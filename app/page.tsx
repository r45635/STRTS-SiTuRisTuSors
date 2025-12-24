"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, History, Settings } from "lucide-react";
import { partieEnCoursExiste } from "@/lib/storage";

export default function HomePage() {
  const [aPartieEnCours, setAPartieEnCours] = useState(false);

  useEffect(() => {
    setAPartieEnCours(partieEnCoursExiste());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
          STRTS
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 font-semibold">
          Si Tu Ris Tu Sors !
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4 w-full max-w-md"
      >
        <Link
          href="/setup"
          className="flex items-center justify-center gap-3 w-full bg-white text-purple-600 hover:bg-purple-50 font-bold py-6 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
        >
          <Play className="w-6 h-6" />
          <span className="text-xl">Nouvelle Partie</span>
        </Link>

        {aPartieEnCours ? (
          <Link
            href="/game"
            className="flex items-center justify-center gap-3 w-full bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold py-6 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
          >
            <History className="w-6 h-6" />
            <span className="text-xl">Reprendre la Partie</span>
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-3 w-full bg-white/20 text-white/50 font-bold py-6 px-8 rounded-2xl shadow-xl cursor-not-allowed"
          >
            <History className="w-6 h-6" />
            <span className="text-xl">Reprendre la Partie</span>
          </button>
        )}

        <Link
          href="/preferences"
          className="flex items-center justify-center gap-3 w-full bg-white/90 text-purple-600 hover:bg-white font-bold py-6 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xl">Historique & Préférences</span>
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-white/70 text-sm"
      >
        Version 1.0.0 - MVP
      </motion.p>
    </div>
  );
}
