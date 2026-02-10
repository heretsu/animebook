import { useEffect, useState, useContext } from "react";
import Spinner from "./spinner";
import { useRouter } from "next/router";
import Image from "next/image";
import ConnectionData from "@/lib/connectionData";
import { UserContext } from "@/lib/userContext";
import ETHSVG from "@/assets/eth";
import SOLSVG from "@/assets/sol";
import ErcTwentyToken from "../lib/static/ErcTwentyToken.json";
import PriceFeedStation from "@/lib/priceFeedStation";
import { ethers } from "ethers";
import DappLibrary from "@/lib/dappLibrary";
import supabase from "@/hooks/authenticateUser";
import DbUsers from "@/hooks/dbUsers";
import SAITAMALOGO from "@/assets/saitama";
import newLogo from "@/assets/newLogo.png";
import tipImage from "@/assets/tipImage.png";

const {
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
  clusterApiUrl,
} = require("@solana/web3.js");
const { Buffer } = require("buffer");

export default function PopupModal({
  address,
  success,
  messageTopic,
  moreInfo,
  username,
  useruuid,
  destSolAddress,
  destinationAddress,
  userDestinationId,
  avatar,
  cover,
  previewType,
  mangaPrice,
  mangaImage,
  mangaName,
  mangaId,
  post,
  subprice,
  setSubscribedUser,
  setOpenSub,
  postid,
  setOpenPostOptions,
  reportType,
  isCommunity,
  fetchCommunityDetails,
}) {
  const { sendNotification } = DappLibrary();
  const ercABI = ErcTwentyToken.abi;
  const { getUsdPrice } = PriceFeedStation();
  const [activateSpinner, setActivateSpinner] = useState(false);
  const {
    userData,
    setAddress,
    deletePost,
    setDeletePost,
    userNumId,
    setPostValues,
    setOpenPurchaseModal,
    darkMode,
  } = useContext(UserContext);
  const {
    address: detectedAddress,
    connectToWallet,
    provider,
  } = ConnectionData();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [currency, setCurrency] = useState("eth");
  const [usdValue, setUsdValue] = useState("");
  const [prices, setPrices] = useState(null);
  const [coinAmount, setCoinAmount] = useState(null);
  const [weiValue, setWeiValue] = useState("");
  const [tipMessage, setTipMessage] = useState("");
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
    if (prices) {
      if (mangaPrice) {
        convertPriceToCoin(coin, prices);
      }
      if (subprice) {
        convertSubPriceToCoin(coin, prices);
      }
    }
  };

  function formatNumber(number) {
    if (Math.floor(number) === number) {
      return number.toString();
    } else {
      return number.toFixed(5).replace(/(\.\d*?[1-9])0+$|\.$/, "$1");
    }
  }

  const convertToCoin = (usd, coin) => {
    if (detectedAddress) {
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
        console.log(amountInWei);
      } else if (isNaN(usd)) {
      } else {
        setCoinAmount("");
      }
    }
  };

  const convertPriceToCoin = (coin, prs) => {
    if (detectedAddress) {
      if (success == "6" && usdValue === "") {
        return;
      }
      let sendAmount = 0;
      if (coin === "luffy") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : mangaPrice) / prs.tokenPrice;
      } else if (coin === "eth") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : mangaPrice) / prs.ethPrice;
      } else if (coin === "sai") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : mangaPrice) / prs.saiPrice;
      } else {
        sendAmount = (success == "6" ? usdValue : mangaPrice) / prs.solPrice;
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
    }
  };

  const convertSubPriceToCoin = (coin, prs) => {
    if (detectedAddress) {
      if (success == "6" && usdValue === "") {
        return;
      }
      let sendAmount = 0;
      if (coin === "luffy") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : subprice) / prs.tokenPrice;
      } else if (coin === "eth") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : subprice) / prs.ethPrice;
      } else if (coin === "sai") {
        sendAmount =
          parseFloat(success == "6" ? usdValue : subprice) / prs.saiPrice;
      } else if (coin === "sol") {
        sendAmount = (success == "6" ? usdValue : subprice) / prs.solPrice;
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
      console.log(amountInWei);
      setWeiValue(amountInWei);
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
                    console.log("Transaction Signature:", signature);
                    setTipMessage(`Tipped ${username} $${amt} in ${coin}`);
                    setCoinAmount("");
                    sendNotification(
                      "tip",
                      userDestinationId,
                      0,
                      0,
                      `tipped you ${amt} ${coin}`
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
            console.log(weiValue);
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
        } else {
          setErr(
            `No wallet address found. Ask ${username} to add one in the settings of their Animebook account`
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

  const purchaseManga = async () => {
    setActivateSpinner(true);
    if (!weiValue) {
      setActivateSpinner(false);
      setErr("Wait for prices to sync");
      return;
    }
    try {
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

        const receiverPublicKey = new PublicKey(receiverRawAddress);

        const result = await fetch("../api/jim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userData.useruuid }),
        });
        if (!result.ok) {
          throw "An error occured. Try again";
          return;
        }
        console.log(weiValue);

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
              supabase
                .from("purchases")
                .insert({
                  mangaid: mangaId,
                  userid: userNumId,
                })
                .then(() => {
                  setOpenPurchaseModal(false);
                });
            })
            .catch((err) => {
              console.error("Transaction Error:", err);
            });
        });
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
      } else {
        transactionResponse = await provider.getSigner().sendTransaction({
          to: destinationAddress,
          value: weiValue,
        });
      }
      if (currency !== "sol") {
        const receipt = await transactionResponse.wait();
        console.log(receipt);

        if (receipt) {
          await supabase.from("purchases").insert({
            mangaid: mangaId,
            userid: userNumId,
          });
          setOpenPurchaseModal(false);
        }
      }
    } catch (e) {
      console.log(e.message);
      if (
        (e.message && e.message.includes("insufficient funds")) ||
        e.message.includes("ERC20: transfer amount exceeds balance") ||
        e.message.includes("subtraction overflow")
      ) {
        setErr(`Insufficient ${currency} balance`);
      } else {
        setErr(e.message.slice(0, 25).concat("..."));
      }
    }
    setActivateSpinner(false);
  };

  const subscribeToUser = async () => {
    setActivateSpinner(true);
    if (!weiValue) {
      setActivateSpinner(false);
      setErr("Wait for prices to sync");
      return;
    }
    try {
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

        const receiverPublicKey = new PublicKey(receiverRawAddress);

        const result = await fetch("../api/jim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userData.useruuid }),
        });
        if (!result.ok) {
          throw "An error occured. Try again";
          return;
        }
        console.log(weiValue);

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
              supabase
                .from("subscriptions")
                .insert({
                  subscriber: userNumId,
                  creator: userBasicInfo.id,
                })
                .then((res) => {
                  setSubscribedUser(true);
                  setOpenSub(false);
                });
            })
            .catch((err) => {
              console.error("Transaction Error:", err);
            });
        });
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
      } else {
        transactionResponse = await provider.getSigner().sendTransaction({
          to: destinationAddress,
          value: weiValue,
        });
      }
      if (currency !== "sol") {
        const receipt = await transactionResponse.wait();
        console.log(receipt);

        if (receipt) {
          const { error } = await supabase.from("subscriptions").insert({
            subscriber: userNumId,
            creator: userBasicInfo.id,
          });
          if (!error) {
            setSubscribedUser(true);
            setOpenSub(false);
          }
        }
      }
    } catch (e) {
      console.log(e.message);
      if (
        (e.message && e.message.includes("insufficient funds")) ||
        e.message.includes("ERC20: transfer amount exceeds balance") ||
        e.message.includes("subtraction overflow")
      ) {
        setErr(`Insufficient ${currency} balance`);
      } else {
        setErr(e.message.slice(0, 25).concat("..."));
      }
    }
    setActivateSpinner(false);
  };

  const [reportSent, setReportSent] = useState(true);
  const sendReport = async () => {
    const { error } = await supabase.from("reports").insert({
      useruuid: useruuid,
      postid: postid,
    });

    if (!error) {
      setReportSent(true);
      setOpenPostOptions(false);
    }
  };

  const deletePostViaId = async (isCommunity) => {
    if (deletePost.media !== null && deletePost.media !== undefined) {
      supabase
        .from("deleted_media")
        .insert({
          url: deletePost.media,
          postid: deletePost.postid,
        })
        .then((response) => {
          if (response && response.status === 201) {
            supabase
              .from(isCommunity === true ? "community_posts" : "posts")
              .delete()
              .eq("id", deletePost.postid)
              .eq("userid", userNumId)
              .then(() => {
                if (router.pathname === "/profile/[user]") {
                  DbUsers()
                    .fetchAllSingleUserPosts(userNumId)
                    .then(({ data }) => {
                      if (data) {
                        setPostValues(data);
                      }
                    });
                } else {
                  if (isCommunity) {
                    fetchCommunityDetails();
                  } else {
                    DbUsers()
                      .fetchAllPosts()
                      .then(({ data }) => {
                        if (data) {
                          setPostValues(data);
                        }
                      });
                  }
                }
              })
              .catch((e) => {
                console.log("error in post deletion for media: ", e);
              });
          }
        })
        .catch((e) => {
          console.log("error in outer deletion media: ", e);
        });
    } else {
      supabase
        .from(isCommunity === true ? "community_posts" : "posts")
        .delete()
        .eq("id", deletePost.postid)
        .eq("userid", userNumId)
        .then(() => {
          if (router.pathname === "/profile/[user]") {
            DbUsers()
              .fetchAllSingleUserPosts(userNumId)
              .then(({ data }) => {
                if (data) {
                  setPostValues(data);
                }
              });
          } else {
            if (isCommunity) {
              fetchCommunityDetails();
            } else {
              DbUsers()
                .fetchAllPosts()
                .then(({ data }) => {
                  if (data) {
                    setPostValues(data);
                  }
                });
            }
          }
        })
        .catch((e) => {
          console.log("error: ", e);
        });
    }
    setDeletePost(null);
  };

  const getPriceData = async () => {
    setCloseEffect(true);

    const res = await getUsdPrice();

    if (res.ethPrice !== null && res.ethPrice !== undefined) {
      setCloseEffect(true);
      setPrices(res);
      if (mangaPrice) {
        convertPriceToCoin(currency ? currency : "eth", res);
      }
      if (subprice) {
        console.log("yoo", closeEffect);
        convertSubPriceToCoin(currency ? currency : "eth", res);
      }
    }
  };

  const [imgSrc, setImgSrc] = useState(avatar);

  useEffect(() => {
    setModalVisible(true);

    if ((mangaPrice || subprice || success == "6") && !closeEffect) {
      // connectToWallet();
      // if (detectedAddress) {
        if (!prices) {
          getPriceData();
        }
      // }
    }
  }, [detectedAddress, closeEffect, provider, prices, subprice, currency]);
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
          ? `relative shadow-2xl justify-center rounded-xl pb-7 w-11/12 lg:w-2/5 flex flex-col items-center`
          : success == "11"
          ? `${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            } flex justify-center`
          : `${
              darkMode && success == "10"
                ? "bg-[#1E1F24] text-white"
                : "bg-white text-black"
            } space-y-3 rounded-xl pt-6 pb-7 px-4 lg:px-20 w-9/12 lg:w-2/5 flex flex-col items-center`
      }
    >
      {success == "11" ? (
        <div className="w-[90vw] absolute top-10 flex justify-center items-center m-auto">
          {previewType === "cover" ? (
            <Image src={cover} alt="user profile" height={2000} width={2000} />
          ) : (
            <Image
              src={imgSrc}
              alt="user profile"
              height={400}
              width={400}
              className="rounded-full"
              onError={() =>
                setImgSrc(
                  "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                )
              }
            />
          )}
        </div>
      ) : success == "10" ? (
        <div className="mb-8 text-sm space-y-2 rounded-lg relative flex flex-col w-full justify-start items-start">
          <span
            onClick={() => {
              sendReport();
            }}
            className="px-1.5 py-1 w-full bg-transparent rounded-lg flex flex-row justify-between items-center"
          >
            <span className="space-x-1 flex flex-row justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="16"
                viewBox="0 0 14 16"
              >
                <path
                  d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                  transform="translate(-15.124 -7.12)"
                  fill="#5f6877"
                />
              </svg>
              <span
                className={`${
                  darkMode ? "text-white" : "text-black"
                } cursor-pointer text-sm`}
              >{`Report spam or other violation from ${username}'s ${
                reportType === "comment"
                  ? "comment"
                  : reportType === "user"
                  ? "message"
                  : "post"
              }`}</span>
            </span>
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 1024 1024"
              fill={darkMode ? "white" : "black"}
              className="icon rotate-180"
              stroke={darkMode ? "white" : "black"}
              strokeWidth={10}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z"
                fill={darkMode ? "white" : "black"}
              />
            </svg>
          </span>
        </div>
      ) : success == "9" ? (
        <div className="flex flex-col py-2 w-full justify-center relative">
          <span className="w-full space-x-0.5 text-lg font-semibold text-gray-500 flex flex-row justify-center items-center">
            <span>{`Subscribing to ${username} mangas`}</span>
          </span>

          <span className="mx-auto py-3">
            <Image
              src={imgSrc}
              alt="user profile"
              height={80}
              width={80}
              className="rounded-full"
              onError={() =>
                setImgSrc(
                  "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                )
              }
            />
          </span>

          <span className="w-fit mx-auto flex flex-row space-x-1">
            <span>{"Subscription: "}</span>
            <span className="text-green-500 font-medium">{`$${subprice}`}</span>
          </span>
          <span className={`${!coinAmount && "italic"} text-slate-700 mx-auto`}>
            {coinAmount ? coinAmount : "fetching price..."}
          </span>

          <span className="py-5 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-4">
            <span
              onClick={() => {
                toggleCurrency("luffy");
              }}
              className={`${
                currency === "luffy"
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <Image
                src={'/assets/publicluffy.png'}
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
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <ETHSVG size={"25"} />
              <span className="font-medium text-sm">ETH</span>
            </span>

            <span
              onClick={() => {
                toggleCurrency("sol");
              }}
              className={`${
                currency === "sol"
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <SOLSVG size={"25"} />
              <span className="font-medium text-sm">SOL</span>
            </span>
          </span>
          {activateSpinner ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span
              onClick={() => {
                subscribeToUser();
              }}
              className="text-lg w-full text-white text-center cursor-pointer font-bold bg-[#EB4463] py-2 px-4 rounded-xl"
            >
              Subscribe
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
      ) : success == "8" ? (
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
          <span className={`${!coinAmount && "italic"} text-slate-700 mx-auto`}>
            {coinAmount ? coinAmount : "fetching price..."}
          </span>
          <span className="py-5 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-4">
            <span
              onClick={() => {
                toggleCurrency("luffy");
              }}
              className={`${
                currency === "luffy"
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <Image
                src={'/assets/publicluffy.png'}
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
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <ETHSVG size={"25"} />
              <span className="font-medium text-sm">ETH</span>
            </span>
            <span
              onClick={() => {
                toggleCurrency("sol");
              }}
              className={`${
                currency === "sol"
                  ? "text-white bg-[#EB4463]"
                  : "text-black bg-white"
              } space-x-1 cursor-pointer rounded border shadow-xl p-1 flex flex-row items-center`}
            >
              <SOLSVG size={"25"} />
              <span className="font-medium text-sm">SOL</span>
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
              className="text-lg w-full text-white text-center cursor-pointer font-bold bg-[#EB4463] py-2 px-4 rounded-xl"
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
                  deletePostViaId(isCommunity);
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
                {post === true ? (
                  <span>{`Send this post a tip!`}</span>
                ) : (
                  <span>{`Send ${username} san a tip!`}</span>
                )}
                <span className="pt-2 text-sm font-normal leading-tight flex flex-col">
                  <span>{"Love what you see? Show your support!"}</span>
                  <span>
                    {
                      "Tipping is an easy way to thank your favorite creators for their awesome content"
                    }
                  </span>
                </span>
              </span>
              <span className="flex h-fit w-fit">
                <Image
                  src={tipImage}
                  alt="user profile"
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
                      if (detectedAddress) {
                        convertToCoin(e.target.value, currency);
                      }
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
                        src={'/assets/publicluffy.png'}
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
                maxLength={80}
                placeholder={"Add a message to your tip..."}
                className={`${
                  darkMode
                    ? "text-white bg-[#27292F] placeholder:text-gray-200"
                    : "bg-gray-100 placeholder:text-black"
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
                  {detectedAddress || currency === "sol"
                    ? "SEND TIP"
                    : "CONNECT"}
                </span>
              )}
              <span className="pt-2 flex flex-row justify-center w-fit mx-auto rounded-lg space-x-1">
                <span
                  onClick={() => {
                    toggleCurrency("luffy");
                  }}
                >
                  <Image
                    src={'/assets/publicluffy.png'}
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
            className={`-mt-16 mb-8 lg:mt-0 ${
              darkMode ? "bg-zinc-800 text-white" : "bg-white text-black"
            } lg:mb-0 font-semibold text-xl text-center items-center h-8 w-8 rounded-full pointer-events-none`}
          >
            x
          </div>
        </div>
      ) : success == "5" ? (
        <>
          <div className="flex flex-col py-2">
            <span className="font-semibold text-lg text-center">
              {"Welcome back!"}
            </span>
            <span className="cursor-pointer flex flex-row justify-start items-center space-x-2">
              <Image
                src={imgSrc}
                alt="user profile"
                height={30}
                width={30}
                className="rounded-full"
                onError={() =>
                  setImgSrc(
                    "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                  )
                }
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
                className="w-full text-white text-center cursor-pointer font-bold bg-[#EB4463] py-2 px-4 rounded-xl"
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
          <span className="mx-auto relative h-10 w-10 flex rounded-full">
            <Image
              src={newLogo}
              alt="logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          </span>
          <span className="font-semibold text-lg text-center">
            {"Konnichiwa! Otaku-san"}
          </span>
          <span className="font-medium text-center h-fit text-slate-500">
            {"こんにちわ！オタクさん"}
          </span>
          <span className="w-full py-4 text-gray-800 text-center">
            {"Welcome to AnimeBook! Proceed to sign in"}
          </span>
          <span
            onClick={() => {
              router.push("/signin");
            }}
            className="flex flex-row justify-center items-center space-x-2 cursor-pointer font-bold bg-[#EB4463] py-3 px-4 rounded-xl text-white text-center"
          >
            <span>{"Sign Up / Sign In"}</span>
            {/* <svg
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
            </svg> */}
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
