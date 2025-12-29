// src/components/HelpModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from 'react';

export default function HeiligabendModal({ children, onClose }) {
  // ---------------------------------------------
  // Schließen durch Klick außerhalb (Overlay-Klick)
  // ---------------------------------------------
  const handleOverlayClick = (event) => {
    // Wenn das Ziel des Klicks GENAU der Overlay-Container ist
    // (und nicht ein Element INNERHALB des Modals)
    if (event.target === event.currentTarget) {
      onClose(); // Modal schließen 
    }
  };

  // ---------------------------------------------
  // Schließen per ESC-Taste (mithilfe von useEffect)
  // ---------------------------------------------
  useEffect(() => {
    const handleEscape = (event) => {
      // Prüfen, ob die gedrückte Taste die Escape-Taste ist
      if (event.key === 'Escape') {
        onClose(); // Modal schließen
      }
    };

    // Event-Listener beim Mounten (Öffnen) hinzufügen
    document.addEventListener('keydown', handleEscape);

    // Clean-up Funktion: Entfernt den Listener beim Unmounten (Schließen)
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]); // Abhängigkeit von setActiveDoor, um sicherzustellen, dass die Funktion aktuell ist
  
  return (
    <AnimatePresence>
      {/* Overlay – dimmt den Hintergrund */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        {/* Modal‑Box – wächst vom Zentrum aus */}
        <motion.div
          className="bg-white
          rounded-lg p-6 
          max-w-[80vw] max-h-[90vh] overflow-y-auto
          shadow-xl relative
          "
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* X‑Icon rechts‑oben */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800
              focus:outline-none"
            aria-label="Schließen"
          >
            {/* Unicode‑Kreuz*/}✖
          </button>

          {/* Inhalt (children) */}
          <div className="mt-4">{children}</div>

          {/* Schließen‑Button am unteren Rand */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="
                px-4 py-2 text-white bg-blue-600 rounded
                hover:bg-blue-700 transition-colors
              "
            >
              Schließen
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
