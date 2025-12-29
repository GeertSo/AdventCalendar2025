// src/components/ClearGameButton.jsx
//import { testday,testmonth,testyear,testmode } from "../App";
import { getToday, getMonth, getYear } from "../utils/datefunctions";

export default function ClearGameButton() {
  // -----------------------------------------------
  // Entfernt nur die Spiel‑Keys (Prefix: "door-")
  // -------------------------------------------------
  const clearGameData = () => {
    // Durch alle Keys iterieren und nur die mit dem Prefix entfernen
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("door-")) {
        localStorage.removeItem(key);
      }
    });

    // kurze Rückmeldung für den Nutzer
    alert("Alle Spielstände wurden gelöscht.");
    
    // Seite sofort neu laden, damit das UI den gelöschten Zustand reflektiert:
    window.location.reload();
  };

    const isTestMode = () => {
    return `TESTMODE ${getToday()}.${getMonth()}.${getYear()}`;
  };

  // -----------------------------------------
  // UI – ein einfacher Button
  // ---------------------------------------
  return (
    <div className="text-white font-bold flex items-center">
      <button
        onClick={clearGameData}
        className="
          px-2 py-2 bg-red-600 text-white rounded
          text-sm md:text-base
          hover:bg-red-700 transition-colors
          focus:outline-none focus:ring-2 focus:ring-red-400
        "
      >
        Reset
      </button>
      <span className="ml-2 mr-2 size-3 relative flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-90"></span>
          <span className="relative inline-flex size-3 rounded-full bg-white"></span>
      </span>
      <div className="text-sm md:text-base lg:text-lg">
      {isTestMode()}
      </div>
      <span className="ml-2 size-3 relative flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-90" style={{ animationDelay: '0.5s' }}></span>
          <span className="relative inline-flex size-3 rounded-full bg-white"></span>
      </span>

    </div>
  );
}