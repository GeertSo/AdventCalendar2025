// src/App.jsx
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import Door from "./components/Door";
import questionsData from "./data/questions.json";

export default function App() {
  const questions = questionsData;

  const doors = Array.from({ length: 24 }, (_, i) => {
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

  const [activeDoor, setActiveDoor] = useState(null);

  return (
    <LayoutGroup>
      {/* 1️⃣  Das weiße Overlay sorgt für bessere Lesbarkeit */}
      <div className="bg-overlay min-h-screen flex flex-col items-center p-4">
        <h1 className="text-3xl font-bold mb-6">🎄 Adventskalender</h1>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {doors.map((d) => (
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
    </LayoutGroup>
  );
}