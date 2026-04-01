import express from "express"
import { getProfile, UploadProfile } from "../controllers/users.controller"
import upload from "../middlewares/upload"


const router = express.Router()

router.route("/me").get(getProfile)
router.route("/upload-profile").post(upload.single("image"),UploadProfile)

export default router