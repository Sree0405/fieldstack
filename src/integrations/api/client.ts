/**
 * fieldstack API Client
 * Communicates with the NestJS backend (http://localhost:4000)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status: number;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    roles: string[];
  };
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const { accessToken, refreshToken } = JSON.parse(tokens);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
      } catch (error) {
        console.error('Failed to load tokens from storage:', error);
      }
    }
  }

  private saveTokensToStorage() {
    if (this.accessToken && this.refreshToken) {
      localStorage.setItem(
        'auth_tokens',
        JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
        })
      );
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_tokens');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.saveTokensToStorage();
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          throw new Error('Unauthorized - please log in again');
        }

        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      console.error(`[API] Error:`, error.message);
      return {
        error: {
          message: error.message || 'Unknown error occurred',
          status: 0,
        },
      };
    }
  }

  async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method,
      ...(body && { body: JSON.stringify(body) }),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    displayName: string;
    role?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async getMe(): Promise<ApiResponse<LoginResponse['user']>> {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async getAllUsers(): Promise<ApiResponse<Array<{ id: string; email: string; displayName: string | null; avatarUrl: string | null; roles: Array<{ id: string; name: string; displayName: string }>; createdAt: string; updatedAt: string }>>> {
    return this.request('/auth/users', {
      method: 'GET',
    });
  }

  async updateUser(userId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAllRoles(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        displayName: string;
        description?: string;
        createdAt?: string;
        updatedAt?: string;
      }>
    >
  > {
    return this.request('/roles', {
      method: 'GET',
    });
  }

  async getRoleById(roleId: string): Promise<ApiResponse<any>> {
    return this.request(`/roles/${roleId}`, {
      method: 'GET',
    });
  }

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(
    roleId: string,
    data: { displayName?: string; description?: string }
  ): Promise<ApiResponse<any>> {
    return this.request(`/roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(roleId: string): Promise<ApiResponse<any>> {
    return this.request(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async logout() {
    this.clearTokens();
    return { error: null };
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  async getCollections(): Promise<
    ApiResponse<Array<{ id: string; name: string; displayName: string }>>
  > {
    return this.request('/collections', {
      method: 'GET',
    });
  }

  async createCollection(data: {
    name: string;
    displayName: string;
    tableName: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string): Promise<ApiResponse<any>> {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async getCrudData(
    collection: string,
    page: string = '1',
    limit: string = '25'
  ): Promise<ApiResponse<any>> {
    return this.request(
      `/${collection}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      }
    );
  }

  async createCrudItem(collection: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCrudItem(
    collection: string,
    id: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCrudItem(collection: string, id: string): Promise<ApiResponse<any>> {
    return this.request(`/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  async getSystemEndpoints(): Promise<ApiResponse<any>> {
    return this.request('/system/endpoints', {
      method: 'GET',
    });
  }

  async getSystemMetrics(): Promise<ApiResponse<any>> {
    return this.request('/system/metrics', {
      method: 'GET',
    });
  }

  async addFieldToCollection(
    collectionId: string,
    field: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/system/collections/${collectionId}/fields`, {
      method: 'POST',
      body: JSON.stringify(field),
    });
  }

  async getCollectionSchema(collectionId: string): Promise<ApiResponse<any>> {
    return this.request(`/system/collections/${collectionId}/schema`, {
      method: 'GET',
    });
  }

  async updateCollectionSchema(collectionId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/system/collections/${collectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============================================================
  // FILE MANAGEMENT
  // ============================================================

  /**
   * Upload a single file
   */
  async uploadFile(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/files`;
    const headers: HeadersInit = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'File upload failed',
          status: 0,
        },
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[]): Promise<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const url = `${API_BASE_URL}/files/multiple`;
    const headers: HeadersInit = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'File upload failed',
          status: 0,
        },
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<ApiResponse<any>> {
    return this.request(`/files/${fileId}`, {
      method: 'GET',
    });
  }

  /**
   * Get all files (with pagination)
   */
  async getAllFiles(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<any>> {
    return this.request(`/files?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<ApiResponse<any>> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get asset URL for a file ID
   * Helper function to construct the URL for serving a file
   */
  getAssetUrl(fileId: string): string {
    return `${API_BASE_URL}/assets/${fileId}`;
  }

  // ============================================================
  // SITE INFO MANAGEMENT
  // ============================================================

  /**
   * Get site info
   */
  async getSiteInfo(): Promise<ApiResponse<any>> {
    return this.request('/site-info', {
      method: 'GET',
    });
  }

  /**
   * Update site info details
   */
  async updateSiteInfo(data: {
    siteName?: string;
    siteTitle?: string;
    siteDescription?: string;
    siteUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: any;
    metadata?: any;
  }): Promise<ApiResponse<any>> {
    return this.request('/site-info', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update site logo
   */
  async updateSiteLogo(logoId: string): Promise<ApiResponse<any>> {
    return this.request('/site-info', {
      method: 'PATCH',
      body: JSON.stringify({ logoId }),
    });
  }

  /**
   * Update site favicon
   */
  async updateSiteFavicon(faviconId: string): Promise<ApiResponse<any>> {
    return this.request('/site-info', {
      method: 'PATCH',
      body: JSON.stringify({ faviconId }),
    });
  }
}

export const apiClient = new ApiClient();

/**
 * Helper function to get asset URL
 * Usage: getAssetsUrl(fileId)
 */
export const getAssetsUrl = (fileId: string): string => {
  return apiClient.getAssetUrl(fileId);
};
