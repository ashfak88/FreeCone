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
  ArrowLeft,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [payError, setPayError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

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

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const type = searchParams.get("type");

        let endpoint = `${API_URL}/offers/${id}`;
        if (type === "proposal") {
          endpoint = `${API_URL}/jobs/proposals/${id}`;
        }

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
          if (type === "proposal") {
            setOffer({
              _id: data._id,
              jobTitle: data.job?.title || "Project Payment",
              budget: data.proposedRate || data.job?.budget || 0,
              freelancer: data.talent,
              client: data.job?.user,
              description: data.coverLetter,
              isPaid: data.isPaid || false,
            });
          } else {
            setOffer(data);
          }
        } else {
          setLoadError(data.message || "Failed to load payment details.");
        }
      } catch (err: any) {
        setLoadError("Connection error. Please check that the server is running.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPaymentData();
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FreeCone",
        description: `Payment for ${offer.jobTitle}`,
        image: "https://your-logo-url.com/logo.png",
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
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setSuccess(true);
              setOffer((prev: any) => ({ ...prev, isPaid: true }));
            } else {
              setPayError(verifyData.message || "Payment verification failed.");
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Messages</span>
        </button>

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
                        <div className="grid grid-cols-1 gap-4">
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
                        `Pay $${(offer.budget || 0).toLocaleString()} via Razorpay`
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
                          <span className="text-slate-400">Platform Fee</span>
                          <span className="text-green-400 font-mono">FREE</span>
                        </div>
                        <div className="pt-4 flex justify-between items-end">
                          <span className="text-slate-200 font-bold">Total Amount</span>
                          <span className="text-3xl font-extrabold text-white font-mono">${(offer.budget || 0).toLocaleString()}</span>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-20 px-8 bg-white rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-200">
                <CheckCircle2 className="text-white w-12 h-12" />
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Payment Successful!</h2>
              <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                The advance payment for <span className="font-bold text-slate-900">"{offer.jobTitle}"</span> has been securely processed. The freelancer has been notified.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
                <button
                  onClick={() => router.push("/messages")}
                  className="h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  Back to Chat
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="h-14 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
