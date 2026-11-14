import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshAccessToken, loginDemoUser } from "./auth.service";
import { sendSuccess } from "../../common/utils/apiResponse";
import { BadRequestError } from "../../common/errors";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, workspace, accessToken, refreshToken } = await registerUser(req.body);
    return sendSuccess(res, 201, "Registration successful", {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        schoolEnabled: workspace.schoolEnabled,
        gymEnabled: workspace.gymEnabled,
        barberEnabled: workspace.barberEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, workspace, accessToken, refreshToken } = await loginUser(email, password);
    return sendSuccess(res, 200, "Login successful", {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        schoolEnabled: workspace.schoolEnabled,
        gymEnabled: workspace.gymEnabled,
        barberEnabled: workspace.barberEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginDemo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, workspace, accessToken, refreshToken } = await loginDemoUser();
    return sendSuccess(res, 200, "Demo login successful", {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isDemo: true },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        schoolEnabled: workspace.schoolEnabled,
        gymEnabled: workspace.gymEnabled,
        barberEnabled: workspace.barberEnabled,
        isDemo: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }
    const newAccessToken = refreshAccessToken(refreshToken);
    return sendSuccess(res, 200, "Token refreshed", { accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return sendSuccess(res, 200, "Current user context", {
      userId: req.user?.userId,
      workspaceId: req.user?.workspaceId,
      role: req.user?.role,
    });
  } catch (error) {
    next(error);
  }
};