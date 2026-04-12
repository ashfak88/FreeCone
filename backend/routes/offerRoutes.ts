import express from "express";
import { createOffer, getMyOffers, updateOfferStatus, getOfferById, payOffer, getEscrowSummary, addOfferUpdate, completeOffer, updateOfferGithub, rejectCompletion } from "../controllers/offerController";
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

// @route   POST /api/offers/:id/updates
router.route("/:id/updates")
  .post(protect, addOfferUpdate);

// @route   PUT /api/offers/:id/complete
router.route("/:id/complete")
  .put(protect, completeOffer);

router.route("/:id/reject-completion")
  .put(protect, rejectCompletion);

// @route   PUT /api/offers/:id/github
router.route("/:id/github")
  .put(protect, updateOfferGithub);

export default router;
