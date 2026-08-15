"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Verificar si ya está autenticado al cargar
  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (res.ok) {
          router.push("/admin");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Credenciales inválidas");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-gold-light/20 p-8 rounded-2xl shadow-sm text-center"
      >
        <div className="flex flex-col items-center mb-8">
          <Heart className="h-10 w-10 text-gold mb-3 animate-pulse" />
          <h1 className="text-2xl font-serif text-olive font-light">Panel de Control</h1>
          <p className="text-xs text-olive-light font-sans tracking-wide mt-1">
            Administración del Matrimonio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {error && (
            <div className="bg-red-50 border-l-2 border-red-500 p-4 rounded text-xs text-red-700 font-sans">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs uppercase tracking-wider text-olive font-semibold font-sans">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs uppercase tracking-wider text-olive font-semibold font-sans">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-olive hover:bg-olive-light disabled:bg-olive/60 text-white py-3.5 rounded-xl text-sm font-sans font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
