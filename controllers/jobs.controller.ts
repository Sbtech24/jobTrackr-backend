import type { Request, Response,NextFunction } from "express";
import { conn } from "../config/db";
import type { AuthRequest } from "../middlewares/AuthMiddleware";


export async function addJob(req:AuthRequest,res:Response,next:NextFunction){
    try{
        const user = req.user.id
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const {title,company,status,description,date_applied} = req.body 

        if(!title||!company||!status||!description){
            res.status(400).json({message:"Please provide all neccessary information"})
        }
        const query = `INSERT INTO jobs(title,company,status,description,date_applied,user_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`
        const result = await conn.query(query,[title,company,status,description,date_applied,user])
        const created = result.rows[0]
        
    res.status(201).json({
        id:created.id,
        title:created.title,
        company:created.company,
        status:created.status,
        description:created.description,
        date_applied:created.date_applied
    })


    }catch(err){
        next(err)
        res.status(500).json({error:"Internal server error",err})
    }

}
export async function getAllJobs(req:AuthRequest,res:Response,next:NextFunction){
    try{
        const user = req.user.id
        if(!user){
            return res.status(401).json({message:"Unauthorized access"})
        }
        const query = `SELECT * from jobs Where user_id = $1`
        const result  = await conn.query(query,[user])
        const created  = result.rows

        if(created.length === 0 ){
            return res.status(200).json({success: true,message:"No jobs found",data:created})
        }

    res.status(200).json({success: true,data:created})


    }catch(err){
        next(err)
        return res.status(500).json({error:"Internal server error"})
    }

}
export async function getSingleJob(req:AuthRequest,res:Response,next:NextFunction){
    try{
        const user = req.user.id
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }
        const {id} = req.params
        const query  = `SELECT * FROM jobs WHERE user_id=$1 AND id =$2`
        const result  = await conn.query(query,[user,id])
        const created =  result.rows

        if(created.length === 0){
           return res.status(404).json({error:'Not Found',message:"Job not found "})
        }
    
    res.status(200).json({success: true,data:created})


    }catch(err){
        next(err)
        res.status(500).json({error:"Internal Server error"})
    }

}
export async function updateJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, company, status, description } = req.body;

    if (!title && !company && !status && !description) {
      return res
        .status(400)
        .json({ message: "No fields provided for update" });
    }

    const fields: string[] = [];
    const values: any[] = [];

    // user_id is always $1
    values.push(userId);

    if (title) {
      fields.push(`title = $${values.length + 1}`);
      values.push(title);
    }

    if (company) {
      fields.push(`company = $${values.length + 1}`);
      values.push(company);
    }

    if (status) {
      fields.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (description) {
      fields.push(`description = $${values.length + 1}`);
      values.push(description);
    }

    // job id (last param)
    values.push(id);

    const query = `
      UPDATE jobs
      SET ${fields.join(", ")}
      WHERE user_id = $1 AND id = $${values.length}
      RETURNING *;
    `;

    const result = await conn.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}


export async function deleteJob(req:AuthRequest,res:Response,next:NextFunction){
    try{
         const user = req.user?.id;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
        const {id} = req.params
        const query = `DELETE FROM jobs WHERE user_id = $1 AND id=$2 RETURNING *`
        const result  = await conn.query(query,[user,id])
        const affected = result.rows

        if(affected.length === 0){
            return res.status(404).json({message:"No job deleted, try valid job"})
        }

    return res.status(200).json({success: true,message:"deleted job",deletedJob: affected[0],})


    }catch(err){
        next(err)
        res.status(404).json({error:"internal server error"})
    }

}