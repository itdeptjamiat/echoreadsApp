export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    categories: string[];
    readingTime: number;
  };
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publication: string;
  publishedAt: string;
  readTime: number;
  category: string;
  imageUrl?: string;
  isBookmarked: boolean;
  isRead: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
} 