"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, 
  VolumeX, 
  Calendar, 
  MapPin, 
  Gift, 
  CheckCircle, 
  Users, 
  Heart, 
  Copy, 
  Check,
  Clock,
  Compass,
  Shirt
} from "lucide-react";
import confetti from "canvas-confetti";

interface Settings {
  names: string;
  musicUrl: string;
  heroBg: string;
  introTitle: string;
  introText: string;
  weddingDate: string | Date;
  mapImage: string;
  address: string;
  hotelName: string;
  mapUrl: string;
  dressCode: string;
  giftText: string;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountOwner: string;
  bankAccountRut: string;
  bankAccountEmail: string;
  footerText: string;
}

interface InvitationClientProps {
  settings: Settings;
}

export default function InvitationClient({ settings }: InvitationClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clipboard copy feedback states
  const [copiedBank, setCopiedBank] = useState(false);

  // RSVP Form states
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    isAttending: "true", // string for radio select
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  const weddingDateObj = new Date(settings.weddingDate);

  // 1. Audio controls
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio(settings.musicUrl);
      audio.loop = true;
      audioRef.current = audio;

      // Intentar reproducción automática de inmediato
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((err) => {
          // Bloqueado por el navegador, se iniciará al primer clic
          console.log("Autoplay on mount blocked: ", err);
        });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings.musicUrl]);

  // Desvanecer la sugerencia de música después de 6 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log("Audio play blocked: ", err));
    }
    setIsPlaying(!isPlaying);
    setHasInteracted(true);
    setShowBubble(false);
  };

  // Play automatically on first user click anywhere if they haven't interacted yet
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            // Autoplay still blocked
            console.log("Autoplay blocked on interaction: ", err);
          });
      }
      // Remove listeners once interacted
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    window.addEventListener("scroll", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
    };
  }, [hasInteracted, isPlaying]);

  // 2. Countdown Calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(settings.weddingDate);
      const difference = +targetDate - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings.weddingDate]);

  // 3. Copy to clipboard helper
  const copyBankDetails = () => {
    const textToCopy = `
Banco: ${settings.bankName}
Tipo de Cuenta: ${settings.bankAccountType}
Número de Cuenta: ${settings.bankAccountNumber}
Nombre: ${settings.bankAccountOwner}
RUT: ${settings.bankAccountRut}
Correo: ${settings.bankAccountEmail}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 3000);
    });
  };

  // 4. RSVP submission
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === "name") {
      // Convertir a mayúsculas automáticamente
      sanitized = value.toUpperCase();
    } else if (name === "rut") {
      // Solo permitir letras y números (sin puntos, guiones, ni símbolos)
      sanitized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isAttending: formData.isAttending === "true",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocurrió un error al enviar el formulario.");
      }

      setSubmitSuccess(true);
      
      // Lanzar confeti si el invitado asistirá
      if (formData.isAttending === "true") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (error: any) {
      setSubmitError(error.message || "Error al enviar. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formato elegante de fecha
  const formattedDate = weddingDateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });

  // Dividir los nombres para estilar el "&"
  const splitNames = settings.names.split("&");
  const partner1 = splitNames[0]?.trim() || "Valentina";
  const partner2 = splitNames[1]?.trim() || "Benjamín";

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fdfbf7] relative">
      {/* 1. Botón Flotante de Música */}
      <button
        onClick={toggleMusic}
        aria-label="Reproducir o pausar música de fondo"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-olive text-white shadow-2xl hover:bg-olive-light transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer border border-gold"
      >
        {isPlaying ? (
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-5 w-5 animate-bounce" />
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[2px] h-2 bg-white animate-pulse"></span>
              <span className="w-[2px] h-3 bg-white animate-pulse" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-[2px] h-1 bg-white animate-pulse" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <VolumeX className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wider font-semibold font-sans hidden md:inline">Música</span>
          </div>
        )}
      </button>

      {/* Sugerencia de música inicial (se desvanece después de unos segundos o al interactuar con el botón) */}
      {showBubble && (
        <div className="fixed bottom-20 right-6 z-40 bg-white border border-gold-light py-2 px-3.5 rounded-lg shadow-lg text-xs font-sans tracking-wide text-olive flex items-center gap-2 animate-bounce">
          <Heart className="h-3 w-3 fill-gold text-gold animate-pulse" />
          <span>{isPlaying ? "Apreta aquí para silenciar la música" : "Apreta aquí para activar la música"}</span>
        </div>
      )}

      {/* 2. Hero Section */}
      <section
        className="relative h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(45, 62, 53, 0.45), rgba(45, 62, 53, 0.65)), url(${settings.heroBg})` }}
      >
        <div className="max-w-4xl px-4 flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-white text-xs md:text-sm uppercase tracking-[0.3em] font-sans font-medium mb-6 text-gold-light"
          >
            Nuestra Unión Civil
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 my-4"
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-cream-light font-serif tracking-tight font-light drop-shadow-sm select-none">
              {partner1}
            </h1>
            <span className="text-4xl md:text-6xl text-gold font-serif italic font-light drop-shadow-sm my-2 md:my-0">&</span>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-cream-light font-serif tracking-tight font-light drop-shadow-sm select-none">
              {partner2}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.0 }}
            className="w-16 h-[1px] bg-gold my-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="text-cream-light text-base md:text-lg tracking-widest font-sans font-light capitalize"
          >
            Sábado, 12 de Septiembre de 2026
          </motion.p>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer">
          <span className="text-[10px] uppercase tracking-[0.25em] text-cream-light opacity-80 font-sans font-light">Deslizar</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-gold rounded-full"
          />
        </div>
      </section>

      {/* Contenedor principal con patrón orgánico */}
      <div className="w-full bg-leaf-pattern flex flex-col items-center">

        {/* 3. Section 2: Intro / Nos casamos */}
        <section className="py-24 px-4 max-w-3xl text-center w-full">
          <div className="flex flex-col items-center">
            <Heart className="h-8 w-8 text-gold mb-6 animate-pulse" />
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0 }}
              className="text-3xl md:text-4xl lg:text-5xl text-olive font-serif font-light mb-6 tracking-wide"
            >
              {settings.introTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="text-base md:text-lg text-olive-light leading-relaxed font-sans font-light px-4 md:px-8 text-balance"
            >
              "{settings.introText}"
            </motion.p>
          </div>
        </section>

        {/* 4. Section 3: Countdown and Date */}
        <section className="py-16 px-4 bg-cream-dark/60 w-full flex flex-col items-center border-y border-gold-light/20">
          <div className="max-w-4xl text-center flex flex-col items-center">
            <Clock className="h-6 w-6 text-gold mb-4" />
            <h3 className="text-xl md:text-2xl text-olive font-serif font-light mb-8 tracking-wider">
              Los esperamos para celebrar nuestra unión
            </h3>
            
            {/* Cuenta Regresiva Visual */}
            <div className="flex items-center gap-1.5 sm:gap-6 md:gap-8 mb-10 select-none">
              <div className="flex flex-col items-center w-14 sm:w-24 bg-white p-2.5 sm:p-4 rounded-xl shadow-sm border border-gold-light/35">
                <span className="text-xl sm:text-4xl font-serif text-olive font-medium">{timeLeft.days}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-olive-light mt-1">Días</span>
              </div>
              <span className="text-lg sm:text-2xl text-gold">:</span>
              <div className="flex flex-col items-center w-14 sm:w-24 bg-white p-2.5 sm:p-4 rounded-xl shadow-sm border border-gold-light/35">
                <span className="text-xl sm:text-4xl font-serif text-olive font-medium">{timeLeft.hours}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-olive-light mt-1">Horas</span>
              </div>
              <span className="text-lg sm:text-2xl text-gold">:</span>
              <div className="flex flex-col items-center w-14 sm:w-24 bg-white p-2.5 sm:p-4 rounded-xl shadow-sm border border-gold-light/35">
                <span className="text-xl sm:text-4xl font-serif text-olive font-medium">{timeLeft.minutes}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-olive-light mt-1">Mins</span>
              </div>
              <span className="text-lg sm:text-2xl text-gold">:</span>
              <div className="flex flex-col items-center w-14 sm:w-24 bg-white p-2.5 sm:p-4 rounded-xl shadow-sm border border-gold-light/35">
                <span className="text-xl sm:text-4xl font-serif text-olive font-medium">{timeLeft.seconds}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-olive-light mt-1">Segs</span>
              </div>
            </div>

            {/* Fecha formateada */}
            <div className="px-6 py-3 border border-gold rounded-full bg-white shadow-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              <span className="text-xs sm:text-sm font-sans tracking-widest uppercase text-olive font-medium">
                {formattedDate} - 08:00 PM
              </span>
            </div>
          </div>
        </section>

        {/* 5. Section 4: Lugar / Ubicación */}
        <section className="py-24 px-4 max-w-5xl w-full flex flex-col md:flex-row items-center gap-12">
          {/* Foto del Lugar */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-gold-light/35"
            >
              <img
                src={settings.mapImage}
                alt="Lugar de la boda"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 text-gold">
              <MapPin className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.2em] font-sans font-semibold">Ubicación</span>
            </div>
            <h3 className="text-3xl font-serif font-light text-olive mb-4">
              Lugar de Celebración
            </h3>
            <p className="text-base text-olive font-medium mb-1 font-sans">
              {settings.hotelName}
            </p>
            <p className="text-sm text-olive-light leading-relaxed font-sans mb-8">
              {settings.address}
            </p>
            <a
              href={settings.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-olive hover:bg-olive hover:text-white text-olive py-3 px-6 rounded-lg text-sm font-sans font-medium transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Ver en Google Maps</span>
            </a>
          </div>
        </section>

        {/* 6. Section 5: Código de Vestimenta */}
        <section className="py-16 px-4 bg-olive text-cream-light w-full flex flex-col items-center text-center">
          <div className="max-w-2xl flex flex-col items-center">
            <span className="w-10 h-10 rounded-full border border-gold flex items-center justify-center text-gold mb-4 shadow-sm bg-olive-dark/10">
              <Shirt className="h-5 w-5" />
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-light text-cream-light mb-4 tracking-wider">
              Código de Vestimenta
            </h3>
            <div className="w-12 h-[1px] bg-gold my-4" />
            <p className="text-xl font-sans font-medium text-gold-light capitalize tracking-widest mt-2">
              {settings.dressCode}
            </p>
            <p className="text-xs text-cream-light/75 font-sans mt-3 font-light max-w-sm">
              Tu presencia y comodidad son lo más importante. Vístete cómodo para celebrar con nosotros.
            </p>
          </div>
        </section>

        {/* 7. Section 6: Mesa de Regalos / Datos Bancarios */}
        <section className="py-24 px-4 max-w-3xl w-full flex flex-col items-center text-center">
          <Gift className="h-8 w-8 text-gold mb-6 animate-pulse" />
          <h3 className="text-3xl font-serif font-light text-olive mb-6 tracking-wide">
            Mesa de Regalos
          </h3>
          <p className="text-sm md:text-base text-olive-light leading-relaxed font-sans mb-12 max-w-xl font-light">
            {settings.giftText}
          </p>

          {/* Tarjeta de Transferencia */}
          <div className="bg-cream-dark/40 border border-gold-light/40 rounded-2xl p-4 sm:p-8 w-full max-w-md shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full transform translate-x-4 -translate-y-4" />
            
            <h4 className="text-sm uppercase tracking-widest text-olive font-semibold font-sans mb-6 pb-2 border-b border-gold-light/20">
              Datos de Transferencia
            </h4>
            
            <div className="space-y-4 text-left font-sans text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">Banco</span>
                <span className="text-olive font-medium text-right">{settings.bankName}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">Tipo Cuenta</span>
                <span className="text-olive font-medium text-right">{settings.bankAccountType}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">Nº Cuenta</span>
                <span className="text-olive font-medium text-right font-mono">{settings.bankAccountNumber}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">Nombre</span>
                <span className="text-olive font-medium text-right">{settings.bankAccountOwner}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">RUT</span>
                <span className="text-olive font-medium text-right font-mono">{settings.bankAccountRut}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-olive-light font-light text-xs uppercase tracking-wider">Correo</span>
                <span className="text-olive font-medium text-right break-all">{settings.bankAccountEmail}</span>
              </div>
            </div>

            <button
              onClick={copyBankDetails}
              className="mt-8 w-full bg-olive hover:bg-olive-light text-white py-3 rounded-lg text-sm font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              {copiedBank ? (
                <>
                  <Check className="h-4 w-4 text-gold-light" />
                  <span>¡Datos Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Datos Bancarios</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* 8. Section 7: Confirmación de Asistencia (RSVP Form) */}
        <section id="rsvp-section" className="py-24 px-4 w-full bg-cream-dark/30 border-t border-gold-light/25 flex flex-col items-center">
          <div className="max-w-xl w-full flex flex-col items-center">
            <Heart className="h-6 w-6 text-gold mb-4" />
            <h3 className="text-3xl font-serif font-light text-olive mb-2 text-center tracking-wide">
              Confirmar Asistencia
            </h3>
            <p className="text-xs text-olive-light font-sans tracking-wide text-center mb-8">
              Por favor completa el formulario antes del 31 de Agosto
            </p>

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-gold-light/40 p-8 rounded-2xl shadow-md w-full text-center flex flex-col items-center"
                >
                  <CheckCircle className="h-16 w-16 text-gold mb-4 animate-bounce" />
                  <h4 className="text-xl font-serif text-olive mb-2 font-medium">¡Muchas Gracias!</h4>
                  <p className="text-sm text-olive-light font-sans leading-relaxed mb-6">
                    {formData.isAttending === "true" 
                      ? "Tu confirmación de asistencia ha sido registrada exitosamente. ¡Nos vemos en nuestro gran día!"
                      : "Gracias por notificarnos. Lamentamos que no puedas acompañarnos, te extrañaremos."}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setFormData({
                        name: "",
                        rut: "",
                        isAttending: "true",
                        message: "",
                      });
                    }}
                    className="border border-gold text-olive py-2 px-6 rounded-lg text-xs font-sans font-medium hover:bg-cream-dark transition-colors duration-200 cursor-pointer"
                  >
                    Enviar otra respuesta
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleRsvpSubmit}
                  className="bg-white border border-gold-light/20 p-4 sm:p-8 rounded-2xl shadow-sm w-full space-y-6 text-left"
                >
                  {submitError && (
                    <div className="bg-red-50 border-l-2 border-red-500 p-4 rounded text-xs text-red-700 font-sans">
                      {submitError}
                    </div>
                  )}

                  {/* Nombre */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-wider text-olive font-semibold font-sans">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: JOTA ERICES"
                      className="border border-gray-200 rounded-lg p-3 text-sm font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    />
                  </div>

                  {/* RUT */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="rut" className="text-xs uppercase tracking-wider text-olive font-semibold font-sans">
                      RUT *
                    </label>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      required
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="Ej: 12345678K"
                      maxLength={12}
                      className="border border-gray-200 rounded-lg p-3 text-sm font-sans font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    />
                    <span className="text-[11px] text-gray-400 font-sans">Solo números y letra verificadora, sin puntos ni guiones</span>
                  </div>

                  {/* Confirmar Asistencia */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider text-olive font-semibold font-sans mb-1">
                      ¿Asistirás a la fiesta? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer font-sans text-sm transition-all duration-200 ${
                        formData.isAttending === "true" 
                          ? "border-gold bg-cream-dark text-olive font-medium shadow-sm" 
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                        <input
                          type="radio"
                          name="isAttending"
                          value="true"
                          checked={formData.isAttending === "true"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span>Sí, asistiré</span>
                      </label>
                      
                      <label className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer font-sans text-sm transition-all duration-200 ${
                        formData.isAttending === "false" 
                          ? "border-gold bg-cream-dark text-olive font-medium shadow-sm" 
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                        <input
                          type="radio"
                          name="isAttending"
                          value="false"
                          checked={formData.isAttending === "false"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span>No podré asistir</span>
                      </label>
                    </div>
                  </div>



                  {/* Mensaje */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs uppercase tracking-wider text-olive font-semibold font-sans">
                      Mensaje para la pareja
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Escribe tus buenos deseos..."
                      className="border border-gray-200 rounded-lg p-3 text-sm font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none transition-all"
                    />
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-olive hover:bg-olive-light disabled:bg-olive/60 text-white py-4 rounded-xl text-sm font-sans font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Enviar Confirmación</span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 9. Footer (Section 8) */}
        <footer className="py-24 px-4 bg-olive text-cream-light w-full border-t border-gold-light/10 text-center flex flex-col items-center">
          <div className="max-w-2xl flex flex-col items-center">
            <Heart className="h-6 w-6 text-gold mb-6 animate-pulse" />
            <p className="text-sm sm:text-base leading-relaxed text-cream-light/80 italic font-sans max-w-md font-light mb-8">
              "{settings.footerText}"
            </p>
            <div className="w-8 h-[1px] bg-gold my-2" />
            <h4 className="text-2xl sm:text-3xl font-serif text-cream-light font-light tracking-widest uppercase mt-4 mb-16">
              Con Cariño, {partner1} & {partner2}
            </h4>

            {/* Créditos de We Are Samod */}
            <div className="flex flex-col items-center gap-2 mt-8 pt-8 border-t border-gold-light/10 w-full">
              <p className="text-[10px] text-cream-light/60 tracking-[0.2em] uppercase font-sans">
                PÁGINA HECHA CON CARIÑO POR <a href="https://wearesamod.com" target="_blank" rel="noopener noreferrer" className="text-gold-light font-medium hover:underline">WE ARE SAMOD</a>
              </p>
              <a 
                href="https://www.linkedin.com/in/juan-erices-fuentealba-628b4a27a/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cream-light/50 hover:text-gold transition-colors duration-300 p-2"
                aria-label="LinkedIn de Juan Erices"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
