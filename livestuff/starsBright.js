import React from "react";

export default function StarsBright({startStream}) {
  
  return (
    <div
      className="relative flex h-full w-full items-start justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #050b18, #0a1428, black)",
        paddingTop: "150px",
      }}
    >
      <div className="absolute inset-0 z-0">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-2 bg-white rounded-full"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              boxShadow:
                "0 0 10px 2px rgba(255, 255, 255, 0.8), -50px 0 10px 1px rgba(255, 255, 255, 0.3)",
              animation: `shootingStar ${8 + Math.random() * 2}s linear ${
                i * 1.5
              }s infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute h-32 w-32 rounded-full"
        style={{
          top: "33%",
          left: "25%",
          background: "rgba(147, 51, 234, 0.2)",
          filter: "blur(80px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <div
        className="absolute h-40 w-40 rounded-full"
        style={{
          bottom: "25%",
          right: "25%",
          background: "rgba(37, 99, 235, 0.2)",
          filter: "blur(100px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.7s infinite",
        }}
      />
      <div
        className="absolute h-24 w-24 rounded-full"
        style={{
          top: "50%",
          right: "33%",
          background: "rgba(6, 182, 212, 0.15)",
          filter: "blur(60px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.3s infinite",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="absolute rounded-full border"
          style={{
            inset: "-2rem",
            borderColor: "rgba(59, 130, 246, 0.2)",
            animation: "spin 10s linear infinite",
          }}
        />

        <div
          className="absolute rounded-full border"
          style={{
            inset: "-1rem",
            borderColor: "rgba(168, 85, 247, 0.3)",
            animation: "spinReverse 10s linear infinite",
          }}
        />

        <button className="group relative flex items-center gap-3 px-5 py-4 bg-transparent text-white font-bold text-xl tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95">
          <div
            className="absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 transition-all"
            style={{
              background:
                "linear-gradient(to right, rgb(37, 99, 235), rgb(168, 85, 247), rgb(236, 72, 153))",
              filter: "blur(4px)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />

          <div className="font-bold relative flex items-center gap-3 bg-transparent px-2.5 py-1.5 rounded-lg border group-hover:border-white/40 transition-colors">
            <span onClick={()=>{startStream()}}
              style={{
                backgroundImage:
                  "linear-gradient(to right, white, rgb(191, 219, 254), rgb(221, 214, 254))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Start a Stream
            </span>
            <div className="relative">
              <div
                className="h-3 w-3 rounded-full bg-red-500 absolute"
                style={{
                  animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <div className="h-3 w-3 rounded-full bg-red-500" />
            </div>
          </div>
        </button>

      </div>

      <style jsx>{`
        @keyframes shootingStar {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-300px, 300px);
            opacity: 0;
          }
        }
        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
