import express from "express";
import { createOffer, getMyOffers, updateOfferStatus, getOfferById, payOffer, getEscrowSummary } from "../controllers/offerController";
import { protect } from "../middleware/auth";

const router = express.Router();

console.log(`   🔥 OFFER ROUTES LOADED AT: ${new Date().toLocaleTimeString()}`);

// @route   POST /api/offers
// @route   GET /api/offers
router.route("/")
  .post(protect, createOffer)
  .get(protect, getMyOffers);

// @route   GET /api/offers/escrow-summary   ← MUST be before /:id
router.route("/escrow-summary")
  .get(protect, getEscrowSummary);

// @route   GET /api/offers/:id
router.route("/:id")
  .get(protect, getOfferById);

// @route   PUT /api/offers/:id/status
router.route("/:id/status")
  .put(protect, updateOfferStatus);

// @route   PUT /api/offers/:id/pay
router.route("/:id/pay")
  .put(protect, payOffer);

export default router;
