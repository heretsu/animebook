import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import CloudSvg from "./cloudSvg";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Spinner from "./spinner";
import ConnectionData from "@/lib/connectionData";
import { ethers } from "ethers";
import { formatUnits } from "ethers";
import ErcTwentyToken from "@/lib/static/ErcTwentyToken.json";

const {
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
  clusterApiUrl,
} = require("@solana/web3.js");

export const BinSvg = ({ pixels }) => {
  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="red"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
      />
    </svg>
  );
};
const EditProfileContainer = () => {

  const ercABI = ErcTwentyToken.abi;
  const { connectToWallet } = ConnectionData();
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, setPostJustMade, address, userData, darkMode } =
    useContext(UserContext);
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [solBalance, setSolBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [luffyBalance, setLuffyBalance] = useState(null);
  const [display, setDisplay] = useState(false);
  const [sl, setSl] = useState("");

  const mediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(e.target.files);
      setSelectedMedia(URL.createObjectURL(file));
    }
  };

  const avatarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(e.target.files);
      setSelectedAvatar(URL.createObjectURL(file));
    }
  };

  const uploadToBucket = async (file, storagePath) => {
    const newName = Date.now() + file.name;
    try {
      const result = await supabase.storage
        .from("mediastore")
        .upload(storagePath + newName, file);

      if (result.error) {
        throw result.error;
      }

      return (
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        "/storage/v1/object/public/mediastore/" +
        result.data.path
      ); // Adjust according to the actual result data structure
    } catch (err) {
      setErrorMsg("Failed to upload. Check internet connection and try again");
      console.error(err);
      throw err;
    }
  };

  const updateAddress = async () => {
    const {addr} = await connectToWallet();
    setNewAddress(addr);
  };

  const updateProfile = async () => {
    setChangesLoading(true);
    setErrorMsg("");
    let coverUrl = null;
    let avatarUrl = null;

    if (coverFile !== null) {
      for (const file of coverFile) {
        coverUrl = await uploadToBucket(file, "cover/");
      }
    }

    if (avatarFile !== null) {
      for (const file of avatarFile) {
        avatarUrl = await uploadToBucket(file, "avatar/");
      }
    }

    if (
      coverUrl === null &&
      avatarUrl === null &&
      bio === "" &&
      newAddress === null
    ) {
      setErrorMsg("You made no changes");
      setChangesLoading(false);
      return;
    }

    // Update the user profile
    const { error } = await supabase
      .from("users")
      .update({
        cover: coverUrl ? coverUrl : userData.cover,
        avatar: avatarUrl ? avatarUrl : userData.avatar,
        bio: bio !== "" ? bio : userData.bio,
        address: newAddress ? newAddress : userData.address,
      })
      .eq("useruuid", userData.useruuid);

    if (error) {
      setErrorMsg("Something went wrong");
      window.location.reload();
      return;
    }

    fullPageReload(`/profile/${userData.username}`);
  };

  const getBalances = async () => {
    if (!userData.address) {
      return;
    }
    try {
      const solConnection = new Connection(process.env.NEXT_PUBLIC_SOLANA_URI);
      const publicKey = new PublicKey(userData.solAddress);
      const balance = await solConnection.getBalance(publicKey);

      const provider = new ethers.providers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/fb06beef2e9f4ca39af4ec33291d626f`
      );
      const ethBal = await provider.getBalance(userData.address);
      const formattedBal = parseFloat(
        parseFloat(formatUnits(ethBal, 18)).toFixed(4)
      );

      const tokenContract = new ethers.Contract(
        "0x54012cDF4119DE84218F7EB90eEB87e25aE6EBd7",
        ercABI,
        provider
      );

      const luffyBal = await tokenContract.balanceOf(userData.address);
      const formattedLuffyBal = parseFloat(
        parseFloat(formatUnits(luffyBal, 9)).toFixed(4)
      );
      const luffyReadableBalance = numberFormatter(formattedLuffyBal);
      setLuffyBalance(luffyReadableBalance ? luffyReadableBalance : 0);
      setEthBalance(formattedBal);
      setSolBalance(balance);
    } catch (error) {
      console.log(error);
      setEthBalance(0);
      setSolBalance(0);
    }
  };

  const getSl = async () => {
    const result = await fetch("../api/jim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: userData.useruuid }),
    });

    if (!result.ok) {
      return;
    }
    const walletData = await result.json();
    const wd = JSON.stringify(base64ToArray(walletData.key));
    setSl(wd);
  };

  function base64ToArray(base64Key) {
    const binaryString = atob(base64Key);

    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return Array.from(byteArray);
  }

  function numberFormatter(number) {
    if (number >= 1_000_000_000_000) {
      return `${Math.floor((number / 1_000_000_000_000) * 10) / 10}T`;
    } else if (number >= 1_000_000_000) {
      return `${Math.floor((number / 1_000_000_000) * 10) / 10}B`;
    } else if (number >= 1_000_000) {
      return `${Math.floor((number / 1_000_000) * 10) / 10}M`;
    } else if (number >= 1_000) {
      return `${Math.floor((number / 1_000) * 10) / 10}K`;
    } else {
      return number.toString();
    }
  }
  const [conAddress, setConAddress] = useState(null);

  useEffect(() => {
    // connectToWallet().then((addr) => {
    //   setConAddress(addr);
    // });
    if (!solBalance) {
      getBalances();
    }

    // Media blob revoked after component is unmounted. Doing this to prevent memory leaks
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia, solBalance]);
  return (
    <>
      {userData !== null && userData !== undefined && (
        <div className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-gray-600'} flex flex-col space-y-4 rounded-xl shadow-lg w-full justify-center items-center`}>
          {selectedMedia ? (
            <label
              htmlFor="input-file"
              className="text-black w-full flex justify-center relative h-[150px] sm:h-[200px]"
            >
              <Image
                src={selectedMedia}
                alt="Invalid post media. Click to change"
                fill={true}
                className="rounded-t-xl object-cover"
              />
              <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                id="input-file"
              />
            </label>
          ) : userData.cover !== null && userData.cover !== undefined ? (
            <label
              onClick={mediaChange}
              htmlFor="input-file"
              className="text-black w-full flex justify-center relative h-[150px] sm:h-[200px]"
            >
              <Image
                src={userData.cover}
                alt="User cover photo"
                fill={true}
                className="rounded-t-xl object-cover"
              />
              <span className="rounded-t-xl cursor-pointer bg-black bg-opacity-50 text-white absolute inset-0 flex flex-col justify-center items-center ">
                <CloudSvg pixels={"80px"} />
                <span className="font-semibold text-sm">
                  Change cover photo
                </span>
              </span>
              <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                id="input-file"
              />
            </label>
          ) : (
            <label
              htmlFor="input-file"
              className="text-white h-[150px] cursor-pointer w-full bg-slate-900 flex flex-col justify-center items-center rounded-t-xl"
            >
              <CloudSvg pixels={"80px"} />
              <span className="font-semibold text-sm">Change cover photo</span>
              <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                id="input-file"
              />
            </label>
          )}
          <span className="flex flex-col px-4 w-full space-y-2">
            <span className="text-start font-medium w-full flex-col items-start">
              <span>Avatar</span>
              {selectedAvatar ? (
                <span className="flex flex-row items-center space-x-4">
                  <label
                    htmlFor="input-avatar-file"
                    className="text-black h-[35px] w-[35px] relative flex cursor-pointer"
                  >
                    <Image
                      src={selectedAvatar}
                      alt="User new avatar"
                      height={50}
                      width={50}
                      className="rounded-full"
                    />
                    <input
                      onChange={avatarChange}
                      className="hidden"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                      id="input-avatar-file"
                    />
                  </label>
                  <span
                    onClick={() => {
                      setSelectedAvatar(null);
                    }}
                    className="cursor-pointer w-fit"
                  >
                    <BinSvg pixels={"20px"} />
                  </span>
                </span>
              ) : (
                <label
                  htmlFor="input-avatar-file"
                  className="flex flex-row items-center space-x-1"
                >
                  <div className="relative h-[35px] w-[35px] cursor-pointer">
                    <Image
                      src={userData.avatar}
                      alt="user avatar"
                      height={35}
                      width={35}
                      className="rounded-full"
                    />
                    <span className="rounded-full absolute inset-0 flex bg-black bg-opacity-60 justify-center items-center">
                      <CloudSvg pixels={"20px"} />
                    </span>
                    <input
                      onChange={avatarChange}
                      className="hidden"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                      id="input-avatar-file"
                    />
                  </div>
                  <span className="text-xs">Click to edit avatar</span>
                </label>
              )}
            </span>

            <span className="space-y-1">
              <span className="text-start font-medium w-full">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                maxLength={160}
                placeholder={userData.bio}
                className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} px-4 h-15 rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
              />
            </span>

            <span className="text-start text-sm font-medium w-full space-x-1">
              <span>Payout wallet</span>
              <span className="text-xs">{"(ERC-20)"}</span>
              <span className="text-xs ml-2 bg-pastelGreen text-white py-0.5 px-1 rounded">
                {"Balance: "} {luffyBalance ? luffyBalance : 0} Luffy{" "}
                {ethBalance ? ethBalance : 0} Eth
              </span>
              <input
                // value=""
                disabled
                value={newAddress ? newAddress : userData.address}
                className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} mt-1 px-4 text-sm text-center cursor-not-allowed rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
              />
              <span className="text-[0.75rem]">
                {
                  "For safety: If you wish to change your payout wallet, reconnect to a preferred address and click on: "
                }
              </span>
              <div
                onClick={() => {
                  // open()
                  // updateAddress();
                }}
                className="w-full pb-2 text-center underline text-orange-500 cursor-pointer"
              >
                {address ? "change wallet" : "connect"}
              </div>
              <div className="font-semibold">
                <span className="text-green-700 text-xs pr-1">
                  {"Currently connected:"}
                </span>
                {address || newAddress ? (
                  <span className="text-sm">
                    {conAddress &&
                      conAddress
                        .slice(0, 7)
                        .concat("...")
                        .concat(conAddress.slice(37, 42))}
                  </span>
                ) : (
                  <span className="text-sm font-normal">
                    {
                      "No address connected yet. Connect your address so you can earn from Animebook"
                    }
                  </span>
                )}
              </div>
            </span>

            <span className="flex flex-col text-start text-sm font-medium w-full space-x-1">
              <span className="flex flex-row items-center">
                <span>Payout wallet 2</span>
                <span className="text-xs">{"(Solana)"}</span>
                <span className="text-xs ml-2 bg-pastelGreen text-white py-0.5 px-1 rounded h-fit">
                  {"Balance: "} {solBalance}
                </span>

                <span
                  onClick={() => {
                    setDisplay(true);
                  }}
                  className="text-xs cursor-pointer flex space-x-1 flex-row justify-center items-center w-fit ml-auto rounded-lg border border-slate-300 bg-slate-100 text-black py-0.5 px-1.5 rounded"
                >
                  <svg
                    fill="#000000"
                    width="20px"
                    height="20px"
                    viewBox="0 0 256 256"
                    id="Flat"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M227.42383,164.8125a3.9998,3.9998,0,1,1-6.92774,4l-20.55542-35.602a120.13387,120.13387,0,0,1-41.15942,19.102l6.4541,36.59961a4.00051,4.00051,0,0,1-3.24512,4.63379,4.06136,4.06136,0,0,1-.69921.06152,4.00171,4.00171,0,0,1-3.93457-3.30664l-6.4043-36.31738a131.58367,131.58367,0,0,1-45.99341-.01709l-6.40405,36.32178a4.00265,4.00265,0,0,1-3.93457,3.30664,4.06041,4.06041,0,0,1-.69922-.06153,4,4,0,0,1-3.24512-4.63379l6.45484-36.60986a120.1421,120.1421,0,0,1-41.11426-19.10937L35.35254,168.9707a3.9998,3.9998,0,1,1-6.92774-4l21.18067-36.68554A142.43333,142.43333,0,0,1,28.8877,107.38867a3.99986,3.99986,0,1,1,6.22265-5.02734,132.78926,132.78926,0,0,0,22.266,21.856c.03113.02636.068.04687.09815.07373C74.60583,137.4248,97.77954,148,128,148c30.19849,0,53.36011-10.56055,70.48779-23.68115.0149-.01319.03308-.02344.0481-.03614a132.77462,132.77462,0,0,0,22.35278-21.92138,3.99986,3.99986,0,1,1,6.22266,5.02734,142.41445,142.41445,0,0,1-20.75806,20.92969Z" />
                  </svg>
                  <span>{"Export Sol private key"}</span>
                </span>
              </span>

              <input
                // value=""
                disabled
                value={userData.solAddress}
                className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} mt-1 px-4 text-sm text-center cursor-not-allowed rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}              />
            </span>

            <span className="pt-2 pb-3 flex flex-col">
              {changesLoading ? (
                <span className="mx-auto">
                  <Spinner spinnerSize={"medium"} />
                </span>
              ) : (
                <span
                  onClick={() => {
                    updateProfile();
                  }}
                  className={`${darkMode ? 'border-none' : 'border'} w-fit mx-auto hover:shadow cursor-pointer px-7 py-2 bg-pastelGreen text-center text-white font-bold rounded-lg`}
                >
                  Save changes
                </span>
              )}
              {errorMsg !== "" && (
                <span className="text-sm w-full flex flex-row justify-center items-center">
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
                  <p className="text-red-500">{errorMsg}</p>
                </span>
              )}
            </span>
          </span>
          {display && (
            <>
              <div
                id="tip-modal"
                className="w-[400px] bg-white p-4 flex flex-col justify-center items-center rounded-lg"
              >
                <span className="font-bold">Exporting Private Key</span>
                <p className="pb-4 text-xs font-medium text-gray-700">
                  Keep your private key secure. Do not share it with anyone.
                  Exposing your private key may result in the loss of your
                  assets
                </p>
                <span className="flex flex-row justify-center items-center text-sm text-gray-700 font-medium px-2 py-1 rounded-lg border border-slate-300 bg-slate-100">
                  <svg
                    fill="#000000"
                    width="20px"
                    height="20px"
                    viewBox="0 0 256 256"
                    id="Flat"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M227.42383,164.8125a3.9998,3.9998,0,1,1-6.92774,4l-20.55542-35.602a120.13387,120.13387,0,0,1-41.15942,19.102l6.4541,36.59961a4.00051,4.00051,0,0,1-3.24512,4.63379,4.06136,4.06136,0,0,1-.69921.06152,4.00171,4.00171,0,0,1-3.93457-3.30664l-6.4043-36.31738a131.58367,131.58367,0,0,1-45.99341-.01709l-6.40405,36.32178a4.00265,4.00265,0,0,1-3.93457,3.30664,4.06041,4.06041,0,0,1-.69922-.06153,4,4,0,0,1-3.24512-4.63379l6.45484-36.60986a120.1421,120.1421,0,0,1-41.11426-19.10937L35.35254,168.9707a3.9998,3.9998,0,1,1-6.92774-4l21.18067-36.68554A142.43333,142.43333,0,0,1,28.8877,107.38867a3.99986,3.99986,0,1,1,6.22265-5.02734,132.78926,132.78926,0,0,0,22.266,21.856c.03113.02636.068.04687.09815.07373C74.60583,137.4248,97.77954,148,128,148c30.19849,0,53.36011-10.56055,70.48779-23.68115.0149-.01319.03308-.02344.0481-.03614a132.77462,132.77462,0,0,0,22.35278-21.92138,3.99986,3.99986,0,1,1,6.22266,5.02734,142.41445,142.41445,0,0,1-20.75806,20.92969Z" />
                  </svg>
                  <span
                    onClick={() => {
                      getSl();
                    }}
                    className="pl-1 cursor-pointer"
                  >
                    export
                  </span>
                </span>
                {sl !== '' && sl !== null && sl !== undefined && <span className="mt-2 rounded-lg bg-white p-2.5 break-words whitespace-normal overflow-auto border border-gray-300 max-w-full">
                  {sl}
                </span>}
              </div>
              <div
                onClick={() => {
                  setSl("");
                  setDisplay(false);
                }}
                id="overlay"
                className="bg-black bg-opacity-80"
              ></div>
            </>
          )}
        </div>
      )}
    </>
  );
};
export default EditProfileContainer;
