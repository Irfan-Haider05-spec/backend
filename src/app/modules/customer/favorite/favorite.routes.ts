import express from "express";

import { addFavoriteValidation } from "./favorite.validation";

import favoriteController from "./favorite.controller";

import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";

const router = express.Router();

// ⭐ Add favorite merchant
router.post(
  "/add",
  auth(),
  validateRequest(addFavoriteValidation),
  favoriteController.addFavorite
);

// ⭐ Get all favorite merchants
router.get(
  "/my-favorites",
  auth(),
  favoriteController.getFavorites
);

// ⭐ Remove favorite merchant
router.delete(
  "/remove/:merchantId",
  auth(),
  favoriteController.removeFavorite
);

export const FavoriteRoutes = router;
