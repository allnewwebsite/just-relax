import { Router } from "express";
import {
  createStockVehicle, getStockVehicle, listStock, removeStockVehicle, updateStockVehicle,
} from "../controllers/stockController.js";

const router = Router();
router.get("/", listStock);
router.get("/:id", getStockVehicle);
router.post("/", createStockVehicle);
router.put("/:id", updateStockVehicle);
router.delete("/:id", removeStockVehicle);
export default router;
