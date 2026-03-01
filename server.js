import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
// import { startFollowUpCron } from "./cron/followUp.js";
// import multer from "multer";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import AdminRoutes from "./routes/adminRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import geoCodeRoutes from "./routes/geocode.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import siteVisitRoutes from "./routes/SiteVisitRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import exchangeRoutes from "./routes/exhangeRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/geocode", geoCodeRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/exchange-rate", exchangeRoutes);

const PORT = process.env.PORT || 8080;

// ✅ Connect DB → then start server → then start cron
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

    //  startFollowUpCron();
    });
  })
  .catch((err) => console.log(err));