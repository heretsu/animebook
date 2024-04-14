import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import DappLogo from "./dappLogo";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animeFontAndImage from "@/assets/animebookFontAndImage.png"

export const MobileNavBar = () => {
  // For dev: This is mobile nav. 
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("/home");

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname]);

  return (
    <div className="lg:invisible fixed bottom-0 w-full">
      <div
        id="navShadow"
        className="bg-white mx-auto w-full flex flex-row justify-between items-center py-1.5 px-3"
      >
        <svg
          onClick={() => {
            fullPageReload("/home");
          }}
          fill="currentColor"
          width="28px"
          height="28px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className={currentRoute == "/home" ? "text-textGreen" : "text-slate-500"}
        >
          <path d="M23,22a1,1,0,0,1-2,0,8.964,8.964,0,0,0-6.3-8.588,1,1,0,1,1,.6-1.908A10.956,10.956,0,0,1,23,22ZM23,4v6a1,1,0,0,1-1,1H18a1,1,0,0,1-1-1V9H13v7a1,1,0,0,1-2,0V13.059A9.01,9.01,0,0,0,3,22a1,1,0,0,1-2,0A11.01,11.01,0,0,1,11,11.051V2a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1V3h3A1,1,0,0,1,23,4ZM17,3H13V7h4Zm4,2H19V9h2ZM10,19a2,2,0,1,0-2,2A2,2,0,0,0,10,19Zm8-1a1,1,0,1,0-1,1A1,1,0,0,0,18,18Z" />
        </svg>

        <svg
          onClick={() => {
            fullPageReload("/explore");
          }}
          className="w-[28px] h-[28px] text-slate-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 21 20"
        >
          <path
            stroke={currentRoute == "/explore" ? "rgb(73, 169, 73)" : "gray"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
            d="m11.479 1.712 2.367 4.8a.532.532 0 0 0 .4.292l5.294.769a.534.534 0 0 1 .3.91l-3.83 3.735a.534.534 0 0 0-.154.473l.9 5.272a.535.535 0 0 1-.775.563l-4.734-2.49a.536.536 0 0 0-.5 0l-4.73 2.487a.534.534 0 0 1-.775-.563l.9-5.272a.534.534 0 0 0-.154-.473L2.158 8.48a.534.534 0 0 1 .3-.911l5.294-.77a.532.532 0 0 0 .4-.292l2.367-4.8a.534.534 0 0 1 .96.004Z"
          />
        </svg>

        <svg
          onClick={() => {
            router.push("/create");
          }}
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          height="28px"
          width="28px"
          stroke="transparent"
          fill={currentRoute === "/create" ? "#74dc9c" : "black"}
          x="0px"
          y="0px"
          viewBox="0 0 52 52"
          style={{
            enableBackground: "new 0 0 52 52",
          }}
          xmlSpace="preserve"
        >
          <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M38.5,28H28v11c0,1.104-0.896,2-2,2 s-2-0.896-2-2V28H13.5c-1.104,0-2-0.896-2-2s0.896-2,2-2H24V14c0-1.104,0.896-2,2-2s2,0.896,2,2v10h10.5c1.104,0,2,0.896,2,2 S39.604,28,38.5,28z" />
        </svg>

        <svg onClick={()=>{router.push("/communities")}}
          width="28px"
          height="28px"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill={currentRoute == "/communities" || currentRoute == "communities/[community]" ? "rgb(73, 169, 73)" : "gray"}
        >
          <path d="M 2 5 L 2 21 L 6 21 L 6 26.09375 L 7.625 24.78125 L 12.34375 21 L 22 21 L 22 5 Z M 4 7 L 20 7 L 20 19 L 11.65625 19 L 11.375 19.21875 L 8 21.90625 L 8 19 L 4 19 Z M 24 9 L 24 11 L 28 11 L 28 23 L 24 23 L 24 25.90625 L 20.34375 23 L 12.84375 23 L 10.34375 25 L 19.65625 25 L 26 30.09375 L 26 25 L 30 25 L 30 9 Z" />
        </svg>

        <svg onClick={()=>{router.push("/earn")}}
              width="28px"
              height="28px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                rx="8.5"
                ry="9"
                transform="matrix(-1 0 0 1 10.5 12)"
                stroke={
                  currentRoute == "/earn" ? "rgb(73, 169, 73)" : "gray"
                }
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 8.8C12.3732 8.29767 11.5941 8 10.7498 8C8.67883 8 7 9.79086 7 12C7 14.2091 8.67883 16 10.7498 16C11.5941 16 12.3732 15.7023 13 15.2"
                stroke={
                  currentRoute == "/earn" ? "rgb(73, 169, 73)" : "gray"
                }
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 3C14.6667 3 22 3.9 22 12C22 20.1 14.6667 21 11 21"
                stroke={
                  currentRoute == "/earn" ? "rgb(73, 169, 73)" : "gray"
                }
                strokeWidth="1.8"
              />
            </svg>

        

        
      </div>
    </div>
  );
};

