export interface User {
  _id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  registered_at?: Date;
  user_type: 'admin' | 'shop' | 'buyer';
  profile_photo?: string;
  current_status: UserStatus;
  status_history?: UserStatusHistory[];
  update_history?: UserUpdateHistory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserStatus {
  status: 'active' | 'suspended' | 'blocked';
  reason?: string;
  updated_at?: Date;
}

export interface UserStatusHistory {
  status: 'active' | 'suspended' | 'blocked';
  reason?: string;
  updated_at: Date;
}

export interface UserUpdateHistory {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_photo?: string;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'admin' | 'shop' | 'buyer';
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_photo?: string;
}

export interface UpdateUserStatusDto {
  status: 'active' | 'suspended' | 'blocked';
  reason?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data?: User | User[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UserFilters {
  user_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}
