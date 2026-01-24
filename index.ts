import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { initDb } from "./models/initDb";
import jobRoutes from "./routes/jobs.routes";
import authRoutes from "./routes/auth.routes";
import { initUserTable } from "./models/initUserTableDb";
import cookieParser from "cookie-parser";
import { AuthMiddleWare } from "./middlewares/AuthMiddleware";
import userRoutes from "./routes/users.routes";
import { limiter } from "./middlewares/RateLimiterMiddleware";
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./swagger";




dotenv.config();

const app = express();
const Port = process.env.PORT || 5000;

// cors
app.use(
  cors({
    origin: [
      "https://job-trackr-nu.vercel.app",
      "http://localhost:3000"
      
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Express 5–safe preflight handler
app.options(/.*/, cors());
// Middleware
app.use(express.json());
app.use(morgan("combined"));

// Rate limit middleware
app.use(limiter);



// middleware for cookies
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "jobTrackr-backend",
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", AuthMiddleWare, jobRoutes);
app.use("/api/v1/user", AuthMiddleWare, userRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(Port, async () => {
  console.log(`Server is Running on port ${Port}`);
});
