import { Router } from "express";
import { login, register } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { executionSteps } from "../../db/schema/executions-steps";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
