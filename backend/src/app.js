// import
import dotenv from "dotenv";
import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import artikel from "./routes/artikel.js";
import video from "./routes/video.js";
import kalkulatorBMI from "./routes/kalkulatorBMI.js";
import kalkulatorKalori from "./routes/kalkulatorKalori.js";

dotenv.config();
const port = process.env.PORT;

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/artikel", artikel);
app.use("/video", video);
app.use("/kalkulatorBMI", kalkulatorBMI);
app.use("/kalkulatorKalori", kalkulatorKalori);
app.post("/upload", (req, res) => { });

// listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
