import { useState } from "react";
import animeBcc from "@/assets/animeBcc.png";
import Image from "next/image";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ConnectionData from "@/lib/connectionData";
import Spinner from "./spinner";

export default function Onboard({ allUsers, me }) {
  const { connectToWallet } = ConnectionData();
  const { fullPageReload } = PageLoadOptions();
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [openImageOnboard, setOpenImageOnboard] = useState(false);
  const [openConnectWallet, setOpenConnectWallet] = useState(false);
  const [activated, setActivated] = useState(false);
  const [reentry, setReentry] = useState(true);

  const checkAvailability = (newUsername) => {
    setErrorMsg("");
    return;
    if (
      allUsers
        .filter((u) => u.username)
        .map((u) => u.username.toLowerCase())
        .includes(newUsername.toLowerCase())
    ) {
      setErrorMsg(`${newUsername} is taken`);
    }
  };

  const saveUsername = () => {
    if (
      allUsers
        .filter((u) => u.username)
        .map((u) => u.username.toLowerCase())
        .includes(username.toLowerCase())
    ) {
      setErrorMsg(`${username} is taken`);
    } else {
      setOpenImageOnboard(true);
    }
  };

  const saveImage = () => {
    setOpenImageOnboard(false);
    setOpenConnectWallet(true);
  };

  const connectAndUpload = async () => {
    setActivated(true);
    const address = await connectToWallet();
    if (address) {
      updateUserInfo(address);
    } else {
      setErrorMsg("Something went wrong");
      setActivated(false);
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

  const updateUserInfo = async (addr) => {
    console.log(addr)
    if (reentry) {
      setReentry(false);

      if (username !== "") {
        let imageUrl = null;

        if (profileImageFile !== null) {
          for (const file of profileImageFile) {
            imageUrl = await uploadToBucket(file, "avatar/");
          }
        }

        const newUser = {
          useruuid: me.id,
          username: username,
          avatar: imageUrl ? imageUrl : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
          address: addr ? addr : null,
        };
        const { data, error } = await supabase.from("users").insert([newUser]);
        if (error) {
          setErrorMsg(error);
        }
        fullPageReload("/home");
      } else {
        setErrorMsg("Input a username otaku san");
      }
    }
  };

  const mediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImageFile(e.target.files);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="mt-10 bg-white text-black space-y-3 rounded-xl pt-6 pb-7 px-4 mx-auto lg:px-20 w-9/12 lg:w-2/5 flex flex-col items-center">
      <div className="w-full flex flex-col space-x-1 justify-center items-center text-center text-lg">
        <Image src={animeBcc} alt="anime book logo" width={100} height={100} />

        <span className="font-bold pt-1" id="anime-book-font">Onboarding</span>
        {openConnectWallet ? (
          <>
            <span className="text-base pt-2 font-semibold">
              Provide a web3 address
            </span>
            <span className="text-sm text-center">
              This will allow other Animebook users send tips directly to your
              wallet
            </span>
          </>
        ) : openImageOnboard ? (
          <>
            <span className="text-base pt-2 font-semibold">
              Upload profile picture
            </span>
            <label
              htmlFor="input-file"
              className="pt-1 relative cursor-pointer"
            >
              {profileImage ? (
                <span className="text-sm flex flex-row items-center justify-start">
                  <Image
                    src={profileImage}
                    alt="Invalid post media. Click to change"
                    height={35}
                    width={35}
                  />
                  <span className="pl-2">{"@"}</span>
                  <span className="font-semibold">{username}</span>
                </span>
              ) : (
                <svg
                  fill="#000000"
                  width="80px"
                  height="80px"
                  viewBox="0 0 24 24"
                  id="image"
                  data-name="Flat Color"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon flat-color cursor-pointer"
                >
                  <rect
                    id="primary"
                    x={2}
                    y={3}
                    width={20}
                    height={18}
                    rx={2}
                    style={{
                      fill: "rgb(0, 0, 0)",
                    }}
                  />
                  <path
                    id="secondary"
                    d="M21.42,19l-6.71-6.71a1,1,0,0,0-1.42,0L11,14.59l-1.29-1.3a1,1,0,0,0-1.42,0L2.58,19a1,1,0,0,0-.29.72,1,1,0,0,0,.31.72A2,2,0,0,0,4,21H20a2,2,0,0,0,1.4-.56,1,1,0,0,0,.31-.72A1,1,0,0,0,21.42,19Z"
                    style={{
                      fill: "rgb(44, 169, 188)",
                    }}
                  />
                  <circle
                    id="secondary-2"
                    data-name="secondary"
                    cx={11}
                    cy={9}
                    r={1.5}
                    style={{
                      fill: "rgb(44, 169, 188)",
                    }}
                  />
                </svg>
              )}

              <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                id="input-file"
              />
            </label>
          </>
        ) : (
          <>
            <span className="text-base py-2 font-semibold">
              Select a preferred username
            </span>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                checkAvailability(e.target.value);
              }}
              maxLength={25}
              placeholder={""}
              className="px-4 h-15 rounded-xl w-full px-2 bg-gray-200 border-none focus:outline-none focus:border-gray-500 focus:ring-0"
            />
          </>
        )}
        {errorMsg !== "" && (
          <span className="text-sm w-full flex flex-row justify-center items-center">
            <svg
              fill="red"
              width="15px"
              height="15px"
              viewBox="0 -8 528 528"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>{"fail"}</title>
              <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
            </svg>
            <p className="text-red-500">{errorMsg}</p>
          </span>
        )}
        {activated ? (
          <span className="mx-auto">
            <Spinner spinnerSize={"medium"} />
          </span>
        ) : (
          <span
            onClick={
              openConnectWallet
                ? connectAndUpload
                : openImageOnboard
                ? saveImage
                : saveUsername
            }
            className="cursor-pointer mt-4 w-full bg-pastelGreen py-1 px-2 font-semibold rounded-lg text-white"
          >
            {openConnectWallet ? "Connect" : "Next"}
          </span>
        )}
        {(openConnectWallet || openImageOnboard) && !activated && (
          <span
            onClick={
              openImageOnboard
                ? () => {
                    setOpenImageOnboard(false);
                    setOpenConnectWallet(true);
                  }
                : () => {updateUserInfo(null)}
            }
            className="cursor-pointer w-full text-sm text-center underline pt-2 text-slate-500"
          >
            skip
          </span>
        )}
      </div>
    </div>
  );
}
