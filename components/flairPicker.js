import React, { useState } from "react";

export default function FlairPicker({ community, selected, onSelect }) {

  const flairMap = {
    "one+piece": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    "dragon+ball": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    "naruto": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    
    "samurai+champloo": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    "jujutsu+kaisen": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    "one+punch+man": [
      { id: "news", label: "News", color: "bg-blue-100 text-blue-800" },
      { id: "spoiler", label: "Spoiler", color: "bg-red-100 text-red-800" },
      { id: "discussion", label: "Discussion", color: "bg-purple-100 text-purple-800" },
      { id: "leak", label: "Leak", color: "bg-orange-100 text-orange-800" },
      { id: "observation", label: "Observation", color: "bg-gray-100 text-gray-800" },
      { id: "manga", label: "Manga", color: "bg-yellow-100 text-yellow-800" },
      { id: "cosplay", label: "Cosplay", color: "bg-green-100 text-green-800" },
      { id: "fanart", label: "Fanart", color: "bg-pink-100 text-pink-800" },
    ],
    
    "twitch": [
      { id: "question", label: "Question", color: "bg-purple-100 text-purple-800" },
      { id: "livestream", label: "Livestream", color: "bg-purple-100 text-purple-800" },
      { id: "guide", label: "Guide", color: "bg-blue-100 text-blue-800" },
      { id: "discussion", label: "Discussion", color: "bg-gray-200 text-gray-800" },
      { id: "feedback", label: "Feedback", color: "bg-green-100 text-green-800" },
      { id: "collab", label: "Collab", color: "bg-indigo-100 text-indigo-800" },
    ],
  
    "luffy+token": [
      { id: "announcement", label: "Announcement", color: "bg-blue-100 text-blue-800" },
      { id: "trading", label: "Trading", color: "bg-green-100 text-green-800" },
      { id: "community", label: "Community", color: "bg-purple-100 text-purple-800" },
    ]
  };
  const flairs = flairMap[community] || [];
  
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        className="bg-zinc-500 text-white px-3 py-1 rounded-2xl"
        onClick={() => setOpen(!open)}
      >
        {selected ? `${selected}` : "Add flair"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 pt-2 max-w-md w-full mx-4">
            <span className="w-full flex flex-row items-center justify-between text-sm font-semibold text-gray-700">
              <span>Select a flair</span>
              <span
                onClick={() => setOpen(false)}
                className="text-red-500 rounded-full text-lg cursor-pointer text-black hover:underline"
              >
                x
              </span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              {flairs.map((flair) => (
                <button
                  key={flair.id}
                  className={`rounded px-3 py-2 text-sm font-medium ${flair.color}`}
                  onClick={() => {
                    onSelect(flair.label);
                    setOpen(false);
                  }}
                >
                  {flair.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
