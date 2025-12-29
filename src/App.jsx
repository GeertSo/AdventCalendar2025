// src/App.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { LayoutGroup } from "framer-motion";
import Door from "./components/Door";
import HelpModal from "./components/HelpModal";
import WaitModal from "./components/WaitModal";
import WrongTimeModal from "./components/WrongTimeModal";
import HeiligabendModal from "./components/HeiligabendModal";
import { shuffleArray } from "./utils/shuffle";
import ClearGameButton from "./components/ClearGameButton";
//import questionsData from "./data/questions.json";
import { myQuestionpath, myTestQuestionpath } from "./secretsNoGit";
import { setTestMode, setTestDayMonthYear, getTestMode, getToday, getMonth, getYear } from "./utils/datefunctions";

const VERSIONCODE = '1.0';

setTestMode(true);
setTestDayMonthYear(25, 12, 2025);

export default function App() {

  const TRIPLE_CLICK_TIMEOUT = 300; // Zeitlimit in Millisekunden
  const [questionpath, setQuestionpath] = useState(getTestMode() ? myTestQuestionpath : myQuestionpath);
  //const questionpath = getTestMode() ? myTestQuestionpath : myQuestionpath;
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoor, setActiveDoor] = useState(null); // null = kein Modal offen
  const [showHelp, setShowHelp] = useState(false);
  const [outside2025, setOutside25] = useState(getYear() != 2025);
  const [beforeDecember25, setBeforeDecember25] = useState(
    getMonth() < 12 && getYear() === 2025
  );
  const [heiligabend, setHeiligabend] = useState(
    getToday() === 24 && getMonth() === 12 && getYear() === 2025
  );
  const [testState, setTestState] = useState(getTestMode);

  const doors = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const day = i + 1;
      const q = questions.find((item) => item.day === day);
      return {
        day,
        question: q?.question ?? "",
        options: q?.options ?? [],
        correctOption: q?.correctOption ?? -1,
        explanation: q?.explanation ?? "",
      };
    });
  }, [loading]);

  // Zufällige Reihenfolge (Shuffle) erzeugen.
  const shuffledDoors = useMemo(() => shuffleArray(doors), [doors]);

  // Zeigt Version in Alert-Fenster an
  const handleTripleClick = () => {
    // A. Zähler inkrementieren
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // B. Alten Timer löschen, falls vorhanden
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // C. Prüfen, ob der Triple-Klick erreicht wurde
    if (newCount === 3) {
      // *** AKTION STARTEN ***
      console.log('🎉 Triple-Klick-Aktion ausgelöst!');
      alert('Version '+VERSIONCODE);
      //setTestMode(true);    // DEAKTIVIERT
      //setTestState(true);   // DEAKTIVIERT

      // Zähler zurücksetzen
      setClickCount(0);
      
      // Den Timer nicht erneut setzen, da die Aktion abgeschlossen ist
      return; 
    }

    // D. Neuen Timer setzen
    // Wenn innerhalb des Timeouts (300ms) kein weiterer Klick erfolgt, 
    // wird der Zähler auf 0 zurückgesetzt.
    timerRef.current = setTimeout(() => {
      //console.log('Zeit abgelaufen. Zähler zurückgesetzt.');
      setClickCount(0);
    }, TRIPLE_CLICK_TIMEOUT);
  };

  // Setze Testparameter wenn erforderlich
  useEffect(() => {
    setQuestionpath(getTestMode() ? myTestQuestionpath : myQuestionpath);
    setOutside25(getYear() != 2025);
    setBeforeDecember25(getMonth() < 12 && getYear() === 2025);
    setHeiligabend(getToday() === 24 && getMonth() === 12 && getYear() === 2025);
    //console.log("questionpath geändert, jetzt = ", questionpath);
    //console.log("testState = ", testState);
  }, [testState, questionpath]);

  // Lade die Fragen vom Server (z.B. /api/questions)
  useEffect(() => {
    //console.log("Lade Fragen von", questionpath);
    setLoading(true);
    async function load() {
      const questionarray = [];
      //let openloads = 0;
      for (let day = 1; day < 25; day++) {
        //openloads++;
        try {
          let apicall = questionpath + day;
          //console.log("Api-call = ",apicall);
          const res = await fetch(apicall);
          //console.log(day," nach fetch(), openloads = ",openloads);
          const data = await res.json();
          //console.log(day," nach json(), openloads = ",openloads);
          if (data.returncode == "OK") {
            //console.log("NACH Aufruf res.json()");
            //console.log(day," Data = ",data);
            const lettermapping = {
              A: 0,
              B: 1,
              C: 2,
            };
            const questiondata = {};
            questiondata.day = day;
            questiondata.question = data.question;
            questiondata.correctOption =
              lettermapping[data.correctAnswer] ?? -1;
            questiondata.explanation = data.explanation;
            questiondata.options = [data.answerA, data.answerB, data.answerC];
            //console.log("questiondata = ",questiondata);
            questionarray.push(questiondata);
            //console.log("questionarry = ", questionarray);
            setQuestions(questionarray);
          } else {
            console.error(
              "Die Frage ",
              day,
              " konnte nicht geladen werden: ",
              data.errorcode
            );
          }
        } catch (e) {
          console.error("Frage ", day, " konnten nicht geladen werden:", e);
        } finally {
          //setLoading(false);
        }
        //openloads--;
      }
      setLoading(false);
    }
    load();
  }, [questionpath]);

  // Während des Ladens ein simpler Spinner / Hinweis
  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-8">
        <div className="pt-24 flex items-center  text-white font-black text-4xl">
          Lade Fragen
{/*           <span className="ml-4 relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-white"></span>
          </span>
          <span className="ml-4 relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" style={{ animationDelay: '0.3s' }}></span>
            <span className="relative inline-flex size-3 rounded-full bg-white"></span>
          </span>
          <span className="ml-4 relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" style={{ animationDelay: '0.6s' }}></span>
            <span className="relative inline-flex size-3 rounded-full bg-white"></span>
          </span>
 */}
        </div>
        <svg className="size-10 animate-spin text-white" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="bg-overlay w-screen h-screen flex flex-col items-center p-1 border-0">
        <header className="w-full flex items-center mb-2 md:mb-6 lg:mb-12 border-0">
          <a href='https://www.geso-bonn.de' className='hover:bg-gray-400' target='_blank' rel='noopener noreferrer'>
            <img src={'images/GeSoLogo.png'} alt="Logo GeSo Bonn" 
            className="w-10 h-10 md:w-14 md:h-14 lg:w-20 lg:h-20"/>
          </a>
          <div>{getTestMode() ? <ClearGameButton /> : ""}</div>
          <h1 className="mx-auto text-xl md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-white font-bold border-0">
            <span onClick={handleTripleClick}>🎄</span> Adventskalender
          </h1>

          <button
            onClick={() => setShowHelp(true)} // öffnet das Modal
            className="px-2 py-2 bg-blue-600 text-white font-bold text-sm md:text-base
            rounded hover:bg-blue-700 
            transition-colors border-0"
          >
            Spielregeln
          </button>
        </header>

        <div className="grid grid grid-cols-7 grid-rows-12 md:grid-cols-8 md:grid-rows-10
        border-0
        w-full flex-grow">
          {shuffledDoors.map((d) => (
            <Door
              key={d.day}
              day={d.day}
              question={d.question}
              options={d.options}
              correctOption={d.correctOption}
              explanation={d.explanation}
              isActive={activeDoor === d.day}
              setActiveDoor={setActiveDoor}
            />
          ))}
        </div>
      </div>

      {/* ---------- Hilfe‑Modal (ausgelagert) ---------- */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <h2 className="text-2xl font-bold mb-4 flex justify-center">
            Spielregeln
          </h2>
          <ul className="list-disc mb-4 text-base lg:text-lg ml-4">
            <li className="mb-1">
              Jeden Tag im Dezember bis zum 24. Dezember gibt es ein Türchen zu
              öffnen.{" "}
            </li>
            <li className="mb-1">
              Pro Türchen gibt es eine Frage mit drei Antwort-Optionen. Nur eine
              der Optionen ist richtig.
            </li>
            <li className="mb-1">
              Nach dem Klick auf eine Option wird sofort angezeigt, ob die
              Antwort richtig war.{" "}
            </li>
            <li className="mb-1">
              Du kannst ein bereits beantwortetes Türchen jederzeit erneut
              öffnen, um die Erklärung zu lesen. Du kannst die Frage aber nicht
              erneut beantworten.
            </li>
            <li className="mb-1">
              Du kannst Türchen für den aktuellen Tag und für vergangene Tage
              öffnen. Nicht jedoch für zukünftige Tage.
            </li>
            <li className="mb-1">
              Hinweis: Sollte das Türchen für den aktuellen Tag gesperrt sein (keine Reaktion beim Anklicken),
              dann musst Du die Webseite im Browser neu laden, damit sich das Datum aktualiert.
            </li>
            <li className="mb-1">
              Auf Smartphones oder kleinen Bildschirmen kann es sein, dass Du einzelne Türchen nur dann siehst, 
              wenn Du den Bildschirm nach oben "wischst". Probier es aus, falls Du ein Türchen vermisst.
            </li>
            <li className="mb-1">
              Damit das Spiel nicht zu einfach wird, wird sich die Position der Türchen auf der Seite immer wieder einmal ändern.
              Also nicht wundern sondern suchen. &#128270;
            </li>
            <li className="mb-1">
              Dieses Jahr gibt es keine 'Bestenliste'.
              Dein Spielstand wird nur lokal in Deinem Browser
              gespeichert und ist ausschließlich nur für Dich sichtbar!
              Das bedeutet auch, dass Dein Spiel an einen bestimmten Browser auf einem bestimmten Gerät gebunden ist.
              Wenn Du das Spiel am nächsten Tag fortsetzen möchtest, 
              dann musst Du das auf dem selben Gerät (z.B. Smartphone oder PC) und dem selben Browser tun.
              Wenn Du dass Spiel auf dem anderen Gerät oder Browser startest, dann beginnt ein neues Spiel.
              (Das war zu verwirrend? Dann vergiss es und fang einfach mit dem Spiel an &#128521;)
            </li>
          </ul>
          <p className="mb-4 text-lg font-bold">Viel Spaß!</p>
          <p className="mb-4">
            Wenn Du Anregungen, Feedback, Fragen oder Probleme hast, schreibe
            eine email an
            <span className="italic"> adventskalender@geso-bonn.de</span>
            {/*
            <a href="mailto:adventskalender@geso-bonn.de"
              class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium
                      py-2 px-6 rounded-lg transition-colors duration-200">
              ✉️ adventskalender@geso-bonn.de
            </a>
            */}
          </p>
          <p className="mb-4 text-xs">
            P.S. Trotz gründlicher Recherche kann keine Gewähr für die
            Korrektheit der Antworten gegeben werden.
          </p>
        </HelpModal>
      )}

      {/* ---------- Wait‑Modal (ausgelagert) ---------- */}
      {beforeDecember25 && (
        <WaitModal
          onClose={() => setBeforeDecember25(getMonth() < 12 && getYear() === 2025)}
        >
          <h2 className="text-2xl font-bold mb-8 flex justify-center" onClick={handleTripleClick}>
            Bald ist es so weit ...
          </h2>
          <p className="flex justify-center">
            Heute ist der {getToday()}.{getMonth()}.{getYear()}.&nbsp;
            Gedulde Dich noch bis zum 1.12.2025.
            Dann startet das Spiel.
          </p>
          <p className="mt-8 flex justify-center items-center">
            <span className="ml-2 mr-2 size-3 relative flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-90"></span>
              <span className="relative inline-flex size-3 rounded-full bg-red-600"></span>
            </span>
            <span className="text-lg font-bold">
            Starte diese Seite am 1.12.2025 erneut!
            </span>
            <span className="ml-2 mr-2 size-3 relative flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-90"></span>
              <span className="relative inline-flex size-3 rounded-full bg-red-600"></span>
            </span>
          </p>
          <p className="flex justify-center ">
          <span className="mt-8 mb-4 ">
            Wenn Du Anregungen, Feedback, Fragen oder Probleme hast, schreibe
            eine email an 
            <span className="italic"> adventskalender@geso-bonn.de</span>
          </span>
          </p>

        </WaitModal>
      )}

      {/* ---------- Wrongtime‑Modal (ausgelagert) ---------- */}
      {outside2025 && (
        <WrongTimeModal onClose={() => setOutside25(getYear() != 2025)}>
          <h2 className="text-2xl font-bold mb-4 flex justify-center " onClick={handleTripleClick}>
            Leider ist es zu spät ...
          </h2>
          Dieser Adventskalender war nur für den Dezember 2025 vorgesehen!
          <p className="mb-4">
            Wenn Du Anregungen, Feedback, Fragen oder Probleme hast, schreibe
            eine email an
            <span className="italic"> adventskalender@geso-bonn.de</span>
          </p>
        </WrongTimeModal>
      )}
      {/* ---------- Heiligabend‑Modal (ausgelagert) ---------- */}
      {heiligabend && (
        <HeiligabendModal onClose={() => setHeiligabend(false)}>
          <h2 className="text-2xl font-bold mb-4 flex justify-center text-red-600">
            Frohe Weihnachten
          </h2>
          <div
            className="h-80 w-60 sm:w-70 md:w-80 bg-[url(/images/heiligabend-bg.jpg)]
          bg-cover text-white font-bold"
          ></div>
        </HeiligabendModal>
      )}
    </LayoutGroup>
  );
}
