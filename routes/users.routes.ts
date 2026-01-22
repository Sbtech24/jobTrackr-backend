import express from "express"
import { getProfile } from "../controllers/users.controller"


const router = express.Router()

router.route("/me").get(getProfile)
// user route to upload prfile picture(/profile-pic)
// user route (put request to update user profile: firstname,email,profile-picture)
export default router