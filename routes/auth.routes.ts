import express from "express"
import { RegisterUser,Login, ForgotPassword, RefreshToken, Logout } from "../controllers/auth.controller"
import { AuthMiddleWare } from "../middlewares/AuthMiddleware"

const router = express.Router()

router.route("/login").post(Login)
router.route("/register").post(RegisterUser)
router.route("/forgot-password").post(AuthMiddleWare,ForgotPassword)
router.route("/refresh").post(RefreshToken)
router.route("/logout").post(Logout)
export default router