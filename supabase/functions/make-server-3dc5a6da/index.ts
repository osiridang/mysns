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

// Login endpoint - 아이디만 사용. 내부적으로 id@local로 매핑. 21t/21t이면 없을 때 자동 생성
app.post("/make-server-3dc5a6da/login", async (c) => {
  try {
    const body = await c.req.json();
    const { id, password } = body;

    if (!id || !password) {
      return c.json({ error: 'ID and password are required' }, 400);
    }

    const email = `${id}@local`;

    let result = await supabase.auth.signInWithPassword({ email, password });
    let { data, error } = result;

    // 21t/21t 인데 사용자가 없으면 자동 생성 후 재시도
    if (error && id === '21t' && password === '21t') {
      const { error: createErr } = await supabase.auth.admin.createUser({
        email: '21t@local',
        password: '21t',
        email_confirm: true,
      });
      if (!createErr) {
        result = await supabase.auth.signInWithPassword({ email: '21t@local', password: '21t' });
        data = result.data;
        error = result.error;
      }
    }

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!data.session) {
      return c.json({ error: 'No session created' }, 401);
    }

    console.log(`User logged in: ${id}`);
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

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email },
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
  if (DEV_MODE) {
    console.log('DEV_MODE enabled - skipping authentication');
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

  c.set('user', data.user);
  await next();
};

// 인증 optional: 토큰 있으면 user, 없으면 null (저장된 내용은 비로그인 시 공용 목록)
const optionalAuth = async (c: any, next: any) => {
  if (DEV_MODE) {
    c.set('user', null);
    await next();
    return;
  }
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    c.set('user', null);
    await next();
    return;
  }
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    c.set('user', null);
    await next();
    return;
  }
  c.set('user', data.user);
  await next();
};

// Health check endpoint
app.get("/make-server-3dc5a6da/health", (c) => {
  return c.json({ status: "ok" });
});

const APP_DEFAULTS_KEY = "app:defaults";

const appDefaultsGet = async (c: any) => {
  try {
    const data = await kv.get(APP_DEFAULTS_KEY);
    return c.json(data ?? {});
  } catch (e) {
    console.error("app-defaults get error:", e);
    return c.json({}, 200);
  }
};
const appDefaultsPost = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { templateData, appTitle, appSubtitle, selectedTemplate } = body;
    if (!templateData || typeof templateData !== "object") {
      return c.json({ error: "templateData is required" }, 400);
    }
    await kv.set(APP_DEFAULTS_KEY, {
      templateData,
      appTitle: appTitle ?? "",
      appSubtitle: appSubtitle ?? "",
      selectedTemplate: selectedTemplate ?? "horizontal-card",
    });
    return c.json({ success: true });
  } catch (e) {
    console.error("app-defaults set error:", e);
    return c.json({ error: e instanceof Error ? e.message : "Failed to save defaults" }, 500);
  }
};

// 앱 기본값 조회 (인증 없이 읽기 가능)
app.get("/make-server-3dc5a6da/app-defaults", appDefaultsGet);
app.get("/app-defaults", appDefaultsGet);
// 앱 기본값 저장 (로그인 없이 저장 가능)
app.post("/make-server-3dc5a6da/app-defaults", appDefaultsPost);
app.post("/app-defaults", appDefaultsPost);

