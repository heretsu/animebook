import supabase from "@/hooks/authenticateUser";
import Head from "next/head";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ConnectionData from "@/lib/connectionData";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import { useRouter } from "next/router";
import newLogo from "@/assets/newLogo.png";
import Image from "next/image";
import img1 from "@/assets/icons/img1_registration.png";
import img2 from "@/assets/icons/img2_registration.png";
import img3 from "@/assets/icons/img3_registration.png";
import img4 from "@/assets/icons/img4_registration.png";
import img5 from "@/assets/icons/img5_registration.png";
import img6 from "@/assets/icons/img6_registration.png";
import img7 from "@/assets/icons/img7_registration.png";
import img8 from "@/assets/icons/img8_registration.png";
import img9 from "@/assets/icons/img9_registration.png";
import img10 from "@/assets/icons/img10_registration.png";


export function AnimeGrid({ img1, img2, img3, img4, img5, img6, img7, img8, img9, img10 }) {
  return (
    <div className="main-container w-full justify-end px-2 h-screen space-x-3 flex flex-row items-center">
      <span className="w-[40%] relative h-full flex flex-col items-start justify-end space-y-1 overflow-hidden">
<div class="marquee-wrapper">
  <div class="container">
    <div class="marquee-block">
      <div class="marquee-inner to-left">
        <span>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">+500</b> Registred Users</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img1}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Earn</b> Money by interacting</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img2}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Chibis</b> Collect them all</p>
          </div>
        </span>
        <span>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img3}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Explore</b> Anime content</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img4}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">12</b> Weekly MVP Awards</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img1}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

        </span>
      </div>
    </div>
  </div>
</div>

      </span>

      <span className="w-[40%] relative h-full flex flex-col items-start justify-end space-y-1 overflow-hidden">
       <div class="marquee-wrapper">
  <div class="container">
    <div class="marquee-block">
      <div class="marquee-inner to-right">
        <span>
          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">+Hundreds</b> Of communities</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img1}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Web3</b> Fully Integrated</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img4}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Message</b> Users and connect</p>
          </div>
        </span>
        <span>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img3}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">Mangas</b> from new Mangakas</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img2}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>

          <div class="marquee-item blackbox">
            <p class="text-white"><b class="big">2023</b> Established</p>
          </div>

          <div class="marquee-item">
            <p class="text-white"><Image
            src={img1}
            alt="Anime Image 1"
            height={500}
            width={500}
            className="marqimg"
          /></p>
          </div>
        </span>
        
      </div>
    </div>
  </div>
</div>
      </span>
    </div>
  );
}

