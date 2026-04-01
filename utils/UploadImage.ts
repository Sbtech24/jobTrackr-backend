import cloudinary from "../config/cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export async function UploadImage(file: Express.Multer.File): Promise<string> {
  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile_images" },
      (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  return result.secure_url;
}