import { useEffect, useState, useContext } from "react";
import Spinner from "./spinner";
import { useRouter } from "next/router";
import Image from "next/image";
import ConnectionData from "@/lib/connectionData";
import { UserContext } from "@/lib/userContext";
import ETHSVG from "@/assets/eth";
import luffyLogo from "../assets/luffyLogo.png";
import ErcTwentyToken from "../lib/static/ErcTwentyToken.json";
import PriceFeedStation from "@/lib/priceFeedStation";
import { ethers } from "ethers";
import DappLibrary from "@/lib/dappLibrary";
import supabase from "@/hooks/authenticateUser";
import DbUsers from "@/hooks/dbUsers";

export default function PopupModal({
  address,
  success,
  messageTopic,
  moreInfo,
  username,
  sourceAddress,
  destinationAddress,
  userDestinationId,
  avatar,
  mangaPrice,
  mangaImage,
  mangaName,
  mangaId,
}) {
  const { sendNotification } = DappLibrary();
  const ercABI = ErcTwentyToken.abi;
  const { getUsdPrice } = PriceFeedStation();
  const [activateSpinner, setActivateSpinner] = useState(false);
  const {
    setAddress,
    deletePost,
    setDeletePost,
    userNumId,
    setPostValues,
    setOpenPurchaseModal,
    
  } = useContext(UserContext);
  const { connectToWallet } = ConnectionData();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [currency, setCurrency] = useState("eth");
  const [usdValue, setUsdValue] = useState("");
  const [prices, setPrices] = useState(null);
  const [coinAmount, setCoinAmount] = useState(null);
  const [weiValue, setWeiValue] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [err, setErr] = useState(null);

  const toggleCurrency = (coin) => {
    setErr("");
    setTipMessage("");
    setCurrency(coin);
    convertToCoin(usdValue, coin);
    convertPriceToCoin(coin, prices);
  };

  function formatNumber(number) {
    if (Math.floor(number) === number) {
      return number.toString();
    } else {
      return number.toFixed(5).replace(/(\.\d*?[1-9])0+$|\.$/, "$1");
    }
  }

  const convertToCoin = (usd, coin) => {
    console.log(prices)
    if (usd !== "" && coin !== "" && !isNaN(usd) && prices) {
      let sendAmount = 0;
      console.log(usd)

      if (coin === "luffy") {
        sendAmount = parseFloat(usd) / prices.tokenPrice;
      } else {
        sendAmount = parseFloat(usd) / prices.ethPrice;
      }
      const amountInWei = ethers.utils.parseUnits(
        sendAmount.toFixed(coin === "luffy" ? 9 : 18).toString(),
        coin === "luffy" ? 9 : 18
      );
      setCoinAmount(`${formatNumber(sendAmount)} ${coin}`);
      setWeiValue(amountInWei);
    } else if (isNaN(usd)) {
    } else {
      setCoinAmount("");
    }
  };

  const convertPriceToCoin = (coin, prs) => {
    if (success == "6" && usdValue === ""){
      return;
    }
    let sendAmount = 0;
    if (coin === "luffy") {
      sendAmount = parseFloat(success == '6' ? usdValue : mangaPrice) / prs.tokenPrice;
    } else {
      sendAmount = parseFloat(success == '6' ? usdValue : mangaPrice) / prs.ethPrice;
    }
    const amountInWei = ethers.utils.parseUnits(
      sendAmount.toFixed(coin === "luffy" ? 9 : 18).toString(),
      coin === "luffy" ? 9 : 18
    );
    setCoinAmount(`${formatNumber(sendAmount)} ${coin}`);
    setWeiValue(amountInWei);
  };

  const sendTip = async () => {
    if (weiValue !== "") {
      try {
        const amt = coinAmount;
        const coin = currency;
        const { provider } = await connectToWallet();
        let transactionResponse = null;

        if (currency === "luffy") {
          const tokenContract = new ethers.Contract(
            "0x54012cDF4119DE84218F7EB90eEB87e25aE6EBd7",
            ercABI,
            provider.getSigner()
          );
          transactionResponse = await tokenContract.transfer(
            destinationAddress,
            weiValue
          );
        } else {
          transactionResponse = await provider.getSigner().sendTransaction({
            to: destinationAddress,
            value: weiValue,
          });
        }
        const receipt = await transactionResponse.wait();
        setTipMessage(`Tipped ${username} $${amt} in ${coin}`);
        setCoinAmount("");
        sendNotification(
          "tip",
          userDestinationId,
          0,
          0,
          `tipped you ${amt} ${coin}`
        );
      } catch (e) {
        console.log(e.message);
        if (
          (e.message && e.message.includes("insufficient funds")) ||
          e.message.includes("ERC20: transfer amount exceeds balance")
        ) {
          setErr(`Insufficient ${currency} balance`);
        } else {
          setErr(e.message.slice(0, 25).concat("..."));
        }
      }
    } else {
      setErr("Empty input");
    }
    setActivateSpinner(false);
  };

  const purchaseManga = async () => {
    setActivateSpinner(true);
    try {
      const { provider } = await connectToWallet();
      let transactionResponse = null;

      if (currency === "luffy") {
        const tokenContract = new ethers.Contract(
          "0x54012cDF4119DE84218F7EB90eEB87e25aE6EBd7",
          ercABI,
          provider.getSigner()
        );
        transactionResponse = await tokenContract.transfer(
          destinationAddress,
          weiValue
        );
      } else {
        transactionResponse = await provider.getSigner().sendTransaction({
          to: destinationAddress,
          value: weiValue,
        });
      }
      const receipt = await transactionResponse.wait();
      console.log(receipt);

      if (receipt) {
        await supabase.from("purchases").insert({
          mangaid: mangaId,
          userid: userNumId,
        });
        setOpenPurchaseModal(false)
      }
    } catch (e) {
      console.log(e.message);
      if (
        (e.message && e.message.includes("insufficient funds")) ||
        e.message.includes("ERC20: transfer amount exceeds balance")
      ) {
        setErr(`Insufficient ${currency} balance`);
      } else {
        setErr(e.message.slice(0, 25).concat("..."));
      }
    }
    setActivateSpinner(false);
  };

  const deletePostViaId = async () => {
    if (deletePost.media !== null && deletePost.media !== undefined) {
      const { data, error } = await supabase.storage
        .from("mediastore")
        .remove([deletePost.media.split("public/mediastore/")[1]]);
      console.log(data, error);
      if (data.length !== 0) {
        supabase
          .from("posts")
          .delete()
          .eq("id", deletePost.postid)
          .eq("userid", userNumId)
          .then((response) => {
            console.log("response: ", response);
            DbUsers()
              .fetchAllSingleUserPosts(userNumId)
              .then(({ data }) => {
                if (data) {
                  setPostValues(data);
                }
              });
          })
          .catch((e) => {
            console.log("error: ", e);
          });
      }
    } else {
      supabase
        .from("posts")
        .delete()
        .eq("id", deletePost.postid)
        .eq("userid", userNumId)
        .then((response) => {
          console.log("response: ", response);
          DbUsers()
            .fetchAllSingleUserPosts(userNumId)
            .then(({ data }) => {
              if (data) {
                setPostValues(data);
              }
            });
        })
        .catch((e) => {
          console.log("error: ", e);
        });
    }
    setDeletePost(null);
  };

  useEffect(() => {
    setModalVisible(true);
    if (mangaPrice || (success == "6")){
      getUsdPrice().then((res) => {
        console.log(res)
        setPrices(res);
        convertPriceToCoin("eth", res);
      });
    }
  }, []);
  return (
    <div
      id={
        success == "3"
          ? !modalVisible
            ? "invisible"
            : "modal-visible"
          : success == "4"
          ? "modal-in-middle"
          : success == "6"
          ? "tip-modal"
          : success == "7"
          ? "modal-in-middle"
          : "modal"
      }
      className={
        success == "4"
          ? ""
          : success == "6"
          ? "relative border-2 shadow-2xl justiy-center bg-white text-black rounded-xl pt-6 pb-7 px-14 w-11/12 lg:w-2/5 flex flex-col items-center"
          : "bg-white text-black space-y-3 rounded-xl pt-6 pb-7 px-4 lg:px-20 w-9/12 lg:w-2/5 flex flex-col items-center"
      }
    >
      {success == "8" ? (
        <div className="flex flex-col py-2 w-full justify-center relative">
          <span className="w-full space-x-0.5 text-lg font-semibold text-gray-500 flex flex-row justify-center items-center">
            <span>{`Purchase manga from ${username}`}</span>
          </span>

          <span className="mx-auto py-3">
            <Image
              src={mangaImage}
              alt="user profile"
              height={80}
              width={80}
              className="rounded"
            />
          </span>

          <span className="text-center w-full flex flex-col justify-center itemts-center">
            <span className="w-fit mx-auto flex flex-row space-x-1">
              <span>{"Name: "}</span>
              <span className="font-medium">{mangaName}</span>
            </span>
            <span className="w-fit mx-auto flex flex-row space-x-1">
              <span>{"Price: "}</span>
              <span className="text-green-500 font-medium">{`$${mangaPrice}`}</span>
            </span>
          </span>
          <span className="text-slate-700 mx-auto">{coinAmount}</span>
          <span className="py-5 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-4">
            <span
              onClick={() => {
                toggleCurrency("luffy");
              }}
              className={`${
                currency === "luffy"
                  ? "text-white bg-pastelGreen"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <Image
                src={luffyLogo}
                alt="luffy logo"
                height={25}
                width={25}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">LUFFY</span>
            </span>

            <span
              onClick={() => {
                toggleCurrency("eth");
              }}
              className={`${
                currency === "eth"
                  ? "text-white bg-pastelGreen"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <ETHSVG size={"25"} />
              <span className="font-medium text-sm">ETH</span>
            </span>
          </span>
          {activateSpinner ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span
              onClick={() => {
                purchaseManga();
              }}
              className="text-lg w-full text-white text-center cursor-pointer font-bold bg-pastelGreen py-2 px-4 rounded-xl"
            >
              Checkout
            </span>
          )}
          {err && (
            <span className="text-sm text-center w-full flex flex-row justify-center items-center">
              <svg
                fill="red"
                width="20px"
                height="20px"
                viewBox="0 -8 528 528"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>{"fail"}</title>
                <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
              </svg>
              <p className="text-red-500">{err}</p>
            </span>
          )}
        </div>
      ) : success == "7" ? (
        <div className="flex flex-col py-2 w-full relative">
          <span className="mx-auto pb-4 text-lg font-medium">
            {"Are you sure you want to delete this post?"}
          </span>
          {activateSpinner ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span className="text-white font-semibold w-full flex flex-row justify-center items-center space-x-20">
              <span
                onClick={() => {
                  deletePostViaId();
                }}
                className="cursor-pointer bg-red-400 px-3 py-2 rounded-lg"
              >
                Delete
              </span>
              <span
                onClick={() => {
                  setDeletePost(null);
                }}
                className="cursor-pointer bg-slate-900 px-3 py-2 rounded-lg"
              >
                Cancel
              </span>
            </span>
          )}
        </div>
      ) : success == "6" ? (
        <div className="flex flex-col py-2 w-full relative">
          <span className="w-full space-x-0.5 text-lg font-semibold text-gray-500 flex flex-row justify-center items-center">
            <svg
              fill="#94a3b8"
              height="18px"
              width="18px"
              id="Icons"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 32 32"
              xmlSpace="preserve"
            >
              <path d="M29,14h-2.2c-0.2-1.3-0.6-2.5-1.3-3.7c-0.7-1.3-0.5-3,0.6-4.1c0.4-0.4,0.4-1,0-1.4c-2-2-5.2-2-7.3-0.1C17.7,4.2,16.3,4,15,4 c-3.9,0-7.5,1.9-9.8,5c-1.5,2-2.2,4.5-2.2,7c0,2.2,0.6,4.3,1.7,6.1l0.1,0.2c-0.1,0.1-0.2,0.1-0.3,0.1C4.2,22.5,4,22.3,4,22 c0-0.6-0.4-1-1-1s-1,0.4-1,1c0,1.4,1.1,2.5,2.5,2.5c0.5,0,1-0.2,1.4-0.4l3.3,5.4C9.3,29.8,9.6,30,10,30h4c0.3,0,0.6-0.1,0.8-0.4 c0.2-0.2,0.3-0.5,0.2-0.8L14.8,28c0.4,0,0.9,0,1.3,0L16,28.8c0,0.3,0,0.6,0.2,0.8S16.7,30,17,30h4c0.3,0,0.7-0.2,0.8-0.5l2-3.1 c2.4-0.9,4.5-2.2,5.9-3.7c0.2-0.2,0.3-0.4,0.3-0.7V15C30,14.4,29.6,14,29,14z M14.9,14.5h1.3c1.6,0,2.9,1.3,2.9,3 c0,1.5-1.1,2.7-2.5,2.9V21c0,0.6-0.4,1-1,1s-1-0.4-1-1v-0.6c-1.4-0.2-2.5-1.4-2.5-2.9c0-0.6,0.4-1,1-1s1,0.4,1,1 c0,0.5,0.4,0.9,0.9,0.9h1.3c0.5,0,0.9-0.4,0.9-0.9c0-0.5-0.4-1-0.9-1h-1.3c-1.6,0-2.9-1.3-2.9-3c0-1.5,1.1-2.7,2.5-2.9V10 c0-0.6,0.4-1,1-1s1,0.4,1,1v0.6c1.4,0.2,2.5,1.4,2.5,2.9c0,0.6-0.4,1-1,1s-1-0.4-1-1c0-0.5-0.4-0.9-0.9-0.9h-1.3 c-0.5,0-0.9,0.4-0.9,0.9C14,14.1,14.4,14.5,14.9,14.5z" />
            </svg>
            <span>{`Tip ${username} san`}</span>
          </span>

          <span className="mx-auto py-3">
            <Image
              src={avatar}
              alt="user profile"
              height={50}
              width={50}
              className="rounded-full"
            />
          </span>

          <span className="w-full h-fit text-gray-500 flex flex-row justify-between items-center bg-slate-200 rounded-lg">
            <span className="flex flex-row items-center justify-start">
              <span className="text-3xl pl-2 font-medium">{"$"}</span>
              <input
                onChange={(e) => {
                  setUsdValue(
                    !isNaN(e.target.value) ? e.target.value : usdValue
                  );
                  convertToCoin(e.target.value, currency);
                }}
                value={usdValue}
                className="w-full text-3xl text-black bg-black h-fit bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="1.00"
              />
            </span>

            {currency === "luffy" ? (
              <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-gray-300 flex flex-row items-center">
                <span className="w-10">
                  <Image
                    src={luffyLogo}
                    alt="luffy logo"
                    height={35}
                    width={35}
                    className="rounded-full"
                  />
                </span>
                <span className="text-gray-600 text-xl font-semibold text-sm">
                  LUFFY
                </span>
              </span>
            ) : (
              <span className="space-x-1 p-2 h-full rounded-r-lg bg-gray-300 border-black flex flex-row items-center">
                <ETHSVG size={"35"} />
                <span className="text-gray-600 text-xl font-semibold text-sm">
                  ETH
                </span>
              </span>
            )}
          </span>
          <span className="text-slate-700">{coinAmount}</span>
          <span className="py-5 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-4">
            <span
              onClick={() => {
                toggleCurrency("luffy");
              }}
              className={`${
                currency === "luffy"
                  ? "text-white bg-pastelGreen"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <Image
                src={luffyLogo}
                alt="luffy logo"
                height={25}
                width={25}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">LUFFY</span>
            </span>

            <span
              onClick={() => {
                toggleCurrency("eth");
              }}
              className={`${
                currency === "eth"
                  ? "text-white bg-pastelGreen"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <ETHSVG size={"25"} />
              <span className="font-medium text-sm">ETH</span>
            </span>
          </span>
          {activateSpinner ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span
              onClick={() => {
                setErr("");
                setActivateSpinner(true);
                sendTip();
              }}
              className="text-lg w-full text-white text-center cursor-pointer font-bold bg-pastelGreen py-2 px-4 rounded-xl"
            >
              Tip
            </span>
          )}
          {err ? (
            <span className="text-sm text-center w-full flex flex-row justify-center items-center">
              <svg
                fill="red"
                width="20px"
                height="20px"
                viewBox="0 -8 528 528"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>{"fail"}</title>
                <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
              </svg>
              <p className="text-red-500">{err}</p>
            </span>
          ) : (
            tipMessage !== "" && (
              <span className="text-green-500 font-medium w-full flex flex-row justify-center items-center text-sm text-center">
                {tipMessage}
              </span>
            )
          )}
          <span className="pt-2 mx-auto text-gray-500 font-medium">
            {"arigato (ありがとう)"}
          </span>
        </div>
      ) : success == "5" ? (
        <>
          <div className="flex flex-col py-2">
            <span className="font-semibold text-lg text-center">
              {"Welcome back!"}
            </span>
            <span className="cursor-pointer flex flex-row justify-start items-center space-x-2">
              <Image
                src={avatar}
                alt="user profile"
                height={30}
                width={30}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">{username}</span>
            </span>
            <span className="py-2 w-full text-gray-800 text-center">
              {"Please connect your wallet"}
            </span>
            {activateSpinner ? (
              <span className="mx-auto">
                <Spinner spinnerSize={"medium"} />
              </span>
            ) : (
              <span
                onClick={() => {
                  setActivateSpinner(true);
                  connectToWallet()
                    .then((res) => {
                      setAddress(res.addr);
                    })
                    .catch((e) => {
                      console.log(e);
                      setActivateSpinner(false);
                    });
                }}
                className="w-full text-white text-center cursor-pointer font-bold bg-textGreen py-2 px-4 rounded-xl"
              >
                Connect
              </span>
            )}
          </div>
        </>
      ) : success == "4" ? (
        <>
          <div className="w-full flex flex-col space-x-1 justify-center items-center font-bold text-center text-lg font-semibold">
            <Spinner spinnerSize={"logo"} />
            <div className="pt-1 text-slate-700">{"Authenticating..."}</div>
            <span className="font-bold pt-1">{messageTopic}</span>
          </div>

          <div className="text-gray-200 justify-center text-center text-sm">
            <span>{moreInfo}</span>
          </div>
        </>
      ) : success == "3" ? (
        <div className="flex flex-col py-4">
          <span className="font-semibold text-lg text-center">
            {"Konnichiwa! Otaku-san"}
          </span>
          <span className="font-medium text-center h-fit text-slate-500">
            {"こんにちわ！オタクさん"}
          </span>
          <span className="py-4 text-gray-800 text-center lg:text-start">
            {"We've made it easy for you to create or sign into your account:"}
          </span>
          <span
            onClick={() => {
              router.push("/signin");
            }}
            className="flex flex-row justify-center items-center space-x-2 cursor-pointer font-bold bg-textGreen py-3 px-4 rounded-xl text-white text-center"
          >
            <span>Sign in with</span>
            <svg
              className="w-5 h-5 text-white"
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
          </span>
        </div>
      ) : success == "2" ? (
        <>
          <div className="w-full flex flex-col space-x-1 justify-center items-center font-bold text-center text-lg font-semibold">
            <Spinner spinnerSize={"medium"} />
            <span className="font-bold pt-1">{messageTopic}</span>
          </div>

          <div className="text-gray-200 justify-center text-center text-sm">
            <span>{moreInfo}</span>
          </div>
        </>
      ) : success == "1" ? (
        <>
          <div className="w-full flex flex-col space-x-1 justify-center items-center font-bold text-center text-lg font-semibold">
            <svg
              className="w-12 h-12 text-green-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 21 21"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m6.072 10.072 2 2 6-4m3.586 4.314.9-.9a2 2 0 0 0 0-2.828l-.9-.9a2 2 0 0 1-.586-1.414V5.072a2 2 0 0 0-2-2H13.8a2 2 0 0 1-1.414-.586l-.9-.9a2 2 0 0 0-2.828 0l-.9.9a2 2 0 0 1-1.414.586H5.072a2 2 0 0 0-2 2v1.272a2 2 0 0 1-.586 1.414l-.9.9a2 2 0 0 0 0 2.828l.9.9a2 2 0 0 1 .586 1.414v1.272a2 2 0 0 0 2 2h1.272a2 2 0 0 1 1.414.586l.9.9a2 2 0 0 0 2.828 0l.9-.9a2 2 0 0 1 1.414-.586h1.272a2 2 0 0 0 2-2V13.8a2 2 0 0 1 .586-1.414Z"
              />
            </svg>
            <span className="font-bold pt-1">{messageTopic}</span>
          </div>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href={moreInfo}
            className="hover:underline cursor-pointer space-x-1 text-newGreenBlue justify-center items-center flex flex-row text-sm"
          >
            <span>View on explorer</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
              />
            </svg>
          </a>
        </>
      ) : (
        <>
          <div className="w-full flex flex-col space-x-1 justify-center items-center font-bold text-center text-lg font-semibold">
            <svg
              className="w-12 h-12 text-red-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 21"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 3.464V1.1m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175C17 15.4 17 16 16.462 16H3.538C3 16 3 15.4 3 14.807c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 10 3.464ZM4 3 3 2M2 7H1m15-4 1-1m1 5h1M6.54 16a3.48 3.48 0 0 0 6.92 0H6.54Z"
              />
            </svg>

            <span className="font-bold pt-1">{messageTopic}</span>
          </div>

          <div className="text-black justify-center text-center text-sm">
            {success == "404" || success == "412" ? (
              <div className="text-white text-base flex flex-col justify-center items-center">
                <span>{moreInfo}</span>

                {success == "404" ? (
                  <div
                    onClick={switchNetwork}
                    className="bg-newGreenBlue cursor-pointer rounded-lg mt-3 px-3 py-2"
                  >
                    Change Network
                  </div>
                ) : (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={"https://metamask.io/download/"}
                    className="bg-newGreenBlue cursor-pointer rounded-lg mt-3 px-3 py-2"
                  >
                    Install Metamask
                  </a>
                )}

                {success !== "404" &&
                  success !== "412" &&
                  "Something went wrong"}
              </div>
            ) : (
              <span>{moreInfo}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
