// import NavBar, { MobileNavBar } from "@/components/navBar";
// import animationData from "@/assets/kianimation.json";
// import Image from "next/image";
// import { useEffect, useState, useContext, useRef } from "react";
// import { UserContext } from "@/lib/userContext";
// import supabase from "@/hooks/authenticateUser";
// import dynamic from "next/dynamic";
// import PageLoadOptions from "@/hooks/pageLoadOptions";
// import LargeTopBar from "@/components/largeTopBar";
// import FancyBg from "@/components/fancyBg";
// import tipImage from "@/assets/tipImage.png";
// import circlesImage from "@/assets/circlesImage.png";
// import Yuki from "@/components/yuki";
// import LargeRightBar from "@/components/largeRightBar";
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// const Earn = () => {
//   const { fullPageReload } = PageLoadOptions();
//   const [tapped, setTapped] = useState(true);
//   const { userData, darkMode } = useContext(UserContext);

//   const dailyKiTap = async () => {
//     setTapped(true);
//     if (!tapped) {
//       console.log("tapped");
//       await supabase
//         .from("users")
//         .update({
//           ki: parseFloat(userData.ki) + 5,
//           lastkiclaim: new Date().toISOString(),
//         })
//         .eq("id", userData.id);
//     }
//   };
//   const [copyClicked, setCopyClicked] = useState(false);

//   const handleCopy = () => {
//     const referralCode = `animebook.io/signin?ref=${userData.username.toLowerCase()}-san`;
//     // Save to clipboard
//     navigator.clipboard.writeText(referralCode).then(() => {
//       setCopyClicked(true); // Set clicked state to true
//       // Reset after a short delay
//       setTimeout(() => setCopyClicked(false), 500);
//     });
//   };
//   const [referrals, setReferrals] = useState([]);

//   const fetchReferrals = async () => {
//     const { data, error } = await supabase
//       .from("referrals")
//       .select("*")
//       .eq("referrer", userData.username.trim());

//     if (data) {
//       setReferrals(data);
//     }
//   };

//   useEffect(() => {
//     if (userData) {
//       fetchReferrals();
//       const currentTime = new Date();
//       const pastTime = new Date(userData.lastkiclaim);
//       const timeDifference = currentTime - pastTime;
//       const secondsAgo = Math.round(timeDifference / 1000);
//       const minutesAgo = Math.round(secondsAgo / 60);
//       const hoursAgo = Math.round(minutesAgo / 60);
//       if (hoursAgo >= 24) {
//         setTapped(false);
//       } else {
//         setTapped(true);
//       }
//     }
//   }, [userData]);
//   return (
//     userData && (
//       <main className={`mb-20 ${darkMode ? "bg-black" : "bg-[#F9F9F9]"}`}>
//         <div className="hidden lg:block block z-40 sticky top-0">
//           <LargeTopBar relationship={false} />
//         </div>
//         <section
//           className={`${
//             darkMode ? "text-white" : "text-black"
//           } mb-5 flex flex-row space-x-2 w-full`}
//         >
//           <NavBar />
//           <div className="w-full pb-2 pl-2 pr-4 lg:pl-[16rem] mt-4 lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col">
//             <span
//               className={`border ${
//                 darkMode
//                   ? "bg-[#1E1F24] border-[#292C33]"
//                   : "bg-white border-[#EEEDEF]"
//               } text-sm flex flex-row justify-start items-center p-3 rounded`}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="21.637"
//                 height="21.615"
//                 viewBox="0 0 23.637 23.615"
//                 fill={darkMode ? "white" : "black"}
//               >
//                 <path
//                   id="about"
//                   d="M12.808,1A11.791,11.791,0,0,0,2.416,18.393l-1.36,4.533a1.312,1.312,0,0,0,1.257,1.69,1.337,1.337,0,0,0,.378-.055L7.223,23.2A11.808,11.808,0,1,0,12.808,1Zm0,5.248A1.312,1.312,0,1,1,11.5,7.56,1.312,1.312,0,0,1,12.808,6.248Zm1.312,13.12H12.808A1.312,1.312,0,0,1,11.5,18.055V12.808a1.312,1.312,0,1,1,0-2.624h1.312A1.312,1.312,0,0,1,14.12,11.5v5.248a1.312,1.312,0,1,1,0,2.624Z"
//                   transform="translate(-1 -1)"
//                 />
//               </svg>
//               <span className="pl-3 font-light">
//                 {`Your KI balance: ${parseFloat(
//                   parseFloat(userData.ki).toFixed(2)
//                 )} KI`}
//               </span>
//             </span>

