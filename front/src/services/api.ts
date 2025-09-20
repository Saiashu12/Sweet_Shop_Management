import { User, Sweet, AuthResponse, SweetsResponse, SearchResponse } from '../types';

const API_URL = ' http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  async register(userData: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error('Failed to register');
    const data: AuthResponse = await res.json()

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error('Invalid credentials');
    const data: AuthResponse = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  },
  
  async getSweets(): Promise<SweetsResponse> {
    const res = await fetch(`${API_URL}/sweets`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to fetch sweets');
    return res.json();
  },

  async searchSweets(params: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/sweets/search?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to search sweets');
    return res.json();
  },

  async createSweet(sweetData: Omit<Sweet, '_id' | 'createdAt' | 'updatedAt'>) {
    const res = await fetch(`${API_URL}/sweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(sweetData),
    });
    if (!res.ok) throw new Error('Failed to create sweet');
    return res.json();
  },

  async updateSweet(id: string, updateData: Partial<Sweet>) {
    const res = await fetch(`${API_URL}/sweets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update sweet');
    return res.json();
  },

  async deleteSweet(id: string) {
    const res = await fetch(`${API_URL}/sweets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to delete sweet');
    return res.json();
  },

  async purchaseSweet(id: string, quantity: number = 1) {
    const res = await fetch(`${API_URL}/sweets/${id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to purchase sweet');
    return res.json();
  },

  async restockSweet(id: string, quantity: number) {
    const res = await fetch(`${API_URL}/sweets/${id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to restock sweet');
    return res.json();
  },
};
