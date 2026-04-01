import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/AuthMiddleware";
import { conn } from "../config/db";
import {UploadImage} from "../utils/UploadImage";

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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
        profile_pic: data.profile_pic,
        email: data.email,
      },
    });
  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function UploadProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const file = req.file;
    const user = req.user?.id;

    // check if user is authenticated
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image")) {
  return res.status(400).json({ message: "Only images allowed" });
}

    const imageUrl = await UploadImage(file);

   

    const query = `UPDATE users SET profile_pic=$1 WHERE id=$2 RETURNING *`;

    const result = await conn.query(query, [imageUrl, user]);



  if (result.rowCount === 0) {
  return res.status(404).json({ message: "User not found" });
}
  
 return res.status(201).json({
  message: "Image successfully added",
  data: result.rows[0].profile_pic, 
});
  } catch (err) {
    next(err);
  }
}
