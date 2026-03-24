import { conn } from "../config/db";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import type { Response,NextFunction } from "express";


export async function Overview (req:AuthRequest,res:Response,next:NextFunction){
        try{
        const user  = req.user.id
        if(!user){
         return res.status(401).json({message:"Unauthorized access"})
        }
      
        const query  = `SELECT status from jobs where user_id =$1 `
     
        const result = await conn.query(query,[user])
   
        const data = result.rows
      
        const interview = data.filter((item)=> item.status == "Interview").length
        const applied = data.filter((item)=> item.status == "Applied").length
        const rejected= data.filter((item)=> item.status == "Rejected").length
        const offer = data.filter((item)=> item.status == "Offer").length
      

        const formattedData  = {
            interview: interview,
            applied:applied,
            rejected:rejected,
            offer:offer


        }

        return res.status(200).json({overview:formattedData})

        }catch(err){
            
    next(err);
    return res.status(500).json({ message: "Internal server error" });
        }

}