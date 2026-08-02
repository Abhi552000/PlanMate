import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import orgRouter from "./routes/organizationRoute.js";
import notificationRouter from "./routes/notificationRoute.js";

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5174",
  "https://plan-mate-eight.vercel.app",
];

// MIDDLEWARE
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB CONNECT
connectDB();

// Routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/organization", orgRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
