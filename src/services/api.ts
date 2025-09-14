const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://multi-tenant-notes-application.vercel.app';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: { email: string; password: string }) {
    console.log('Attempting login with:', credentials.email);
    const data = await this.request<{
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('Login successful, setting token');
    this.setToken(data.token);
    return data;
  }

  async getNotes() {
    return this.request<any[]>('/notes');
  }

  async createNote(noteData: { title: string; content: string }) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id: string, noteData: { title: string; content: string }) {
    return this.request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id: string) {
    return this.request<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async upgradeTenant(slug: string) {
    return this.request<any>(`/tenants/${slug}/upgrade`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();