"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}