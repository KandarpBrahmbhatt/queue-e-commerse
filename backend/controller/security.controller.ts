import { Response } from "express";
import { AuthRequest } from "../models/user.model";
import Session from "../models/session.model";
import LoginHistory from "../models/loginHistory.model";

/**
 * Get all active sessions for the currently logged-in user
 */
export const getActiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sessions = await Session.find({ userId, isActive: true }).sort({ lastActiveAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Active sessions retrieved successfully",
      data: sessions,
    });
  } catch (error: any) {
    console.error("getActiveSessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve active sessions",
      error: error.message,
    });
  }
};

/**
 * Revoke (delete) a specific session, forcing a logout on that device
 */
export const revokeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify that the session exists and belongs to the current user
    const session = await Session.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or unauthorized to revoke",
      });
    }

    // Delete the session to revoke access
    await Session.deleteOne({ _id: sessionId });

    return res.status(200).json({
      success: true,
      message: "Device session revoked successfully",
    });
  } catch (error: any) {
    console.error("revokeSession error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke session",
      error: error.message,
    });
  }
};

/**
 * Retrieve recent login logs (success & failure attempts) for the user
 */
export const getLoginHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch the last 10 login history logs
    const history = await LoginHistory.find({ userId })
      .sort({ loginTime: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      message: "Login history retrieved successfully",
      data: history,
    });
  } catch (error: any) {
    console.error("getLoginHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve login history",
      error: error.message,
    });
  }
};



export const loginHistoryFIND =async(req:AuthRequest,res:Response)=>{
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(400).json({message:"user not found error"})
    }
    
    const lloginhistory = await LoginHistory.find({userId})

    return res.status(200).json({message:"loginHistroy found sucessfully",lloginhistory})
  } catch (error:any) {
    console.log(`loginHistoryFINd error ${error}`)

    return res.status(500).json({message:"loginHistoryFind error",error:error.message})
  }
}