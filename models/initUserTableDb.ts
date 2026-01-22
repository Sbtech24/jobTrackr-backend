import { conn } from "../config/db";


export async function initUserTable(){
    try{
        await conn.query(`
        CREATE TABLE IF NOT EXISTS users(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profile_pic TEXT,
        refresh_Token TEXT NULL, 
        created_at TIMESTAMP DEFAULT NOW()
        )
        `)
        console.log('user table successfully initailised')

    }catch(err){
        console.log('error connecting to table',err)

    }
   
}