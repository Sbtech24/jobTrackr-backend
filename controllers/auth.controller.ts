import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { conn } from "../config/db";
import dotenv from "dotenv";
import type { AuthRequest } from "../middlewares/AuthMiddleware";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function RegisterUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password,username } = req.body;

    const query = `SELECT * from users WHERE email = $1`;
    const existing = await conn.query(query, [email]);
    const checkUser = existing.rows[0];
    if (checkUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insert = await conn.query(
      `INSERT INTO users (email,password,username) VALUES ($1,$2,$3) RETURNING *`,
      [email,hashedPassword,username]
    );
    const result = insert.rows[0];

    return res
      .status(201)
      .json({ success: true,message: `User ${result.username} created successfully` });
  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const query = `SELECT * from users WHERE email = $1`;
    const result = await conn.query(query, [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ mesage: "User not found" });
    const user = result.rows[0];
    const hash = result.rows[0].password;
    const comparePassword = await bcrypt.compare(password, hash);

    if (!comparePassword) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      return res.status(500).json({ message: "Internal server error" });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );
   

    const insertQuery = await conn.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2 RETURNING id`,
      [refreshToken, user.id]
    );

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    const dbresult = insertQuery.rows[0];

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    return res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function RefreshToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;

     if (!cookies?.jwt) {
      return res.status(401).json({ message: "Unauthorized, please log in" });
    }
    //  Verify the refersh token
    const verifyToken = jwt.verify(
      cookies.jwt,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    req.user = verifyToken;
    const user = req.user
    const email = req.user?.email;

    const query = `SELECT refresh_token FROM users WHERE email =$1 `;
    const result = await conn.query(query, [email]);
     const storedRefresh = result.rows[0]?.refresh_token;

    if (!storedRefresh || storedRefresh !== cookies.jwt) {
      return res.status(403).json({ message: "Refresh token mismatch" });
    }

      const accessToken = jwt.sign({ id: user.id, username: user.email }, ACCESS_TOKEN_SECRET as string, { expiresIn: "1h" });

    return res.status(200).json({ accessToken });

  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function Logout(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;
    
    if (!cookies) {
      return res
        .status(200)
        .json({ message: "Logout successful" });
    }
    //  Invalidate the cookies
  res.clearCookie("jwt",{
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    res.status(200).json({success: true,message: "Logout successful"})

  } catch (err) {
    next(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function ForgotPassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(404).json({ message: "Password missmatch" });
    }
    const saltRounds = 10;
    const hasPassword = await bcrypt.hash(newPassword, saltRounds);
    const query = `UPDATE users SET password =$1 WHERE id= $2`;
    const result = (await conn.query(query, [hasPassword, user])).rows[0];
    return res.status(201).json({success: true, message: `Password Updated successfully` });
  } catch (err) {
    next(err);
    return res.status(500).json({success: false, message: "Internal server error" });
  }
}
