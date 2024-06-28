import { Router } from "express";
import * as tagController from "../controllers/tagController.js";
import { controllerWrapper as cw } from "./controllerWrapper.js";

export const router = Router();

router.get("/tags", cw(tagController.getAllTags));
router.get("/tags/:id", cw(tagController.getOneTag));

router.post("/tags", cw(tagController.createTag));
router.patch("/tags/:id", cw(tagController.updateTag));
router.delete("/tags/:id", cw(tagController.deleteTag));

router.put("/cards/:cardId/tags/:tagId", cw(tagController.assignTagToCard));
router.delete("/cards/:cardId/tags/:tagId", cw(tagController.removeTagFromCard));
