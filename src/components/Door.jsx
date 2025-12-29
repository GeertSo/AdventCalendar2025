// src/components/Door.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import parse from "html-react-parser";
//import { testmode, testday, testmonth, testyear } from "../App";
import { getToday, getMonth, getYear } from "../utils/datefunctions";

export default function Door({
  day,
  question,
  options,
  correctOption,
  explanation,
  isActive, // true : dieses Türchen zeigt das Modal
  setActiveDoor, // (num|null) => void – öffnet / schließt das Modal
}) {
  //day <= 24 ? console.log(day, " Door() aufgerufen, correctOption = ", correctOption) : {};
  /* -------------------------------------------------
   * 1️⃣  Persistenz – Laden aus localStorage
   * ------------------------------------------------- */
  const storageKey = `door-${day}`;
  const stored = localStorage.getItem(storageKey);
  const parsed = stored ? JSON.parse(stored) : {};

  const [answered, setAnswered] = useState(!!parsed.answered);
  const [selected, setSelected] = useState(
    typeof parsed.selected === "number" ? parsed.selected : null
  );
  const [isCorrect, setIsCorrect] = useState(
    parsed.hasOwnProperty("correct") ? parsed.correct : null
  );
  const [showExplanation, setShowExplanation] = useState(answered);

  /* -------------------------------------------------
   * 2️⃣  Persistenz‑Update
   * ------------------------------------------------- */
  useEffect(() => {
    const payload = {
      answered,
      selected,
      correct: isCorrect,
      correctOption,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [answered, selected, isCorrect, correctOption, storageKey]);

  /* -------------------------------------------------
   * 3️⃣  Aktuelles Datum – für Sperr‑Logik
   * ------------------------------------------------- */
  // prüfen, ob der Tag in der Zukunft liegt - oder bei debugmode "false"
  const isFuture = day > getToday() || getMonth() != 12 | getYear() != 2025;
  const isToday = day == getToday();
  const hasNoQuestion = !question?.trim(); // leere Frage → kein Inhalt

  const isDisabled = isFuture || hasNoQuestion; // Gesamtsperre

  /* -------------------------------------------------
   * 4️⃣  Klick‑Handler (öffnet das Modal, wenn erlaubt)
   * ------------------------------------------------- */
  const handleDoorClick = () => {
    if (isDisabled) return; // gesperrt => nichts tun
    setActiveDoor(day); // Modal öffnen (auch bei bereits beantwortet)
  };

  /* -------------------------------------------------
   * 5️⃣  Antwort‑Handler (innerhalb des Modals)
   * ------------------------------------------------- */
  const handleAnswer = (idx) => {
    if (answered) return;
    const correct = idx === correctOption;
    setSelected(idx);
    setIsCorrect(correct);
    setAnswered(true);
    setShowExplanation(true);
  };

  /* -------------------------------------------------
   * 6️⃣  Icon‑Helper (✅/❌/❓)
   * ------------------------------------------------- */
  const statusIcon = () => {
    if (!answered) return "❓";
    return isCorrect ? "✅" : "❌";
  };
  const answerCorrectText = () => {
    return isCorrect ? "Richtig!" : "Leider war Deine Antwort Falsch";
  };

  const iconColor = () => {
    if (!answered) return "text-gray-600";
    return isCorrect ? "text-green-600" : "text-red-600";
  };


  // ---------------------------------------------
  // Schließen durch Klick außerhalb (Overlay-Klick)
  // ---------------------------------------------
  const handleOverlayClick = (event) => {
    // Wenn das Ziel des Klicks GENAU der Overlay-Container ist
    // (und nicht ein Element INNERHALB des Modals)
    if (event.target === event.currentTarget) {
      setActiveDoor(null); // Modal schließen (Zoom‑Out)
    }
  };

  // ---------------------------------------------
  // Schließen per ESC-Taste (mithilfe von useEffect)
  // ---------------------------------------------
  useEffect(() => {
    const handleEscape = (event) => {
      // Prüfen, ob die gedrückte Taste die Escape-Taste ist
      if (event.key === 'Escape') {
        setActiveDoor(null); // Modal schließen (Zoom‑Out)
      }
    };

    // Event-Listener beim Mounten (Öffnen) hinzufügen
    document.addEventListener('keydown', handleEscape);

    // Clean-up Funktion: Entfernt den Listener beim Unmounten (Schließen)
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setActiveDoor]); // Abhängigkeit von setActiveDoor, um sicherzustellen, dass die Funktion aktuell ist

  /* -------------------------------------------------
   * 7️⃣  Render
   * ------------------------------------------------- */
  return (
    <>
      {/* ---------- 7.1️⃣  Door - only visible if day<25  ---------- */}
      <motion.div
        layoutId={`door-${day}`} // Morph‑ID
        className={`
          w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-26 xl:h-26 2xl:w-30 2xl:h-30 m-1
          flex items-center justify-center
          rounded-lg border-2
          ${
            answered
              ? "border-0 bg-white"
              : "bg-white/30 border-gray-500 border-dashed"
          }
          ${
            !answered && !isDisabled
              ? "hover:bg-white/60 cursor-pointer border-gray-200"
              : ""
          }
          ${isDisabled ? "bg-white/10 cursor-not-allowed" : "cursor-pointer"}
          ${day > 24 ? "invisible" : ""}
          select-none relative
        `}
        onClick={handleDoorClick}
      >
        {/* Ergebnis‑Icon, falls bereits beantwortet */}
        {answered && (
          <div className={`text-xl md:text-2xl ${iconColor()}`}>
            {statusIcon()}
          </div>
        )}

        {/* Textfarbe und Texthintergrundfarbe festlegen*/}
        <span
          className={`
            ${isDisabled ? "text-xl text-gray-700" : ""}
            ${answered ? "font-semibold text-xl md:text-2xl bg-trasparent text-gray-500" : ""}
            ${!isDisabled && !answered && isToday ? "font-bold text-yellow-400 bg-black/30 text-2xl md:text-3xl px-2" : ""}
            ${!isDisabled && !answered && !isToday ? "font-semibold text-yellow-400 bg-black/30 text-xl md:text-2xl px-2" : ""}
        `}
        >
          {day}
        </span>


      </motion.div>

      {/* ---------- 7.2️⃣  Modal (nur, wenn aktiv) ---------- */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId={`door-${day}`} // gleiche ID → Morph‑Effekt
            className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
          >
            {/* Card‑Inhalt – wächst vom Tile zum Modal */}
            <motion.div
              className="bg-white rounded-lg p-8 shadow-xl                 
                max-w-[80vw]
                max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Frage‑Text */}
              <p className="text-center mb-4 text-xl lg:text-2xl whitespace-pre-line">
                {question}
              </p>

              {/* ---------- Antwort‑Buttons ----------
                 * Wenn noch nicht beantwortet → aktiv,
                 * wenn bereits beantwortet → deaktiviert + farbige Markierung *
               ------------------------------------- */}
              <div className="flex flex-col gap-2">
                {options.map((opt, idx) => {
                  const isChosen = idx === selected;
                  const isRight = idx === correctOption;

                  // Hintergrundfarbe je nach Status
                  let bg = "bg-gray-100 hover:bg-gray-200";
                  if (answered) {
                    if (isRight) bg = "bg-green-100";
                    else if (isChosen) bg = "bg-red-100";
                    else bg = "bg-gray-100";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={answered}
                      className={`
                        py-2 px-3 rounded text-sm
                        ${bg}
                        text-base lg:text-lg
                        transition-colors
                      `}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback‑Icon (nach Antwort) */}
              {answered && (
                <div
                  className={`mt-4 text-xl flex justify-center ${iconColor()}`}
                >
                  {answerCorrectText()}
                </div>
              )}

              {/* Erklärung (nach Antwort bzw. sofort bei erneutem Öffnen) */}
              {showExplanation && (
                <div className="mt-4 text-base lg:text-lg text-gray-800 whitespace-pre-line">
                  <p>{parse(explanation)}</p>
                </div>
              )}

              {/* Weiter‑Button (schließt das Modal) */}
              {showExplanation && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setActiveDoor(null)} // Modal schließen (Zoom‑Out)
                    className="
                      px-4 py-2 bg-blue-600 text-white rounded
                      hover:bg-blue-700 transition-colors
                    "
                  >
                    Weiter
                  </button>
                </div>
              )}

              {/* X‑Icon rechts‑oben */}
              {showExplanation && (
                <button
                  onClick={() => setActiveDoor(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 focus:outline-none"
                  aria-label="Schließen"
                >
                  {/* Unicode‑Kreuz*/}✖
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
