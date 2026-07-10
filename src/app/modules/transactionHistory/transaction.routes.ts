// src/app/modules/points/point.route.ts

import { Router } from "express";
import { PointController } from "./transaction.controller";
import auth from "../../middlewares/auth";



const router = Router();

// Get transactions: all / earn / use
router.get("/transactions", auth() , PointController.getTransactions);

// Get points summary
router.get("/summary", auth() , PointController.getSummary);

export const TransactionRoute = router;
