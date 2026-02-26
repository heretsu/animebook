import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "../lib/userContext";
import CloudSvg from "./cloudSvg";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Spinner from "./spinner";
import ConnectionData from "@/lib/connectionData";
import { ethers } from "ethers";
import { formatUnits } from "@ethersproject/units";
import ErcTwentyToken from "@/lib/static/ErcTwentyToken.json";
import free from "@/assets/chibis/free.jpg";
import yellowchibi from "@/assets/chibis/yellowchibi.png";
import customBorder from "@/assets/customborder.png";
import customBorder2 from "@/assets/customborder2.png";
import fireborder from "@/assets/fireborder.png";

import { useTranslation } from "next-i18next";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

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

export const LanguageSwitcher = ({ darkMode }) => {
  const { i18n } = useTranslation();

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <span className="relative w-full">
      <select
        onChange={handleChange}
        value={i18n.language}
        className={`${
          darkMode ? "bg-[#27292F]" : "bg-gray-200"
        } mt-1 p-2 pr-8 text-sm text-start cursor-pointer rounded-lg w-full border-none focus:outline-none focus:ring-0 appearance-none`}
      >
        <option value="en">English</option>
        <option value="ja-romaji">Japanese</option>
        <option value="ja">Japanese nonromaji</option>
        <option value="es">Español</option>
        <option value="de">German</option>
        <option value="fr">Français</option>
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex justify-center items-center px-2">
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          fill={darkMode ? "white" : "black"}
        >
          <path d="M0 0h48v48H0z" fill="none" />
          <g id="Shopicon">
            <g>
              <polygon points="24,29.171 9.414,14.585 6.586,17.413 24,34.827 41.414,17.413 38.586,14.585  " />
            </g>
          </g>
        </svg>
      </span>
    </span>
  );
};

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
  const { setVisible } = useWalletModal();
  const { publicKey } = useWallet();

  const { t } = useTranslation();
  const ercABI = ErcTwentyToken.abi;
  const { connectToWallet } = ConnectionData();
  const { fullPageReload } = PageLoadOptions();
  const {
    userNumId,
    setPostJustMade,
    address,
    userData,
    darkMode,
    currentUserChibis,
    setCurrentUserChibis,
    currentUserBorders,
    setCurrentUserBorders,
  } = useContext(UserContext);
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [newSolAddr, setNewSolAddr] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [solBalance, setSolBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [luffyBalance, setLuffyBalance] = useState(null);
  const [display, setDisplay] = useState(false);
  const [sl, setSl] = useState("");
  const [myAnimeWatchList, setMyAnimeWatchList] = useState(null);
  const [reentry, setReentry] = useState(true);
  const [selectedBorder, setSelectedBorder] = useState(null);

  const saveAnimes = () => {
    if (!reentry) {
      return;
    }
    setReentry(false);
    const animeData = selectedAnimes.map((anime) => ({
      title: anime.title,
      trailer: anime.trailer.url,
      image: anime.images.jpg.large_image_url,
      userid: userNumId,
      rating: ratings[anime.mal_id] || 0,
    }));
    if (animeData.some((anime) => anime.rating === 0)) {
      return;
    }

    supabase
      .from("animes")
      .insert(animeData)
      .then(async (res) => {
        fetchAnimes();
        setOpenWatchList(false);
        setRateSelectedAnimes(false);
        setSelectedAnimes([]);
        setRatings({});
      })
      .catch((e) => {
        console.log(console.log("error: ", e));
      });
  };

  const fetchAnimes = () => {
    supabase
      .from("animes")
      .select(
        "id, created_at, title, trailer, image, users(id, avatar, username), rating"
      )
      .eq("userid", userNumId)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setMyAnimeWatchList(res.data);
          setReentry(true);
        }
      });
  };

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
    const { addr } = await connectToWallet();
    setNewAddress(addr);
  };

  const updateProfile = async () => {
    setChangesLoading(true);
    setErrorMsg("");
    let coverUrl = null;
    let avatarUrl = null;

    if (selectedBorder !== null && selectedBorder !== undefined) {
      await supabase
        .from("users")
        .update({
          borderid: selectedBorder,
        })
        .eq("useruuid", userData.useruuid);
    }

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
      newAddress === null &&
      newSolAddr === null &&
      selectedBorder === null
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
        solAddress: newSolAddr ? newSolAddr : userData.solAddress,
        solupdated:
          newSolAddr !== null && newSolAddr !== undefined && newSolAddr !== ""
            ? true
            : null,
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
      console.log('ok')
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
    const result = await fetch("/api/jim", {
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
  const [valuesLoaded, setValuesLoaded] = useState(false);

  const [openWatchList, setOpenWatchList] = useState(false);
  const [ratings, setRatings] = useState({});

  const handleRatingChange = (animeId, newRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [animeId]: newRating, // Updates only the selected anime rating
    }));
  };
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    // connectToWallet().then((addr) => {
    //   setConAddress(addr);
    // });
    if (userData && userData.avatar && !valuesLoaded) {
      fetchAnimes();
      setImgSrc(userData.avatar);
      setValuesLoaded(true);
    }
    if (!solBalance) {
      getBalances();
    }

    // Media blob revoked after component is unmounted. Doing this to prevent memory leaks
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia, solBalance, userData]);

  const [animes, setAnimes] = useState([]);
  const [selectedAnimes, setSelectedAnimes] = useState([]);
  const [allAnimes, setAllAnimes] = useState([]);
  const [rateSelectedAnimes, setRateSelectedAnimes] = useState(false);

  const fetchAllChibis = (userid) => {
    supabase
      .from("chibis")
      .select("id, created_at, collectionid, users(id, avatar, username)")
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
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

  useEffect(() => {
    if (userData) {
      fetchAllChibis(userData.id);
      fetchAllBorders(userData.id);
    }
    if (publicKey) {
      setNewSolAddr(publicKey.toBase58());
    }
    async function fetchAllAnimes() {
      const allAnimes = [];
      let currentPage = 1;
      const perPage = 50;
      let hasNextPage = true;

      const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          description
        }
      }
    }
  `;

      while (hasNextPage) {
        try {
          const response = await fetch("/api/anilist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              variables: { page: currentPage, perPage },
            }),
          });

          if (!response.ok) {
            console.log('not loaded anilist1: ', response)
            return
          }

          const result = await response.json();
          const media = result.data.Page.media;
          const pageInfo = result.data.Page.pageInfo;

          allAnimes.push(...media);
          hasNextPage = pageInfo.hasNextPage;
          currentPage++;
        } catch (error) {
          console.error("Error fetching animes:", error);
          break;
        }
      }

      setAllAnimes(allAnimes);
      setAnimes(allAnimes); // optional if you're filtering later
    }
    async function fetchAnimes() {
      const allAnimes = [];
      let currentPage = 1;
      const perPage = 50;
      let hasNextPage = true;

      const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
        }
      }
    }
  `;

      while (hasNextPage) {
        try {
          const response = await fetch("/api/anilist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              variables: { page: currentPage, perPage },
            }),
          });
          if (!response.ok) {
            console.log('not loaded anilist2: ', response)
            return
          }
          const result = await response.json();
          const media = result.data.Page.media;
          const pageInfo = result.data.Page.pageInfo;

          // Map AniList format to Jikan-like format
          const transformed = media.map((anime) => ({
            mal_id: anime.id, // Anilist ID used as mal_id
            title: anime.title.english || anime.title.romaji,
            images: {
              jpg: {
                image_url: anime.coverImage.large,
              },
            },
          }));

          allAnimes.push(...transformed);
          hasNextPage = pageInfo.hasNextPage;
          currentPage++;
        } catch (error) {
          console.error("Error fetching animes:", error);
          break;
        }
      }

      setAllAnimes(allAnimes);
      setAnimes(allAnimes);
    }

    fetchAnimes();
  }, [userData, publicKey]);

  // Toggle anime selection
  const handleSelectAnime = (anime) => {
    setSelectedAnimes((prev) =>
      prev.includes(anime)
        ? prev.filter((item) => item !== anime)
        : [...prev, anime]
    );
  };
  return (
    <div className="flex flex-col">
      {userData !== null && userData !== undefined && (
        <div
          className={`${
            darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
          } pb-4 text-sm flex flex-col rounded-lg shadow-lg w-full justify-center items-center`}
        >
          <span className="text-start w-full pt-2 pl-4 font-medium">
            Banner
          </span>
          {selectedMedia ? (
            <label
              htmlFor="input-file"
              className="text-black w-full flex justify-center relative h-[150px] sm:h-[200px]"
            >
              <Image
                src={selectedMedia}
                alt="Invalid post media. Click to change"
                fill={true}
                className="px-4 pb-0 rounded object-cover"
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
                className="px-4 rounded object-cover"
              />
              <span className="rounded-lg cursor-pointer text-white absolute inset-0 flex flex-col justify-center items-center ">
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
              className="rounded-lg text-white h-[150px] cursor-pointer w-full bg-slate-900 flex flex-col justify-center items-center"
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
                      src={imgSrc}
                      alt="user avatar"
                      height={35}
                      width={35}
                      className="rounded-full"
                      onError={() =>
                        setImgSrc(
                          "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                        )
                      }
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
              <span className="text-start font-medium w-full">Username</span>
              <input
                disabled
                value={userData.username}
                className={`${
                  darkMode ? "bg-[#27292F]" : "bg-gray-200"
                } mt-1 px-4 text-sm text-start cursor-not-allowed rounded-lg resize-none w-full px-2 border-none focus:outline-none focus:border-[#27292F] focus:ring-0`}
              />
            </span>
            <span className="space-y-1">
              <span className="text-start w-full flex flex-row space-x-0.5 items-end">
                <span className="font-medium">Bio</span>
                <span className="font-light text-sm">
                  {"(max 80 characters)"}
                </span>
              </span>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                maxLength={80}
                placeholder={userData.bio}
                className={`${
                  darkMode
                    ? "bg-[#27292F] placeholder:text-gray-200"
                    : "bg-gray-200"
                } px-4 h-15 rounded-lg resize-none w-full px-2 border-none focus:outline-none focus:border-[#27292F] focus:ring-0`}
              />
            </span>

            <span className="flex flex-col text-start text-xs sm:text-sm font-medium w-full space-x-1">
              <span className="flex flex-row items-center">
                <span>ETH Wallet</span>

                <span className="text-xs ml-2 bg-[#EB4463] text-white py-0.5 px-1 rounded h-fit">
                  {"Balance: "} {luffyBalance ? luffyBalance : 0} Luffy{" "}
                  {ethBalance ? ethBalance : 0} Eth
                </span>

                <span
                  onClick={() => {
                    // setDisplay(true);
                  }}
                  className="text-xs cursor-pointer flex space-x-1 flex-row justify-center items-center w-fit ml-auto py-0.5"
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
                </span>
              </span>
              <span className="text-xs">
                {"Your wallet will be used for payouts and for purchases."}
              </span>
              <span
                className={`${
                  darkMode ? "bg-[#27292F]" : "bg-gray-200"
                } flex flex-row justify-between mt-1 pl-4 items-center text-sm text-start rounded-lg resize-none w-full`}
              >
                <input
                  // value=""
                  disabled
                  value={newAddress ? newAddress : userData.address}
                  className={`${
                    darkMode ? "bg-[#27292F]" : "bg-gray-200"
                  } mt-1 px-4 text-sm text-start cursor-not-allowed rounded-lg resize-none w-full px-2 border-none focus:outline-none focus:border-[#27292F] focus:ring-0`}
                />
                <span
                  onClick={() => {
                    // connectToWallet()
                    // open()
                    updateAddress();
                  }}
                  className="flex flex-row space-x-1 cursor-pointer bg-black text-white px-3 py-2 h-full rounded-r-lg"
                >
                  <span>Change</span>
                  <span>Wallet</span>
                </span>
              </span>
            </span>

            <span className="flex flex-col text-start text-xs sm:text-sm font-medium w-full space-x-1">
              <span className="flex flex-row items-center">
                <span>Sol Wallet</span>

                <span className="text-xs ml-2 bg-[#EB4463] text-white py-0.5 px-1 rounded h-fit">
                  {"Balance: "} {solBalance}
                </span>

                <span
                  onClick={() => {
                    setDisplay(true);
                  }}
                  className="text-xs cursor-pointer flex space-x-1 flex-row justify-center items-center w-fit ml-auto py-0.5"
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
                  <span className="underline">{"Export Sol private key"}</span>
                </span>
              </span>
              <span className="text-xs">
                {"Your wallet will be used for payouts and for purchases."}
              </span>
              <span
                className={`${
                  darkMode ? "bg-[#27292F]" : "bg-gray-200"
                } flex flex-row justify-between mt-1 pl-4 items-center text-sm text-start rounded-lg resize-none w-full`}
              >
                <input
                  // value=""
                  disabled
                  value={newSolAddr ? newSolAddr : userData.solAddress}
                  className={`${
                    darkMode ? "bg-[#27292F]" : "bg-gray-200"
                  } mt-1 px-4 text-sm text-start cursor-not-allowed rounded-lg resize-none w-full px-2 border-none focus:outline-none focus:border-[#27292F] focus:ring-0`}
                />
                <span
                  onClick={() => {
                    setVisible(true);
                  }}
                  className="flex flex-row space-x-1 cursor-pointer bg-black text-white px-3 py-2 h-full rounded-r-lg"
                >
                  <span>Change</span>
                  <span>Wallet</span>
                </span>
              </span>
            </span>

            <span className="space-y-1 flex flex-col">
              <span className="text-start font-medium w-full">Language</span>
              <LanguageSwitcher darkMode={darkMode} />
            </span>

            <span className="text-start text-xs sm:text-sm w-full flex flex-col">
              <span className="flex flex-row font-medium">
                <span>Your Chibis</span>
              </span>
              {currentUserChibis ? (
                <span
                  id="scrollbar-remove"
                  className="relative flex flex-row space-x-1 overflow-x-scroll"
                >
                  {currentUserChibis.map((cb) => (
                    <span
                      key={cb.id}
                      className="relative flex flex-col items-center w-16 rounded-lg"
                    >
                      <Image
                        src={cb.collectionid === 2 ? yellowchibi : free}
                        alt="chibi"
                        className="rounded-lg w-16 h-16 object-cover"
                      />
                    </span>
                  ))}
                </span>
              ) : (
                <span className="w-full text-center">
                  {"Go to Earn & Shop and get a free chibi"}
                </span>
              )}
            </span>
            <span className="text-start text-xs sm:text-sm w-full flex flex-col">
              <span className="flex flex-row font-medium">
                <span>Your Borders</span>
              </span>
              {currentUserBorders ? (
                <span
                  id="scrollbar-remove"
                  className="relative flex flex-row space-x-1 overflow-x-scroll"
                >
                  {currentUserBorders.map((cb) => (
                    <span
                      key={cb.id}
                      onClick={() => {
                        setSelectedBorder(cb.collectionid);
                      }}
                    >
                      <AvatarDesign
                        border={
                          cb.collectionid === 3
                            ? fireborder
                            : cb.collectionid === 2
                            ? customBorder2
                            : customBorder
                        }
                        userData={userData}
                        size={80}
                      />
                      <span className="w-full flex flex-row pr-2 justify-end">
                        <span
                          className={`border ${
                            selectedBorder === cb.collectionid ||
                            (cb.collectionid === userData.borderid &&
                              selectedBorder === null)
                              ? "bg-[#EB4463]"
                              : darkMode
                              ? "bg-[#27292F] border-gray-300"
                              : "bg-[#F9F9F9] border-[#D0D3DB]"
                          } cursor-pointer h-4 w-4 flex items-center rounded`}
                        >
                          {(selectedBorder === cb.collectionid ||
                            (cb.collectionid === userData.borderid &&
                              selectedBorder === null)) && (
                            <svg
                              fill="white"
                              width="20px"
                              height="20px"
                              viewBox="0 0 24 24"
                              baseProfile="tiny"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M16.972 6.251c-.967-.538-2.185-.188-2.72.777l-3.713 6.682-2.125-2.125c-.781-.781-2.047-.781-2.828 0-.781.781-.781 2.047 0 2.828l4 4c.378.379.888.587 1.414.587l.277-.02c.621-.087 1.166-.46 1.471-1.009l5-9c.537-.966.189-2.183-.776-2.72z" />
                            </svg>
                          )}
                        </span>
                      </span>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="w-full text-center">
                  {"Go to Earn & Shop and get a border"}
                </span>
              )}
            </span>

            <span className="text-start text-xs sm:text-sm w-full flex flex-col">
              <span className="flex flex-row font-medium">
                <span>Anime Watch History</span>
              </span>

              <span className="text-xs">
                {"Add Animes you have watched and rate them"}
              </span>

              <span
                id="scrollbar-remove"
                className="relative flex flex-row space-x-1 overflow-x-scroll"
              >
                <span
                  onClick={() => {
                    setOpenWatchList(true);
                  }}
                  className={`border ${
                    darkMode
                      ? "bg-[#27292F] border-[#32353C]"
                      : "bg-[#F9F9F9] border-[#D0D3DB]"
                  } text-2xl font-bold flex items-center justify-center rounded-xl relative w-20 h-20 overflow-hidden cursor-pointer`}
                >
                  +
                </span>

                {myAnimeWatchList !== null &&
                  myAnimeWatchList !== undefined &&
                  myAnimeWatchList.length > 0 &&
                  myAnimeWatchList.map((anime) => (
                    <span
                      key={anime.id}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 shadow-md"
                    >
                      {/* Anime Image */}
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {/* Rating Stars */}
                      <span className="absolute bottom-1 left-1 right-1 bg-black/60 px-2 py-0.5 rounded-md flex justify-center space-x-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < anime.rating ? "text-[#EB4463]" : "text-white"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
              </span>
            </span>
          </span>

          {openWatchList && (
            <>
              <div
                id="manga-modal"
                className="w-full m-auto lg:p-4 flex flex-col-reverse lg:flex-row lg:space-x-1 justify-center items-center space-y-2 lg:space-y-0 lg:items-start rounded-lg"
              >
                {rateSelectedAnimes &&
                selectedAnimes &&
                selectedAnimes.length > 0 ? (
                  <div className="bg-white w-[90%] md:w-[60%] rounded-lg overflow-hidden">
                    <div className="bg-transparent lg:bg-zinc-800 text-black lg:text-white px-6 py-4 flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        Rate your Animes
                      </h2>
                    </div>
                    <div className="px-4 py-2">
                      {selectedAnimes.map((anime) => {
                        return (
                          <span
                            key={anime.mal_id}
                            className="flex border-b py-2 border-[#D0D3DB] flex-row w-full items-center justify-between"
                          >
                            <span className="flex flex-row space-x-2 items-center">
                              <span className="flex">
                                <img
                                  src={anime.images.jpg.image_url}
                                  alt={anime.title || "anime"}
                                  width={50}
                                  height={50}
                                  className="w-full border-2 h-16 border-black rounded-lg object-cover"
                                />
                              </span>
                              <span className="font-semibold">
                                {anime.title}
                              </span>
                            </span>

                            <span className="flex items-center bg-[#292C33E6] px-2 py-0.5 rounded-full">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg cursor-pointer ${
                                    i < (ratings[anime.mal_id] || 0)
                                      ? "text-[#EB4463]"
                                      : "text-white"
                                  }`}
                                  onClick={() =>
                                    handleRatingChange(anime.mal_id, i + 1)
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                    <span className="pt-10 pb-3 text-center text-white flex flex-row space-x-1 px-4">
                      <span
                        onClick={() => {
                          setRateSelectedAnimes(false);
                        }}
                        className="cursor-pointer font-bold px-8 py-3 bg-[#2A2C33] rounded-lg"
                      >
                        BACK
                      </span>
                      <span className="cursor-pointer py-1 w-full flex flex-col rounded-lg bg-[#EB4463]">
                        <span
                          onClick={() => {
                            saveAnimes();
                          }}
                          className="font-bold"
                        >
                          SAVE ANIMES
                        </span>
                        <span>
                          {selectedAnimes.length}{" "}
                          {selectedAnimes.length === 1 ? "Anime" : "Animes"}{" "}
                          selected
                        </span>
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-white w-[90%] md:w-[60%] rounded-lg overflow-hidden">
                    <div className="bg-transparent lg:bg-zinc-800 text-white px-6 py-4 flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        Add an anime to your watchlist
                      </h2>
                    </div>

                    <div className="rounded-lg text-black flex flex-row space-x-0 w-[98%] mt-2 mx-auto px-2 p-1 items-center bg-[#F9F9F9] border border-[#EEEDEF]">
                      <svg
                        className="w-4 h-8 text-black"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                      <input
                        type="text"
                        onChange={(e) => {
                          setAnimes(
                            allAnimes.filter((an) => {
                              return an.title
                                .toLowerCase()
                                .includes(e.target.value.toLowerCase());
                            })
                          );
                        }}
                        placeholder="Search for animes"
                        className="text-black placeholder:text-gray-800 w-full border-none text-sm bg-transparent focus:ring-0 focus:ring-0"
                      />
                    </div>

                    <div className="px-4 py-2">
                      <h3 className={`text-sm text-black font-medium mb-2`}>
                        Popular animes
                      </h3>
                      <div className="flex justify-center w-full">
                        <div className="w-fit grid grid-cols-3 md:grid-cols-8 gap-3">
                          {animes.slice(0, 16).map((anime) => (
                            <div
                              key={anime.mal_id}
                              className={`relative cursor-pointer w-24 rounded-lg overflow-hidden shadow-md ${
                                selectedAnimes.includes(anime)
                                  ? "border-2 border-[#EB4463]"
                                  : ""
                              }`}
                              onClick={() => handleSelectAnime(anime)}
                            >
                              <span className="flex">
                                <img
                                  src={anime.images.jpg.image_url}
                                  alt={anime.title || "anime"}
                                  width={50}
                                  height={50}
                                  className="w-full h-24 object-cover"
                                />
                              </span>
                              <div
                                className={`absolute bottom-0 w-full p-1 text-center text-xs font-medium text-white ${
                                  selectedAnimes.includes(anime)
                                    ? "bg-[#EB4463]"
                                    : "bg-black/60"
                                }`}
                              >
                                {anime.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pt-2 pb-4">
                      <button
                        className="w-full bg-[#EB4463] text-white py-2 rounded-lg text-center"
                        disabled={selectedAnimes.length === 0}
                        onClick={() => {
                          if (selectedAnimes.length > 0) {
                            setRateSelectedAnimes(true);
                          }
                        }}
                      >
                        <span className="font-bold">NEXT</span>
                        <br />
                        {selectedAnimes.length}{" "}
                        {selectedAnimes.length === 1 ? "Anime" : "Animes"}{" "}
                        selected
                      </button>
                    </div>
                  </div>
                )}
                <span className="h-[1px] lg:hidden lg:h-0"></span>
                <span
                  onClick={() => {
                    setOpenWatchList(false);
                    setRateSelectedAnimes(false);
                    setSelectedAnimes([]);
                  }}
                  className="cursor-pointer bg-white rounded-full p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="9.848"
                    height="9.527"
                    viewBox="0 0 14.848 14.527"
                  >
                    <path
                      id="Pfad_4751"
                      data-name="Pfad 4751"
                      d="M5.662-12.827.364-19.96H4.09l3.494,4.687,3.494-4.687H14.8l-5.3,7.133,5.5,7.395H11.252L7.584-10.382,3.916-5.433H.16Z"
                      transform="translate(-0.16 19.96)"
                      fill="#292c33"
                    />
                  </svg>
                </span>
              </div>
              <div id="overlay" className="bg-black backdrop-blur-md"></div>
            </>
          )}

          {display && (
            <>
              <div
                id="tip-modal"
                className="w-[400px] bg-white p-4 flex flex-col justify-center items-center rounded-lg"
              >
                <span className="font-bold">Exporting Private Key</span>
                <p className="pb-4 text-xs font-medium text-gray-700">
                  This key unlocks your original Animebook Sol wallet. Keep it
                  secure. Do not share it with anyone. Exposing your private key
                  may result in the loss of your assets.
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
                {sl !== "" && sl !== null && sl !== undefined && (
                  <span className="mt-2 rounded-lg bg-white p-2.5 break-words whitespace-normal overflow-auto border border-gray-300 max-w-full">
                    {sl}
                  </span>
                )}
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
      <span className="pt-1 pb-3 flex flex-col">
        {changesLoading ? (
          <span className="mx-auto">
            <Spinner spinnerSize={"medium"} />
          </span>
        ) : (
          <span
            onClick={() => {
              updateProfile();
            }}
            className={`${
              darkMode ? "border-none" : "border"
            } w-full mx-auto hover:shadow cursor-pointer px-7 py-2 bg-[#EB4463] text-center text-white font-semibold rounded-lg`}
          >
            SAVE CHANGES
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
            <p className="text-[#EB4463]">{errorMsg}</p>
          </span>
        )}
      </span>
    </div>
  );
};
export default EditProfileContainer;
