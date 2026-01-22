import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import { conn } from "../config/db";

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // fetch user details
    const query = `SELECT * from users WHERE id=$1`;
    const result = await conn.query(query, [user]);
    const data = result.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        username: data.username,
        profile_pic:data.profile_pic,
        email: data.email,
      },
    });
  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
