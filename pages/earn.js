import NavBar, { MobileNavBar } from "@/components/navBar";
import animationData from "@/assets/kianimation.json";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import dynamic from "next/dynamic";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import LargeTopBar from "@/components/largeTopBar";
import FancyBg from "@/components/fancyBg";
import tipImage from "@/assets/tipImage.png";
import circlesImage from "@/assets/circlesImage.png";
import Yuki from "@/components/yuki";
import LargeRightBar from "@/components/largeRightBar";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Earn = () => {
  const { fullPageReload } = PageLoadOptions();
  const [tapped, setTapped] = useState(true);
  const { userData, darkMode } = useContext(UserContext);

  const dailyKiTap = async () => {
    setTapped(true);
    if (!tapped) {
      console.log("tapped");
      await supabase
        .from("users")
        .update({
          ki: parseFloat(userData.ki) + 5,
          lastkiclaim: new Date().toISOString(),
        })
        .eq("id", userData.id);
    }
  };
  const [copyClicked, setCopyClicked] = useState(false);

  const handleCopy = () => {
    const referralCode = `animebook.io/signin?ref=${userData.username.toLowerCase()}-san`;
    // Save to clipboard
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopyClicked(true); // Set clicked state to true
      // Reset after a short delay
      setTimeout(() => setCopyClicked(false), 500);
    });
  };
  const [referrals, setReferrals] = useState([]);

  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer", userData.username.trim());

    if (data) {
      setReferrals(data);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchReferrals();
      const currentTime = new Date();
      const pastTime = new Date(userData.lastkiclaim);
      const timeDifference = currentTime - pastTime;
      const secondsAgo = Math.round(timeDifference / 1000);
      const minutesAgo = Math.round(secondsAgo / 60);
      const hoursAgo = Math.round(minutesAgo / 60);
      if (hoursAgo >= 24) {
        setTapped(false);
      } else {
        setTapped(true);
      }
    }
  }, [userData]);
  return (
    userData && (
      <main className={`${darkMode ? "bg-black" : "bg-[#F9F9F9]"}`}>
        <div className="hidden lg:block block z-40 sticky top-0">
          <LargeTopBar relationship={false} />
        </div>
        <section
          className={`${
            darkMode ? "text-white" : "text-black"
          } mb-5 flex flex-row space-x-2 w-full`}
        >
          <NavBar />
          <div className="w-full pb-2 pl-2 pr-4 lg:pl-[16rem] mt-4 lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col">
            <span
              className={`border ${
                darkMode
                  ? "bg-[#1E1F24] border-[#292C33]"
                  : "bg-white border-[#EEEDEF]"
              } text-sm flex flex-row justify-start items-center p-3 rounded`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21.637"
                height="21.615"
                viewBox="0 0 23.637 23.615"
                fill={darkMode ? "white" : "black"}
              >
                <path
                  id="about"
                  d="M12.808,1A11.791,11.791,0,0,0,2.416,18.393l-1.36,4.533a1.312,1.312,0,0,0,1.257,1.69,1.337,1.337,0,0,0,.378-.055L7.223,23.2A11.808,11.808,0,1,0,12.808,1Zm0,5.248A1.312,1.312,0,1,1,11.5,7.56,1.312,1.312,0,0,1,12.808,6.248Zm1.312,13.12H12.808A1.312,1.312,0,0,1,11.5,18.055V12.808a1.312,1.312,0,1,1,0-2.624h1.312A1.312,1.312,0,0,1,14.12,11.5v5.248a1.312,1.312,0,1,1,0,2.624Z"
                  transform="translate(-1 -1)"
                />
              </svg>
              <span className="pl-3 font-light">
                {`Your KI balance: ${parseFloat(
                  parseFloat(userData.ki).toFixed(2)
                )} KI`}
              </span>
            </span>

            <span className="pl-8 text-white mt-7 rounded-xl border border-black h-48 flex flex-row items-center justify-between w-full bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600 bg-green-800 relative w-fit">
              {/* Left Section: Text & Button */}
              <span className="flex flex-col space-y-1 w-full">
                {/* Title */}
                <span className="font-bold leading-tight text-lg xl:text-xl flex flex-row space-x-1">
                  <span>{"Earn"}</span>
                  <span>{"&"}</span>
                  <span>{"Shop"}</span>
                </span>

                {/* Description */}
                <span className="leading-tight font-medium text-xs xl:text-sm flex flex-col justify-start w-full">
                  <span className="flex flex-row space-x-1">
                    <span>{"Earn"}</span>
                    <span>{"KI"}</span>
                    <span>{"by"}</span>
                    <span>{"interacting"}</span>
                    <span>{"on"}</span>
                    <span>{"Animebook!"}</span>
                  </span>
                  <span>
                    {
                      "You can swap your KI for amazing products or Luffy Tokens!"
                    }
                  </span>
                </span>

                {/* Claim Button */}
                <span id="z-20"
                  onClick={() => {
                    if (!tapped) {
                      dailyKiTap();
                      console.log('tapp')
                    }
                  }}
                  className={`w-fit text-xs lg:text-[0.7rem] font-semibold ${
                    tapped ? "text-gray-300 bg-gray-700" : "text-black bg-white"
                  } rounded py-2 px-5 sm:px-7`}
                >
                  {tapped ? "Next claim in 24 hours" : "Claim Today's KI"}
                </span>
              </span>

              {/* Right Section: Yuki (Overflow Allowed) */}
              <span className="w-fit -ml-16 h-full flex items-center justify-start relative">
                <Yuki className={"-mt-10 bottom-0 h-48 xl:h-56 w-auto"} />
              </span>
            </span>

            <span className="flex flex-row items-center space-x-1">
              <span>{"Referral code:"}</span>{" "}
              <span>{`animebook.io/signin?ref=${userData.username.toLowerCase()}-san`}</span>
              <svg
                onClick={() => {
                  handleCopy();
                }}
                className={`cursor-pointer ${
                  copyClicked && "bg-blue-400 rounded"
                }`}
                width="18px"
                height="18px"
                viewBox="0 0 24 24"
                fill="#3b82f6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2V4zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2h-4zm4-2V4H4v10h10z"
                  fill="#3b82f6"
                />
              </svg>
            </span>

            <span className="py-2 font-bold">
              {"How to earn with Animebook"}
            </span>
            <span className="w-full flex flex-row space-x-4">
              <span
                className={`w-fit flex flex-col border ${
                  darkMode
                    ? "bg-[#1e1f24] border-[#292C33]"
                    : "bg-white border-[#EEEDEF]"
                } rounded-lg p-7 items-start`}
              >
                <span className="text-lg font-semibold flex flex-row">
                  <span>KI Points</span>
                  <span className="h-8 w-12">
                    <Lottie animationData={animationData} />
                  </span>
                </span>
                <span
                  className={`text-xs ${
                    darkMode ? "text-white" : "text-[#5D6879]"
                  } w-fit flex flex-col`}
                >
                  <span>{"Complete daily tasks and earn KI points"}</span>
                </span>
              </span>

              <span
                className={`w-fit flex flex-col border w-fit ${
                  darkMode
                    ? "bg-[#1e1f24] border-[#292C33]"
                    : "bg-white border-[#EEEDEF]"
                } rounded-lg p-7 items-start`}
              >
                <span className="space-x-1 text-lg font-semibold flex flex-row">
                  <span>Tips</span>
                  <span className="flex h-8 w-8">
                    <Image
                      src={tipImage}
                      alt="user profile"
                      height={35}
                      width={35}
                      className="relative rounded-full"
                    />
                  </span>
                </span>
                <span
                  className={`text-xs ${
                    darkMode ? "text-white" : "text-[#5D6879]"
                  } w-fit flex flex-col`}
                >
                  <span>{"Receive tips from users and get paid!"}</span>
                </span>
              </span>
              <span
                className={`hidden lg:block w-1/2 flex flex-col border ${
                  darkMode
                    ? "bg-[#1e1f24] border-[#292C33]"
                    : "bg-white border-[#EEEDEF]"
                } rounded-lg p-7 items-start`}
              >
                <span className="space-x-2 text-lg font-semibold flex flex-row">
                  <span>Sell your art</span>
                  <span className="flex h-8 w-8">
                    <Image
                      src={circlesImage}
                      alt="user profile"
                      height={35}
                      width={35}
                      className="relative rounded-full"
                    />
                  </span>
                </span>
                <span
                  className={`text-xs ${
                    darkMode ? "text-white" : "text-[#5D6879]"
                  } w-fit flex flex-col`}
                >
                  <span>
                    {
                      "Sell your art, manga, and more, and get paid instantly for every purchase or subscription!"
                    }
                  </span>
                </span>
              </span>
            </span>
            <span
              className={`lg:hidden mt-2 w-1/2 flex flex-col border ${
                darkMode
                  ? "bg-[#1e1f24] border-[#292C33]"
                  : "bg-white border-[#EEEDEF]"
              } rounded-lg p-7 items-start`}
            >
              <span className="space-x-2 text-lg font-semibold flex flex-row">
                <span>Sell your art</span>
                <span className="flex h-8 w-8">
                  <Image
                    src={circlesImage}
                    alt="user profile"
                    height={35}
                    width={35}
                    className="relative rounded-full"
                  />
                </span>
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-white" : "text-[#5D6879]"
                } w-fit flex flex-col`}
              >
                <span>
                  {
                    "Sell your art, manga, and more, and get paid instantly for every purchase or subscription!"
                  }
                </span>
              </span>
            </span>

            <span className="py-2 flex flex-col justify-start items-start">
              <span className="pb-2 font-medium text-lg">Shop</span>
              <span className="rounded-xl py-8 bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600 bg-green-800 text-xl text-white font-semibold opacity-70 w-full text-center justify-center">
                {"Coming Soon!"}
              </span>
            </span>

            <span className="mt-4 flex flex-col">
              <span className="text-lg font-medium">{`Referrals ${referrals.length}`}</span>
              <ol
                className={`mt-1 px-8 py-2 ${
                  darkMode ? "bg-slate-900" : "bg-slate-300"
                } rounded-lg`}
              >
                {referrals &&
                  referrals.length > 0 &&
                  referrals.map((invite) => {
                    return (
                      <li
                        className="cursor-default"
                        onClick={() => {
                          fullPageReload(`/profile/${invite.referee}`);
                        }}
                        key={invite.id}
                      >
                        {invite.referee}
                      </li>
                    );
                  })}
              </ol>
            </span>
          </div>

          <div className="hidden lg:block sticky right-2 top-20 heighto">
            <LargeRightBar />
          </div>
        </section>
        <MobileNavBar />
      </main>
    )
  );
};
export default Earn;

//

{
  /* <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-0 lg:mt-0 flex flex-col">
          <div className="flex flex-row mx-auto items-start justify-center w-48 h-30">
            <Lottie animationData={animationData} />
          </div>
          <span>Your karma points are 200</span>
          <span className="flex flex-row space-x-0.5 text-sm font-semibold cursor-pointer bg-blue-400 text-white w-fit px-2 py-1 rounded">
            <span>Claim Today's points</span>
            <span>
              <svg
                id="Uploaded to svgrepo.com"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="20px"
                height="20px"
                viewBox="0 0 32 32"
                xmlSpace="preserve"
              >
                <style type="text/css">
                  {
                    "\n\t.duotone_twee{fill:white;}\n\t.duotone_een{fill:white;}\n\t.st0{fill:#FFF9F9;}\n\t.st1{fill:#808080;}\n"
                  }
                </style>
                <g>
                  <path
                    className="duotone_twee"
                    d="M18.5,27h-5c-0.276,0-0.5-0.224-0.5-0.5v-3c0-0.276,0.224-0.5,0.5-0.5h5c0.276,0,0.5,0.224,0.5,0.5v3 C19,26.776,18.776,27,18.5,27z"
                  />
                  <g>
                    <g>
                      <path
                        className="duotone_een"
                        d="M16,4C9.373,4,4,8.373,4,15c0,0.686,0.113,1.513,0.113,1.513c0.011,0.081,0.036,0.135,0.066,0.174 c0,0.001,0,0.002,0.001,0.003L12,24.305V23.5c0-0.182,0.037-0.355,0.097-0.517l-6.769-6.539c-0.203-0.206-0.194-0.547,0.03-0.73 C5.811,15.345,6.394,15,7,15c1.102,0,2.064,0.594,2.586,1.478c0.097,0.164,2.253,4.386,2.915,5.684 C12.702,22.062,12.926,22,13.167,22h0.374l-2.766-5.496c-0.091-0.18-0.073-0.405,0.065-0.552C11.383,15.372,12.142,15,13,15 c0.992,0,1.86,0.489,2.406,1.231c0.064,0.087,0.094,0.194,0.094,0.302V22h1v-5.467c0-0.107,0.031-0.215,0.094-0.302 C17.14,15.489,18.008,15,19,15c0.858,0,1.617,0.372,2.16,0.951c0.138,0.147,0.156,0.372,0.065,0.552L18.459,22h0.374 c0.24,0,0.464,0.062,0.666,0.163c0.661-1.298,2.818-5.52,2.915-5.684C22.936,15.594,23.898,15,25,15 c0.606,0,1.189,0.345,1.642,0.715c0.224,0.183,0.233,0.524,0.03,0.73l-6.769,6.539C19.963,23.145,20,23.318,20,23.5v0.805 l7.82-7.615c0-0.001,0-0.002,0.001-0.003c0.03-0.04,0.055-0.093,0.066-0.174c0,0,0.113-0.827,0.113-1.513C28,8.373,22.627,4,16,4 z"
                      />
                    </g>
                    <g>
                      <path
                        className="duotone_een"
                        d="M16,4C9.373,4,4,8.373,4,15c0,0.686,0.113,1.513,0.113,1.513c0.011,0.081,0.036,0.135,0.066,0.174 c0,0.001,0,0.002,0.001,0.003L12,24.305V23.5c0-0.182,0.037-0.355,0.097-0.517l-6.769-6.539c-0.203-0.206-0.194-0.547,0.03-0.73 C5.811,15.345,6.394,15,7,15c1.102,0,2.064,0.594,2.586,1.478c0.097,0.164,2.253,4.386,2.915,5.684 C12.702,22.062,12.926,22,13.167,22h0.374l-2.766-5.496c-0.091-0.18-0.073-0.405,0.065-0.552C11.383,15.372,12.142,15,13,15 c0.992,0,1.86,0.489,2.406,1.231c0.064,0.087,0.094,0.194,0.094,0.302V22h1v-5.467c0-0.107,0.031-0.215,0.094-0.302 C17.14,15.489,18.008,15,19,15c0.858,0,1.617,0.372,2.16,0.951c0.138,0.147,0.156,0.372,0.065,0.552L18.459,22h0.374 c0.24,0,0.464,0.062,0.666,0.163c0.661-1.298,2.818-5.52,2.915-5.684C22.936,15.594,23.898,15,25,15 c0.606,0,1.189,0.345,1.642,0.715c0.224,0.183,0.233,0.524,0.03,0.73l-6.769,6.539C19.963,23.145,20,23.318,20,23.5v0.805 l7.82-7.615c0-0.001,0-0.002,0.001-0.003c0.03-0.04,0.055-0.093,0.066-0.174c0,0,0.113-0.827,0.113-1.513C28,8.373,22.627,4,16,4 z"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            </span>
          </span>
        </div> */
}

//

// <div className="flex flex-row w-14 h-10 object-cover items-center justify-center">
//   <Lottie animationData={animationData} />
//   <span className="pl-12 absolute text-xs font-bold">200</span>
// </div>

// <div className="flex flex-col pt-24 w-full justify-center items-center text-center text-[2rem]">
//             <span>
//               <Image
//                 src={animeBookLogo}
//                 alt="anime book logo"
//                 width={200}
//                 height={200}
//                 className="rounded-t-xl object-cover"
//               />
//             </span>
//             <span className="flex flex-row">
//               <span id="anime-book-font" className="pr-4 text-black">
//                 Coming
//               </span>
//               <span id="anime-book-font" className="text-pastelGreen">
//                 so
//               </span>
//               <span className="text-invisible text-white">o</span>
//               <span id="anime-book-font" className="text-pastelGreen">
//                 on
//               </span>
//             </span>
//             <span className="pt-2 pr-0.5 font-bold text-sm text-black">
//               近日公開
//             </span>
//           </div>