//             <span className="pl-8 text-white mt-7 rounded-xl border border-black h-48 flex flex-row items-center justify-between w-full bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600 bg-green-800 relative w-fit">
//               {/* Left Section: Text & Button */}
//               <span className="flex flex-col space-y-1 w-full">
//                 {/* Title */}
//                 <span className="font-bold leading-tight text-lg xl:text-xl flex flex-row space-x-1">
//                   <span>{"Earn"}</span>
//                   <span>{"&"}</span>
//                   <span>{"Shop"}</span>
//                 </span>

//                 {/* Description */}
//                 <span className="leading-tight font-medium text-xs xl:text-sm flex flex-col justify-start w-full">
//                   <span className="flex flex-row space-x-1">
//                     <span>{"Earn"}</span>
//                     <span>{"KI"}</span>
//                     <span>{"by"}</span>
//                     <span>{"interacting"}</span>
//                     <span>{"on"}</span>
//                     <span>{"Animebook!"}</span>
//                   </span>
//                   <span>
//                     {
//                       "You can swap your KI for amazing products or Luffy Tokens!"
//                     }
//                   </span>
//                 </span>

//                 {/* Claim Button */}
//                 <span id="z-20"
//                   onClick={() => {
//                     if (!tapped) {
//                       dailyKiTap();
//                       console.log('tapp')
//                     }
//                   }}
//                   className={`w-fit text-xs lg:text-[0.7rem] font-semibold ${
//                     tapped ? "text-gray-300 bg-gray-700" : "text-black bg-white"
//                   } rounded py-2 px-5 sm:px-7`}
//                 >
//                   {tapped ? "Next claim in 24 hours" : "Claim Today's KI"}
//                 </span>
//               </span>

//               {/* Right Section: Yuki (Overflow Allowed) */}
//               <span className="w-fit -ml-16 h-full flex items-center justify-start relative">
//                 <Yuki className={"-mt-10 bottom-0 h-48 xl:h-56 w-auto"} />
//               </span>
//             </span>

//             <span className="flex flex-row items-center space-x-1">
//               <span>{"Referral code:"}</span>{" "}
//               <span>{`animebook.io/signin?ref=${userData.username.toLowerCase()}-san`}</span>
//               <svg
//                 onClick={() => {
//                   handleCopy();
//                 }}
//                 className={`cursor-pointer ${
//                   copyClicked && "bg-blue-400 rounded"
//                 }`}
//                 width="18px"
//                 height="18px"
//                 viewBox="0 0 24 24"
//                 fill="#3b82f6"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2V4zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2h-4zm4-2V4H4v10h10z"
//                   fill="#3b82f6"
//                 />
//               </svg>
//             </span>

//             <span className="py-2 font-bold">
//               {"How to earn with Animebook"}
//             </span>
//             <span className="w-full flex flex-row space-x-4">
//               <span
//                 className={`w-fit flex flex-col border ${
//                   darkMode
//                     ? "bg-[#1e1f24] border-[#292C33]"
//                     : "bg-white border-[#EEEDEF]"
//                 } rounded-lg p-7 items-start`}
//               >
//                 <span className="text-lg font-semibold flex flex-row">
//                   <span>KI Points</span>
//                   <span className="h-8 w-12">
//                     <Lottie animationData={animationData} />
//                   </span>
//                 </span>
//                 <span
//                   className={`text-xs ${
//                     darkMode ? "text-white" : "text-[#5D6879]"
//                   } w-fit flex flex-col`}
//                 >
//                   <span>{"Complete daily tasks and earn KI points"}</span>
//                 </span>
//               </span>

