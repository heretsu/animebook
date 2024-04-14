import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useEffect, useState } from "react";

const Signin = () => {
  const { address, connectToWallet } = ConnectionData();
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const login = (provider) => {
    
    try {
      supabase.auth.signInWithOAuth({
        provider: provider,
        // options: {
        //   redirectTo: "http://localhost:3000/home",
        // },
        // options: {
        //   redirectTo: "https://animebook-cypherp0nk.vercel.app/home",
        // },
      });
    } catch (error) {
      throw "could not sign in";
    }
  };
  useEffect(() => {
    if (navigator.userAgent.includes("MetaMaskMobile")) {
      connectToWallet();
    }
  }, []);

  return (
    <div className="pt-8 px-6 w-full h-full rounded-t-xl">
      <div className="pb-4 flex flex-row w-full justify-center items-center text-center text-logoSize">
        <span id="anime-book-font" className="pr-2 text-pastelGreen">
          Anime
        </span>
        <span id="anime-book-font">bo</span>
        <span className="text-invisible text-white">o</span>
        <span id="anime-book-font">ok</span>
      </div>

      <div className="bg-white mx-auto my-6 rounded-xl w-full md:w-1/2 lg:w-1/3 py-6 px-4 shadow space-y-3">
        <h2 className="text-center flex flex-col">
          <span className="font-bold text-lg">{"Connect and sign in:"}</span>
          {note && (
            <span className="w-full text-center text-sm text-green-500">
              {note}
            </span>
          )}
          {errorMsg && (
            <span className="w-full text-center text-sm text-red-500">
              {errorMsg}
            </span>
          )}
        </h2>
        <div
          onClick={
            address
              ? () => {
                  setNote("Wallet already connected. Click on X to sign in");
                }
              : () => {
                  connectToWallet();
                }
          }
          className={
            address
              ? "text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              : "text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
          }
        >
          <span className="font-bold text-base">
            {address
              ? `${address.substr(0, 6)}....${address.substr(
                  address.length - 4,
                  address.length
                )}`
              : "Connect wallet"}
          </span>
        </div>
        <svg
          fill="#000000"
          width="25px"
          height="25px"
          viewBox="0 0 24 24"
          id="down-double-arrow"
          data-name="Line Color"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full icon line-color"
        >
          <polyline
            id="secondary"
            points="4 17 7 20 10 17"
            style={{
              fill: "none",
              stroke: "rgb(44, 169, 188)",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
            }}
          />
          <line
            id="secondary-2"
            data-name="secondary"
            x1={7}
            y1={4}
            x2={7}
            y2={20}
            style={{
              fill: "none",
              stroke: "rgb(44, 169, 188)",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
            }}
          />
          <line
            id="primary"
            x1={17}
            y1={4}
            x2={17}
            y2={20}
            style={{
              fill: "none",
              stroke: "rgb(0, 0, 0)",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
            }}
          />
          <polyline
            id="primary-2"
            data-name="primary"
            points="14 17 17 20 20 17"
            style={{
              fill: "none",
              stroke: "rgb(0, 0, 0)",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
            }}
          />
        </svg>
        <div
          onClick={
            address
              ? ()=>{login('twitter')}
              : () => {
                  setErrorMsg("Click on Connect wallet first");
                }
          }
          className={
            address
              ? "text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              : "text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
          }
        >
          
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              fill="currentColor"
              d="M12.186 8.672 18.743.947h-2.927l-5.005 5.9-4.44-5.9H0l7.434 9.876-6.986 8.23h2.927l5.434-6.4 4.82 6.4H20L12.186 8.672Zm-2.267 2.671L8.544 9.515 3.2 2.42h2.2l4.312 5.719 1.375 1.828 5.731 7.613h-2.2l-4.699-6.237Z"
            />
          </svg>

          <span className="font-bold text-base">X</span>
        </div>
        <div
          onClick={
            address
              ? ()=>{login('google')}
              : () => {
                  setErrorMsg("Click on Connect wallet first");
                }
          }
          className={
            address
              ? "text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              : "text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 512 512"
            style={{
              enableBackground: "new 0 0 512 512",
            }}
            xmlSpace="preserve"
            className="w-6 h-6"
          >
            <path
              style={{
                fill: "#167EE6",
              }}
              d="M492.668,211.489l-208.84-0.01c-9.222,0-16.697,7.474-16.697,16.696v66.715 c0,9.22,7.475,16.696,16.696,16.696h117.606c-12.878,33.421-36.914,61.41-67.58,79.194L384,477.589 c80.442-46.523,128-128.152,128-219.53c0-13.011-0.959-22.312-2.877-32.785C507.665,217.317,500.757,211.489,492.668,211.489z"
            />
            <path
              style={{
                fill: "#12B347",
              }}
              d="M256,411.826c-57.554,0-107.798-31.446-134.783-77.979l-86.806,50.034 C78.586,460.443,161.34,512,256,512c46.437,0,90.254-12.503,128-34.292v-0.119l-50.147-86.81 C310.915,404.083,284.371,411.826,256,411.826z"
            />
            <path
              style={{
                fill: "#0F993E",
              }}
              d="M384,477.708v-0.119l-50.147-86.81c-22.938,13.303-49.48,21.047-77.853,21.047V512 C302.437,512,346.256,499.497,384,477.708z"
            />
            <path
              style={{
                fill: "#FFD500",
              }}
              d="M100.174,256c0-28.369,7.742-54.91,21.043-77.847l-86.806-50.034C12.502,165.746,0,209.444,0,256 s12.502,90.254,34.411,127.881l86.806-50.034C107.916,310.91,100.174,284.369,100.174,256z"
            />
            <path
              style={{
                fill: "#FF4B26",
              }}
              d="M256,100.174c37.531,0,72.005,13.336,98.932,35.519c6.643,5.472,16.298,5.077,22.383-1.008 l47.27-47.27c6.904-6.904,6.412-18.205-0.963-24.603C378.507,23.673,319.807,0,256,0C161.34,0,78.586,51.557,34.411,128.119 l86.806,50.034C148.202,131.62,198.446,100.174,256,100.174z"
            />
            <path
              style={{
                fill: "#D93F21",
              }}
              d="M354.932,135.693c6.643,5.472,16.299,5.077,22.383-1.008l47.27-47.27 c6.903-6.904,6.411-18.205-0.963-24.603C378.507,23.672,319.807,0,256,0v100.174C293.53,100.174,328.005,113.51,354.932,135.693z"
            />
          </svg>

          <span className="font-bold text-base">Google</span>
        </div>
      </div>

      <div className="rounded-b-xl pb-3 px-6 text-textGreen text-xs flex flex-row justify-center space-x-10">
        <span className="cursor-pointer underline">Terms of Service</span>
        <span className="cursor-pointer underline">Privacy Policy</span>
      </div>
    </div>
  );
};
export default Signin;
