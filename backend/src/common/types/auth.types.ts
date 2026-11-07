import { UserRole } from "../constants/roles";

export interface AuthUser {
  userId: string;
  workspaceId: string;
  role: UserRole;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

