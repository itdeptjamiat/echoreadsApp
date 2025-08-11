import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import envConfig from '../../config/environment';

const API_BASE_URL = envConfig.apiUrl;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response types
export interface LoginResponse {
  message: string;
  user: {
    user: {
      _id: string;
      email: string;
      username: string;
      name: string;
      createdAt: string;
      isVerified: boolean;
      jwtToken: string;
      plan: string;
      profilePic: string;
      resetPasswordOtpVerified: boolean;
      uid: number;
      userType: string;
      __v: number;
    };
    token: string;
  };
}

export interface SignupResponse {
  message: string;
  user?: {
    user: {
      _id: string;
      email: string;
      username: string;
      name: string;
      createdAt: string;
      isVerified: boolean;
      jwtToken: string;
      plan: string;
      profilePic: string;
      resetPasswordOtpVerified: boolean;
      uid: number;
      userType: string;
      __v: number;
    };
    token: string;
  };
}

// New interface for signup without immediate login
export interface SignupSuccessResponse {
  message: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface Magazine {
  _id: string;
  name: string;
  category: string;
  type: string;
  image: string;
  downloads: number;
  rating: number;
  description: string;
  magzineType: string;
  createdAt?: string;
  fileType?: string;
  isActive?: boolean;
  mid?: number;
  file?: string; // PDF file URL
  reviews?: any[]; // Reviews array
  __v?: number; // Version number
}

export interface MagazinesResponse {
  success: boolean;
  data: Magazine[];
}

export interface SingleMagazineResponse {
  success: boolean;
  data: Magazine;
}

export interface RatingRequest {
  mid: number;
  rating: number;
  review: string;
  userId: number;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  data?: {
    rating: number;
    review: string;
    magazineId: number;
    userId: number;
  };
}

export interface Review {
  userId: number;
  rating: number;
  review: string;
  time: string;
  username: string;
  userProfilePic: string;
}

export interface RatingStats {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MagazineRatingsResponse {
  success: boolean;
  data: {
    magazineId: string;
    magazineName: string;
    averageRating: number;
    totalReviews: number;
    ratingStats: RatingStats;
    userRating: number | null;
    reviews: Review[];
    pagination: Pagination;
  };
}

export interface UserProfile {
  _id: string;
  username: string;
  name: string;
  email: string;
  uid: number;
  profilePic: string;
  userType: string;
  plan: string;
  isVerified: boolean;
  resetPasswordOtpVerified: boolean;
  createdAt: string;
  __v: number;
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  username?: string;
  profilePic?: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserProfile;
  };
}

export interface R2UploadResponse {
  uploadURL: string;
}

export interface R2UploadRequest {
  fileName: string;
  fileType: string;
}

// API functions
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/user/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await api.post('/user/signup', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || 'Signup failed');
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection.');
      } else {
        // Other error
        throw new Error('An unexpected error occurred.');
      }
    }
  },
};

export const magazinesAPI = {
  getMagazines: async (): Promise<MagazinesResponse> => {
    try {
      console.log('🌐 Fetching magazines from:', `${API_BASE_URL}/user/magzines`);
      const response = await axios.get(`${API_BASE_URL}/user/magzines`);
      console.log('Magazines API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Magazines API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch magazines');
    }
  },

  getMagazineById: async (magazineId: string): Promise<SingleMagazineResponse> => {
    try {
      console.log('🌐 Fetching magazine with ID:', magazineId);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for authentication:', token ? 'Token exists' : 'No token');
      
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Try different endpoint variations
      let response;
      try {
        // First try with user prefix
        response = await axios.get(`${API_BASE_URL}/user/magzines/${magazineId}`, {
          headers
        });
        console.log('Success with /user/magzines endpoint');
      } catch (error: any) {
        console.log('Failed with /user/magzines, trying without user prefix...');
        // Try without user prefix
        response = await axios.get(`${API_BASE_URL}/magzines/${magazineId}`, {
          headers
        });
        console.log('Success with /magzines endpoint');
      }
      console.log('Single Magazine API Response:', response.data);
      
      // Handle different response structures
      if (response.data.success) {
        return response.data;
      } else if (response.data.data) {
        // If the response has data but no success flag
        return {
          success: true,
          data: response.data.data
        };
      } else if (response.data._id) {
        // If the response is the magazine data directly
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error: any) {
      console.error('Single Magazine API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Magazine not found. Please check the magazine ID.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch magazine details');
      }
    }
  },

  rateMagazine: async (ratingData: RatingRequest): Promise<RatingResponse> => {
    try {
      console.log('Submitting rating:', ratingData);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for rating:', token ? 'Token exists' : 'No token');
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${API_BASE_URL}/user/rate-magazine`, ratingData, {
        headers
      });
      
      console.log('Rating API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Rating API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid rating data');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to submit rating');
      }
    }
  },

  getMagazineRatings: async (mid: number): Promise<MagazineRatingsResponse> => {
    try {
      console.log('Fetching ratings for magazine MID:', mid);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for ratings:', token ? 'Token exists' : 'No token');
      
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${API_BASE_URL}/user/magazine-ratings/${mid}`, {
        headers
      });
      
      console.log('Magazine Ratings API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Magazine Ratings API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Magazine ratings not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch magazine ratings');
      }
    }
  },

  getUserProfile: async (uid: number): Promise<UserProfileResponse> => {
    try {
      console.log('Fetching user profile for UID:', uid);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for profile:', token ? 'Token exists' : 'No token');
      
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${API_BASE_URL}/user/profile/${uid}`, {
        headers
      });
      
      console.log('User Profile API Response:', response.data);
      
      // Handle the new response structure: { data: { user: {...} }, success: true }
      if (response.data.data && response.data.data.user) {
        return {
          success: true,
          user: response.data.data.user
        };
      } else if (response.data.user) {
        // Handle the old response structure: { user: {...} }
        return {
          success: true,
          user: response.data.user
        };
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error: any) {
      console.error('User Profile API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('User profile not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
      }
    }
  },

  updateUserProfile: async (uid: number, updateData: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> => {
    try {
      console.log('Updating user profile for UID:', uid, 'with data:', updateData);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for profile update:', token ? 'Token exists' : 'No token');
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.put(`${API_BASE_URL}/user/profile/${uid}`, updateData, {
        headers
      });
      
      console.log('Update User Profile API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update User Profile API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid update data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 409) {
        throw new Error(error.response?.data?.message || 'Username or email already taken.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update user profile');
      }
    }
  },

  getR2UploadURL: async (fileName: string, fileType: string): Promise<R2UploadResponse> => {
    try {
      console.log('Getting R2 upload URL for:', fileName, 'type:', fileType);
      
      // Get the stored token for authentication
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token for R2 upload:', token ? 'Token exists' : 'No token');
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${API_BASE_URL}/r2-url`, {
        fileName,
        fileType
      }, {
        headers
      });
      
      console.log('R2 Upload URL Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('R2 Upload URL API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to get upload URL');
      }
    }
  },
};

export default api; 