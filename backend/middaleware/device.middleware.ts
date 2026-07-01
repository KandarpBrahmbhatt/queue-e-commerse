import { Request, Response, NextFunction } from "express";
import { getDeviceInfo } from "../utils/deviceInfo";

declare global {
  namespace Express {
    interface Request {
      deviceInfo?: ReturnType<typeof getDeviceInfo>;
    }
  }
}

export const deviceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.deviceInfo = getDeviceInfo(req);

  next();
};