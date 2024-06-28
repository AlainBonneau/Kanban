import { Router } from "express";
import * as cardController from "../controllers/cardController.js";
import { controllerWrapper as cw } from "./controllerWrapper.js";

export const router = Router();


router.get("/cards", cw(cardController.getAllCards));
router.get("/cards/:id", cw(cardController.getOneCard));
router.delete("/cards/:id", cw(cardController.deleteCard));
router.post("/cards", cw(cardController.createCard));
router.patch("/cards/:id", cw(cardController.updateCard));
