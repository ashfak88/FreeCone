"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Home,
  LayoutDashboard,
  MessageSquare,
  Hand
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, handleResponse } from "@/lib/api";

const EXCHANGE_RATE = 83.5;
const PLATFORM_FEE_PERCENT = 0.05;

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateOfferLocally, updateProposalLocally } = useStore();

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [payError, setPayError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(5);

  const [formData, setFormData] = useState({
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123",
    name: user?.name || ""
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoadError("You must be logged in to access this page.");
          setLoading(false);
          return;
        }

        const type = searchParams.get("type");

        let endpoint = `${API_URL}/offers/${id}`;
        if (type === "proposal") {
          endpoint = `${API_URL}/jobs/proposals/${id}`;
        }

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await handleResponse(res);

        if (data) {
          if (type === "proposal") {
            const isPaid = data.isPaid || false;
            setOffer({
              _id: data._id,
              jobTitle: data.job?.title || "Project Payment",
              budget: data.proposedRate || data.job?.budget || 0,
              freelancer: data.talent,
              client: data.job?.user,
              description: data.coverLetter,
              isPaid: isPaid,
            });
            if (isPaid) setSuccess(true);
          } else {
            setOffer(data);
            if (data.isPaid) setSuccess(true);
          }
        }
      } catch (err: any) {
        setLoadError("Connection error. Please check that the server is running.");
      } finally {
        setLoading(false);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/config/commission`);
        const data = await handleResponse(res);
        if (data) {
          setCommissionRate(data.platformCommission);
        }
      } catch (error) {
        console.error("Failed to fetch commission config:", error);
      }
    };

    if (id) {
      fetchPaymentData();
      fetchConfig();
    }
  }, [id, searchParams]);


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setPayError("");

    try {
      const resRazorpay = await loadRazorpay();
      if (!resRazorpay) {
        setPayError("Razorpay SDK failed to load. Are you online?");
        setProcessing(false);
        return;
      }

      const token = localStorage.getItem("accessToken");

      // 1. Create Order
      const orderRes = await fetch(`${API_URL}/payments/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: id,
          amount: offer.budget,
          type: searchParams.get("type") || "advance_payment",
        }),
      });

      const orderData = await handleResponse(orderRes);
      if (!orderData) return;

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FreeCone",
        description: `Payment for ${offer.jobTitle}`,
        image: "", // Use merchant default logo from Razorpay dashboard
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch(`${API_URL}/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...response,
                offerId: id,
                type: searchParams.get("type") || "advance_payment",
              }),
            });

            const verifyData = await handleResponse(verifyRes);
            if (verifyData) {
              setSuccess(true);
              const updated = verifyData.updatedDoc || { ...offer, isPaid: true };
              setOffer(updated);
              
              // Update global store instantly
              if (searchParams.get("type") === "proposal") {
                updateProposalLocally(updated);
              } else {
                updateOfferLocally(updated);
              }
            }
          } catch (err: any) {
            setPayError("Verification connection error. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#0F172A",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setPayError(response.error.description || "Payment failed");
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setPayError(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">Initializing Secure Checkout...</p>
      </div>
    );
  }

  if (loadError || !offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center gap-4 max-w-md w-full text-center shadow-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Details Not Found</h2>
          <p className="text-slate-600 text-sm">{loadError || "We couldn't find the payment details you're looking for."}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] text-slate-900 ${success ? "overflow-hidden" : ""}`}>

      <main className={`max-w-6xl mx-auto px-4 ${success ? "h-screen flex flex-col justify-center" : "py-8 md:py-16"}`}>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Checkout</h1>
                  <p className="text-slate-500">Securely finalize your advance payment to start the project</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SECURE CHECKOUT
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-3 text-slate-700">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Secure Payment Gateway</p>
                          <p className="text-xs text-slate-500">Fast and encrypted checkout via Razorpay</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Recipient Payout Destination - Moved to Main Card for Transparency */}
                          {(offer.freelancer?.paymentAccount?.upiId || offer.freelancer?.paymentAccount?.cardDetails?.last4) && (
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm font-bold">payments</span>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Recipient Payout Destination</p>
                              </div>
                              <div className="flex flex-col gap-2 pl-6">
                                {offer.freelancer.paymentAccount.upiId && (
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[10px] font-bold">account_balance_wallet</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">UPI: {offer.freelancer.paymentAccount.upiId}</span>
                                  </div>
                                )}
                                {offer.freelancer.paymentAccount.cardDetails?.last4 && (
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[10px] font-bold">credit_card</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CARD: **** {offer.freelancer.paymentAccount.cardDetails.last4}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400 font-medium italic pl-6">Funds will be held in Escrow and released to this account once milestones are approved.</p>
                            </div>
                          )}

                          {/* Payer's Saved Method Confirmation */}
                          {(user?.paymentAccount?.upiId || user?.paymentAccount?.cardDetails?.last4) && (
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm font-bold">person</span>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Your Saved Payment Info</p>
                              </div>
                              <div className="pl-6">
                                {user.paymentAccount.upiId && (
                                  <p className="text-xs font-bold text-slate-700">UPI: {user.paymentAccount.upiId}</p>
                                )}
                                {user.paymentAccount.cardDetails?.last4 && (
                                  <p className="text-xs font-bold text-slate-700">CARD: **** {user.paymentAccount.cardDetails.last4}</p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Your Name</label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {payError && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{payError}</span>
                      </div>
                    )}

                    <button
                      onClick={handlePayment}
                      disabled={processing}
                      className={`w-full h-16 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${processing
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.98]"
                        }`}
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay $${((offer.budget || 0) * (1 + commissionRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })} via Razorpay`
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3" />
                      Secure payment with 128-bit encryption
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── Order Summary ─── */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none"></div>

                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Order Summary
                    </h2>

                    <div className="space-y-6 relative z-10">
                      <div className="space-y-1">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Project Title</p>
                        <p className="text-lg font-medium leading-tight">{offer.jobTitle || "Project Payment"}</p>
                      </div>

                      <div className="flex items-center gap-4 py-6 border-y border-white/10">
                        <img
                          src={offer.freelancer?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.freelancer?.name || "Freelancer")}&background=6A6B4C&color=fff`}
                          className="w-12 h-12 rounded-2xl border border-white/10 object-cover"
                          alt={offer.freelancer?.name || "Freelancer"}
                        />
                        <div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Freelancer</p>
                          <p className="font-semibold text-primary">{offer.freelancer?.name || "—"}</p>
                        </div>
                      </div>


                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Advance Payment (100%)</span>
                          <span className="font-mono">${(offer.budget || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Platform Fee ({commissionRate}%)</span>
                          <span className="text-primary font-mono">${((offer.budget || 0) * (commissionRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-4 flex flex-col items-end gap-1">
                          <div className="flex justify-between w-full items-end border-t border-white/10 pt-4">
                            <span className="text-slate-200 font-bold">Total Amount</span>
                            <span className="text-3xl font-extrabold text-white font-mono">${((offer.budget || 0) * (1 + commissionRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                            Approx. ₹{Math.round((offer.budget || 0) * (1 + commissionRate / 100) * EXCHANGE_RATE).toLocaleString()} INR
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Escrow Protected</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Your money will be held securely in escrow and only released to the freelancer once you approve the work milestones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // ─── Success Screen ───
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto w-full"
            >
              <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60" />

                <div className="relative z-10 p-10 md:p-14 flex flex-col items-center text-center">
                  {/* Animated Handshake */}
                  <div className="mb-12 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 100 }}
                      className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden border border-primary/20"
                    >
                      {/* Left Hand */}
                      <motion.div
                        initial={{ x: -100, opacity: 0, rotate: 20 }}
                        animate={{ x: -8, opacity: 1, rotate: 45 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="absolute"
                      >
                        <Hand className="w-16 h-16 text-primary" />
                      </motion.div>

                      {/* Right Hand */}
                      <motion.div
                        initial={{ x: 100, opacity: 0, rotate: -20 }}
                        animate={{ x: 8, opacity: 1, rotate: -45 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="absolute"
                      >
                        <Hand className="w-16 h-16 text-primary scale-x-[-1]" />
                      </motion.div>

                    </motion.div>

                    {/* Shaking Motion */}
                    <motion.div
                      animate={{
                        y: [0, -8, 8, -8, 8, 0],
                      }}
                      transition={{
                        delay: 1,
                        duration: 0.6,
                        repeat: 1,
                        repeatType: "reverse",
                      }}
                      className="absolute inset-0 pointer-events-none"
                    />

                    {/* Decorative Rings */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 1.5 }}
                      className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="space-y-4 mb-12">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
                    >
                      Payment Successful!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed"
                    >
                      The advance payment for <span className="text-slate-900 font-bold">"{offer.jobTitle}"</span> has been processed. The project is now active and the freelancer has been notified.
                    </motion.p>
                  </div>

                               <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
                  >
                    <button
                      onClick={() => router.replace("/")}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 hover:bg-slate-100 rounded-3xl transition-all group border border-slate-100"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Home className="w-6 h-6 text-slate-600" />
                      </div>
                      <span className="font-bold text-slate-900">Go to Home</span>
                    </button>
                    <button
                      onClick={() => router.replace("/dashboard")}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-primary/5 hover:bg-primary/10 rounded-3xl transition-all group border border-primary/10"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                      </div>
                      <span className="font-bold text-slate-900">Dashboard</span>
                    </button>
                    <button
                      onClick={() => router.replace("/messages")}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-900 hover:bg-slate-800 rounded-3xl transition-all group shadow-xl shadow-slate-200"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-white">Back to Chat</span>
                    </button>
                  </motion.div>
                </div>

                {/* Footer info */}
                <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    FreeCone Escrow Protection Active
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
