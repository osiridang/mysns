import { projectId } from '@/config/supabase';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants';

const getBaseUrl = () => API_BASE_URL(projectId);

/** Supabase Edge Function 연결 확인 (개발 시 콘솔에서 확인용) */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const base = getBaseUrl();
  if (!base || !projectId) {
    return { ok: false, message: 'VITE_SUPABASE_URL이 없거나 projectId를 추출할 수 없습니다.' };
  }
  try {
    const res = await fetch(`${base}${API_ENDPOINTS.HEALTH}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.status === 'ok') {
      return { ok: true, message: `Supabase 연결됨 (${projectId})` };
    }
    return { ok: false, message: `서버 응답 ${res.status}: ${JSON.stringify(data)}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '네트워크 오류' };
  }
}

export const apiClient = {
  async post(endpoint: string, body: any, accessToken?: string) {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      let msg: string;
      try {
        const json = JSON.parse(text);
        msg = json.error || text || `HTTP ${response.status}`;
      } catch {
        msg = text || `HTTP ${response.status}`;
      }
      throw new Error(msg);
    }

    return response.json();
  },

  async get(endpoint: string, accessToken?: string) {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      headers: {
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async delete(endpoint: string, accessToken?: string) {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

export const authApi = {
  login: (id: string, password: string) =>
    apiClient.post(API_ENDPOINTS.LOGIN, { id, password }),

  verifySession: (accessToken: string) =>
    apiClient.post(API_ENDPOINTS.VERIFY_SESSION, {}, accessToken),
};

export const imageApi = {
  saveImage: (imageData: string, metadata: any, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.SAVE_IMAGE, { imageData, metadata }, accessToken),

  getImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.IMAGES, accessToken),

  deleteImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.IMAGES}/${imageId}`, accessToken),

  getProfileImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.PROFILE_IMAGES, accessToken),

  uploadProfileImage: (imageData: string, name: string, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.PROFILE_IMAGES, { imageData, name }, accessToken),

  deleteProfileImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.PROFILE_IMAGES}/${imageId}`, accessToken),

  getBackgroundImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.BACKGROUND_IMAGES, accessToken),

  uploadBackgroundImage: (imageData: string, name: string, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.BACKGROUND_IMAGES, { imageData, name }, accessToken),

  deleteBackgroundImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.BACKGROUND_IMAGES}/${imageId}`, accessToken),

  getTextImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.TEXT_IMAGES, accessToken),

  uploadTextImage: (imageData: string, name: string, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.TEXT_IMAGES, { imageData, name }, accessToken),

  deleteTextImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.TEXT_IMAGES}/${imageId}`, accessToken),

  getLogoImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.LOGO_IMAGES, accessToken),

  uploadLogoImage: (imageData: string, name: string, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.LOGO_IMAGES, { imageData, name }, accessToken),

  deleteLogoImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.LOGO_IMAGES}/${imageId}`, accessToken),
};

/** 앱 기본값: 다른 브라우저/기기에서도 동일한 값 표시 */
export const appDefaultsApi = {
  get: () => apiClient.get(API_ENDPOINTS.APP_DEFAULTS),
  save: (data: { templateData: any; appTitle: string; appSubtitle: string; selectedTemplate: string }, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.APP_DEFAULTS, data, accessToken),
};
