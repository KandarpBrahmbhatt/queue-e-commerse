import rateLimit from "express-rate-limit";

// globally badha mate use thase
export const rateLimiter  = rateLimit({
    windowMs:15 * 60 *1000, // 15 min
    max:100,
    standardHeaders:true,
    legacyHeaders:false,

    message:{
        success:false,
        message:"Too many requests. Please try again later"
    }
})

export const loginLimiter = rateLimit({
    windowMs:15 * 60 * 1000,
    max:5,

    message:{
        success:false,
        message:"To many login attempts. Try again after 15 minutes "
    }
})

export const signupLimiter = rateLimit({
    windowMs:15 * 60 *1000,
    max:103,
    message:"Too many signup attepmts"
})