import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useEffect, useState } from "react";

const Signin = () => {
  const { address, connectToWallet } = ConnectionData();
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const login = () => {
    try {
      supabase.auth.signInWithOAuth({
        provider: "twitter",
        // options: {
        //   redirectTo: "http://localhost:3000",
        // },
      });
    } catch (error) {
      throw "could not sign in";
    }
  };
  useEffect(()=>{
    if (navigator.userAgent.includes("MetaMaskMobile")){
      connectToWallet()
    }
  }, [])

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
              : () => {connectToWallet()}
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
          onClick={address ? login : ()=>{setErrorMsg("Click on Connect wallet first");}}
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
      </div>

      <div className="rounded-b-xl pb-3 px-6 text-textGreen text-xs flex flex-row justify-center space-x-10">
        <span className="cursor-pointer underline">Terms of Service</span>
        <span className="cursor-pointer underline">Privacy Policy</span>
      </div>
    </div>
  );
};
export default Signin;
