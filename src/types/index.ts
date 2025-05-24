export interface Blog {
  id: number;
  title: string;
  slug: string;
  subheading: string;
  tldr: string;
  content: string;
  image: string;
  estimated_read_time: number;
  created_at: string;
}

export interface Comment {
  id: number;
  blog: number;
  name: string;
  content: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  blog: number;
  rating: number;
  email: string;
  message: string;
  submitted_at: string;
}

export interface Story {
  id: number;
  story_text: string;
  allow_publish: boolean;
  submitted_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}