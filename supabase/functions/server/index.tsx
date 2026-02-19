import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// 🚀 개발 모드: true로 설정하면 인증 없이 API 사용 가능
const DEV_MODE = true;

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

console.log('🔧 Initializing Supabase client...');
console.log('📍 SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
);

// Initialize storage bucket
const BUCKET_NAME = 'make-3dc5a6da-cardnews';
const initBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log(`Created bucket: ${BUCKET_NAME}`);
  }
};
await initBucket();

// Login endpoint - 특정 사용자만 접속 가능
app.post("/make-server-3dc5a6da/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Supabase Auth를 사용한 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!data.session) {
      return c.json({ error: 'No session created' }, 401);
    }

    console.log(`User logged in: ${email}`);
    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    console.error('Login endpoint error:', error);
    return c.json({ error: `Login failed: ${error.message}` }, 500);
  }
});

// Register endpoint - 새로운 사용자 등록 (관리자가 사용)
app.post("/make-server-3dc5a6da/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // 관리자만 사용할 수 있도록 특별한 키 체크 (선택사항)
    // const adminKey = c.req.header('X-Admin-Key');
    // if (adminKey !== Deno.env.get('ADMIN_REGISTER_KEY')) {
    //   return c.json({ error: 'Unauthorized' }, 401);
    // }

    // Supabase Auth를 사용한 사용자 생성
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email },
      // 이메일 서버가 설정되지 않았으므로 자동으로 이메일 확인
      email_confirm: true
    });

    if (error) {
      console.error('Registration error:', error);
      return c.json({ error: `Registration failed: ${error.message}` }, 500);
    }

    console.log(`User registered: ${email}`);
    return c.json({ 
      success: true, 
      user: data.user,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return c.json({ error: `Registration failed: ${error.message}` }, 500);
  }
});

// Verify session endpoint
app.post("/make-server-3dc5a6da/verify-session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Session verification error:', error);
    return c.json({ error: `Verification failed: ${error.message}` }, 500);
  }
});

// Middleware to protect routes
const requireAuth = async (c: any, next: any) => {
  // 🚀 개발 모드: DEV_MODE가 true면 인증 건너뛰기
  if (DEV_MODE) {
    console.log('DEV_MODE enabled - skipping authentication');
    // Mock user for dev mode
    c.set('user', { id: 'dev-user', email: 'dev@example.com' });
    await next();
    return;
  }
  
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  // Store user in context
  c.set('user', data.user);
  await next();
};

// Health check endpoint
app.get("/make-server-3dc5a6da/health", (c) => {
  return c.json({ status: "ok" });
});

// Save card news image
app.post("/make-server-3dc5a6da/save-image", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, metadata } = body;

    if (!imageData || !metadata) {
      return c.json({ error: 'Missing imageData or metadata' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `cardnews_${timestamp}.png`;

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload image: ${uploadError.message}` }, 500);
    }

    // Save metadata to kv store
    const imageRecord = {
      id: timestamp.toString(),
      filename,
      metadata,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`cardnews:${timestamp}`, imageRecord);

    console.log(`Successfully saved image: ${filename}`);
    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    console.error('Error saving image:', error);
    return c.json({ error: `Failed to save image: ${error.message}` }, 500);
  }
});

// Get all saved images
app.get("/make-server-3dc5a6da/images", requireAuth, async (c) => {
  try {
    let records = [];
    try {
      records = await kv.getByPrefix('cardnews:');
    } catch (kvError) {
      console.log('No images found or error fetching from KV:', kvError);
      records = [];
    }
    
    // Get signed URLs for all images
    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600); // 1 hour expiry

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          console.error('Error creating signed URL for', record.filename, urlError);
          return {
            ...record,
            url: null,
          };
        }
      })
    );

    return c.json({ images: imagesWithUrls.reverse() }); // Most recent first
  } catch (error) {
    console.error('Error fetching images:', error);
    return c.json({ error: `Failed to fetch images: ${error.message}` }, 500);
  }
});

// Delete an image
app.delete("/make-server-3dc5a6da/images/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`cardnews:${id}`);

    if (!record) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete image: ${deleteError.message}` }, 500);
    }

    // Delete from kv store
    await kv.del(`cardnews:${id}`);

    console.log(`Successfully deleted image: ${record.filename}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return c.json({ error: `Failed to delete image: ${error.message}` }, 500);
  }
});

// Upload profile image
app.post("/make-server-3dc5a6da/profile-images", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, name } = body;

    if (!imageData) {
      return c.json({ error: 'Missing imageData' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `profile_${timestamp}.png`;

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload image: ${uploadError.message}` }, 500);
    }

    // Save metadata to kv store
    const profileRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '후보 얼굴',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`profile:${timestamp}`, profileRecord);

    console.log(`Successfully saved profile image: ${filename}`);
    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    console.error('Error saving profile image:', error);
    return c.json({ error: `Failed to save profile image: ${error.message}` }, 500);
  }
});

