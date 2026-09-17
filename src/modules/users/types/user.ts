import type { UserRole } from "@/modules/auth/types/auth";
import type { PaginatedResponse } from "@/types/api";
export type UserStatus = "ACTIVE" | "DISABLED" | "DELETED";
export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string | null;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
export interface UserInput {
  email: string;
  phoneNumber: string;
  password?: string;
  displayName?: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
}
export type UserList = PaginatedResponse<User>;
