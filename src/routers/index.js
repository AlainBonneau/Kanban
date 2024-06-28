// Router principal
import { Router } from "express";

import { router as listRouter } from "./listRouter.js";
import { router as cardRouter } from "./cardRouter.js";
import { router as tagRouter } from "./tagRouter.js";

export const router = Router();

router.use(listRouter);
router.use(cardRouter);
router.use(tagRouter);

// Middleware 404 (API)
router.use((req, res) => {
  res.status(404).json({ error: "Ressource not found"});
});
