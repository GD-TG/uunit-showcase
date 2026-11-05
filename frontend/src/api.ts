// Lightweight native fetch client with automatic token attachment

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseURL: string = '/api';

  private async request(endpoint: string, options: FetchOptions = {}) {
    let url = `${this.baseURL}${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = localStorage.getItem('uunit_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: response.statusText };
      }
      const error: any = new Error(errorData.detail || 'Request failed');
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    // If no content
    if (response.status === 204) return null;
    return { data: await response.json() };
  }

  get(endpoint: string, options?: FetchOptions) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(endpoint: string, options?: FetchOptions) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const api = new ApiClient();
export default api;
