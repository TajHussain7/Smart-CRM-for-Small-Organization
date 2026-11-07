import { UserRole } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        workspaceId: string;
        role: UserRole;
      };
    }
  }
}

export {};