const NavBar = () => {
  const { fullPageReload } = PageLoadOptions();
  const { userData, myProfileRoute, NotSignedIn } = useContext(UserContext);
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useState("/home");

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname]);

  return (
    <div className="fixed invisible lg:visible h-screen py-2 flex flex-col">
      <div className="px-6 bg-white w-full h-full rounded-t-xl">
        <div className="py-4 flex justify-start items-center">
          <Image src={animeFontAndImage} alt="anime book colored logo" height={200} width={200}/>
          
        </div>
        <span className="border-t py-3 cursor-pointer flex justify-start items-center space-x-1">
          {userData && (
            <span className="relative h-8 w-8 flex">
              <Image
                src={userData.picture}
                alt="user myprofile"
                height={35}
                width={35}
                className="rounded-full"
              />
            </span>
          )}
          {userData ? (
            <span className="text-sm flex flex-row items-center justify-start">
              <span>{"@"}</span>
              <span
                onClick={() => {
                  fullPageReload(`/profile/${userData.username}`);
                }}
                className="font-semibold"
              >
                {userData && userData.username}
              </span>{" "}
            </span>
          ) : (
            NotSignedIn && (
              <span
                onClick={() => {
                  fullPageReload("/signin");
                }}
                className="cursor-pointer w-full bg-pastelGreen px-8 py-2 text-center text-white font-bold rounded-xl"
              >
                Login
              </span>
            )
          )}
        </span>
        <div className="text-sm block font-medium space-y-6 pr-28 py-7 border-y border-gray-200">
          <div
            onClick={() => {
              fullPageReload("/home");
            }}
            className={
              currentRoute == "/home" || currentRoute == "/create"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              fill="currentColor"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23,22a1,1,0,0,1-2,0,8.964,8.964,0,0,0-6.3-8.588,1,1,0,1,1,.6-1.908A10.956,10.956,0,0,1,23,22ZM23,4v6a1,1,0,0,1-1,1H18a1,1,0,0,1-1-1V9H13v7a1,1,0,0,1-2,0V13.059A9.01,9.01,0,0,0,3,22a1,1,0,0,1-2,0A11.01,11.01,0,0,1,11,11.051V2a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1V3h3A1,1,0,0,1,23,4ZM17,3H13V7h4Zm4,2H19V9h2ZM10,19a2,2,0,1,0-2,2A2,2,0,0,0,10,19Zm8-1a1,1,0,1,0-1,1A1,1,0,0,0,18,18Z" />
            </svg>
            <span>Home</span>
          </div>
          <div
            onClick={() => {
              fullPageReload("/explore");
            }}
            className={
              currentRoute == "/explore"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              className="w-[24px] h-[24px] text-black"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 21 20"
            >
              <path
                stroke={
                  currentRoute == "/explore" ? "rgb(73, 169, 73)" : "#000000"
                }
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m11.479 1.712 2.367 4.8a.532.532 0 0 0 .4.292l5.294.769a.534.534 0 0 1 .3.91l-3.83 3.735a.534.534 0 0 0-.154.473l.9 5.272a.535.535 0 0 1-.775.563l-4.734-2.49a.536.536 0 0 0-.5 0l-4.73 2.487a.534.534 0 0 1-.775-.563l.9-5.272a.534.534 0 0 0-.154-.473L2.158 8.48a.534.534 0 0 1 .3-.911l5.294-.77a.532.532 0 0 0 .4-.292l2.367-4.8a.534.534 0 0 1 .96.004Z"
              />
            </svg>
            <span>Explore</span>
          </div>
          <div
            onClick={() => {
              fullPageReload("/communities");
            }}
            className={
              currentRoute == "/communities" ||
              currentRoute == "/communities/[community]"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M 2 5 L 2 21 L 6 21 L 6 26.09375 L 7.625 24.78125 L 12.34375 21 L 22 21 L 22 5 Z M 4 7 L 20 7 L 20 19 L 11.65625 19 L 11.375 19.21875 L 8 21.90625 L 8 19 L 4 19 Z M 24 9 L 24 11 L 28 11 L 28 23 L 24 23 L 24 25.90625 L 20.34375 23 L 12.84375 23 L 10.34375 25 L 19.65625 25 L 26 30.09375 L 26 25 L 30 25 L 30 9 Z" />
            </svg>
            <span>Communities</span>
          </div>

          <div
            onClick={() => {
              fullPageReload("/notifications");
            }}
            className={
              currentRoute == "/notifications"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              width="24.5px"
              height="24.5px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke={
                currentRoute == "/notifications" ? "rgb(73, 169, 73)" : "black"
              }
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="miter"
            >
              <path d="M19,14l2,4H3l2-4V9.29A7.2,7.2,0,0,1,11.78,2,7,7,0,0,1,19,9Z" />
              <path d="M16,18a4,4,0,1,1-8,0" />
            </svg>
            <span>Notifications</span>
          </div>
          <div
            onClick={() => {
              fullPageReload(`/profile/${userData.username}`);
            }}
            className={
              myProfileRoute &&
              (currentRoute === "/profile/[user]" || currentRoute === "/edit")
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              className="w-[24px] h-[24px] text-black"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 18"
            >
              <path
                stroke={
                  myProfileRoute &&
                  (currentRoute === "/profile/[user]" ||
                    currentRoute === "/edit")
                    ? "rgb(73, 169, 73)"
                    : "#000000"
                }
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-2 3h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"
              />
            </svg>
            <span>Profile</span>
          </div>
          <div
            onClick={() => {
              router.push("/settings");
            }}
            className={
              currentRoute == "/settings"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                currentRoute == "/settings" ? "rgb(73, 169, 73)" : "#000000"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Settings</span>
          </div>
          <div
            onClick={() => {
              router.push("/earn");
            }}
            className={
              currentRoute == "/earn"
                ? "text-textGreen text-start cursor-pointer flex flex-row space-x-3 items-center"
                : "text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                rx="8.5"
                ry="9"
                transform="matrix(-1 0 0 1 10.5 12)"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 8.8C12.3732 8.29767 11.5941 8 10.7498 8C8.67883 8 7 9.79086 7 12C7 14.2091 8.67883 16 10.7498 16C11.5941 16 12.3732 15.7023 13 15.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 3C14.6667 3 22 3.9 22 12C22 20.1 14.6667 21 11 21"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <span>Earn</span>
          </div>
        </div>
        <div className="pt-6 w-full flex justify-center">
          <span
            onClick={() => {
              router.push("/create");
            }}
            className="cursor-pointer w-full bg-pastelGreen px-8 py-2 text-center text-white rounded-xl"
          >
            Make a Post
          </span>
        </div>
      </div>
      <div className="bg-white rounded-b-xl pb-3 px-6 text-textGreen text-xs flex flex-row justify-between space-x-10">
        <span className="cursor-pointer underline">Terms of Service</span>
        <span className="cursor-pointer underline">Privacy Policy</span>
      </div>
    </div>
  );
};
export default NavBar;
