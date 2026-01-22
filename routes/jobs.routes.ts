import express from "express"
import { addJob,getAllJobs,getSingleJob,updateJob,deleteJob } from "../controllers/jobs.controller"

const router = express.Router()

router.route("/").post(addJob).get(getAllJobs)

router.route("/:id").get(getSingleJob).put(updateJob).delete(deleteJob)


export default router