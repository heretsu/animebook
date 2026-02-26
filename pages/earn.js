import NavBar, { MobileNavBar } from "@/components/navBar";
import animationData from "@/assets/kianimation.json";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../lib/userContext";
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
import free from "@/assets/chibis/free.jpg";
import PopupModal from "@/components/popupModal";
import SAITAMALOGO from "@/assets/saitama";
import SOLSVG from "@/assets/sol";
import ETHSVG from "@/assets/eth";
import Spinner from "@/components/spinner";
import luffyLogo from "../assets/luffyLogo.png";
import yellowchibi from "../assets/chibis/yellowchibi.png";
import fireborder from "../assets/fireborder.png";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const ShopPurchase = ({
  currentUserChibis,
  currentUserBorders,
  userData,
  darkMode,
  cartDetail,
  setShopImageItem,
}) => {
  const { fullPageReload } = PageLoadOptions();
  const [currency, setCurrency] = useState("luffy");
  const [usdValue, setUsdValue] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const purchaseBorder = async () => {
    setLoading(true);
    if (cartDetail.purchaseType === "border") {
      if (parseFloat(userData.ki) >= parseFloat(cartDetail.kiprice)) {
        const newKi = parseFloat(userData.ki) - parseFloat(cartDetail.kiprice);
        supabase
          .from("borders")
          .insert({
            userid: userData.id,
            collectionid: cartDetail.collectionid,
          })
          .then((response) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            supabase
              .from("users")
              .update({
                ki: newKi,
                borderid: cartDetail.collectionid,
              })
              .eq("useruuid", userData.useruuid)
              .then((res) => {
                if (res.error) {
                  setLoading(false);
                  console.log(res.error);
                  return;
                }
                setSuccess(true);
                setLoading(false);
              })
              .catch((error) => {
                setLoading(false);
                console.log("cypher e: ", error);
              });
          })
          .catch((error) => {
            setLoading(false);
            console.log("cypher e: ", error);
          });
      }
    }

    setLoading(false);
  };

  const purchaseChibi = async () => {
    setLoading(true);
    if (cartDetail.purchaseType === "chibi") {
      if (parseFloat(userData.ki) >= parseFloat(cartDetail.kiprice)) {
        const newKi = parseFloat(userData.ki) - parseFloat(cartDetail.kiprice);
        const {data, error} = await supabase.from("users").update({
          ki: newKi,
        }).eq("useruuid", userData.useruuid)
        ;
        if (error){
          console.log(error)
          setLoading(false)
          return
        }

        supabase
          .from("chibis")
          .insert({
            userid: userData.id,
            collectionid: cartDetail.collectionid,
          })
          .then((res) => {
            if (res.error) {
              setLoading(false);
              return;
            }
            setSuccess(true);
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.log("cypher e: ", error);
          });
      }
    }

    setLoading(false);
  };

  return (
    <div
      id={"shop-modal"}
      className="h-screen text-white relative flex flex-row justify-center items-end lg:items-center w-full lg:px-2"
    >
      <span
        className={`max:h-[85vh] overflow-y-scroll lg:m-auto w-full lg:w-fit flex flex-col-reverse lg:flex-row items-center lg:items-start justify-between lg:space-x-2`}
      >
        <span
          className={`${
            darkMode ? "bg-black text-white" : "bg-white text-black"
          } w-full lg:w-fit m-auto h-full max-h-[90vh] overflow-hidden p-0.5 rounded-lg p-2 flex flex-col lg:flex-row items-center lg:items-start justify-center`}
        >
          <span className="m-auto flex justify-center">
            <span className="m-auto p-2">
              {cartDetail.purchaseType === "border" ? (
                <AvatarDesign
                  border={cartDetail.image}
                  userData={userData}
                  size={200}
                />
              ) : (
                <Image
                  src={cartDetail.image}
                  alt="cart item"
                  width={400}
                  height={400}
                  className="border border-black rounded-lg object-cover"
                />
              )}
            </span>
          </span>
          {cartDetail.purchaseType === "chibi" &&
            (!!(
              currentUserChibis &&
              currentUserChibis.some(
                (item) => item.collectionid === cartDetail.collectionid
              )
            ) ? (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="w-full text-center text-lg font-semibold">
                  {" "}
                  {"You have this Chibi"}
                </span>
                <span
                  onClick={() => {
                    fullPageReload(`/profile/${userData.username}`, "window");
                  }}
                  className="mt-4 text-lg w-full text-white text-center cursor-pointer font-semibold bg-[#EB4463] p-1.5 rounded-lg"
                >
                  View in profile
                </span>
              </span>
            ) : success ? (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="w-full text-center text-lg font-semibold">
                  {" "}
                  {"Added to collections!"}
                </span>
                <span
                  onClick={() => {
                    fullPageReload(`/profile/${userData.username}`, "window");
                  }}
                  className="mt-4 text-lg w-full text-white text-center cursor-pointer font-semibold bg-[#EB4463] p-1.5 rounded-lg"
                >
                  View in profile
                </span>
              </span>
            ) : (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="flex flex-row items-center justify-start space-x-2">
                  <span className="text-lg font-semibold">{"Chibi #1"}</span>
                  <span className="px-2 bg-[#0000001A] border border-black rounded-lg text-xs">
                    limited
                  </span>
                </span>
                <span className="pb-2 text-sm font-[500]">
                  {
                    "Show off your anime love with adorable chibis and share the cuteness!"
                  }
                </span>
                <span className="text-sm font-[500]">
                  {
                    "Chibis can be highlighted on your profile and can be activated in the settings."
                  }
                </span>
                <span
                  className={`border ${
                    darkMode
                      ? "border-[#32353C] bg-[#27292F] text-white"
                      : "border-[#D0D3DB] bg-gray-100 text-black"
                  } my-3 w-full h-fit flex flex-row justify-between items-center rounded-lg`}
                >
                  <span className="flex flex-row items-center justify-start">
                    <span className="text-xl pl-2 font-semibold">{"$"}</span>
                    <input
                      onChange={(e) => {
                        setUsdValue(
                          !isNaN(e.target.value) ? e.target.value : usdValue
                        );
                      }}
                      disabled
                      value={usdValue}
                      className={`w-full text-normal ${
                        darkMode
                          ? "placeholder:text-white"
                          : "placeholder:text-black"
                      } bg-black h-fit bg-transparent border-none focus:outline-none focus:ring-0`}
                      placeholder={cartDetail.price}
                    />
                  </span>

                  {currency === "ki" ? (
                    <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                      <span className="-mx-4 h-8 w-12">
                        <Lottie animationData={animationData} />
                      </span>

                      <span className="-ml-4 text-white text-xl font-semibold text-sm">
                        KI
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="up-arrow"
                        width="7.582"
                        height="8.821"
                        viewBox="0 0 8.582 9.821"
                        className="ml-2"
                      >
                        <g id="Gruppe_3153" data-name="Gruppe 3153">
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                            transform="translate(-32.307 0)"
                            fill="#f9f9f9"
                          />
                        </g>
                      </svg>
                    </span>
                  ) : currency === "luffy" ? (
                    <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                      <span className="w-10">
                        <Image
                          src={luffyLogo}
                          alt="luffy logo"
                          height={35}
                          width={35}
                          className="rounded-full"
                        />
                      </span>
                      <span className="text-white text-xl font-semibold text-sm">
                        LUFFY
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="up-arrow"
                        width="7.582"
                        height="8.821"
                        viewBox="0 0 8.582 9.821"
                        className="ml-2"
                      >
                        <g id="Gruppe_3153" data-name="Gruppe 3153">
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                            transform="translate(-32.307 0)"
                            fill="#f9f9f9"
                          />
                        </g>
                      </svg>
                    </span>
                  ) : currency === "eth" ? (
                    <span className="space-x-1 p-2 h-full rounded-r-lg bg-zinc-700 border-black flex flex-row items-center">
                      <ETHSVG size={"35"} />
                      <span className="text-white text-xl font-semibold text-sm">
                        ETH
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="up-arrow"
                        width="7.582"
                        height="8.821"
                        viewBox="0 0 8.582 9.821"
                        className="ml-2"
                      >
                        <g id="Gruppe_3153" data-name="Gruppe 3153">
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                            transform="translate(-32.307 0)"
                            fill="#f9f9f9"
                          />
                        </g>
                      </svg>
                    </span>
                  ) : currency === "sol" ? (
                    <span className="space-x-1 p-2 h-full rounded-r-lg bg-zinc-700 border-black flex flex-row items-center">
                      <SOLSVG size={"35"} />
                      <span className="text-white text-xl font-semibold text-sm">
                        SOL
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="up-arrow"
                        width="7.582"
                        height="8.821"
                        viewBox="0 0 8.582 9.821"
                        className="ml-2"
                      >
                        <g id="Gruppe_3153" data-name="Gruppe 3153">
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                            transform="translate(-32.307 0)"
                            fill="#f9f9f9"
                          />
                        </g>
                      </svg>
                    </span>
                  ) : (
                    <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                      <span className="w-[30px]">
                        <SAITAMALOGO w={35} h={30} />
                      </span>
                      <span className="text-white text-l font-bold text-sm">
                        SAITAMA
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        id="up-arrow"
                        width="7.582"
                        height="8.821"
                        viewBox="0 0 8.582 9.821"
                        className="ml-2"
                      >
                        <g id="Gruppe_3153" data-name="Gruppe 3153">
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                            transform="translate(-32.307 0)"
                            fill="#f9f9f9"
                          />
                        </g>
                      </svg>
                    </span>
                  )}
                </span>
                <span className="flex flex-row items-center">
                  <span className="pl-2 text-sm font-semibold">KI:</span>
                  <span className="-ml-1 h-6 w-8">
                    <Lottie animationData={animationData} />
                  </span>
                  <span className="flex items-center -ml-1.5 text-xs">
                    {cartDetail.kiprice}
                  </span>
                </span>
                {loading ? (
                  <span className="w-full flex justify-center">
                    <Spinner spinnerSize={"medium"} />
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      purchaseChibi();
                    }}
                    className={`${
                      parseFloat(userData.ki) >= parseFloat(cartDetail.kiprice)
                        ? "bg-[#EB4463] cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-lg w-full text-white text-center font-semibold p-2 py-2 rounded-lg`}
                  >
                    {parseFloat(cartDetail.price) === 0
                      ? "CLAIM NOW"
                      : "BUY NOW"}
                  </span>
                )}
                <span className="pt-2 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-1">
                  <span
                    onClick={() => {
                      setCurrency("luffy");
                    }}
                  >
                    <Image
                      src={luffyLogo}
                      alt="luffy logo"
                      height={25}
                      width={25}
                      className="rounded-full"
                    />
                  </span>
                  <span
                    onClick={() => {
                      setCurrency("sol");
                    }}
                  >
                    <SOLSVG size={"24"} />
                  </span>
                  <span
                    onClick={() => {
                      setCurrency("eth");
                    }}
                  >
                    <ETHSVG size={"24"} />
                  </span>

                  <span
                    onClick={() => {
                      setCurrency("sai");
                    }}
                  >
                    <span className="">
                      <SAITAMALOGO w={25} h={25} />
                    </span>
                  </span>
                </span>
              </span>
            ))}

          {cartDetail.purchaseType === "border" &&
            (!!(
              currentUserBorders &&
              currentUserBorders.some(
                (item) => item.collectionid === cartDetail.collectionid
              )
            ) ? (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="w-full text-center text-sm pb-2 font-semibold">
                  {cartDetail.name}
                </span>
                <span className="w-full text-center text-lg font-semibold">
                  {" "}
                  {"You have this border"}
                </span>
                <span
                  onClick={() => {
                    fullPageReload(`/profile/${userData.username}`, "window");
                  }}
                  className="mt-4 text-lg w-full text-white text-center cursor-pointer font-semibold bg-[#EB4463] p-1.5 rounded-lg"
                >
                  View in profile
                </span>
              </span>
            ) : success ? (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="w-full text-center text-lg font-semibold">
                  {" "}
                  {"Added to collections!"}
                </span>
                <span
                  onClick={() => {
                    fullPageReload(`/profile/${userData.username}`, "window");
                  }}
                  className="mt-4 text-lg w-full text-white text-center cursor-pointer font-semibold bg-[#EB4463] p-1.5 rounded-lg"
                >
                  View in profile
                </span>
              </span>
            ) : (
              <span
                id="scrollbar-remove"
                className="w-full lg:w-[280px] h-full my-auto max-h-[90vh] overflow-y-scroll min-h-[1vh] flex flex-col text-base justify-start text-start"
              >
                <span className="flex flex-row items-center justify-start space-x-2">
                  <span className="text-lg font-semibold">
                    {cartDetail.name}
                  </span>
                  {cartDetail.purchaseType === "chibi" && (
                    <span className="px-2 bg-[#0000001A] border border-black rounded-lg text-xs">
                      limited
                    </span>
                  )}
                </span>
                <span className="pb-2 text-sm font-[500]">
                  {"Stand out with Animebook borders"}
                </span>
                <span className="text-sm font-[500]">
                  {
                    "Borders can be highlighted on your profile and can be activated in the settings."
                  }
                </span>
                <span
                  className={`border ${
                    darkMode
                      ? "border-[#32353C] bg-[#27292F] text-white"
                      : "border-[#D0D3DB] bg-gray-100 text-black"
                  } my-3 w-full h-fit flex flex-row justify-between items-center rounded-lg`}
                >
                  <span className="flex flex-row items-center justify-start">
                    <span className="text-xl pl-2 font-semibold">{"$"}</span>
                    <input
                      onChange={(e) => {
                        setUsdValue(
                          !isNaN(e.target.value) ? e.target.value : usdValue
                        );
                      }}
                      disabled
                      value={usdValue}
                      className={`w-full text-normal ${
                        darkMode
                          ? "placeholder:text-white"
                          : "placeholder:text-black"
                      } bg-black h-fit bg-transparent border-none focus:outline-none focus:ring-0`}
                      placeholder={cartDetail.price}
                    />
                  </span>

                  {currency === "luffy" ? (
                    <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                      <span className="w-10">
                        <Image
                          src={luffyLogo}
                          alt="luffy logo"
                          height={35}
                          width={35}
                          className="rounded-full"
                        />
                      </span>
                      <span className="text-white text-xl font-semibold text-sm">
                        LUFFY
                      </span>
                    </span>
                  ) : currency === "eth" ? (
                    <span className="space-x-1 p-2 h-full rounded-r-lg bg-zinc-700 border-black flex flex-row items-center">
                      <ETHSVG size={"35"} />
                      <span className="text-white text-xl font-semibold text-sm">
                        ETH
                      </span>
                    </span>
                  ) : currency === "sol" ? (
                    <span className="space-x-1 p-2 h-full rounded-r-lg bg-zinc-700 border-black flex flex-row items-center">
                      <SOLSVG size={"35"} />
                      <span className="text-white text-xl font-semibold text-sm">
                        SOL
                      </span>
                    </span>
                  ) : (
                    <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                      <span className="w-[30px]">
                        <SAITAMALOGO w={35} h={30} />
                      </span>
                      <span className="text-white text-l font-bold text-sm">
                        SAITAMA
                      </span>
                    </span>
                  )}
                </span>
                <span className="flex flex-row items-center">
                  <span className="pl-2 text-sm font-semibold">KI:</span>
                  <span className="-ml-1 h-6 w-8">
                    <Lottie animationData={animationData} />
                  </span>
                  <span className="flex items-center -ml-1.5 text-xs">
                    {cartDetail.kiprice}
                  </span>
                </span>
                {loading ? (
                  <span className="w-full flex justify-center">
                    <Spinner spinnerSize={"medium"} />
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      purchaseBorder();
                    }}
                    className={`${
                      parseFloat(userData.ki) >= parseFloat(cartDetail.kiprice)
                        ? "bg-[#EB4463] cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-lg w-full text-white text-center cursor-pointer font-semibold bg-[#EB4463] p-2 py-2 rounded-lg`}
                  >
                    {parseFloat(cartDetail.price) === 0
                      ? "CLAIM NOW"
                      : "BUY NOW"}
                  </span>
                )}
                <span className="pt-2 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-1">
                  <span
                    onClick={() => {
                      setCurrency("luffy");
                    }}
                  >
                    <Image
                      src={luffyLogo}
                      alt="luffy logo"
                      height={25}
                      width={25}
                      className="rounded-full"
                    />
                  </span>
                  <span
                    onClick={() => {
                      setCurrency("sol");
                    }}
                  >
                    <SOLSVG size={"24"} />
                  </span>
                  <span
                    onClick={() => {
                      setCurrency("eth");
                    }}
                  >
                    <ETHSVG size={"24"} />
                  </span>

                  <span
                    onClick={() => {
                      setCurrency("sai");
                    }}
                  >
                    <span className="">
                      <SAITAMALOGO w={25} h={25} />
                    </span>
                  </span>
                </span>
              </span>
            ))}
        </span>
        <span
          onClick={() => {
            setShopImageItem(null);
          }}
          className="mb-3 bg-white text-xl cursor-pointer text-center items-center text-black h-8 w-8 rounded-full"
        >
          x
        </span>
      </span>
    </div>
  );
};

