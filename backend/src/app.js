import express from "express";
import cors from "cors";
import product from "./routes/productRoutes.js";
import user from "./routes/userRoutes.js";
import order from "./routes/orderRoutes.js";
import payment from "./routes/paymentRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

// ✅ CORS Middleware (MUST be before routes)
app.use(
  cors({
    origin: "https://ecomerce-x0yf.onrender.com", // frontend URL from Render
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use("/api", product);
app.use("/api", user);
app.use("/api", order);
app.use("/api", payment);

export default app;