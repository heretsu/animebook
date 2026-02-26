import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "../lib/userContext";
import CloudSvg from "./cloudSvg";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Spinner from "./spinner";
import animeBookLogo from "@/assets/animeBookLogo.png";

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
const NewCommunityContainer = ({ isAdmin }) => {
  const { fullPageReload } = PageLoadOptions();
  const { userData, userNumId, darkMode } = useContext(UserContext);
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [animeName, setAnimeName] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false)

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

  const addToCommunity = async () => {
    setChangesLoading(true);
    setErrorMsg("");
    let coverUrl = null;
    let avatarUrl = null;

    if (coverFile !== null) {
      const folder = isAdmin ? "community/cover/" : "community/cover/requests/";
      for (const file of coverFile) {
        coverUrl = await uploadToBucket(file, folder);
      }
    }

    if (avatarFile !== null) {
      const folder = isAdmin
        ? "community/avatar/"
        : "community/avatar/requests/";
      for (const file of avatarFile) {
        avatarUrl = await uploadToBucket(file, folder);
      }
    }

    if (
      coverUrl === null ||
      avatarUrl === null ||
      bio === "" ||
      animeName === ""
    ) {
      setErrorMsg("All field inputs needed");
      setChangesLoading(false);
      return;
    }

    // Update the user profile
    const { error } = await supabase
      .from(isAdmin ? "communities" : "community_requests")
      .insert({
        cover: coverUrl,
        avatar: avatarUrl,
        bio: bio,
        owner: userNumId,
        name: animeName
          .trim()
          .toLowerCase()
          .replace(/\s+(?!\s*$)/g, "+"),
      });

    if (error) {
      setChangesLoading(false)
      setErrorMsg("Something went wrong");
      console.log(error);
      return;
    }
    if (isAdmin) {
      fullPageReload(`/communities`);
    } else {
      setChangesLoading(false)
      setRequestSent(true)
    }
  };

  useEffect(() => {
    // Media blob revoked after component is unmounted. Doing this to prevent memory leaks
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia]);
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
          ) : (
            <label
              onClick={mediaChange}
              htmlFor="input-file"
              className="text-black w-full flex justify-center relative h-[150px] sm:h-[200px]"
            >
              <Image
                src={animeBookLogo}
                alt="anime book logo"
                fill={true}
                className="rounded-t-xl object-cover"
              />
              <span className="rounded-t-xl cursor-pointer bg-black bg-opacity-50 text-white absolute inset-0 flex flex-col justify-center items-center ">
                <CloudSvg pixels={"80px"} />
                <span className="font-semibold text-sm">
                  Upload anime cover
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
          )}
          <span className="flex flex-col px-4 w-full space-y-2">
            <span className="text-start font-medium w-full flex-col items-start">
              <span>Anime image</span>
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
                  <div className="relative h-[45px] w-fit cursor-pointer">
                    <Image
                      src={animeBookLogo}
                      alt="animebook logo"
                      height={50}
                      width={50}
                      className=""
                    />
                    <span className="rounded absolute inset-0 flex bg-black bg-opacity-60 justify-center items-center">
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
                  <span className="text-xs">Click to add anime image</span>
                </label>
              )}
            </span>

            <span className="space-y-1">
              <span className="text-start font-medium w-full">
                Community name
              </span>
              <input
                value={animeName}
                onChange={(e) => {
                  setAnimeName(e.target.value);
                }}
                maxLength={50}
                placeholder={"One piece community"}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} px-4 rounded-xl w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
              />

              <span className="text-start font-medium w-full">Description</span>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                maxLength={250}
                placeholder={"One piece community for all..."}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} resize-none px-4 h-15 rounded-xl w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
              />
            </span>

            <span className="pt-2 pb-3 flex flex-col">
              {changesLoading ? (
                <span className="mx-auto">
                  <Spinner spinnerSize={"medium"} />
                </span>
              ) : requestSent ? (
                <span className="flex flex-col space-y-3">
                  <span
                    onClick={() => {}}
                    className="cursor-not-allowed shadow-xl border border-gray-300 font-semibold mx-auto w-fit py-1 px-3 rounded-lg bg-transparent text-textGreen"
                  >
                    Request Submitted
                  </span>
                  <span className="text-center italic text-sm">
                    Your community suggestion is saved and will be considered
                  </span>
                </span>
              ) : (
                <span
                  onClick={() => {
                    addToCommunity();
                  }}
                  className="w-fit mx-auto hover:shadow cursor-pointer px-7 py-2 bg-pastelGreen text-center text-white font-bold rounded-lg"
                >
                  {isAdmin ? "Add community" : "Request community"}
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
        </div>
      )}
    </>
  );
};
export default NewCommunityContainer;
