export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  MagazineDetail: {
    magazineId: string;
    magazineData: any;
  };
  AudioPlayer: {
    magazineId: string;
    magazineData: any;
  };
  UserProfile: {
    userId: string;
  };
  Login: undefined;
  Signup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Categories: undefined;
  Profile: undefined;
};

// Magazine types
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

// User types
export interface User {
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
} 