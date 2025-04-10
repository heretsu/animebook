import { useState } from "react";
import animeBcc from "@/assets/animeBcc.png";
import Image from "next/image";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ConnectionData from "@/lib/connectionData";
import Spinner from "./spinner";
import newLogo from "@/assets/newLogo.png";
import { AnimeGrid } from "@/pages/signin";
import img1 from "@/assets/icons/img1_registration.png";
import img2 from "@/assets/icons/img2_registration.png";
import img3 from "@/assets/icons/img3_registration.png";
import img4 from "@/assets/icons/img4_registration.png";
import { FilledCloudSvg } from "./cloudSvg";

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
      //cypher: updated
      updateUserInfo(null)
    }
  };

  const connectAndUpload = () => {
    setActivated(true);
    connectToWallet()
      .then(({ addr }) => {
        console.log(addr);
        if (addr) {
          updateUserInfo(addr);
        } else {
          setErrorMsg("Something went wrong");
          setActivated(false);
        }
      })
      .catch((e) => {
        console.log(e, "e");
        updateUserInfo(null);
      });
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
          username: username.trim(),
          avatar: imageUrl
            ? imageUrl
            : "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
          address: addr ? addr : null,
          ki: 0,
        };
        const { data, error } = await supabase.from("users").insert([newUser]);
        if (error) {
          setErrorMsg(error);
          return;
        }
        fullPageReload("/home", "window");
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
    <div className="h-screen flex flex-row items-end md:items-center">
      <div className="flex md:hidden w-full h-screen">
        <AnimeGrid img1={img1} img2={img2} img3={img3} img4={img4} />
      </div>

      <div className="absolute bottom-0 h-[70vh] flex flex-col justify-between md:relative bg-white shadow-2xl mx-auto pt-4 p-2 rounded-3xl w-full md:w-1/2">
        <div className="text-center flex flex-col w-[50%] mx-auto">
          <div className="pb-2 mx-auto relative h-18 w-18 flex justify-center rounded-full">
            <Image
              src={newLogo}
              alt="logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>

          {openConnectWallet ? (
            <>
              <span className="text-xl pt-2 font-semibold">
                Provide a web3 address
              </span>
              <span className="text-sm text-center">
                This will allow other Animebook users send tips directly to your
                wallet
              </span>
            </>
          ) : (
            <span className="w-full mx-auto flex flex-col justify-center items-center">
              <span className="font-bold text-2xl text-center flex flex-col justify-center">
                <span>{"Almost done!"}</span>
                <span>{"Complete your profile"}</span>
              </span>

              <span className="text-[0.8rem]">
                Select a username and a profile picture
              </span>

              <label
                htmlFor="input-file"
                className="py-4 relative cursor-pointer"
              >
                {profileImage ? (
                  <span className="relative h-20 w-20 text-sm flex flex-row items-center justify-start">
                    <Image
                      src={profileImage}
                      alt="Invalid post media. Click to change"
                      height={70}
                      width={70}
                      className="rounded-full h-20 w-20 object-cover"
                    />
                  </span>
                ) : (
                  <span className="relative inline-block h-20 w-20">
                    <span className="relative h-18 w-full m-auto flex justify-center items-center">
                      <Image
                        src={
                          "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                        }
                        alt="your profile picture goes here. click"
                        width={70}
                        height={70}
                        className="flex flex-shrink-1 rounded-full object-cover"
                      />
                    </span>

                    <span className="bg-black/30 rounded-full absolute inset-0 flex justify-center items-center">
                      <FilledCloudSvg pixels={"35px"} />
                    </span>
                  </span>
                )}

                <input
                  onChange={mediaChange}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                  id="input-file"
                />
              </label>

              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  checkAvailability(e.target.value);
                }}
                maxLength={25}
                placeholder={"Username.."}
                className="placeholder:text-black text-center px-4 h-15 rounded-2xl w-full px-2 bg-transparent border border-[#EEEDEF] focus:outline-none focus:border-[#EB4463] focus:ring-0"
              />
            </span>
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
              onClick={openConnectWallet ? connectAndUpload : saveUsername}
              className="w-full mx-auto flex flex-col justify-center items-center font-bold cursor-pointer mt-4 bg-[#EB4463] py-1 px-2 rounded-2xl text-white"
            >
              {openConnectWallet ? "Connect" : "Next"}
            </span>
          )}
          {openConnectWallet && (
            <span className="flex flew-row justify-between w-full">
              <span
                onClick={
                  openConnectWallet
                    ? () => {
                        setOpenConnectWallet(false);
                      }
                    : () => {
                        setOpenImageOnboard(false);
                      }
                }
                className="cursor-pointer w-full text-sm text-center underline pt-2 text-slate-500"
              >
                back
              </span>

              <span
                onClick={
                  openImageOnboard
                    ? () => {
                        setOpenConnectWallet(true);
                      }
                    : () => {
                        updateUserInfo(null);
                      }
                }
                className="cursor-pointer w-full text-sm text-center underline pt-2 text-slate-500"
              >
                skip
              </span>
            </span>
          )}
        </div>
        <div className="p-4 w-full text-[#D0D3DB] text-xs flex flex-row items-center justify-between space-x-1">
          <div>{"© Anime Book 2025, All rights reserved"}</div>
          <div className="rounded-b-xl flex flex-row justify-center space-x-1">
            <span
              onClick={() => {
                fullPageReload("/terms-of-service");
              }}
              className="cursor-pointer underline"
            >
              Terms of Service
            </span>
            <span
              onClick={() => {
                fullPageReload("privacy-policy");
              }}
              className="cursor-pointer underline"
            >
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
      <div className="hidden md:flex w-1/2">
        <AnimeGrid img1={img1} img2={img2} img3={img3} img4={img4} />
      </div>
    </div>
  );
}