// Get all profile images
app.get("/make-server-3dc5a6da/profile-images", requireAuth, async (c) => {
  try {
    let records = [];
    try {
      records = await kv.getByPrefix('profile:');
    } catch (kvError) {
      console.log('No profile images found or error fetching from KV:', kvError);
      records = [];
    }
    
    // Get signed URLs for all images
    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600); // 1 hour expiry

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          console.error('Error creating signed URL for', record.filename, urlError);
          return {
            ...record,
            url: null,
          };
        }
      })
    );

    return c.json({ images: imagesWithUrls.reverse() }); // Most recent first
  } catch (error) {
    console.error('Error fetching profile images:', error);
    return c.json({ error: `Failed to fetch profile images: ${error.message}` }, 500);
  }
});

// Delete a profile image
app.delete("/make-server-3dc5a6da/profile-images/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`profile:${id}`);

    if (!record) {
      return c.json({ error: 'Profile image not found' }, 404);
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete profile image: ${deleteError.message}` }, 500);
    }

    // Delete from kv store
    await kv.del(`profile:${id}`);

    console.log(`Successfully deleted profile image: ${record.filename}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return c.json({ error: `Failed to delete profile image: ${error.message}` }, 500);
  }
});

// Upload text image (calligraphy, logos, etc.)
app.post("/make-server-3dc5a6da/text-images", requireAuth, async (c) => {
  try {
    console.log('POST /text-images - Starting upload...');
    const body = await c.req.json();
    const { imageData, name } = body;

    console.log('Received data:', { name, imageDataLength: imageData?.length || 0 });

    if (!imageData) {
      console.error('Missing imageData');
      return c.json({ error: 'Missing imageData' }, 400);
    }

    // Generate unique filename with extension from data URL
    const timestamp = Date.now();
    const isSvg = imageData.startsWith('data:image/svg+xml');
    const extension = isSvg ? 'svg' : 'png';
    const filename = `text_${timestamp}.${extension}`;

    console.log('Generated filename:', filename, 'isSvg:', isSvg);

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z+]+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('Buffer created, size:', buffer.length);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: isSvg ? 'image/svg+xml' : 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload text image: ${uploadError.message}` }, 500);
    }

    console.log('Upload successful:', uploadData);

    // Save metadata to kv store
    const textImageRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '텍스트 이미지',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`textimage:${timestamp}`, textImageRecord);

    console.log(`Successfully saved text image: ${filename}`);
    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    console.error('Error saving text image:', error);
    return c.json({ error: `Failed to save text image: ${error.message}` }, 500);
  }
});

// Get all text images
app.get("/make-server-3dc5a6da/text-images", requireAuth, async (c) => {
  try {
    console.log('GET /text-images - Starting fetch...');
    let records = [];
    try {
      records = await kv.getByPrefix('textimage:');
      console.log('KV records fetched:', records?.length || 0, 'records');
    } catch (kvError) {
      console.log('No text images found or error fetching from KV:', kvError);
      records = [];
    }
    
    // If no records, return empty array immediately
    if (!records || records.length === 0) {
      console.log('No text images found, returning empty array');
      return c.json({ images: [] });
    }
    
    // Get signed URLs for all images
    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600); // 1 hour expiry

          if (urlError) {
            console.error('Error creating signed URL for', record.filename, urlError);
          }

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          console.error('Exception creating signed URL for', record.filename, urlError);
          return {
            ...record,
            url: null,
          };
        }
      })
    );

    console.log('Successfully fetched text images:', imagesWithUrls.length);
    return c.json({ images: imagesWithUrls.reverse() }); // Most recent first
  } catch (error) {
    console.error('Error fetching text images - Full error:', error);
    return c.json({ error: `Failed to fetch text images: ${error.message}` }, 500);
  }
});

// Delete a text image
app.delete("/make-server-3dc5a6da/text-images/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`textimage:${id}`);

    if (!record) {
      return c.json({ error: 'Text image not found' }, 404);
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete text image: ${deleteError.message}` }, 500);
    }

    // Delete from kv store
    await kv.del(`textimage:${id}`);

    console.log(`Successfully deleted text image: ${record.filename}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting text image:', error);
    return c.json({ error: `Failed to delete text image: ${error.message}` }, 500);
  }
});

// Upload background image
app.post("/make-server-3dc5a6da/background-images", requireAuth, async (c) => {
  try {
    console.log('POST /background-images - Starting upload...');
    const body = await c.req.json();
    const { imageData, name } = body;

    console.log('Received data:', { name, imageDataLength: imageData?.length || 0 });

    if (!imageData) {
      console.error('Missing imageData');
      return c.json({ error: 'Missing imageData' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `background_${timestamp}.png`;

    console.log('Generated filename:', filename);

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('Buffer created, size:', buffer.length);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload background image: ${uploadError.message}` }, 500);
    }

    console.log('Upload successful:', uploadData);

    // Save metadata to kv store
    const backgroundRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '배경 이미지',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`background:${timestamp}`, backgroundRecord);

    console.log(`Successfully saved background image: ${filename}`);
    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    console.error('Error saving background image:', error);
    return c.json({ error: `Failed to save background image: ${error.message}` }, 500);
  }
});

