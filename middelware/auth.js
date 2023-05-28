import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = (req,res,next) =>{
    const token  = req.cookies['connect.sid']

    if(!token) return next(new ErrorHandler("Not Logged In",401))

    next();
}

export const authorizeAdmin = (req,res,next) =>{
    const admin = req.user.role

    if(admin !== "admin") return next(new ErrorHandler("Only Admin Allowed",405))

    next();
}