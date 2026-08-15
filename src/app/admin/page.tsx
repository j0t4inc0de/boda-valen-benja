"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Download, 
  Trash2, 
  Save, 
  CheckCircle,
  ExternalLink,
  Search,
  Heart,
  Upload,
  Music,
  Image as ImageIcon
} from "lucide-react";

interface Guest {
  id: number;
  name: string;
  rut: string;
  email: string;
  phone: string;
  isAttending: boolean;
  companionsCount: number;
  companionsNames: string;
  dietaryRestrictions: string;
  message: string;
  createdAt: string;
}

interface Settings {
  names: string;
  musicUrl: string;
  heroBg: string;
  introTitle: string;
  introText: string;
  weddingDate: string;
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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"guests" | "settings">("guests");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [guests, setGuests] = useState<Guest[]>([]);
  const [settings, setSettings] = useState<Settings>({
    names: "",
    musicUrl: "",
    heroBg: "",
    introTitle: "",
    introText: "",
    weddingDate: "",
    mapImage: "",
    address: "",
    hotelName: "",
    mapUrl: "",
    dressCode: "",
    giftText: "",
    bankName: "",
    bankAccountType: "",
    bankAccountNumber: "",
    bankAccountOwner: "",
    bankAccountRut: "",
    bankAccountEmail: "",
    footerText: "",
  });

