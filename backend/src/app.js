import express from "express";
import cors from "cors";
import product from "./routes/productRoutes.js";
import user from "./routes/userRoutes.js";
import order from "./routes/orderRoutes.js";
import payment from "./routes/paymentRoutes.js";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

const app = express();

// CORS: use FRONTEND_URL when provided, otherwise allow localhost dev ports
const allowedOrigins = ["https://ecomerce-x0yf.onrender.com", "http://localhost:5173", "http://localhost:5174"].filter(Boolean);
const corsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow non-browser tools (Postman, server-to-server)
        return allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api", product);
app.use("/api", user);
app.use("/api", order);
app.use("/api", payment);

// Prefer serving the built frontend if files exist. This avoids "Cannot GET /" when frontend not built.
const frontendDist = path.resolve(process.cwd(), "frontend", "dist");
const indexHtml = path.join(frontendDist, "index.html");
const frontendBuilt = fs.existsSync(indexHtml);

if (frontendBuilt) {
  app.use(express.static(frontendDist));

  // Serve index.html for any non-API route so SPA routing works
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(indexHtml);
  });
} else {
  // Simple root to verify the server is up (useful for API-only deploys)
  app.get("/", (req, res) => res.send("API is running"));
}

// 404 for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  next();
});

// Basic error handler to avoid uncaught exceptions returning HTML
app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || "Server error" });
});

export default app;