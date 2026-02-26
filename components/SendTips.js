import { useEffect, useState, useContext } from "react";
import { UserContext } from "../lib/userContext";
import Image from "next/image";
import ETHSVG from "@/assets/eth";
import SOLSVG from "@/assets/sol";

import ErcTwentyToken from "@/lib/static/ErcTwentyToken.json";
import { ethers } from "ethers";
import ConnectionData from "@/lib/connectionData";
import PriceFeedStation from "@/lib/priceFeedStation";
import Spinner from "./spinner";
import SAITAMALOGO from "@/assets/saitama";
import DappLibrary from "@/lib/dappLibrary";

const {
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
} = require("@solana/web3.js");
const { Buffer } = require("buffer");

function formatNumber(number) {
  if (Math.floor(number) === number) {
    return number.toString();
  } else {
    return number.toFixed(5).replace(/(\.\d*?[1-9])0+$|\.$/, "$1");
  }
}

export default function SendTips({
  setOpenTipJar,
  recipient,
  handleSendStreamChat,
}) {
  const { sendNotification } = DappLibrary();
  const destinationAddress = "0x9cdF5cba9D49289b78Cce868697a5bac558d4072";
  const { userData, darkMode } = useContext(UserContext);

  const {
    address: detectedAddress,
    connectToWallet,
    provider,
  } = ConnectionData();
  const { getUsdPrice } = PriceFeedStation();
  const [activateSpinner, setActivateSpinner] = useState(false);
  const ercABI = ErcTwentyToken.abi;
  const [modalVisible, setModalVisible] = useState(false);
  const [currency, setCurrency] = useState("eth");
  const [usdValue, setUsdValue] = useState("1");
  const [prices, setPrices] = useState(null);
  const [coinAmount, setCoinAmount] = useState(null);
  const [weiValue, setWeiValue] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [err, setErr] = useState(null);
  const [closeEffect, setCloseEffect] = useState(false);

  const toggleCurrency = (coin) => {
    setCloseEffect(true);
    setErr("");
    setTipMessage("");
    setCurrency(coin);
    if (usdValue !== "") {
      convertToCoin(usdValue, coin);
    }
  };

  const getPriceData = async () => {
    setCloseEffect(true);

    const res = await getUsdPrice();

    if (res.ethPrice !== null && res.ethPrice !== undefined) {
      setCloseEffect(true);
      setPrices(res);
    }
  };

  const convertToCoin = (usd, coin) => {
    if (usd !== "" && coin !== "" && !isNaN(usd) && prices) {
      let sendAmount = 0;

      if (coin === "luffy") {
        sendAmount = parseFloat(usd) / prices.tokenPrice;
      } else if (coin === "eth") {
        sendAmount = parseFloat(usd) / prices.ethPrice;
      } else if (coin === "sai") {
        sendAmount = parseFloat(usd) / prices.saiPrice;
      } else {
        sendAmount = usd / prices.solPrice;
      }

      const amountInWei =
        coin === "sol"
          ? sendAmount * 1_000_000_000
          : ethers.utils.parseUnits(
              sendAmount.toFixed(coin === "eth" ? 18 : 9).toString(),
              coin === "eth" ? 18 : 9
            );
      setCoinAmount(
        `${formatNumber(sendAmount)} ${coin === "sai" ? "saitama inu" : coin}`
      );
      setWeiValue(amountInWei);
    } else if (isNaN(usd)) {
    } else {
      setCoinAmount("");
    }
  };

  const sendTip = async () => {
    if (weiValue !== "") {
      try {
        if (destinationAddress || currency === "sol") {
          const amt = coinAmount;
          const coin = currency;

          let transactionResponse = null;

          if (currency === "sol") {
            let receiverRawAddress = destSolAddress;

            if (
              receiverRawAddress === null ||
              receiverRawAddress === undefined ||
              receiverRawAddress === ""
            ) {
              const thirdParty = await fetch("../api/jim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: useruuid }),
              });

              if (thirdParty.ok) {
                const twData = await thirdParty.json();
                const { error } = await supabase
                  .from("users")
                  .update({
                    solAddress: twData.address,
                  })
                  .eq("useruuid", twData.useruuid);
                if (error) {
                  console.log("error while adding address1: ", error);
                } else {
                  receiverRawAddress = twData.address;
                }
              }
            }

            if (!receiverRawAddress) {
              return;
            }
            if (!userData.solupdated) {
              const receiverPublicKey = new PublicKey(receiverRawAddress);

              const result = await fetch("../api/jim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: userData.useruuid }),
              });
              if (!result.ok) {
                return;
              }

              const walletData = await result.json();
              const myKey = walletData.key;

              const solConnection = new Connection(
                process.env.NEXT_PUBLIC_SOLANA_URI
              );

              const senderKeypair = Keypair.fromSecretKey(
                Uint8Array.from(Buffer.from(myKey, "base64"))
              );
              const senderPublicKey = senderKeypair.publicKey;

              // Check the sender's balance
              const balance = await solConnection.getBalance(senderPublicKey);
              if (balance < parseInt(weiValue)) {
                throw { message: "insufficient funds" };
              }

              const transaction = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: senderKeypair.publicKey,
                  toPubkey: receiverPublicKey,
                  lamports: parseInt(weiValue),
                })
              );
              transaction.feePayer = senderPublicKey;
              solConnection.getLatestBlockhash().then(({ blockhash }) => {
                transaction.recentBlockhash = blockhash;

                transaction.sign(senderKeypair);

                solConnection
                  .sendRawTransaction(transaction.serialize())
                  .then((signature) => {
                    setTipMessage(
                      `Gifted ${recipient.username} $${amt} in ${coin}`
                    );

                    if (handleSendStreamChat) {
                      handleSendStreamChat(
                        `gifted you $${amt} in ${coin} ${
                          customMessage && customMessage
                        }`
                      );
                      setOpenTipJar(false);
                    }

                    setCoinAmount("");
                    sendNotification(
                      "tip",
                      recipient.id,
                      0,
                      0,
                      `gifted your stream with $${amt} worth of ${coin}`
                    );
                  })
                  .catch((err) => {
                    console.error("Transaction Error:", err);
                  });
              });
            } else {
            }
          } else if (currency === "luffy") {
            const tokenContract = new ethers.Contract(
              "0x54012cDF4119DE84218F7EB90eEB87e25aE6EBd7",
              ercABI,
              provider.getSigner()
            );
            transactionResponse = await tokenContract.transfer(
              destinationAddress,
              weiValue
            );
          } else if (currency === "sai") {
            const tokenContract = new ethers.Contract(
              "0x0000e3705d8735ee724a76f3440c0a7ea721ed00",
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
          // const receipt = await transactionResponse.wait();
          setTipMessage(`Gifted ${recipient.username} $${amt} in ${coin}`);
          if (handleSendStreamChat) {
            handleSendStreamChat(
              `gifted you $${amt} in ${coin} ${customMessage && customMessage}`
            );
            setOpenTipJar(false);
          }
          setCoinAmount("");
          sendNotification(
            "tip",
            userDestinationId,
            0,
            0,
            `gifted your stream $${amt} worth of ${coin}`
          );
        } else {
          setErr(
            `No wallet address found. Ask ${recipient.username} to add one in the settings of their Animebook account`
          );
        }
      } catch (e) {
        console.log(e.message);
        if (
          (e.message && e.message.includes("insufficient funds")) ||
          e.message.includes("ERC20: transfer amount exceeds balance") ||
          e.message.includes("subtraction overflow")
        ) {
          setErr(
            `Insufficient ${currency === "sai" ? "saitama" : currency} balance`
          );
        } else {
          setErr(e.message.slice(0, 25).concat("..."));
        }
      }
    } else {
      setErr("Wait for price to sync");
    }
    setActivateSpinner(false);
  };

  useEffect(() => {
    setModalVisible(true);

    if (!closeEffect) {
      if (!prices) {
        getPriceData();
      }
    }
  }, [detectedAddress, closeEffect, provider, prices]);

  return (
    <div
      id="giftjar-modal"
      className={`relative shadow-2xl flex flex-col items-center justify-center lg:w-2/5 space-y-3 rounded-xl pt-6 pb-7 px-4 lg:px-20 w-9/12`}
    >
      <div className="lg:h-full flex flex-col-reverse justify-center items-center lg:flex-row space-x-2 lg:items-start lg:justify-start">
        <div
          className={`${
            darkMode ? "bg-[#17181C]" : "bg-white"
          } -mt-4 lg:mt-0 h-full flex flex-col pb-2 rounded-xl w-full relative`}
        >
          <span
            className={`lg:bg-[#292C33] ${
              darkMode ? "text-white" : "text-black"
            } text-center lg:text-start lg:text-white p-5 rounded-t-xl w-full space-x-0.5 text-2xl lg:text-3xl font-semibold flex flex-col-reverse lg:flex-row justify-center items-center`}
          >
            <span className="flex flex-col">
              <span className="text-[18px] font-semibold">{`Gift ${recipient.username} san`}</span>

              <span className="pt-0.5 text-sm font-normal leading-tight flex flex-col">
                <span>{`Cheer ${recipient.username} and stand out in the chat`}</span>
              </span>
            </span>
            <span className="flex h-fit w-fit">
              <Image
                src={"/stickers/1.webp"}
                alt="cheer"
                height={90}
                width={90}
                className="relative"
              />
            </span>
          </span>
          <span className="flex flex-col w-full px-8 pb-6">
            <span
              className={`border ${
                darkMode
                  ? "border-[#32353C] bg-[#27292F] text-white"
                  : "border-[#EEEDEF] bg-gray-100 text-black"
              } mt-3 w-full h-fit flex flex-row justify-between items-center rounded-lg`}
            >
              <span className="flex flex-row items-center justify-start">
                <span className="text-xl pl-2 font-semibold">{"$"}</span>
                <input
                  onChange={(e) => {
                    setUsdValue(
                      !isNaN(e.target.value) ? e.target.value : usdValue
                    );
                    convertToCoin(e.target.value, currency);
                  }}
                  value={usdValue}
                  className={`w-full text-normal ${
                    darkMode
                      ? "placeholder:text-white"
                      : "placeholder:text-black"
                  } bg-black h-fit bg-transparent border-none focus:outline-none focus:ring-0`}
                  placeholder="1.00"
                />
              </span>

              {currency === "luffy" ? (
                <span className="space-x-1 w-fit p-2 h-full rounded-r-lg bg-zinc-700 flex flex-row items-center">
                  <span className="w-10">
                    <Image
                      src={"/assets/publicluffy.png"}
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
            <textarea
              maxLength={500}
              placeholder={"Send a message (optional)"}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className={`${
                darkMode
                  ? "text-white bg-[#27292F] placeholder:text-gray-200"
                  : "bg-gray-100 placeholder:text-black text-black"
              } mt-1.5 placeholder:text-sm px-4 h-15 rounded-lg resize-none w-full px-2 border-none focus:outline-none focus:border-[#27292F] focus:ring-0`}
            />
            <span className={`${darkMode ? "text-white" : "text-black"}`}>
              {coinAmount}
            </span>
            <span className="mx-auto pb-3 flex flex-col justify-center w-fit"></span>
            {activateSpinner ? (
              <span className="mx-auto">
                <Spinner spinnerSize={"medium"} />
              </span>
            ) : (
              <span
                onClick={() => {
                  if (detectedAddress || currency === "sol") {
                    setErr("");
                    setActivateSpinner(true);
                    sendTip();
                  } else {
                    connectToWallet();
                  }
                }}
                className="text-lg w-full text-white text-center cursor-pointer font-bold bg-[#EB4463] py-2 px-4 rounded-lg"
              >
                {detectedAddress || currency === "sol" ? "SEND TIP" : "CONNECT"}
              </span>
            )}
            <span className="pt-2 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-1">
              <span
                onClick={() => {
                  toggleCurrency("luffy");
                }}
              >
                <Image
                  src={"/assets/publicluffy.png"}
                  alt="luffy logo"
                  height={25}
                  width={25}
                  className="rounded-full"
                />
              </span>

              <span
                onClick={() => {
                  toggleCurrency("eth");
                }}
              >
                <ETHSVG size={"24"} />
              </span>

              <span
                onClick={() => {
                  toggleCurrency("sol");
                }}
              >
                <SOLSVG size={"24"} />
              </span>
              <span
                onClick={() => {
                  toggleCurrency("sai");
                }}
              >
                <span className="">
                  <SAITAMALOGO w={25} h={25} />
                </span>
              </span>
            </span>
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
          </span>
        </div>
        <div
          onClick={() => {
            setOpenTipJar(false);
          }}
          className={`flex-shrink-0 cursor-pointer -mt-16 mb-8 lg:mt-0 ${
            darkMode ? "bg-zinc-800 text-white" : "bg-white text-black"
          } lg:mb-0 font-semibo ld text-xl text-center items-center h-8 w-8 rounded-full`}
        >
          x
        </div>
      </div>
    </div>
  );
}