  // UI state feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Upload states
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);
  const mapFileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  // 1. Verificación de Autenticación y Carga Inicial
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const checkRes = await fetch("/api/admin/check");
        if (!checkRes.ok) {
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);

        // Cargar Datos
        const [guestsRes, settingsRes] = await Promise.all([
          fetch("/api/guests"),
          fetch("/api/settings")
        ]);

        if (guestsRes.ok && settingsRes.ok) {
          const guestsData = await guestsRes.json();
          const settingsData = await settingsRes.json();
          setGuests(guestsData);
          
          // Formatear la fecha para el input datetime-local (yyyy-MM-ddThh:mm)
          const rawDate = new Date(settingsData.weddingDate);
          const offset = rawDate.getTimezoneOffset();
          const formattedDate = new Date(rawDate.getTime() - (offset*60*1000)).toISOString().slice(0, 16);

          setSettings({
            ...settingsData,
            weddingDate: formattedDate,
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del panel: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  // 2. Cerrar Sesión
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  // 3. Modificación del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Subida de Archivos (Fotos y MP3)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "heroBg" | "musicUrl" | "mapImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(targetField);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al subir el archivo");
      }

      const data = await res.json();
      setSettings((prev) => ({
        ...prev,
        [targetField]: data.url,
      }));
    } catch (err: any) {
      alert(err.message || "Error al subir el archivo");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  // 5. Guardar Configuraciones
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          weddingDate: settings.weddingDate && !isNaN(new Date(settings.weddingDate).getTime())
            ? new Date(settings.weddingDate).toISOString()
            : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al actualizar las configuraciones");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message || "Error al guardar. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Eliminar un invitado
  const handleDeleteGuest = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este invitado del listado?")) {
      return;
    }

    try {
      const res = await fetch(`/api/guests?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGuests((prev) => prev.filter((guest) => guest.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar invitado: ", error);
    }
  };

  // 7. Descargar Listado de Invitados en CSV
  const downloadCSV = () => {
    const headers = [
      "Nombre", 
      "RUT", 
      "Asistencia", 
      "Mensaje", 
      "Fecha Registro"
    ];
    
    const rows = guests.map((g) => [
      g.name,
      g.rut || "",
      g.isAttending ? "Si" : "No",
      g.message || "",
      new Date(g.createdAt).toLocaleString("es-CL")
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invitados_boda_${settings.names.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculos de estadísticas para confirmados
  const confirmedAttending = guests.filter((g) => g.isAttending);
  const declinedCount = guests.filter((g) => !g.isAttending).length;

  // Invitados filtrados
  const filteredGuests = guests.filter((g) => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.rut && g.rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (g.message && g.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-olive font-medium uppercase tracking-widest">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col">
      {/* 1. Header del Dashboard */}
      <header className="bg-white border-b border-gold-light/20 py-4 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-gold fill-gold" />
          <h1 className="text-lg font-serif text-olive font-medium">
            Panel de {settings.names || "Valentina & Benjamín"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-olive hover:text-gold transition-colors font-medium border border-gray-200 py-2 px-4 rounded-lg bg-white"
          >
            <span>Ir a la pagina</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors font-medium border border-red-100 py-2 px-4 rounded-lg bg-red-50/50 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Navegación de Pestañas */}
      <div className="bg-white border-b border-gray-100 flex px-6 md:px-8">
        <button
          onClick={() => setActiveTab("guests")}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium transition-all border-b-2 cursor-pointer ${
            activeTab === "guests"
              ? "border-gold text-olive font-semibold"
              : "border-transparent text-gray-400 hover:text-olive"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Invitados ({guests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium transition-all border-b-2 cursor-pointer ${
            activeTab === "settings"
              ? "border-gold text-olive font-semibold"
              : "border-transparent text-gray-400 hover:text-olive"
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Configuración Web (Cambiables)</span>
        </button>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {activeTab === "guests" ? (
          <div className="space-y-6">
            {/* Tarjetas Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-left">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Invitados Registrados</p>
                <p className="text-3xl font-serif font-light text-olive mt-1">{guests.length}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-left">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Total Confirmados</p>
                <p className="text-3xl font-serif font-light text-green-700 mt-1">{confirmedAttending.length}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-left">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">No Asistirán</p>
                <p className="text-3xl font-serif font-light text-red-600 mt-1">{declinedCount}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-left">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Porcentaje Asistencia</p>
                <p className="text-3xl font-serif font-light text-gold mt-1">
                  {guests.length > 0 ? `${Math.round((confirmedAttending.length / guests.length) * 100)}%` : "0%"}
                </p>
              </div>
            </div>

            {/* Listado y Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Buscador */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>

                {/* Descarga */}
                <button
                  onClick={downloadCSV}
                  disabled={guests.length === 0}
                  className="w-full md:w-auto bg-olive hover:bg-olive-light disabled:bg-olive/50 text-white text-xs font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar Listado (CSV)</span>
                </button>
              </div>

              {/* Tabla de Invitados */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100">
                      <th className="py-4 px-6">Invitado</th>
                      <th className="py-4 px-6">RUT</th>
                      <th className="py-4 px-4 text-center">Asiste</th>
                      <th className="py-4 px-6">Mensaje</th>
                      <th className="py-4 px-6">Registro</th>
                      <th className="py-4 px-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600 font-sans">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-olive">{guest.name}</td>
                          <td className="py-4 px-6 font-mono text-gray-500">{guest.rut || <span className="text-gray-300 italic">Sin RUT</span>}</td>
                          <td className="py-4 px-4 text-center">
                            {guest.isAttending ? (
                              <span className="inline-block py-1 px-2.5 bg-green-50 text-green-700 font-semibold rounded-full uppercase tracking-wider text-[10px]">
                                Sí
                              </span>
                            ) : (
                              <span className="inline-block py-1 px-2.5 bg-red-50 text-red-600 font-semibold rounded-full uppercase tracking-wider text-[10px]">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate" title={guest.message}>
                            {guest.message || <span className="text-gray-300 italic">Sin mensaje</span>}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-mono">
                            {new Date(guest.createdAt).toLocaleString("es-CL").slice(0, -3)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar invitado"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                          {searchTerm ? "No se encontraron invitados que coincidan con la búsqueda." : "Aún no hay invitados registrados."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Formulario de Configuración (Cambiables) */
          <form onSubmit={handleSaveSettings} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8 text-left">
            
            {/* Inputs ocultos para subida de archivos */}
            <input 
              type="file" 
              ref={heroFileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "heroBg")} 
            />
            <input 
              type="file" 
              ref={musicFileInputRef} 
              accept="audio/mp3,audio/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "musicUrl")} 
            />
            <input 
              type="file" 
              ref={mapFileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, "mapImage")} 
            />

            {/* Alertas */}
            {saveSuccess && (
              <div className="bg-green-50 border-l-2 border-green-500 p-4 rounded text-xs text-green-700 font-semibold font-sans flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Las configuraciones se han guardado y actualizado exitosamente.</span>
              </div>
            )}
            {saveError && (
              <div className="bg-red-50 border-l-2 border-red-500 p-4 rounded text-xs text-red-700 font-sans">
                {saveError}
              </div>
            )}

            {/* SECCIÓN 1: Datos Principales */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Información del Matrimonio & Hero
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="names" className="text-xs font-semibold text-olive">
                    Nombres de los Novios
                  </label>
                  <input
                    type="text"
                    id="names"
                    name="names"
                    value={settings.names}
                    onChange={handleInputChange}
                    placeholder="Ej: Valentina & Benjamín"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="weddingDate" className="text-xs font-semibold text-olive">
                    Fecha y Hora del Matrimonio
                  </label>
                  <input
                    type="datetime-local"
                    id="weddingDate"
                    name="weddingDate"
                    value={settings.weddingDate}
                    onChange={handleInputChange}
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hero Background */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="heroBg" className="text-xs font-semibold text-olive">
                      Foto de Portada (Hero)
                    </label>
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      disabled={uploadingField === "heroBg"}
                      className="text-[11px] text-olive hover:text-gold font-medium flex items-center gap-1 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      <span>{uploadingField === "heroBg" ? "Subiendo..." : "Subir Foto"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    id="heroBg"
                    name="heroBg"
                    value={settings.heroBg}
                    onChange={handleInputChange}
                    placeholder="URL o ruta de la imagen"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  {settings.heroBg && (
                    <div className="mt-1 relative h-20 w-32 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                      <img src={settings.heroBg} alt="Vista previa Hero" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Canción MP3 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="musicUrl" className="text-xs font-semibold text-olive">
                      Canción de Fondo (MP3)
                    </label>
                    <button
                      type="button"
                      onClick={() => musicFileInputRef.current?.click()}
                      disabled={uploadingField === "musicUrl"}
                      className="text-[11px] text-olive hover:text-gold font-medium flex items-center gap-1 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Music className="h-3 w-3" />
                      <span>{uploadingField === "musicUrl" ? "Subiendo..." : "Subir Archivo MP3"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    id="musicUrl"
                    name="musicUrl"
                    value={settings.musicUrl}
                    onChange={handleInputChange}
                    placeholder="URL o ruta del archivo MP3"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  {settings.musicUrl && (
                    <audio controls src={settings.musicUrl} className="w-full mt-1 h-8 scale-95 origin-left" />
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Mensaje de Bienvenida */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Sección "Nos Casamos"
              </h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="introTitle" className="text-xs font-semibold text-olive">
                  Título
                </label>
                <input
                  type="text"
                  id="introTitle"
                  name="introTitle"
                  value={settings.introTitle}
                  onChange={handleInputChange}
                  placeholder="Ej: Nos casamos"
                  className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="introText" className="text-xs font-semibold text-olive">
                  Párrafo de Introducción
                </label>
                <textarea
                  id="introText"
                  name="introText"
                  rows={3}
                  value={settings.introText}
                  onChange={handleInputChange}
                  placeholder="Escribe el mensaje de invitación..."
                  className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                />
              </div>
            </div>

            {/* SECCIÓN 3: Ubicación */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Detalles del Lugar & Google Maps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="hotelName" className="text-xs font-semibold text-olive">
                    Nombre del Lugar/Hotel
                  </label>
                  <input
                    type="text"
                    id="hotelName"
                    name="hotelName"
                    value={settings.hotelName}
                    onChange={handleInputChange}
                    placeholder="Ej: Hotel Boutique Cabernet"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="address" className="text-xs font-semibold text-olive">
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Héctor Calvo 380, Cerro Bellavista, Valparaíso"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mapUrl" className="text-xs font-semibold text-olive">
                    Enlace de Google Maps (Botón)
                  </label>
                  <input
                    type="url"
                    id="mapUrl"
                    name="mapUrl"
                    value={settings.mapUrl}
                    onChange={handleInputChange}
                    placeholder="https://maps.app.goo.gl/..."
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="mapImage" className="text-xs font-semibold text-olive">
                      Foto de Ubicación / Lugar
                    </label>
                    <button
                      type="button"
                      onClick={() => mapFileInputRef.current?.click()}
                      disabled={uploadingField === "mapImage"}
                      className="text-[11px] text-olive hover:text-gold font-medium flex items-center gap-1 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>{uploadingField === "mapImage" ? "Subiendo..." : "Subir Foto"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    id="mapImage"
                    name="mapImage"
                    value={settings.mapImage}
                    onChange={handleInputChange}
                    placeholder="URL o ruta de la foto"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  {settings.mapImage && (
                    <div className="mt-1 relative h-20 w-32 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                      <img src={settings.mapImage} alt="Vista previa Lugar" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: Código de Vestimenta */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Estilo & Vestimenta
              </h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dressCode" className="text-xs font-semibold text-olive">
                  Código de Vestimenta
                </label>
                <input
                  type="text"
                  id="dressCode"
                  name="dressCode"
                  value={settings.dressCode}
                  onChange={handleInputChange}
                  placeholder="Ej: Semi formal"
                  className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
              </div>
            </div>

            {/* SECCIÓN 5: Regalos & Cuentas Bancarias */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Mesa de Regalos & Transferencia
              </h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="giftText" className="text-xs font-semibold text-olive">
                  Texto Introductorio
                </label>
                <textarea
                  id="giftText"
                  name="giftText"
                  rows={3}
                  value={settings.giftText}
                  onChange={handleInputChange}
                  placeholder="Escribe la introducción para los regalos..."
                  className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankName" className="text-xs font-semibold text-olive">
                    Nombre del Banco
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={settings.bankName}
                    onChange={handleInputChange}
                    placeholder="Ej: Banco de Chile"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankAccountType" className="text-xs font-semibold text-olive">
                    Tipo de Cuenta
                  </label>
                  <input
                    type="text"
                    id="bankAccountType"
                    name="bankAccountType"
                    value={settings.bankAccountType}
                    onChange={handleInputChange}
                    placeholder="Ej: Cuenta Corriente"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankAccountNumber" className="text-xs font-semibold text-olive">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={settings.bankAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Ej: 123-45678-90"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankAccountOwner" className="text-xs font-semibold text-olive">
                    Nombre Titular
                  </label>
                  <input
                    type="text"
                    id="bankAccountOwner"
                    name="bankAccountOwner"
                    value={settings.bankAccountOwner}
                    onChange={handleInputChange}
                    placeholder="Ej: Valentina & Benjamín"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankAccountRut" className="text-xs font-semibold text-olive">
                    RUT Titular
                  </label>
                  <input
                    type="text"
                    id="bankAccountRut"
                    name="bankAccountRut"
                    value={settings.bankAccountRut}
                    onChange={handleInputChange}
                    placeholder="Ej: 12.345.678-9"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bankAccountEmail" className="text-xs font-semibold text-olive">
                    Correo del Titular
                  </label>
                  <input
                    type="email"
                    id="bankAccountEmail"
                    name="bankAccountEmail"
                    value={settings.bankAccountEmail}
                    onChange={handleInputChange}
                    placeholder="Ej: correo@ejemplo.com"
                    className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: Pie de Página */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-semibold text-olive border-b border-gray-100 pb-2">
                Pie de Página (Footer)
              </h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="footerText" className="text-xs font-semibold text-olive">
                  Mensaje de Agradecimiento Final
                </label>
                <textarea
                  id="footerText"
                  name="footerText"
                  rows={3}
                  value={settings.footerText}
                  onChange={handleInputChange}
                  placeholder="Escribe el mensaje de agradecimiento final..."
                  className="border border-gray-200 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                />
              </div>
            </div>

            {/* Botón de Guardado */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-olive hover:bg-olive-light disabled:bg-olive/60 text-white font-sans text-xs font-semibold uppercase tracking-wider py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
