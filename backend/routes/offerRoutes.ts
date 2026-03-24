import express from "express";
import { createOffer, getMyOffers, updateOfferStatus } from "../controllers/offerController";
import { protect } from "../middleware/auth";

const router = express.Router();

console.log(`   🔥 OFFER ROUTES LOADED AT: ${new Date().toLocaleTimeString()}`);

// @route   POST /api/offers
// @route   GET /api/offers
router.route("/")
  .post(protect, createOffer)
  .get(protect, getMyOffers);

// @route   PUT /api/offers/:id/status
router.route("/:id/status")
  .put(protect, updateOfferStatus);

export default router;
