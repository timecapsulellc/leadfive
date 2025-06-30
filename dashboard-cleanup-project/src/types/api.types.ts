// This file contains type definitions for API responses used throughout the project.

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardData {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
}

export interface Report {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}