import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "./middleware/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import userRoutes from "./routes/users.js";
import stockRoutes from "./routes/stock.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
}));
app.use("/api/invoices", requireAuth, invoiceRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/available-stock", requireAuth, stockRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Something went wrong." : error.message });
});
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Just Relax API listening on port ${port}`));
