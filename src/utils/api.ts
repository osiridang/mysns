import { projectId } from '/utils/supabase/info';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants';

const getBaseUrl = () => API_BASE_URL(projectId);

export const apiClient = {
  async post(endpoint: string, body: any, accessToken?: string) {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
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
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.LOGIN, { email, password }),

  verifySession: (accessToken: string) =>
    apiClient.post(API_ENDPOINTS.VERIFY_SESSION, {}, accessToken),
};

export const imageApi = {
  saveImage: (imageData: string, metadata: any, accessToken: string) =>
    apiClient.post(API_ENDPOINTS.SAVE_IMAGE, { imageData, metadata }, accessToken),

  getProfileImages: (accessToken: string) =>
    apiClient.get(API_ENDPOINTS.PROFILE_IMAGES, accessToken),

  deleteProfileImage: (imageId: string, accessToken: string) =>
    apiClient.delete(`${API_ENDPOINTS.PROFILE_IMAGES}/${imageId}`, accessToken),
};