export function AvatarDesign({ border, userData, size }) {
  return (
    <div className={`relative w-[${size}px] h-[${size}px]`}>
      {/* The border ring */}
      <Image src={border} alt="custom border" fill className="object-contain" />
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
  const {
    userData,
    darkMode,
    setUserChibis,
    currentUserChibis,
    setCurrentUserChibis,
    currentUserBorders,
    setCurrentUserBorders
  } = useContext(UserContext);
  const [chosenShop, setChosenShop] = useState("all");
  const [shopImageItem, setShopImageItem] = useState(null);
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

  const fetchAllChibis = (userid) => {
    supabase
      .from("chibis")
      .select("id, created_at, collectionid, users(id, avatar, username)")
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUserChibis(res.data);
          if (userid) {
            setCurrentUserChibis(
              res.data.filter((c) => {
                return c.users.id === userid;
              })
            );
          }
        }
      });
  };

  const fetchAllBorders = (userid) => {
    supabase
      .from("borders")
      .select("id, created_at, collectionid, users(id, avatar, username)")
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          if (userid) {
            setCurrentUserBorders(
              res.data.filter((c) => {
                return c.users.id === userid;
              })
            );
          }
        }
      });
  };

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
      fetchAllChibis(userData.id);
      fetchAllBorders(userData.id)
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

              {(chosenShop === "all" || chosenShop === "chibis") && (
                <span className="pt-2 gap-1.5 grid grid-cols-2 lg:grid-cols-4">
                  <span
                    className={`cursor-pointer flex flex-col p-4 border rounded-xl ${
                      darkMode
                        ? "border-[#292C33]"
                        : "bg-[#FFFFFF] border-[#EEEDEF]"
                    }`}
                    onClick={() => {
                      setShopImageItem({
                        image: free,
                        name: "Chibi #1",
                        price: "0.00",
                        kiprice: "0",
                        collectionid: 1,
                        purchaseType: "chibi",
                      });
                    }}
                  >
                    <span className="pb-1.5 flex flex-row justify-between items-center">
                      <span className="text-sm font-semibold">{`Chibi #1`}</span>
                      <span
                        className={`px-2 bg-[#0000001A] border ${
                          darkMode ? "border-[#292C33]" : "border-black"
                        } rounded-lg text-xs`}
                      >
                        Limited
                      </span>
                    </span>
                    <span
                      className={`mx-auto flex w-fit items-center justify-center rounded-lg`}
                    >
                      <span className={`relative w-[140px] h-[140px]`}>
                        <Image
                          src={free}
                          alt="custom border"
                          fill
                          className="border border-black object-cover rounded-lg"
                        />
                      </span>
                    </span>
                    <span className="text-sm pt-2 text-white w-full flex flex-row justify-between">
                      <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">
                        Free
                      </span>
                      <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">
                        {"$0.00"}
                      </span>
                    </span>
                  </span>

                  <span
                    className={`cursor-pointer flex flex-col p-4 border rounded-xl ${
                      darkMode
                        ? "border-[#292C33]"
                        : "bg-[#FFFFFF] border-[#EEEDEF]"
                    }`}
                    onClick={() => {
                      setShopImageItem({
                        image: yellowchibi,
                        name: "Chibi #2",
                        price: "5",
                        kiprice: "500",
                        collectionid: 2,
                        purchaseType: "chibi",
                      });
                    }}
                  >
                    <span className="pb-1.5 flex flex-row justify-between items-center">
                      <span className="text-sm font-semibold">{`Chibi #2`}</span>
                      <span
                        className={`px-2 bg-[#0000001A] border ${
                          darkMode ? "border-[#292C33]" : "border-black"
                        } rounded-lg text-xs`}
                      >
                        Limited
                      </span>
                    </span>
                    <span
                      className={`mx-auto flex w-fit items-center justify-center rounded-lg`}
                    >
                      <span className={`relative w-[140px] h-[140px]`}>
                        <Image
                          src={yellowchibi}
                          alt="custom border"
                          fill
                          className="border border-black object-cover rounded-lg"
                        />
                      </span>
                    </span>
                    <span className="text-sm pt-2 text-white w-full flex flex-row justify-between">
                      <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">
                        500
                      </span>
                      <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">
                        {"$5"}
                      </span>
                    </span>
                  </span>
                </span>
              )}
              {/* BORDERS BOX */}
              {(chosenShop === "all" || chosenShop === "borders") && (
                <span className="pt-2 gap-1.5 grid grid-cols-2 lg:grid-cols-4">
                  <span
                    className={`flex flex-col p-4 border rounded-xl ${
                      darkMode
                        ? "border-[#292C33]"
                        : "bg-[#FFFFFF] border-[#EEEDEF]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{`Border "Animebook"`}</span>

                    <span
                      className={`p-1 ${
                        darkMode ? "bg" : "bg-[#0000001A]"
                      } flex items-center justify-center border border-black rounded-lg`}
                      onClick={() => {}}
                    >
                      <AvatarDesign
                        border={customBorder}
                        userData={userData}
                        size={120}
                      />
                    </span>
                    <span
                      onClick={() => {
                        setShopImageItem({
                          image: customBorder,
                          name: `Border "Animebook"`,
                          price: "0.5",
                          kiprice: "50",
                          collectionid: 1,
                          purchaseType: "border",
                        });
                      }}
                      className="cursor-pointer text-sm pt-2 text-white w-full flex flex-row justify-between"
                    >
                      <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">
                        50 Ki
                      </span>
                      <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">
                        {"$0.5"}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`flex flex-col p-4 border rounded-xl ${
                      darkMode
                        ? "border-[#292C33]"
                        : "bg-[#FFFFFF] border-[#EEEDEF]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{`Border "River"`}</span>

                    <span
                      className={`p-1 ${
                        darkMode ? "bg" : "bg-[#0000001A]"
                      } flex items-center justify-center border border-black rounded-lg`}
                      onClick={() => {}}
                    >
                      <AvatarDesign
                        border={customBorder2}
                        userData={userData}
                        size={120}
                      />
                    </span>
                    <span
                      onClick={() => {
                        setShopImageItem({
                          image: customBorder2,
                          name: `Border "River"`,
                          price: "1",
                          kiprice: "100",
                          collectionid: 2,
                          purchaseType: "border",
                        });
                      }}
                      className="cursor-pointer text-sm pt-2 text-white w-full flex flex-row justify-between"
                    >
                      <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">
                        100 Ki
                      </span>
                      <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">
                        {"$1"}
                      </span>
                    </span>
                  </span>

                  <span
                    className={`flex flex-col p-4 border rounded-xl ${
                      darkMode
                        ? "border-[#292C33]"
                        : "bg-[#FFFFFF] border-[#EEEDEF]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{`Border "Fire"`}</span>

                    <span
                      className={`p-1 ${
                        darkMode ? "bg" : "bg-[#0000001A]"
                      } flex items-center justify-center border border-black rounded-lg`}
                      onClick={() => {}}
                    >
                      <AvatarDesign
                        border={fireborder}
                        userData={userData}
                        size={120}
                      />
                    </span>
                    <span
                      onClick={() => {
                        setShopImageItem({
                          image: fireborder,
                          name: `Border "Fire"`,
                          price: "1",
                          kiprice: "100",
                          collectionid: 3,
                          purchaseType: "border",
                        });
                      }}
                      className="cursor-pointer text-sm pt-2 text-white w-full flex flex-row justify-between"
                    >
                      <span className="border border-black bg-[#EB4463] rounded py-0.5 w-[48%] text-center">
                        100 Ki
                      </span>
                      <span className="border border-black bg-[#292C33] rounded py-0.5 w-[48%] text-center">
                        {"$1"}
                      </span>
                    </span>
                  </span>
                </span>
              )}
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

        {shopImageItem && (
          <ShopPurchase
            darkMode={darkMode}
            userData={userData}
            cartDetail={shopImageItem}
            setShopImageItem={setShopImageItem}
            currentUserChibis={currentUserChibis}
            currentUserBorders={currentUserBorders}
          />
        )}

        {shopImageItem && (
          <div
            onClick={() => {
              setShopImageItem(null);
            }}
            id="manga-overlay"
            className="bg-black bg-opacity-80"
          ></div>
        )}
      </main>
    )
  );
};
export default Earn;
