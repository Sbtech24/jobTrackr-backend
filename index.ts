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


// cors
app.use(
  cors({
    origin: ["http://localhost:3000"],
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json());
app.use(morgan("combined"));

// Rate limit middleware
app.use(limiter);



// middleware for cookies
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", AuthMiddleWare, jobRoutes);
app.use("/api/v1/user", AuthMiddleWare, userRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT || 4000, async () => {
  console.log(`Server is Running on port ${process.env.PORT}`);
});
