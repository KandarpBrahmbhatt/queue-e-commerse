import express from 'express'
import { 
    getDashboardOverView, 
    getAllUsers, 
    updateUserRole, 
    blockOrUnblockUser 
} from '../controller/admin.controller'
import { isAuth, authorizeRole } from '../middaleware/auth.middleware'

const adminRouter = express.Router()

// Dashboard Overview (Admin & SuperAdmin only)
adminRouter.get(
    "/getAdmin",
    isAuth,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    getDashboardOverView
)

// List all users (Admin & SuperAdmin only)
adminRouter.get(
    "/users",
    isAuth,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    getAllUsers
)

// Change user roles (SuperAdmin only to prevent privilege escalation)
adminRouter.put(
    "/users/:userId/role",
    isAuth,
    authorizeRole("SUPER_ADMIN"),
    updateUserRole
)

// Block/Unblock users (Admin & SuperAdmin only)
adminRouter.put(
    "/users/:userId/block",
    isAuth,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    blockOrUnblockUser
)

export default adminRouter