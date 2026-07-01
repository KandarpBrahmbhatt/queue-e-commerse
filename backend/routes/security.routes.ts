import express from "express";
import {
  getActiveSessions,
  revokeSession,
  getLoginHistory,
  loginHistoryFIND,
} from "../controller/security.controller";
import { isAuth } from "../middaleware/auth.middleware";

const securityRouter = express.Router();

/**
 * GET /api/security/sessions
 * Returns a list of all active device sessions for the authenticated user
 */
securityRouter.get("/sessions", isAuth, getActiveSessions);

/**
 * DELETE /api/security/sessions/:sessionId
 * Terminates/logs out a specific active device session remotely
 */
securityRouter.delete("/sessions/:sessionId", isAuth, revokeSession);

/**
 * GET /api/security/login-history
 * Returns the recent 10 login histories (successful and failed logs)
 */
securityRouter.get("/login-history", isAuth, getLoginHistory);

/**
 * GET /api/security/login-history/all
 * Returns all login histories (successful and failed logs)
 */
securityRouter.get("/login-history/all", isAuth, loginHistoryFIND);

export default securityRouter;