//               <span
//                 className={`w-fit flex flex-col border w-fit ${
//                   darkMode
//                     ? "bg-[#1e1f24] border-[#292C33]"
//                     : "bg-white border-[#EEEDEF]"
//                 } rounded-lg p-7 items-start`}
//               >
//                 <span className="space-x-1 text-lg font-semibold flex flex-row">
//                   <span>Tips</span>
//                   <span className="flex h-8 w-8">
//                     <Image
//                       src={tipImage}
//                       alt="user profile"
//                       height={35}
//                       width={35}
//                       className="relative rounded-full"
//                     />
//                   </span>
//                 </span>
//                 <span
//                   className={`text-xs ${
//                     darkMode ? "text-white" : "text-[#5D6879]"
//                   } w-fit flex flex-col`}
//                 >
//                   <span>{"Receive tips from users and get paid!"}</span>
//                 </span>
//               </span>
//               <span
//                 className={`hidden lg:block w-1/2 flex flex-col border ${
//                   darkMode
//                     ? "bg-[#1e1f24] border-[#292C33]"
//                     : "bg-white border-[#EEEDEF]"
//                 } rounded-lg p-7 items-start`}
//               >
//                 <span className="space-x-2 text-lg font-semibold flex flex-row">
//                   <span>Sell your art</span>
//                   <span className="flex h-8 w-8">
//                     <Image
//                       src={circlesImage}
//                       alt="user profile"
//                       height={35}
//                       width={35}
//                       className="relative rounded-full"
//                     />
//                   </span>
//                 </span>
//                 <span
//                   className={`text-xs ${
//                     darkMode ? "text-white" : "text-[#5D6879]"
//                   } w-fit flex flex-col`}
//                 >
//                   <span>
//                     {
//                       "Sell your art, manga, and more, and get paid instantly for every purchase or subscription!"
//                     }
//                   </span>
//                 </span>
//               </span>
//             </span>
//             <span
//               className={`lg:hidden mt-2 w-1/2 flex flex-col border ${
//                 darkMode
//                   ? "bg-[#1e1f24] border-[#292C33]"
//                   : "bg-white border-[#EEEDEF]"
//               } rounded-lg p-7 items-start`}
//             >
//               <span className="space-x-2 text-lg font-semibold flex flex-row">
//                 <span>Sell your art</span>
//                 <span className="flex h-8 w-8">
//                   <Image
//                     src={circlesImage}
//                     alt="user profile"
//                     height={35}
//                     width={35}
//                     className="relative rounded-full"
//                   />
//                 </span>
//               </span>
//               <span
//                 className={`text-xs ${
//                   darkMode ? "text-white" : "text-[#5D6879]"
//                 } w-fit flex flex-col`}
//               >
//                 <span>
//                   {
//                     "Sell your art, manga, and more, and get paid instantly for every purchase or subscription!"
//                   }
//                 </span>
//               </span>
//             </span>

//             <span className="py-2 flex flex-col justify-start items-start">
//               <span className="pb-2 font-medium text-lg">Shop</span>
//               <span className="rounded-xl py-8 bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600 bg-green-800 text-xl text-white font-semibold opacity-70 w-full text-center justify-center">
//                 {"Coming Soon!"}
//               </span>
//             </span>

//             <span className="mt-4 flex flex-col">
//               <span className="text-lg font-medium">{`Referrals ${referrals.length}`}</span>
//               <ol
//                 className={`mt-1 px-8 py-2 ${
//                   darkMode ? "bg-slate-900" : "bg-slate-300"
//                 } rounded-lg`}
//               >
//                 {referrals &&
//                   referrals.length > 0 &&
//                   referrals.map((invite) => {
//                     return (
//                       <li
//                         className="cursor-default"
//                         onClick={() => {
//                           fullPageReload(`/profile/${invite.referee}`);
//                         }}
//                         key={invite.id}
//                       >
//                         {invite.referee}
//                       </li>
//                     );
//                   })}
//               </ol>
//             </span>
//           </div>

