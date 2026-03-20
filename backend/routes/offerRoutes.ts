import express from "express";
import { createOffer, getMyOffers } from "../controllers/offerController";
import { protect } from "../middleware/auth";

const router = express.Router();

console.log(`   🔥 OFFER ROUTES LOADED AT: ${new Date().toLocaleTimeString()}`);

// @route   POST /api/offers
// @route   GET /api/offers
router.route("/")
  .post(protect, createOffer)
  .get(protect, getMyOffers);

export default router;
