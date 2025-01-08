import NavBar, { MobileNavBar } from "@/components/navBar";
import animeBookLogo from "@/assets/animeBookLogo.png";
import animationData from "@/assets/kianimation.json";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";

const Earn = () => {
  const [tapped, setTapped] = useState(true);
  const { userData, darkMode} = useContext(UserContext);

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

  useEffect(() => {
    if (userData) {
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
  return (userData && 
    <main> 
      <section className={`${darkMode ? 'text-white' : 'text-black'} mb-5 flex flex-row space-x-2 w-full`}>
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <span className="mx-auto font-medium text-sm">
            Current KI: {parseFloat(parseFloat(userData.ki).toFixed(2))}
          </span>

          { tapped ? <div
            
            className="cursor-pointer border-4 border-gray-300 shadow-xl rounded-full h-60 w-60 flex flex-row mx-auto items-center justify-center"
          >
            <span className="h-30 w-30">
              <Lottie animationData={animationData} />
            </span>
          </div> : <div
            onClick={() => {
              dailyKiTap();
            }}
            className="cursor-pointer border-4 border-blue-300 shadow-xl rounded-full h-60 w-60 flex flex-row mx-auto items-center justify-center"
          >
            <span className="absolute border-2 shadow-xl border-blue-400 rounded-full h-60 w-60 animate-ping"></span>
            <span className="h-30 w-30">
              <Lottie animationData={animationData} />
            </span>
          </div> }
          <span className="mx-auto font-semibold">{tapped ? "Next claim in 24 hours" : "Claim Today's KI"}</span>
        </div>
      </section>
      <MobileNavBar />
    </main>
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
