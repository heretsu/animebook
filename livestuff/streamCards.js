import React, { useState } from "react";

export default function StreamCards({setOnOpenCustomizeStream, setOnOpenScheduler, darkMode}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = document.getElementById("cards-container");
    const scrollAmount = 400;

    if (direction === "right") {
      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    } else {
      container.scrollTo({
        left: container.scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      setScrollPosition(container.scrollLeft);
    }, 300);
  };

  const handleScroll = () => {
    const container = document.getElementById("cards-container");
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < maxScroll - 5);
  };

  return (
    <div className="relative h-full w-full flex flex-row items-center">
      {showLeftArrow && (
        <div
          className="h-full flex items-center absolute left-0 top-[60%] -translate-y-1/2 z-20"
          style={{
            background:
              "linear-gradient(to right, black, black, #1e1f24",
          }}
        >
          <button
            onClick={() => {
              scroll("left");
            }}
            className="h-fit bg-purple-600 hover:bg-purple-700 text-center text-white rounded-sm ml-2 -pl-0.5 opacity-80"
            style={{
              background:
                "linear-gradient(to right, rgb(37, 99, 235), rgb(168, 85, 247), rgb(236, 72, 153))",
              paddingRight: "2px",
            }}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width={48} height={48} fill="white" fillOpacity={0.01} />
              <path
                d="M31 36L19 24L31 12"
                stroke="white"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>{" "}
        </div>
      )}

      <div
        id="cards-container"
        onScroll={handleScroll}
        className="h-full flex space-x-4 w-full overflow-x-auto overflow-y-hidden px-16"
      >
        <div onClick={()=>{setOnOpenCustomizeStream(true)}} className={`cursor-pointer group relative w-[30%] flex-shrink-0 bg-[#1e1f24] backdrop-blur-sm rounded-xl rounded-xl p-6 transition-all duration-300 hover:scale-105`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">
              Customize Stream
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              {
                "Add a title to your stream and a notification message for your followers"
              }
            </p>
            <span className="pt-4 m-auto flex items-center justify-center">
              <img
                src="/assets/magicyuki.png"
                alt="Description"
                className="w-24 h-24"
              />
            </span>
          </div>
        </div>

        <div onClick={()=>{setOnOpenScheduler(true)}} className="cursor-pointer group relative w-[30%] flex-shrink-0 bg-[#1e1f24] backdrop-blur-sm rounded-xl rounded-xl p-6 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">
              Schedule Stream
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Plan your streaming schedule and set up recurring streams
            </p>
            <span className="m-auto flex items-center justify-center">
              <img
                src="/assets/yukimeditate.png"
                alt="Description"
                className="w-24 h-28"
              />
            </span>
          </div>
        </div>

        <div className="cursor-pointer group relative w-[30%] flex-shrink-0 bg-[#1e1f24] backdrop-blur-sm rounded-xl rounded-xl p-6 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Guidelines</h3>
            <p className="text-slate-300 text-sm mb-4">
              Review the rules and guidelines for streaming on Animebook
            </p>

            <span className="pt-4 m-auto flex items-center justify-center">
              <img
                src="/assets/yukiandluffy.png"
                alt="Description"
                className="w-24 h-24"
              />
            </span>
          </div>
        </div>

        <div className="cursor-pointer group relative w-[30%] flex-shrink-0 bg-[#1e1f24] backdrop-blur-sm rounded-xl rounded-xl p-6 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Collab</h3>
            <p className="text-slate-300 text-sm mb-4">
            {"Invite co-hosts and guests to join your stream and collaborate live"}
            </p>

            <span className="pt-6 m-auto flex items-center justify-center">
              <img
                src="/assets/yukiexcited.png"
                alt="Description"
                style={{
                  width: '90px',
                  height: '90px'
                }}
              />
            </span>
          </div>
        </div>
        
      </div>

      {showRightArrow && (
         <div
         className="h-full flex items-center absolute top-[60%] -translate-y-1/2 z-20"
         style={{
          background:
            "linear-gradient(to right, #1e1f24, black, black",
          right: "0rem",
        }}
       >
        <button
          onClick={() => {
            scroll("right");
          }}
          className="h-fit bg-purple-600 hover:bg-purple-700 text-white rounded-sm ml-2 -pl-0.5 opacity-80"
          style={{
            background:
              "linear-gradient(to right, rgb(37, 99, 235), rgb(168, 85, 247), rgb(236, 72, 153))",
            paddingLeft: "2px",
            right: "1rem",
          }}
        >
          <svg
            className="rotate-180"
            width="20px"
            height="20px"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width={48} height={48} fill="white" fillOpacity={0.01} />
            <path
              d="M31 36L19 24L31 12"
              stroke="white"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        </div>
      )}
    </div>
  );
}