// Save card news image
app.post("/make-server-3dc5a6da/save-image", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, metadata } = body;

    if (!imageData || !metadata) {
      return c.json({ error: 'Missing imageData or metadata' }, 400);
    }

    const timestamp = Date.now();
    const filename = `cardnews_${timestamp}.png`;

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

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

    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600);

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

    return c.json({ images: imagesWithUrls.reverse() });
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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete image: ${deleteError.message}` }, 500);
    }

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

    const timestamp = Date.now();
    const filename = `profile_${timestamp}.png`;

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

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

    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600);

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

    return c.json({ images: imagesWithUrls.reverse() });
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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return c.json({ error: `Failed to delete profile image: ${deleteError.message}` }, 500);
    }

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
    const body = await c.req.json();
    const { imageData, name } = body;

    if (!imageData) {
      return c.json({ error: 'Missing imageData' }, 400);
    }

    const timestamp = Date.now();
    const isSvg = imageData.startsWith('data:image/svg+xml');
    const extension = isSvg ? 'svg' : 'png';
    const filename = `text_${timestamp}.${extension}`;

    const base64Data = imageData.replace(/^data:image\/[a-z+]+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

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
    let records = [];
    try {
      records = await kv.getByPrefix('textimage:');
    } catch (kvError) {
      records = [];
    }

    if (!records || records.length === 0) {
      return c.json({ images: [] });
    }

    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600);

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          return { ...record, url: null };
        }
      })
    );

    return c.json({ images: imagesWithUrls.reverse() });
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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      return c.json({ error: `Failed to delete text image: ${deleteError.message}` }, 500);
    }

    await kv.del(`textimage:${id}`);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: `Failed to delete text image: ${error.message}` }, 500);
  }
});

// Upload background image
app.post("/make-server-3dc5a6da/background-images", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, name } = body;

    if (!imageData) {
      return c.json({ error: 'Missing imageData' }, 400);
    }

    const timestamp = Date.now();
    const filename = `background_${timestamp}.png`;

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      return c.json({ error: `Failed to upload background image: ${uploadError.message}` }, 500);
    }

    const backgroundRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '배경 이미지',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`background:${timestamp}`, backgroundRecord);

    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    return c.json({ error: `Failed to save background image: ${error.message}` }, 500);
  }
});

// Get all background images
app.get("/make-server-3dc5a6da/background-images", requireAuth, async (c) => {
  try {
    let records = [];
    try {
      records = await kv.getByPrefix('background:');
    } catch (kvError) {
      records = [];
    }

    if (!records || records.length === 0) {
      return c.json({ images: [] });
    }

    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600);

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          return { ...record, url: null };
        }
      })
    );

    return c.json({ images: imagesWithUrls.reverse() });
  } catch (error) {
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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      return c.json({ error: `Failed to delete background image: ${deleteError.message}` }, 500);
    }

    await kv.del(`background:${id}`);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: `Failed to delete background image: ${error.message}` }, 500);
  }
});

// Upload logo image
app.post("/make-server-3dc5a6da/logo-images", requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, name } = body;

    if (!imageData) {
      return c.json({ error: 'Missing imageData' }, 400);
    }

    const timestamp = Date.now();
    const filename = `logo_${timestamp}.png`;

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      return c.json({ error: `Failed to upload logo image: ${uploadError.message}` }, 500);
    }

    const logoRecord = {
      id: timestamp.toString(),
      filename,
      name: name || '로고 이미지',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`logo:${timestamp}`, logoRecord);

    return c.json({ success: true, id: timestamp.toString(), filename });
  } catch (error) {
    return c.json({ error: `Failed to save logo image: ${error.message}` }, 500);
  }
});

// Get all logo images
app.get("/make-server-3dc5a6da/logo-images", requireAuth, async (c) => {
  try {
    let records = [];
    try {
      records = await kv.getByPrefix('logo:');
    } catch (kvError) {
      records = [];
    }

    if (!records || records.length === 0) {
      return c.json({ images: [] });
    }

    const imagesWithUrls = await Promise.all(
      records.map(async (record) => {
        try {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(record.filename, 3600);

          return {
            ...record,
            url: urlData?.signedUrl || null,
          };
        } catch (urlError) {
          return { ...record, url: null };
        }
      })
    );

    return c.json({ images: imagesWithUrls.reverse() });
  } catch (error) {
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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([record.filename]);

    if (deleteError) {
      return c.json({ error: `Failed to delete logo image: ${deleteError.message}` }, 500);
    }

    await kv.del(`logo:${id}`);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: `Failed to delete logo image: ${error.message}` }, 500);
  }
});

// ----- Saved contents (저장된 내용) -----
const getSavedContentsUserId = (c: any) => {
  const user = c.get("user");
  if (!user || user.id === "dev-user") return null;
  return user.id;
};

// 목록 조회
app.get("/make-server-3dc5a6da/saved-contents", optionalAuth, async (c) => {
  try {
    const user_id = getSavedContentsUserId(c);
    const { data, error } = await supabase
      .from("saved_contents")
      .select("id, template_type, data, title, app_title, app_subtitle, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("saved-contents list error:", error);
      return c.json({ error: error.message }, 500);
    }
    const list = (data || []).map((row: any) => ({
      id: row.id,
      templateType: row.template_type,
      data: row.data,
      title: row.title,
      appTitle: row.app_title ?? undefined,
      appSubtitle: row.app_subtitle ?? undefined,
      timestamp: new Date(row.created_at).getTime(),
    }));
    return c.json({ contents: list });
  } catch (e) {
    console.error("saved-contents list error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// 저장
app.post("/make-server-3dc5a6da/saved-contents", optionalAuth, async (c) => {
  try {
    const user_id = getSavedContentsUserId(c);
    const body = await c.req.json().catch(() => ({}));
    const { id, templateType, data: contentData, title, appTitle, appSubtitle } = body;
    if (!templateType || !contentData || !title) {
      return c.json({ error: "templateType, data, title are required" }, 400);
    }
    const row: any = {
      user_id,
      template_type: templateType,
      data: contentData,
      title: String(title).slice(0, 500),
      app_title: appTitle != null ? String(appTitle).slice(0, 500) : null,
      app_subtitle: appSubtitle != null ? String(appSubtitle).slice(0, 500) : null,
    };
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      row.id = id;
    }
    const { data: inserted, error } = await supabase.from("saved_contents").insert(row).select("id, created_at").single();
    if (error) {
      console.error("saved-contents insert error:", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({
      id: inserted.id,
      timestamp: new Date(inserted.created_at).getTime(),
    });
  } catch (e) {
    console.error("saved-contents insert error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// 삭제
app.delete("/make-server-3dc5a6da/saved-contents/:id", optionalAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const user_id = getSavedContentsUserId(c);
    let q = supabase.from("saved_contents").delete().eq("id", id);
    if (user_id !== null) {
      q = q.eq("user_id", user_id);
    } else {
      q = q.is("user_id", null);
    }
    const { error } = await q;
    if (error) {
      console.error("saved-contents delete error:", error);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ success: true });
  } catch (e) {
    console.error("saved-contents delete error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);
