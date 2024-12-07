// import
import dotenv from "dotenv";
import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import artikel from "./routes/artikel.js";
import video from "./routes/video.js";
import kalkulatorBMI from "./routes/kalkulatorBMI.js";
import kalkulatorKalori from "./routes/kalkulatorKalori.js";
import Transaksi from "./routes/transaksi.js";
import Chat from "./routes/chat.js";
import { initializeSocket } from "./services/socketConfig.js";

dotenv.config();
const port = process.env.PORT;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Middleware untuk melayani file statis
app.use("/public", express.static("public")); // Tambahkan ini

const server = http.createServer(app);

// routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/artikel", artikel);
app.use("/video", video);
app.use("/kalkulatorBMI", kalkulatorBMI);
app.use("/kalkulatorKalori", kalkulatorKalori);
app.use("/transaksi", Transaksi);
app.use("/chat", Chat);
app.post("/upload", (req, res) => {});

initializeSocket(server);

// listen
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