// Get all background images
app.get("/make-server-3dc5a6da/background-images", requireAuth, async (c) => {
  try {
    console.log('GET /background-images - Starting fetch...');
    let records = [];
    try {
      records = await kv.getByPrefix('background:');
      console.log('KV records fetched:', records?.length || 0, 'records');
    } catch (kvError) {
      console.log('No background images found or error fetching from KV:', kvError);
      records = [];
    }
    
    // If no records, return empty array immediately
    if (!records || records.length === 0) {
      console.log('No background images found, returning empty array');
      return c.json({ images: [] });
    }
    
    // Get signed URLs for all images
    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600); // 1 hour expiry

          if (urlError) {
            console.error('Error creating signed URL for', record.filename, urlError);
          }

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          console.error('Exception creating signed URL for', record.filename, urlError);
          return {
            ...record,
            url: null,
          };
        }
      })
    );

    console.log('Successfully fetched background images:', imagesWithUrls.length);
    return c.json({ images: imagesWithUrls.reverse() }); // Most recent first
  } catch (error) {
    console.error('Error fetching background images - Full error:', error);
    return c.json({ error: `Failed to fetch background images: ${error.message}` }, 500);
  }
});

// Delete a background image
app.delete("/make-server-3dc5a6da/background-images/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`background:${id}`);

    if (!record) {
      return c.json({ error: 'Background image not found' }, 404);
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete background image: ${deleteError.message}` }, 500);
    }

    // Delete from kv store
    await kv.del(`background:${id}`);

    console.log(`Successfully deleted background image: ${record.filename}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting background image:', error);
    return c.json({ error: `Failed to delete background image: ${error.message}` }, 500);
  }
});

// Upload logo image
app.post("/make-server-3dc5a6da/logo-images", requireAuth, async (c) => {
  try {
    console.log('POST /logo-images - Starting upload...');
    const body = await c.req.json();
    const { imageData, name } = body;

    console.log('Received data:', { name, imageDataLength: imageData?.length || 0 });

    if (!imageData) {
      console.error('Missing imageData');
      return c.json({ error: 'Missing imageData' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `logo_${timestamp}.png`;

    console.log('Generated filename:', filename);

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('Buffer created, size:', buffer.length);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload logo image: ${uploadError.message}` }, 500);
    }

    console.log('Upload successful:', uploadData);

    // Save metadata to kv store
    const logoRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '로고 이미지',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`logo:${timestamp}`, logoRecord);

    console.log(`Successfully saved logo image: ${filename}`);
    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    console.error('Error saving logo image:', error);
    return c.json({ error: `Failed to save logo image: ${error.message}` }, 500);
  }
});

// Get all logo images
app.get("/make-server-3dc5a6da/logo-images", requireAuth, async (c) => {
  try {
    console.log('GET /logo-images - Starting fetch...');
    let records = [];
    try {
      records = await kv.getByPrefix('logo:');
      console.log('KV records fetched:', records?.length || 0, 'records');
    } catch (kvError) {
      console.log('No logo images found or error fetching from KV:', kvError);
      records = [];
    }
    
    // If no records, return empty array immediately
    if (!records || records.length === 0) {
      console.log('No logo images found, returning empty array');
      return c.json({ images: [] });
    }
    
    // Get signed URLs for all images
    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600); // 1 hour expiry

          if (urlError) {
            console.error('Error creating signed URL for', record.filename, urlError);
          }

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          console.error('Exception creating signed URL for', record.filename, urlError);
          return {
            ...record,
            url: null,
          };
        }
      })
    );

    console.log('Successfully fetched logo images:', imagesWithUrls.length);
    return c.json({ images: imagesWithUrls.reverse() }); // Most recent first
  } catch (error) {
    console.error('Error fetching logo images - Full error:', error);
    return c.json({ error: `Failed to fetch logo images: ${error.message}` }, 500);
  }
});

// Delete a logo image
app.delete("/make-server-3dc5a6da/logo-images/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`logo:${id}`);

    if (!record) {
      return c.json({ error: 'Logo image not found' }, 404);
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete logo image: ${deleteError.message}` }, 500);
    }

    // Delete from kv store
    await kv.del(`logo:${id}`);

    console.log(`Successfully deleted logo image: ${record.filename}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting logo image:', error);
    return c.json({ error: `Failed to delete logo image: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);