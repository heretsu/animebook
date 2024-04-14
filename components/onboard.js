import { useState } from "react";
import animeBookLogo from "@/assets/animeBookLogo.png";
import Image from "next/image";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function Onboard({ allUsers, me, address }) {
  const {fullPageReload} = PageLoadOptions()
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [reentry, setReentry] = useState(true);
  const checkAvailability = (newUsername) => {
    setErrorMsg("");
    if (
      allUsers
        .filter((u) => u.username)
        .map((u) => u.username.toLowerCase())
        .includes(newUsername.toLowerCase())
    ) {
      setErrorMsg(`${newUsername} is taken`);
    }
  };

  const saveUsername = async () => {
    if (reentry) {
      setReentry(false);
      if (
        allUsers
          .filter((u) => u.username)
          .map((u) => u.username.toLowerCase())
          .includes(username.toLowerCase())
      ) {
        setErrorMsg(`${username} is taken`);
      } else {
        if (username !== "") {
          const newUser = {
            useruuid: me.id,
            username: username,
            avatar: me.user_metadata.picture,
            address: address,
          };
          const { data, error } = await supabase
            .from("users")
            .insert([newUser]);
          if (error) {
            setErrorMsg(error);
          }
          fullPageReload('/home')
        } else {
          setErrorMsg("Input a username otaku san");
        }
      }
    }
    
  };
  return (
    <div className="mt-10 bg-white text-black space-y-3 rounded-xl pt-6 pb-7 px-4 mx-auto lg:px-20 w-9/12 lg:w-2/5 flex flex-col items-center">
      <div className="w-full flex flex-col space-x-1 justify-center items-center text-center text-lg">
        <Image
          src={animeBookLogo}
          alt="anime book logo"
          width={100}
          height={100}
        />

        <span className="font-bold pt-1">Onboarding</span>
        <span className="text-base py-2 ">Select a preferred username</span>
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
        <span
          onClick={() => {
            saveUsername();
          }}
          className="cursor-pointer mt-4 w-full bg-pastelGreen py-1 px-2 font-semibold rounded-lg text-white"
        >
          Next
        </span>
      </div>
    </div>
  );
}
