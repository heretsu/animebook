import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ConnectionData from "@/lib/connectionData";
import { useEffect, useState } from "react";

const Signin = () => {
  const { address, connectToWallet } = ConnectionData();
  const { fullPageReload } = PageLoadOptions();
  const [note, setNote] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openManual, setOpenManual] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [miniError, setMiniError] = useState("");
  const [verificationLink, setOpenVerificationLink] = useState(false);
  const [signInMethod, setSignInMethod] = useState(false);
  const [signUpMethod, setSignUpMethod] = useState(false);

  const login = async (provider) => {
    try {
      setMiniError("");
      if (provider === "manual") {
        if (signUpMethod && manualPassword !== confirmPassword) {
          setManualPassword("");
          setConfirmPassword("");
          setMiniError("Passwords do not match");
          return;
        }
        const { data, error } = signUpMethod
          ? await supabase.auth
              .signUp({
                email: manualEmail,
                password: manualPassword,
                // options: {
                //   redirectTo: "https://localhost:3000/home",
                // },
                // options: {
                //   redirectTo: "https://animebook-cypherp0nk.vercel.app/home",
                // },
              })
              .catch((e) => {
                console.log(e);
                setMiniError("Sign up error. Too many requests");
              })
          : await supabase.auth
              .signInWithPassword({
                email: manualEmail,
                password: manualPassword,
                // options: {
                //   redirectTo: "https://localhost:3000/home",
                // },
                // options: {
                //   redirectTo: "https://animebook-cypherp0nk.vercel.app/home",
                // },
              })
              .catch((e) => {
                console.log(e);
                setMiniError("Sign in error. Too many requests");
              });
        if (error) {
          console.log(error, typeof error);
          setMiniError(
            "An error occured. Confirm your email if not done already"
          );
          return;
        }
        if (data && data.user) {
          if (signInMethod) {
            fullPageReload("/home");
          } else {
            setOpenVerificationLink(true);
          }
        }
      } else {
        supabase.auth.signInWithOAuth({
          provider: provider,
          // options: {
          //   redirectTo: "http://localhost:3000/home",
          // },
          // options: {
          //   redirectTo: "https://animebook-cypherp0nk.vercel.app/home",
          // },
        });
      }
    } catch (error) {
      console.log(error);
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
        <span id="anime-book-font">Bo</span>
        <span className="text-invisible text-white">o</span>
        <span id="anime-book-font">ok</span>
      </div>

      <div className="bg-white mx-auto my-6 rounded-xl w-full md:w-1/2 lg:w-1/3 p-4 shadow">
        {verificationLink ? (
          <div className="flex flex-col">
            <h2 className="my-3 text-center flex flex-col">
              <span className="font-bold text-lg">{"Confirm your email:"}</span>
            </h2>
            <span className="w-full text-sm text-black text-start flex flex-col">
              <span className="w-full">
                {"A confirmation link was sent to:"}
              </span>
              <span className="text-textGreen">{manualEmail}</span>
            </span>
          </div>
        ) : (
          <>
            <h2 className="my-3 text-center flex flex-col">
              <span className="font-bold text-lg">
                {"Connect  and sign in:"}
              </span>
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
                      setNote(
                        "Wallet already connected. Click on X to sign in"
                      );
                    }
                  : () => {
                      connectToWallet();
                    }
              }
              className={
                address
                  ? "mb-3 text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
                  : "mb-3 text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              }
            >
              <span className="font-bold text-base">
                {address ? (
                  `${address.substr(0, 6)}....${address.substr(
                    address.length - 4,
                    address.length
                  )}`
                ) : (
                  <span className="flex flex-row items-center space-x-0.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M18 3H2v18h18v-4h2V7h-2V3h-2zm0 14v2H4V5h14v2h-8v10h8zm2-2h-8V9h8v6zm-4-4h-2v2h2v-2z"
                        fill="#334155"
                      />
                    </svg>
                    <span>{"Connect"}</span>
                    <span>{"(optional)"}</span>
                  </span>
                )}
              </span>
            </div>
            <div className="mb-3 border-b border-slate-300"></div>
            <div
              onClick={() => {
                login("twitter");
              }}
              className={
                address
                  ? "mb-3 text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
                  : "mb-3 text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
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
              onClick={() => {
                login("google");
              }}
              className={
                address
                  ? "mb-3 text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
                  : "mb-3 text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
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
            <div
              onClick={() => {
                login("discord");
              }}
              className={
                address
                  ? "mb-3 text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
                  : "mb-3 text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              }
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
              >
                <path
                  d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                  fill="none"
                />
                <path
                  d="M23.6361 9.33998C22.212 8.71399 20.6892 8.25903 19.0973 8C18.9018 8.33209 18.6734 8.77875 18.5159 9.13408C16.8236 8.89498 15.1469 8.89498 13.4857 9.13408C13.3283 8.77875 13.0946 8.33209 12.8974 8C11.3037 8.25903 9.77927 8.71565 8.35518 9.3433C5.48276 13.4213 4.70409 17.3981 5.09342 21.3184C6.99856 22.6551 8.84487 23.467 10.66 23.9983C11.1082 23.4189 11.5079 22.8029 11.8523 22.1536C11.1964 21.9195 10.5683 21.6306 9.9748 21.2951C10.1323 21.1856 10.2863 21.071 10.4351 20.9531C14.0551 22.5438 17.9881 22.5438 21.5649 20.9531C21.7154 21.071 21.8694 21.1856 22.0251 21.2951C21.4299 21.6322 20.8 21.9211 20.1442 22.1553C20.4885 22.8029 20.8865 23.4205 21.3364 24C23.1533 23.4687 25.0013 22.6567 26.9065 21.3184C27.3633 16.7738 26.1261 12.8335 23.6361 9.33998ZM12.3454 18.9075C11.2587 18.9075 10.3676 17.9543 10.3676 16.7937C10.3676 15.6331 11.2397 14.6783 12.3454 14.6783C13.4511 14.6783 14.3422 15.6314 14.3232 16.7937C14.325 17.9543 13.4511 18.9075 12.3454 18.9075ZM19.6545 18.9075C18.5678 18.9075 17.6767 17.9543 17.6767 16.7937C17.6767 15.6331 18.5488 14.6783 19.6545 14.6783C20.7602 14.6783 21.6514 15.6314 21.6323 16.7937C21.6323 17.9543 20.7602 18.9075 19.6545 18.9075Z"
                  fill="#5865F2"
                />
              </svg>

              <span className="font-bold text-base">Discord</span>
            </div>
            <div
              onClick={() => {
                setOpenManual(true);
              }}
              className={
                openManual
                  ? "text-slate-700 bg-pastelGreen cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
                  : "text-gray-100 bg-slate-700 cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-xl w-full text-sm"
              }
            >
              <svg
                width="25px"
                height="25px"
                viewBox="0 0 16 16"
                stroke={openManual ? "#334155" : "white"}
                strokeWidth="0.45"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill={openManual ? "#334155" : "white"}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1 3.5l.5-.5h13l.5.5v9l-.5.5h-13l-.5-.5v-9zm1 1.035V12h12V4.536L8.31 8.9H7.7L2 4.535zM13.03 4H2.97L8 7.869 13.03 4z"
                />
              </svg>

              <span className="font-bold text-base">Email</span>
            </div>
            {openManual && (
              <svg
                fill="#000000"
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                id="down-double-arrow"
                data-name="Line Color"
                xmlns="http://www.w3.org/2000/svg"
                className="my-1 w-full icon line-color"
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
            )}

            {openManual &&
              (signInMethod || signUpMethod ? (
                <form
                  className="flex flex-col"
                  onSubmit={(e) => {
                    e.preventDefault();
                    login("manual");
                  }}
                >
                  <span className="mx-auto italic font-medium pb-1 text-gray-800">
                    {signUpMethod ? "Sign up" : "Sign in"}
                  </span>
                  <input
                    autoComplete="username"
                    value={manualEmail}
                    onChange={(e) => {
                      setManualEmail(e.target.value);
                    }}
                    placeholder="Enter email"
                    className="mb-2 border border-gray-300 font-semibold text-slate-700 text-center text-gray-800 rounded-xl w-full bg-slate-100 focus:border-gray-300 focus:ring-0"
                  />
                  <input
                    autoComplete="current-password"
                    value={manualPassword}
                    onChange={(e) => {
                      setManualPassword(e.target.value);
                    }}
                    placeholder="Enter password"
                    type="password"
                    className="border border-gray-300 font-semibold text-slate-700 text-center text-gray-800 rounded-xl w-full bg-slate-100 focus:border-gray-300 focus:ring-0"
                  />
                  {signUpMethod && (
                    <input
                      autoComplete="current-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                      }}
                      placeholder="Confirm password"
                      type="password"
                      className="mt-2 border border-gray-300 font-semibold text-slate-700 text-center text-gray-800 rounded-xl w-full bg-slate-100 focus:border-gray-300 focus:ring-0"
                    />
                  )}
                  {miniError && (
                    <span className="w-full text-center text-sm text-red-500">
                      {miniError}
                    </span>
                  )}
                  <span className="mt-2 w-full flex flex-row justify-between items-center">
                    <span
                      onClick={() => {
                        setSignInMethod(false);
                        setSignUpMethod(false);
                      }}
                      className="h-5/6 cursor-pointer font-medium text-gray-800 bg-slate-100 border border-slate-400 rounded-lg flex items-center px-2 py-1"
                    >
                      Cancel
                    </span>
                    <input
                      type="submit"
                      className="cursor-pointer w-fit bg-pastelGreen px-2 py-1 h-5/6 text-center flex items-center text-slate-700 font-semibold rounded-lg"
                    />
                  </span>
                </form>
              ) : (
                <div className="w-full flex flex-row items-center space-x-4">
                  <span
                    onClick={() => {
                      setSignUpMethod(false);
                      setSignInMethod(true);
                    }}
                    className="w-1/2 text-center cursor-pointer font-semibold text-gray-800 bg-slate-100 border border-slate-400 rounded-lg px-2 py-1"
                  >
                    Sign in
                  </span>
                  <span
                    onClick={() => {
                      setSignInMethod(false);
                      setSignUpMethod(true);
                    }}
                    className="w-1/2 text-center cursor-pointer font-semibold text-gray-800 bg-slate-100 border border-slate-400 rounded-lg px-2 py-1"
                  >
                    Sign up
                  </span>
                </div>
              ))}
          </>
        )}
      </div>

      <div className="rounded-b-xl pb-3 px-6 text-textGreen text-xs flex flex-row justify-center space-x-10">
        <span className="cursor-pointer underline">Terms of Service</span>
        <span className="cursor-pointer underline">Privacy Policy</span>
      </div>
    </div>
  );
};
export default Signin;
