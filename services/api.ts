```typescript
import { API_CONFIG } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private static instance: ApiService;
  private authToken: string | null = null;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async init() {
    this.authToken = await AsyncStorage.getItem('auth_token');
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem('auth_token');
        this.authToken = null;
      }
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.authToken = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(userData: {
    email: string;
    password: string;
    username: string;
  }) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await this.handleResponse(response);
      
      if (data.token) {
        this.authToken = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async verifyToken() {
    if (!this.authToken) return false;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.VERIFY_TOKEN}`, {
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  async fetchUserProfile() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  }

  async logout() {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
  }
}

export const apiService = ApiService.getInstance();
```