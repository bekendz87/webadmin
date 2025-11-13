import { NextApiRequest, NextApiResponse } from 'next';

declare module 'next' {
  interface NextApiRequest {
    ip?: string;
  }
}

export interface ExtendedNextApiRequest extends NextApiRequest {
  ip: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}