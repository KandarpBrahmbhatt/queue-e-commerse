import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**

* Middleware to verify request signature
  */
  export const verifySignature = (secret?: string) => {
   return (req: Request, res: Response, next: NextFunction) => {
  try {
  const activeSecret = secret || process.env.SIGNATURE_SECRET;

  if (!activeSecret) {
  return res.status(500).json({
  success: false,
  message: "Signature secret is not configured on the server",
  });
  }

  const signature = req.headers["x-signature"] as string;

  if (!signature) {
  return res.status(401).json({
  success: false,
  message: "Signature missing",
  });
  }

  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
  .createHmac("sha256", activeSecret)
  .update(payload)
  .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Signature verification failed!");
    console.error("Received signature:", signature);
    console.error("Expected signature:", expectedSignature);
    console.error("Payload:", payload);
    return res.status(403).json({
      success: false,
      message: "Invalid signature",
    });
  }

  next();
  } catch (error: any) {
  return res.status(500).json({
  success: false,
  message: error.message,
  });
  }
  };
  };
