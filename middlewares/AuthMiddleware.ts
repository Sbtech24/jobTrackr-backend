import dotenv from "dotenv"
import jwt, { type JwtPayload } from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"

dotenv.config()

export interface AuthRequest extends Request{
    user?:any
}

export const AuthMiddleWare = (req:AuthRequest,res:Response,next:NextFunction) =>{
    const authHeader = req.headers["authorization"]

    if(!authHeader){
        return res.status(401).json({message:"Unauthorized access"})
    }
     const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" })
  }
   try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET  as string) as JwtPayload


  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized user" })
  }
    req.user = decoded
    next()

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" })
  }
}