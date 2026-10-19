"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;

  return (
    <motion.div
      key={key}
      initial={{ scaleX: 0, opacity: 1, originX: 0 }}
      animate={{
        scaleX: [0, 0.75, 1],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.55,
        times: [0, 0.7, 1],
        ease: "easeInOut",
      }}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#0F766E] via-[#2DD4BF] to-[#14B8A6] z-50 shadow-[0_0_12px_rgba(45,212,191,0.8)] pointer-events-none"
    />
  );
}
