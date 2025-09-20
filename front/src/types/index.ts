export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Sweet {
  _id: string;
  name: string;
  category: 'chocolate' | 'candy' | 'gummy' | 'hard-candy' | 'lollipop' | 'cake' | 'cookie' | 'other';
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface SweetsResponse {
  success: boolean;
  data: {
    sweets: Sweet[];
    count: number;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    sweets: Sweet[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApiError {
  success: false;
  error: string;
}