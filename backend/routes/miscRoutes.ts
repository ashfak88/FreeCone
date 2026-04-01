import express from "express";
import { ping } from "../controllers/miscController";

const router = express.Router();

router.get("/ping", ping);

export default router;