const Signin = () => {
  const [radioChecked, setRadioChecked] = useState(false);
  const router = useRouter();
  const { darkMode } = useContext(UserContext);
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
  const [callPassword, setCallPassword] = useState(false);

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
                email: manualEmail.trim(),
                password: manualPassword,
                // options: {
                //   redirectTo: "https://localhost:3000/home",
                // },
                options: {
                  redirectTo: "https://animebook-theta.vercel.app/home",
                },
                // options: {
                //   redirectTo: "https://animebook.io/home",
                // },
              })
              .catch((e) => {
                console.log(e);
                setMiniError(`Sign up error: ${e.message && e.message}`);
              })
          : await supabase.auth
              .signInWithPassword({
                email: manualEmail.trim(),
                password: manualPassword,
                // options: {
                //   redirectTo: "https://localhost:3000/home",
                // },
                options: {
                  redirectTo: "https://animebook-theta.vercel.app/home",
                },
                // options: {
                //   redirectTo: "https://animebook.io/home",
                // },
              })
              .catch((e) => {
                console.log(e);
                setMiniError("Sign in error. Too many requests");
              });
        if (error) {
          console.log(error, typeof error);
          setMiniError(`An error occured: ${error.message && error.message}`);
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
          options: {
            redirectTo: "https://animebook-theta.vercel.app/home",
          },
          // options: {
          //   redirectTo: "https://animebook.io/home",
          // },
        });
      }
    } catch (error) {
      console.log(error);
      throw "could not sign in";
    }
  };

  useEffect(() => {
    const { ref } = router.query;

    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
    if (navigator.userAgent.includes("MetaMaskMobile")) {
      connectToWallet();
    }
  }, [router.query]);

  return (
    <div className="h-screen flex flex-row md:items-center">
      <div className="flex md:hidden w-full h-screen">
        <AnimeGrid img1={img1} img2={img2} img3={img3} img4={img4} />
      </div>

      <div className="whitebox absolute flex flex-col justify-between bottom-0 md:relative bg-white mx-auto p-2 rounded-3xl w-full md:w-[40%] mgl">
        {verificationLink ? (
          <div className="flex flex-col">
            <div className="pt-2 pb-0.5 mx-auto relative h-18 w-18 flex rounded-full">
              <Image
                src={newLogo}
                alt="logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </div>
            <span className="my-1 text-center flex flex-col">
              <span className="text-lg font-bold">
                {"Confirm your email to continue"}
              </span>
            </span>
            <span className="w-full text-sm text-black text-start flex flex-row justify-center">
              <span className="px-1">
                {"A confirmation link was sent to your email:"}
              </span>
              <span className="font-bold">{manualEmail}</span>
            </span>
          </div>
        ) : (
          <>
            <div className="my-3 text-center flex flex-col">
              <div className="pb-2 mx-auto relative h-18 w-18 flex rounded-full signlogo">
                <Image
                  src={newLogo}
                  alt="logo"
                  width={90}
                  height={90}
                  className="rounded-full"
                />
              </div>

              <span className="headline font-bold text-lg">
                {callPassword && signUpMethod
                  ? "Set Password"
                  : callPassword && signInMethod
                  ? "Enter Password"
                  : "Welcome to Anime Book"}
              </span>
              <span>
                {callPassword && signUpMethod
                  ? "Set a strong password to log in to your account"
                  : callPassword && signInMethod
                  ? "Enter your password to log in to your account"
                  : "Anime Book is the world's first Web3 social media platform for anime and manga fans. Connect with thousands of people, discuss trending topics, and earn along the way!"}
              </span>

              <form
                className="addmargin pt-2 flex flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  login("manual");
                }}
              >
                {!callPassword && (
                  <span className="flex flex-row w-full p-0.5 pr-1.5 items-center justify-between rounded-3xl space-x-1 border border-[#EEEDEF]">
                    <input
                      autoComplete="username"
                      value={manualEmail}
                      onChange={(e) => {
                        setErrorMsg("");
                        setMiniError("");
                        setNote("");
                        setManualEmail(e.target.value);
                      }}
                      placeholder={signInMethod ? "Input E-mail for sign in" :  signUpMethod ?  "Input E-mail for registration" : "E-mail"}
                      className={`${(signInMethod || signUpMethod) ? "placeholder:text-red-400" : ""} text-start border-none bg-transparent text-center text-black w-full focus:border-none focus:ring-0 `}
                    />
                    <svg
                      onClick={() => {
                        if (!callPassword) {
                          setCallPassword(true);
                        }
                      }}
                      className="cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 37 37"
                    >
                      <g
                        id="Gruppe_3588"
                        data-name="Gruppe 3588"
                        transform="translate(-726 -456)"
                      >
                        <circle
                          id="Ellipse_224"
                          data-name="Ellipse 224"
                          cx="18.5"
                          cy="18.5"
                          r="18.5"
                          transform="translate(726 456)"
                          fill="#eb4463"
                        />
                        <g id="Arrow-23" transform="translate(621.15 431.658)">
                          <path
                            id="Pfad_12383"
                            data-name="Pfad 12383"
                            d="M121.345,43.628a1.936,1.936,0,0,0,0-1.576L117.9,34.326a1.5,1.5,0,0,1,2.212-1.982c2.223,1.727,7.856,6.923,10.406,9.294a1.643,1.643,0,0,1,0,2.406c-2.55,2.371-8.183,7.567-10.406,9.294a1.5,1.5,0,0,1-2.212-1.982Z"
                            transform="translate(0 0)"
                            fill="#fff"
                          />
                        </g>
                      </g>
                    </svg>
                  </span>
                )}

                {callPassword && (
                  <span className="flex flex-col space-y-2">
                    <span className="flex flex-row w-full p-0.5 pr-1.5 items-center justify-between rounded-3xl space-x-1 border border-[#EEEDEF]">
                      <input
                        autoComplete="current-password"
                        value={manualPassword}
                        onChange={(e) => {
                          setErrorMsg("");
                          setMiniError("");
                          setNote("");
                          setManualPassword(e.target.value);
                        }}
                        type="password"
                        placeholder="Password"
                        className="text-start border-none bg-transparent text-center text-black w-full focus:border-none focus:ring-0"
                      />
                    </span>
                    {signUpMethod && (
                      <span className="flex flex-row w-full p-0.5 pr-1.5 items-center justify-between rounded-3xl space-x-1 border border-[#EEEDEF]">
                        <input
                          autoComplete="current-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setErrorMsg("");
                            setMiniError("");
                            setNote("");
                            setConfirmPassword(e.target.value);
                          }}
                          placeholder="Confirm password"
                          type="password"
                          className="text-start border-none bg-transparent text-center text-black w-full focus:border-none focus:ring-0"
                        />
                      </span>
                    )}
                    {signUpMethod && (
                      <span className="py-1 text-base font-light flex flex-row w-full items-start justify-start text-start space-x-1">
                        <span
                          onClick={() => {
                            setRadioChecked(!radioChecked);
                          }}
                          className={`border ${
                            radioChecked
                              ? "border-[#EB4463]"
                              : "border-gray-300"
                          } h-4 w-4 cursor-pointer my-auto flex p-0.5 rounded-full bg-transparent`}
                        >
                          <span
                            className={`${
                              radioChecked ? "bg-[#EB4463]" : "bg-[#EEEDEF]"
                            } h-2.5 w-2.5 rounded-full w-full`}
                          ></span>
                        </span>

                        <span className="pl-1">{"I've read the"}</span>
                        <span
                          onClick={() => {
                            fullPageReload("/terms-of-service", "_blank");
                          }}
                          className="font-medium underline cursor-default"
                        >
                          {"Terms of Services"}
                        </span>
                        <span>{"and agree with them"}</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={signUpMethod && !radioChecked}
                      className={`border-none ${
                        signInMethod || radioChecked
                          ? "bg-[#EB4463]"
                          : "bg-gray-500 cursor-not-allowed"
                      } my-2.5 text-white cursor-pointer w-full py-2 flex items-center justify-center rounded-full`}
                    >
                      {signUpMethod ? "Register now" : "Login"}
                    </button>

                    {callPassword && (
                      <div className="pt-1 font-light text-slate-700 flex flex-row space-x-1">
                        <span>
                          {signUpMethod
                            ? "Already have an account?"
                            : "Don't have an account?"}
                        </span>
                        <span
                          onClick={() => {
                            setErrorMsg("");
                            setMiniError("");
                            setNote("");
                            if (signUpMethod) {
                              setSignUpMethod(false);
                              setSignInMethod(true);
                            } else {
                              setSignInMethod(false);
                              setSignUpMethod(true);
                            }

                            setManualEmail("");
                            setManualPassword("");
                            setConfirmPassword("");
                            setCallPassword(false);
                          }}
                          className="font-medium cursor-pointer underline"
                        >
                          {signUpMethod ? "Login" : "Register"}
                        </span>
                      </div>
                    )}
                  </span>
                )}

                {miniError && (
                  <span className="w-full text-center text-sm text-red-500">
                    {miniError}
                  </span>
                )}
              </form>

              {!callPassword && (
                <div className="py-4 flex items-center justify-center w-full">
                  <div className="w-full border-t border-dashed border-gray-300"></div>
                  <span className="px-5 text-slate-800">OR</span>
                  <div className="w-full border-t border-dashed border-gray-300"></div>
                </div>
              )}

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
            </div>

            {!callPassword && (
              <div>
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
                    "mb-3 text-slate-700 bg-[#F9F9F9] border border-[#EEEDEF] cursor-pointer p-2 space-x-2 flex flex-row justify-center items-center rounded-com w-full text-sm"
                  }
                >
                  <span className="w-full text-base">
                    {address ? (
                      `${address.substr(0, 6)}....${address.substr(
                        address.length - 4,
                        address.length
                      )}`
                    ) : (
                      <span className="w-full flex flex-row justify-start items-center space-x-2">
                        <svg
                          width="30px"
                          height="30px"
                          viewBox="0 0 32 32"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="white"
                          className="bg-blacki p-1.5 rounded-full"
                        >
                          <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z" />
                        </svg>
                        <span>{"Connect with Wallet"}</span>
                      </span>
                    )}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.996"
                    height="14.566"
                    viewBox="0 0 8.996 14.566"
                  >
                    <g id="Arrow-23" transform="translate(-117.653 -32)">
                      <path
                        id="Pfad_12383"
                        data-name="Pfad 12383"
                        d="M120.133,39.811a1.3,1.3,0,0,0,0-1.058l-2.312-5.19a1,1,0,0,1,1.486-1.332c1.493,1.16,5.277,4.65,6.99,6.243a1.1,1.1,0,0,1,0,1.616c-1.713,1.593-5.5,5.083-6.99,6.243A1,1,0,0,1,117.821,45Z"
                        transform="translate(0 0)"
                        fill={darkMode ? "gray" : "#292c33"}
                      />
                    </g>
                  </svg>
                </div>
                <div
                  onClick={() => {
                    login("twitter");
                  }}
                  className={
                    "mb-3 text-slate-700 bg-[#F9F9F9] border border-[#EEEDEF] cursor-pointer p-2 space-x-2 flex flex-row justify-start items-center rounded-com w-full text-sm"
                  }
                >
                  <span className="w-full flex flex-row justify-start items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 50 50"
                      width="30px"
                      height="30px"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                      className="bg-blacki p-1.5 rounded-full"
                    >
                      <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
                    </svg>

                    <span className="text-base">{"Connect with X"}</span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.996"
                    height="14.566"
                    viewBox="0 0 8.996 14.566"
                  >
                    <g id="Arrow-23" transform="translate(-117.653 -32)">
                      <path
                        id="Pfad_12383"
                        data-name="Pfad 12383"
                        d="M120.133,39.811a1.3,1.3,0,0,0,0-1.058l-2.312-5.19a1,1,0,0,1,1.486-1.332c1.493,1.16,5.277,4.65,6.99,6.243a1.1,1.1,0,0,1,0,1.616c-1.713,1.593-5.5,5.083-6.99,6.243A1,1,0,0,1,117.821,45Z"
                        transform="translate(0 0)"
                        fill={darkMode ? "gray" : "#292c33"}
                      />
                    </g>
                  </svg>
                </div>
                <div
                  onClick={() => {
                    login("google");
                  }}
                  className={
                    "mb-3 text-slate-700 bg-[#F9F9F9] border border-[#EEEDEF] cursor-pointer p-2 space-x-2 flex flex-row justify-start items-center rounded-com w-full text-sm"
                  }
                >
                  <span className="w-full flex flex-row justify-start items-center space-x-2">
                    <svg
                      fill="white"
                      width="25px"
                      height="25px"
                      viewBox="-2 -2 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMinYMin"
                      className="jam jam-google h-8 w-8 p-2 bg-blacki rounded-full"
                    >
                      <path d="M4.376 8.068A5.944 5.944 0 0 0 4.056 10c0 .734.132 1.437.376 2.086a5.946 5.946 0 0 0 8.57 3.045h.001a5.96 5.96 0 0 0 2.564-3.043H10.22V8.132h9.605a10.019 10.019 0 0 1-.044 3.956 9.998 9.998 0 0 1-3.52 5.71A9.958 9.958 0 0 1 10 20 9.998 9.998 0 0 1 1.118 5.401 9.998 9.998 0 0 1 10 0c2.426 0 4.651.864 6.383 2.302l-3.24 2.652a5.948 5.948 0 0 0-8.767 3.114z" />
                    </svg>
                    <span className="text-base">{"Connect with Google"}</span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.996"
                    height="14.566"
                    viewBox="0 0 8.996 14.566"
                  >
                    <g id="Arrow-23" transform="translate(-117.653 -32)">
                      <path
                        id="Pfad_12383"
                        data-name="Pfad 12383"
                        d="M120.133,39.811a1.3,1.3,0,0,0,0-1.058l-2.312-5.19a1,1,0,0,1,1.486-1.332c1.493,1.16,5.277,4.65,6.99,6.243a1.1,1.1,0,0,1,0,1.616c-1.713,1.593-5.5,5.083-6.99,6.243A1,1,0,0,1,117.821,45Z"
                        transform="translate(0 0)"
                        fill={darkMode ? "gray" : "#292c33"}
                      />
                    </g>
                  </svg>
                </div>
                <div
                  onClick={() => {
                    login("discord");
                  }}
                  className={
                    "mb-3 text-slate-700 bg-[#F9F9F9] border border-[#EEEDEF] cursor-pointer p-2 space-x-2 flex flex-row justify-start items-center rounded-com w-full text-sm"
                  }
                >
                  <span className="w-full flex flex-row justify-start items-center space-x-2">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 bg-blacki p-1 rounded-full"
                    >
                      <path
                        d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                        fill="none"
                      />
                      <path
                        d="M23.6361 9.33998C22.212 8.71399 20.6892 8.25903 19.0973 8C18.9018 8.33209 18.6734 8.77875 18.5159 9.13408C16.8236 8.89498 15.1469 8.89498 13.4857 9.13408C13.3283 8.77875 13.0946 8.33209 12.8974 8C11.3037 8.25903 9.77927 8.71565 8.35518 9.3433C5.48276 13.4213 4.70409 17.3981 5.09342 21.3184C6.99856 22.6551 8.84487 23.467 10.66 23.9983C11.1082 23.4189 11.5079 22.8029 11.8523 22.1536C11.1964 21.9195 10.5683 21.6306 9.9748 21.2951C10.1323 21.1856 10.2863 21.071 10.4351 20.9531C14.0551 22.5438 17.9881 22.5438 21.5649 20.9531C21.7154 21.071 21.8694 21.1856 22.0251 21.2951C21.4299 21.6322 20.8 21.9211 20.1442 22.1553C20.4885 22.8029 20.8865 23.4205 21.3364 24C23.1533 23.4687 25.0013 22.6567 26.9065 21.3184C27.3633 16.7738 26.1261 12.8335 23.6361 9.33998ZM12.3454 18.9075C11.2587 18.9075 10.3676 17.9543 10.3676 16.7937C10.3676 15.6331 11.2397 14.6783 12.3454 14.6783C13.4511 14.6783 14.3422 15.6314 14.3232 16.7937C14.325 17.9543 13.4511 18.9075 12.3454 18.9075ZM19.6545 18.9075C18.5678 18.9075 17.6767 17.9543 17.6767 16.7937C17.6767 15.6331 18.5488 14.6783 19.6545 14.6783C20.7602 14.6783 21.6514 15.6314 21.6323 16.7937C21.6323 17.9543 20.7602 18.9075 19.6545 18.9075Z"
                        fill="white"
                      />
                    </svg>

                    <span className="text-base">{"Connect with Discord"}</span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.996"
                    height="14.566"
                    viewBox="0 0 8.996 14.566"
                  >
                    <g id="Arrow-23" transform="translate(-117.653 -32)">
                      <path
                        id="Pfad_12383"
                        data-name="Pfad 12383"
                        d="M120.133,39.811a1.3,1.3,0,0,0,0-1.058l-2.312-5.19a1,1,0,0,1,1.486-1.332c1.493,1.16,5.277,4.65,6.99,6.243a1.1,1.1,0,0,1,0,1.616c-1.713,1.593-5.5,5.083-6.99,6.243A1,1,0,0,1,117.821,45Z"
                        transform="translate(0 0)"
                        fill={darkMode ? "gray" : "#292c33"}
                      />
                    </g>
                  </svg>
                </div>

                <div className="pt-1 font-light text-slate-700 flex flex-row space-x-1">
                  <span>
                    {signUpMethod
                      ? "Already have an account?"
                      : "Don't have an account?"}
                  </span>
                  <span
                    onClick={() => {
                      setErrorMsg("");
                      setMiniError("");
                      setNote("");
                      if (signUpMethod) {
                        setSignUpMethod(false);
                        setSignInMethod(true);
                      } else {
                        setSignInMethod(false);
                        setSignUpMethod(true);
                      }

                      setManualEmail("");
                      setManualPassword("");
                      setConfirmPassword("");
                      setCallPassword(false);
                    }}
                    className="font-medium cursor-pointer underline"
                  >
                    {signUpMethod ? "Login" : "Register"}
                  </span>
                </div>
              </div>
            )}

            <div className="addmargin w-full text-[#D0D3DB] text-xs flex flex-row items-center justify-between space-x-1">
              <div>{"© Anime Book 2025"}</div>
              <div className="rounded-b-xl flex flex-row justify-center space-x-1">
                <span
                  onClick={() => {
                    fullPageReload("/terms-of-service");
                  }}
                  className="cursor-pointer underline"
                >
                  Terms of Service
                </span>
                <span
                  onClick={() => {
                    fullPageReload("privacy-policy");
                  }}
                  className="cursor-pointer underline"
                >
                  Privacy Policy
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="hidden md:flex w-1/2">
        <AnimeGrid img1={img1} img2={img2} img3={img3} img4={img4} />
      </div>
    </div>
  );
};
export default Signin;