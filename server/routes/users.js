import { Router } from "express";
import { createUser, getCurrentUser, listUsers, updateUser } from "../controllers/userController.js";
import { requireAdmin } from "../middleware/auth.js";
import { rateLimit } from "express-rate-limit";

const router = Router();
const accountCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Account creation limit reached. Please try again later." },
});
router.get("/me", getCurrentUser);
router.get("/", requireAdmin, listUsers);
router.post("/", requireAdmin, accountCreationLimit, createUser);
router.patch("/:uid", requireAdmin, updateUser);
export default router;
