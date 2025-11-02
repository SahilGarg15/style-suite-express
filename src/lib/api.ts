// API client for backend communication

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Auth token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Generic API call wrapper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('API Call:', url); // Debug log

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error('API Error:', response.status, url); // Debug log
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.token);
    return response;
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await apiCall<{ user: any; token: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setAuthToken(response.token);
    return response;
  },

  logout: () => {
    removeAuthToken();
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return apiCall<{ products: any[]; total: number }>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string) => {
    return apiCall<any>(`/products/${id}`);
  },
};

// Orders API
export const ordersApi = {
  create: async (orderData: {
    items: Array<{ productId: string; quantity: number; size?: string; color?: string }>;
    shippingAddress: any;
    paymentMethod: string;
  }) => {
    return apiCall<any>('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async () => {
    return apiCall<any[]>('/orders/my-orders');
  },

  track: async (orderNumber: string) => {
    return apiCall<any>(`/orders/track?orderNumber=${orderNumber}`);
  },
};

// Users API
export const usersApi = {
  getProfile: async () => {
    return apiCall<any>('/users/profile');
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    return apiCall<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Reviews API
export const reviewsApi = {
  // Get reviews for a product (public - no auth required)
  getProductReviews: async (productId: string) => {
    return apiCall<{
      reviews: Array<{
        id: string;
        rating: number;
        comment: string;
        createdAt: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      }>;
      averageRating: number;
      totalReviews: number;
    }>(`/reviews?productId=${productId}`);
  },

  // Create a review (requires authentication)
  create: async (reviewData: {
    productId: string;
    rating: number;
    comment?: string;
  }) => {
    return apiCall<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Update a review (requires authentication)
  update: async (reviewId: string, data: {
    rating?: number;
    comment?: string;
  }) => {
    return apiCall<any>('/reviews', {
      method: 'PUT',
      body: JSON.stringify({ reviewId, ...data }),
    });
  },

  // Delete a review (requires authentication)
  delete: async (reviewId: string) => {
    return apiCall<any>(`/reviews?reviewId=${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminApi = {
  // Products
  products: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      return apiCall<{ products: any[]; total: number; page: number; totalPages: number }>(
        `/admin/products${queryString ? `?${queryString}` : ''}`
      );
    },

    create: async (productData: any) => {
      return apiCall<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    update: async (productData: any) => {
      return apiCall<any>('/admin/products', {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },

    delete: async (id: string) => {
      return apiCall<any>(`/admin/products?id=${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders
  orders: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      return apiCall<{ orders: any[]; total: number; page: number; totalPages: number }>(
        `/admin/orders${queryString ? `?${queryString}` : ''}`
      );
    },

    updateStatus: async (orderId: string, status: string) => {
      return apiCall<any>('/admin/orders', {
        method: 'PUT',
        body: JSON.stringify({ orderId, status }),
      });
    },
  },

  // Users
  users: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      return apiCall<{ users: any[]; total: number; page: number; totalPages: number }>(
        `/admin/users${queryString ? `?${queryString}` : ''}`
      );
    },

    updateRole: async (userId: string, role: string) => {
      return apiCall<any>('/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, role }),
      });
    },
  },

  // Stats
  stats: {
    get: async () => {
      return apiCall<any>('/admin/stats');
    },
  },
};
