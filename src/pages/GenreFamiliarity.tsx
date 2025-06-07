import { useState } from "react";

export function GenreFamiliarity() {
  const [familiarity, setFamiliarity] = useState<string | null>(null);

  const options = [
    { id: "newbie", label: "I'm new to LitRPG" },
    { id: "casual", label: "I've read a few LitRPG books" },
    { id: "enthusiast", label: "I'm a regular LitRPG reader" },
    { id: "expert", label: "I'm a LitRPG expert" },
  ];

  const handleSubmit = () => {
    if (familiarity) {
      // TODO: Handle the familiarity selection
      window.location.href = "/"; // Navigate to home or next page
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue text-white p-8 pt-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to LitRPG Academy!
        </h1>
        <p className="text-xl mb-12 text-center">
          To help personalize your experience, tell us about your familiarity
          with the LitRPG genre:
        </p>

        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setFamiliarity(option.id)}
              className={`w-full p-4 rounded-lg transition-all duration-300 text-left
                ${
                  familiarity === option.id
                    ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!familiarity}
          className={`mt-12 w-full py-4 rounded-lg font-semibold transition-all duration-300
            ${
              familiarity
                ? "bg-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
