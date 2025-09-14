export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  tenant: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  noteLimit: number;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  authorId: {
    _id: string;
    email: string;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}