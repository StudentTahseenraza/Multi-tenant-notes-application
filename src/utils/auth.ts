import { User } from '../types';

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getTenantColor = (slug: string): string => {
  switch (slug) {
    case 'acme':
      return 'from-blue-600 to-blue-800';
    case 'globex':
      return 'from-green-600 to-green-800';
    default:
      return 'from-gray-600 to-gray-800';
  }
};