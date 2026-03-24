import express from "express"
import { Overview } from "../controllers/overview.controller"
const router = express.Router()

router.route("/").get(Overview)

export default router