//           <div className="hidden lg:block sticky right-2 top-20 heighto">
//             <LargeRightBar />
//           </div>
//         </section>
//         <MobileNavBar />
//       </main>
//     )
//   );
// };
// export default Earn;

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
import customBorder from "@/assets/customborder.png";
import customBorder2 from "@/assets/customborder2.png";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function AvatarWithBorder({ border, userData, size }) {
  return (
    <div className={`relative w-[${size}px] h-[${size}px]`}>
      {/* The border ring */}
      <Image
        src={border}
        alt="custom border"
        fill
        className="object-contain"
      />
      {/* The user avatar */}
      <Image
        src={userData.avatar}
        alt="user avatar"
        width={size}
        height={size}
        className="object-cover rounded-full p-2"
      />
    </div>
  );
}

const Earn = () => {
  const { fullPageReload } = PageLoadOptions();
  const [tapped, setTapped] = useState(true);
  const { userData, darkMode } = useContext(UserContext);
  const [chosenShop, setChosenShop] = useState("all");

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
                <span
                  id="z-20"
                  onClick={() => {
                    if (!tapped) {
                      dailyKiTap();
                      console.log("tapp");
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
              <span className="font-bold">Shop</span>
              <span
                className={`border ${
                  darkMode
                    ? "bg-[#1E1F24] border-[#292C33] text-white"
                    : "bg-white border-[#EEEDEF] text-black"
                } font-medium flex p-0.5 rounded w-full overflow-y-scroll`}
              >
                <span className="text-sm space-x-2 w-fit flex flex-row">
                  <span
                    onClick={() => {
                      setChosenShop("all");
                    }}
                    className={
                      chosenShop === "all"
                        ? "rounded bg-[#EB4463] text-white py-1 px-3.5 cursor-pointer"
                        : "py-1 px-3.5 cursor-pointer"
                    }
                  >
                    All
                  </span>

                  <span
                    onClick={() => {
                      setChosenShop("borders");
                    }}
                    className={
                      chosenShop === "borders"
                        ? "rounded bg-[#EB4463] text-white py-1 px-3.5 cursor-pointer"
                        : "py-1 px-3.5 cursor-pointer"
                    }
                  >
                    Borders
                  </span>
                  <span
                    onClick={() => {
                      setChosenShop("chibis");
                    }}
                    className={
                      chosenShop === "chibis"
                        ? "rounded bg-[#EB4463] text-white py-1 px-3.5 cursor-pointer"
                        : "py-1 px-3.5 cursor-pointer"
                    }
                  >
                    Chibis
                  </span>
                  <span
                    onClick={() => {
                      setChosenShop("crypto");
                    }}
                    className={
                      chosenShop === "crypto"
                        ? "rounded bg-[#EB4463] text-white py-1 px-3.5 cursor-pointer"
                        : "py-1 px-3.5 cursor-pointer"
                    }
                  >
                    Crypto
                  </span>
                </span>
              </span>

              {/* CHIBIS BOX */}
              {(chosenShop === 'all' || chosenShop === 'borders') && <span className="pt-2 gap-1.5 grid grid-cols-2 lg:grid-cols-4">
                <span className={`flex flex-col p-4 border rounded-xl ${darkMode ? "" : "bg-[#FFFFFF] border-[#EEEDEF]"}`}>
                    <span className="text-sm font-semibold">{`Border "Animebook"`}</span>
                    
                  <span
                    className={`p-1 ${
                      darkMode ? "bg" : "bg-[#0000001A]"
                    } flex items-center justify-center border border-black rounded-lg`}
                    onClick={()=>{
                      
                    }}
                  >
                    <AvatarWithBorder
                      border={customBorder}
                      userData={userData}
                      size={120}
                    />
                  </span>
                  <span className="text-sm pt-2 text-white w-full flex flex-row justify-between">
                    <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">1000 Ki</span>
                    <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">{"$2.99"}</span>
                  </span>
                </span>
                
              </span>}
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