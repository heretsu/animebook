import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import DappLogo from "./dappLogo";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import navLogo from "@/assets/navLogo.png";
import supabase from "@/hooks/authenticateUser";
import X from "./x";
import Telegram from "./telegram";
import DarkModeToggle from "./darkModeToggle";
import Link from "next/link";
import DbUsers from "@/hooks/dbUsers";

const NavBarDependencies = () => {
  const { fetchAllUsers, fetchAllPosts } = DbUsers();

  const {
    allUsers,
    userData,
    myProfileRoute,
    NotSignedIn,
    notifyUserObject,
    setNotifyUserObject,
    userNumId,
    darkMode,
    unreadMessagesLength,
    setUnreadMessagesLength,
    originalPostValues,
    originalExplorePosts,
    allUserObject,
    setAllUserObject,
    postValues,
    setPostValues,
    setTagsFilter,
    communities, unreadCount, setUnreadCount
  } = useContext(UserContext);
  const [currentRoute, setCurrentRoute] = useState("/home");
  const router = useRouter();

  const fetchNotifications = () => {
    supabase
      .from("notifications")
      .select(
        "*, users!public_notifications_actorid_fkey(id, username, avatar)"
      )
      .eq("userid", userNumId)
      .order("created_at", { ascending: false })
      .then((result) => {
        if (result.data !== null && result.data !== undefined) {
          let noteObject = {};
          result.data.forEach((note) => {
            const period = getNotificationPeriod(note.created_at);
            if (!noteObject[period]) {
              noteObject[period] = [];
            }
            // Create a unique identifier for each note
            const noteIdentifier = `${note.type}-${note.content}-${note.users.id}-${note.postid}`;
            // Check if this note already exists in the array
            const isNoteAlreadyAdded = noteObject[period].some(
              (existingNote) =>
                `${existingNote.type}-${existingNote.content}-${existingNote.userid}-${existingNote.postid}` ===
                noteIdentifier
            );
            if (!isNoteAlreadyAdded) {
              noteObject[period].push({
                type: note.type,
                created_at: note.created_at,
                content: note.content,
                avatar: note.users.avatar,
                username: note.users.username,
                userid: note.users.id,
                postid: note.postid,
              });
            }
          });
          setNotifyUserObject(noteObject);
        }
      });
  };

  const getNotificationPeriod = (dateStr) => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const notificationDate = new Date(dateStr);

    const notificationDateStart = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    // Calculate the difference in days
    const diffTime = todayStart - notificationDateStart;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      return "Today";
    } else if (diffDays < 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return "Past 7 days";
    } else if (diffDays <= 30) {
      return "Past 30 days";
    } else {
      return "Older";
    }
  };

  const lastReadDate =
    userData && userData.lastreadnotification
      ? new Date(userData.lastreadnotification)
      : null;

  // Loop through notifications and check timestamps
  const getUnreadNotifications = async () => {
    let urc = 0;

    if (notifyUserObject && userData.lastreadnotification !== null) {
      if (notifyUserObject.Older) {
        notifyUserObject.Older.forEach((notification) => {
          const notificationDate = new Date(notification.created_at);
          if (notificationDate > lastReadDate) {
            urc++;
          }
        });
      }
      if (notifyUserObject.Yesterday) {
        notifyUserObject.Yesterday.forEach((notification) => {
          const notificationDate = new Date(notification.created_at);
          if (notificationDate > lastReadDate) {
            urc++;
          }
        });
      }
      if (notifyUserObject.Today) {
        notifyUserObject.Today.forEach((notification) => {
          const notificationDate = new Date(notification.created_at);
          if (notificationDate > lastReadDate) {
            urc++;
          }
        });
      }
      if (notifyUserObject["Past 7 days"]) {
        notifyUserObject["Past 7 days"].forEach((notification) => {
          const notificationDate = new Date(notification.created_at);
          if (notificationDate > lastReadDate) {
            urc++;
          }
        });
      }
      if (notifyUserObject["Past 30 days"]) {
        notifyUserObject["Past 30 days"].forEach((notification) => {
          const notificationDate = new Date(notification.created_at);
          if (notificationDate > lastReadDate) {
            urc++;
          }
        });
      }
      setUnreadCount(numberFormatter(urc));
    } else if (notifyUserObject && userData.lastreadnotification === null) {
      if (notifyUserObject.Older) {
        urc += notifyUserObject.Older.length;
      }
      if (notifyUserObject.Yesterday) {
        urc += notifyUserObject.Yesterday.length;
      }
      if (notifyUserObject.Today) {
        urc += notifyUserObject.Today.length;
      }
      if (notifyUserObject["Past 7 days"]) {
        urc += notifyUserObject["Past 7 days"].length;
      }
      if (notifyUserObject["Past 30 days"]) {
        urc += notifyUserObject["Past 30 days"].length;
      }
      setUnreadCount(numberFormatter(urc));
    } else {
      setUnreadCount(null);
    }
  };

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

  const getAllSearchData = () => {
    if (!postValues) {
      fetchAllPosts()
        .then((result) => {
          setPostValues(result.data);
        })
        .catch((e) => console.log(e, "largetopbar.js posts error"));
    }

    if (!allUserObject) {
      // setDisableUsersReentry(true);
      fetchAllUsers()
        .then((res) => {
          setAllUserObject(res.data);
        })
        .catch((e) => console.log(e, "largetopbar.js users error"));
    }
  };

  const [imgSrc, setImgSrc] = useState("");
  const [imgSrcs, setImgSrcs] = useState("");
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const [openUsers, setOpenUsers] = useState(null);
  const [searchedWord, setSearchedWord] = useState("");
  const [valuesLoaded, setValuesLoaded] = useState(false);

  const formatGroupName = (text) => {
    return text
      .split("+") // Split the string at '+'
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
  };

  const handleImageError = (id) => {
    setImgSrcs((prev) => ({
      ...prev,
      [id]: "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
    }));
  };
  const searchForItem = (e) => {
    setSearchedWord(e.target.value);
    if (e.target.value !== "") {
      if (!postValues || !allUserObject || !originalPostValues) {
        getAllSearchData();
      }
      const foundPosts =
        // router.pathname === "/profile/[user]"
        //   ? originalPostValues
        //     ? originalPostValues.filter((post) => {
        //         if (
        //           post.users.username.toLowerCase() === routedUser.toLowerCase()
        //         ) {
        //           return post.content
        //             .toLowerCase()
        //             .includes(e.target.value.toLowerCase());
        //         }
        //       })
        //     : [] :
        originalPostValues
          ? originalPostValues.filter((post) =>
              post?.content?.toLowerCase().includes(e.target.value.toLowerCase())
            )
          : [];

      const foundExplorePosts = originalExplorePosts
        ? originalExplorePosts.filter((post) =>
            post?.post?.content?.toLowerCase()
              .includes(e.target.value.toLowerCase())
          )
        : [];

      const foundUsers = allUserObject
        ? allUserObject.filter((user) =>
            user?.username?.toLowerCase().includes(e.target.value.toLowerCase())
          )
        : [];
      setTagsFilter(false);
      // setSearchFilter(true);

      setOpenSuggestions({
        foundPosts: foundPosts,
        foundExplorePosts: foundExplorePosts,
        foundUsers: foundUsers,
      });
    } else {
      setOpenSuggestions(null);
    }
  };
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (openUsers && !valuesLoaded) {
      setImgSrcs(
        openUsers.reduce(
          (acc, user) => ({ ...acc, [user.id]: user.avatar }),
          {}
        )
      );
      setValuesLoaded(true);
    }

    if (userData && userData.avatar) {
      setImgSrc(userData.avatar);
    }
    setCurrentRoute(router.pathname);
    if (!initialized) {
      fetchNotifications();
      getUnreadNotifications();
      setInitialized(true);
    }
    if (notifyUserObject && notifyUserObject.Older) {
      getUnreadNotifications();
    }
    if (notifyUserObject === null) {
      setUnreadCount(null);
    }
  }, [
    valuesLoaded,
    openUsers,
    initialized,
    router.pathname,
    notifyUserObject,
    userData,
  ]);

  return {
    formatGroupName,
    communities,
    imgSrcs,
    setImgSrcs,
    handleImageError,
    valuesLoaded,
    setValuesLoaded,
    searchedWord,
    searchForItem,
    getAllSearchData,
    openSuggestions,
    openUsers,
    setOpenSuggestions,
    setOpenUsers,
    unreadMessagesLength,
    setUnreadMessagesLength,
    imgSrc,
    setImgSrc,
    allUsers,
    userData,
    myProfileRoute,
    NotSignedIn,
    notifyUserObject,
    setNotifyUserObject,
    userNumId,
    unreadCount,
    router,
    currentRoute,
    setCurrentRoute,
    darkMode,
  };
};

export const MobileNavBar = () => {
  // For dev: This is mobile nav.
  const { fullPageReload } = PageLoadOptions();
  const {
    unreadMessagesLength,
    setUnreadMessagesLength,
    imgSrc,
    setImgSrc,
    unreadCount,
    currentRoute,
    router,
    darkMode,
  } = NavBarDependencies();

  return (
    <div
      id="anime-book-font"
      className="text-sm lg:invisible fixed text-[#5d6879] bottom-0 w-full"
    >
      <div
        className={`border-t ${
          darkMode
            ? "bg-[#1e1f24] border-[#292C33]"
            : "bg-white border-[#EEEDEF]"
        } mx-auto w-full flex flex-row justify-between items-center py-2 px-3`}
      >
        <span
          onClick={() => {
            fullPageReload("/home", "window");
          }}
          className="flex flex-col justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19.858"
            height="20.987"
            viewBox="0 0 19.858 20.987"
          >
            <g id="torii-gate" transform="translate(0 -42.669)">
              <g
                id="Gruppe_3248"
                data-name="Gruppe 3248"
                transform="translate(0 42.669)"
              >
                <path
                  id="Pfad_4689"
                  data-name="Pfad 4689"
                  d="M19.759,42.854a.368.368,0,0,0-.4-.173,38.6,38.6,0,0,1-9.425,1.037A38.592,38.592,0,0,1,.5,42.681a.368.368,0,0,0-.4.173.638.638,0,0,0-.069.534l.827,2.623a.44.44,0,0,0,.347.328c.019,0,.84.1,2.083.2l-.109,2.423H2.068a.479.479,0,0,0-.414.525v2.1a.479.479,0,0,0,.414.525h.956L2.483,63.1a.612.612,0,0,0,.112.392.378.378,0,0,0,.3.166H4.551a.471.471,0,0,0,.413-.492l.545-11.051h8.841l.545,11.051a.471.471,0,0,0,.413.492h1.655a.378.378,0,0,0,.3-.166.612.612,0,0,0,.112-.392l-.541-10.985h.956a.479.479,0,0,0,.414-.525v-2.1a.479.479,0,0,0-.414-.525H16.68l-.109-2.423c1.243-.107,2.064-.2,2.083-.2A.44.44,0,0,0,19,46.012l.827-2.623A.638.638,0,0,0,19.759,42.854ZM8.688,48.965H5.662l.1-2.24c.926.057,1.921.1,2.921.125v2.114Zm2.482,0V46.851c1-.023,1.995-.069,2.921-.125l.1,2.24Z"
                  transform="translate(0 -42.669)"
                  fill={`${
                    currentRoute === "/home"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#292C33"
                  }`}
                />
              </g>
            </g>
          </svg>
          <span
            className={`${
              currentRoute === "/home"
                ? "text-[#EA334E]"
                : darkMode
                ? "text-white"
                : "text-[#292C33]"
            }`}
          >
            Home
          </span>
        </span>

        <span
          onClick={() => {
            fullPageReload("/explore", "window");
          }}
          className="flex flex-col justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22.318"
            height="22.318"
            viewBox="0 0 22.318 22.318"
          >
            <g
              id="Layer_32"
              data-name="Layer 32"
              transform="translate(-3 -2.998)"
            >
              <path
                id="Pfad_4696"
                data-name="Pfad 4696"
                d="M24.933,9.54a.77.77,0,0,1-1.418.414.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093A.377.377,0,0,0,20.4,9.66a.385.385,0,0,0-.294.162A1.154,1.154,0,1,1,19.161,8a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,0,1,.77.77ZM5.309,5.692a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,1,1-.648,1.184.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093.385.385,0,0,0-.6.033,1.154,1.154,0,1,1-.94-1.821ZM3,14.158A11.126,11.126,0,0,1,4.5,8.587a1.9,1.9,0,0,0,2.09-.3,2.369,2.369,0,0,0,2.7.1,1.539,1.539,0,1,0,1.024-2.69c-.044,0-.088,0-.131.006a2.286,2.286,0,0,0-1.3-1.367A11.132,11.132,0,0,1,22.266,6.5a2.283,2.283,0,0,0-2.279.917,1.9,1.9,0,0,0-.825-.185,1.924,1.924,0,1,0,1.277,3.36,2.369,2.369,0,0,0,2.7.1,1.52,1.52,0,0,0,1.691.231,11.074,11.074,0,0,1-1.75,9.922l-3.633-5.738a2.854,2.854,0,0,0-2.423-1.333H11.292a2.854,2.854,0,0,0-2.424,1.333L5.237,20.843A11.168,11.168,0,0,1,3,14.158Zm16.605,2.635a1.919,1.919,0,0,1-1.214.443,1.893,1.893,0,0,1-1.385-.6.385.385,0,0,0-.646.147,2.306,2.306,0,0,1-2.125,1.6.374.374,0,0,0-.077-.007,2.306,2.306,0,0,1-2.2-1.6.385.385,0,0,0-.647-.148,1.893,1.893,0,0,1-1.385.6,1.924,1.924,0,0,1-1.21-.44l.8-1.27a2.088,2.088,0,0,1,1.773-.975h5.733a2.088,2.088,0,0,1,1.773.975ZM3.314,25.317,8.3,17.445a2.676,2.676,0,0,0,3.144.081,3.073,3.073,0,0,0,2.629,1.624.407.407,0,0,0,.087.01,3.071,3.071,0,0,0,2.716-1.625,2.676,2.676,0,0,0,3.147-.083L25,25.317Z"
                transform="translate(0 0)"
                fill={`${
                  currentRoute === "/explore"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
            </g>
          </svg>
          <span
            className={`${
              currentRoute === "/explore"
                ? "text-[#EA334E]"
                : darkMode
                ? "text-white"
                : "text-[#292C33]"
            }`}
          >
            Explore
          </span>
        </span>
        {/* </span> */}

        <span
          onClick={() => {
            fullPageReload("/create", "window");
          }}
          className="flex flex-col justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_2"
            data-name="Layer 2"
            width="25"
            height="25"
            viewBox="0 0 25 25"
          >
            <g id="_01.Add" data-name="01.Add">
              <path
                id="Pfad_4737"
                data-name="Pfad 4737"
                d="M19.243,0H5.757A5.773,5.773,0,0,0,0,5.757V19.243A5.773,5.773,0,0,0,5.757,25H19.243A5.773,5.773,0,0,0,25,19.243V5.757A5.773,5.773,0,0,0,19.243,0Zm-1.61,13.577H13.839a.22.22,0,0,0-.222.222v3.8a1.117,1.117,0,0,1-2.234,0V13.8a.22.22,0,0,0-.222-.222H7.367a1.117,1.117,0,0,1,0-2.234h3.794a.22.22,0,0,0,.222-.222V7.327a1.117,1.117,0,0,1,2.234,0v3.794a.22.22,0,0,0,.222.227h3.794a1.117,1.117,0,1,1,0,2.234Z"
                fill={
                  currentRoute === "/create"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }
              />
            </g>
          </svg>

          <span
            className={`${
              currentRoute === "/create"
                ? "text-[#EA334E]"
                : darkMode
                ? "text-white"
                : "text-[#292C33]"
            }`}
          >
            Post
          </span>
          {/* </span> */}
        </span>

        <span
          onClick={() => {
            fullPageReload("/communities", "window");
          }}
          className="flex flex-col justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22.318"
            height="25.966"
            viewBox="0 0 22.318 25.966"
          >
            <g id="maneki-neko" transform="translate(-38.923 -24.871)">
              <path
                id="Pfad_4672"
                data-name="Pfad 4672"
                d="M85.59,158.787a2.831,2.831,0,0,1,.762-2.625,4.848,4.848,0,0,1-.692-.613c-.681.472-2.026.95-4.666,1.118a1.714,1.714,0,0,1-3.384,0,13.315,13.315,0,0,1-3.788-.674,3.711,3.711,0,0,0,.052,1.2,1.9,1.9,0,0,0,.6,1.038,3.3,3.3,0,0,0,.756.42,3.034,3.034,0,0,1,1.044.657,2.027,2.027,0,0,1,.495,1.374,3.437,3.437,0,0,1,.862.517,2.365,2.365,0,0,1,.9,1.618,2.511,2.511,0,0,1-.856,2.032c.989,0,2.294,0,3.254,0a2.51,2.51,0,0,1-.855-2.031,2.365,2.365,0,0,1,.9-1.618,4.154,4.154,0,0,1,3.045-.823c1.981.191,3.5,1.536,3.445,3.03a3.754,3.754,0,0,0,.643-.631,3.556,3.556,0,0,0,.731-1.842c-.081.005-.161.009-.241.009A2.983,2.983,0,0,1,85.59,158.787Z"
                transform="translate(-30.587 -114.612)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4673"
                data-name="Pfad 4673"
                d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                transform="translate(-1.724 -151.64)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4674"
                data-name="Pfad 4674"
                d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                transform="translate(-118.026 -121.059)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4675"
                data-name="Pfad 4675"
                d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                transform="translate(-15.497 -155.316)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4676"
                data-name="Pfad 4676"
                d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                transform="translate(-79.156 -152.755)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4677"
                data-name="Pfad 4677"
                d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                transform="translate(-31.275 -110.952)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4678"
                data-name="Pfad 4678"
                d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                transform="translate(-78.796 -109.823)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4679"
                data-name="Pfad 4679"
                d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                transform="translate(-61.481 -112.268)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4680"
                data-name="Pfad 4680"
                d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                transform="translate(-3.394 -100.058)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4681"
                data-name="Pfad 4681"
                d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                transform="translate(0 -114.92)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4682"
                data-name="Pfad 4682"
                d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                transform="translate(-69.591 -76.038)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4683"
                data-name="Pfad 4683"
                d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                transform="translate(-7.675 0)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4684"
                data-name="Pfad 4684"
                d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                transform="translate(-7.785 -17.062)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4685"
                data-name="Pfad 4685"
                d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                transform="translate(-95.102 -10.944)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4686"
                data-name="Pfad 4686"
                d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                transform="translate(-26.748 -10.939)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4687"
                data-name="Pfad 4687"
                d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                transform="translate(-64.598 -67.034)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
              <path
                id="Pfad_4688"
                data-name="Pfad 4688"
                d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                transform="translate(-115.102 -44.975)"
                fill={`${
                  currentRoute === "/communities" ||
                  currentRoute === "/communites/[community]"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "#292C33"
                }`}
              />
            </g>
          </svg>
          <span
            className={`${
              currentRoute === "/communities" ||
              currentRoute === "/communities/[community]"
                ? "text-[#EA334E]"
                : darkMode
                ? "text-white"
                : "text-[#292C33]"
            }`}
          >
            {"Comm."}
          </span>
          {/* </span> */}
        </span>

        <span
          onClick={() => {
            router.push("/earn", "window");
          }}
          className={"flex flex-col justify-center items-center"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24.818"
            height="24.842"
            viewBox="0 0 19.818 22.944"
          >
            <g id="layer1" transform="translate(-1.059 -280.596)">
              <path
                id="path4503"
                d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                transform="translate(0 0)"
                fill={
                  currentRoute == "/earn"
                    ? "#EA334E"
                    : darkMode
                    ? "white"
                    : "black"
                }
              />
            </g>
          </svg>

          <span
            className={`${
              currentRoute === "/earn"
                ? "text-[#EA334E]"
                : darkMode
                ? "text-white"
                : "text-black"
            }`}
          >
            Earn
          </span>
          {/* </span> */}
        </span>
      </div>
    </div>
  );
};

const NavBar = () => {
  const { fullPageReload } = PageLoadOptions();
  const {
    formatGroupName,
    communities,
    imgSrcs,
    setImgSrcs,
    handleImageError,
    searchedWord,
    searchForItem,
    getAllSearchData,
    openSuggestions,
    openUsers,
    setOpenSuggestions,
    setOpenUsers,
    valuesLoaded,
    originalExplorePosts,
    unreadMessagesLength,
    setUnreadMessagesLength,
    imgSrc,
    setImgSrc,
    allUsers,
    userData,
    myProfileRoute,
    NotSignedIn,
    unreadCount,
    currentRoute,
    router,
    darkMode,
  } = NavBarDependencies();
  const registeredAuth = 108;

  return (
    <div
      className={`${
        darkMode
          ? "bg-[#1e1f24] text-white border-[#292C33]"
          : "bg-white border-[#EEEDEF]"
      } border-r fixed invisible lg:visible h-screen py-2 pl-4 min-w-[250px] flex flex-col`}
    >
      <div className="w-full h-full">
        <span
          className={`${
            darkMode ? "bg-[#1e1f24]" : "bg-white"
          } flex flex-col justify-center items-center pb-4 pr-4`}
        >
          {
            <span
              className={`border rounded ${
                darkMode
                  ? "bg-zinc-800 border-[#32353C]"
                  : "bg-white border-[#D0D3DB]"
              } px-2 py-0.5 w-full flex flex-row items-center`}
            >
              <svg
                className="w-4 h-4 text-slate-400"
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
                value={searchedWord}
                onChange={searchForItem}
                onClick={getAllSearchData}
                type="search"
                className={`w-full text-xs ${
                  darkMode ? "text-white" : "text-gray-500"
                } bg-transparent border-none focus:ring-0 placeholder-[#6A6B71]`}
                placeholder="Search for users and more..."
              />
            </span>
          }
          {(openSuggestions !== null || openUsers !== null) && (
            <span className="w-full flex flex-col">
              {openSuggestions !== null && (
                <span className="w-full flex flex-col">
                  <span
                    onClick={() => {
                      fullPageReload(`/search?${searchedWord}`, "window");
                      // if (
                      //   router.pathname !== "/explore" &&
                      //   openSuggestions.foundPosts &&
                      //   openSuggestions.foundPosts.length === 0
                      // ) {
                      //   return;
                      // } else {
                      //   router.push('/search/')
                      //   setPostValues(openSuggestions.foundPosts);
                      // }
                      // if (
                      //   router.pathname === "/explore" &&
                      //   openSuggestions.foundExplorePosts &&
                      //   openSuggestions.foundExplorePosts.length === 0
                      // ) {
                      //   return;
                      // } else {
                      //   setExplorePosts(openSuggestions.foundExplorePosts);
                      // }

                      // setOpenSuggestions(null);
                    }}
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } p-2 flex flex-row items-center cursor-pointer hover:bg-[#EA334E] hover:text-white font-medium`}
                  >
                    {`${
                      router.pathname === "/explore"
                        ? openSuggestions.foundExplorePosts.length
                        : openSuggestions.foundPosts.length
                    } posts found`}
                  </span>
                  <span
                    onClick={() => {
                      if (
                        openSuggestions.foundUsers &&
                        openSuggestions.foundUsers.length === 0
                      ) {
                        return;
                      }
                      const users = openSuggestions.foundUsers;
                      setOpenSuggestions(null);
                      setOpenUsers(users);
                    }}
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } p-2 flex flex-row items-center cursor-pointer hover:bg-[#EA334E] hover:text-white font-medium`}
                  >
                    {`${openSuggestions.foundUsers.length} users found`}
                  </span>
                </span>
              )}
              {openUsers !== null && openUsers.length !== 0 && (
                <span>
                  <span className="py-1 w-full flex justify-end">
                    <span
                      onClick={() => {
                        setOpenUsers(null);
                      }}
                      className={`cursor-pointer text-sm hover:text-[#EA334E] border ${
                        darkMode
                          ? "border-white bg-white text-black"
                          : "border-gray-200 bg-gray-100 text-slate-400"
                      } py-0.5 px-1.5 rounded-2xl`}
                    >
                      {"clear"}
                    </span>
                  </span>

                  <span>
                    {openUsers.slice(0, 8).map((os) => {
                      return (
                        <span
                          key={os.id}
                          onClick={() => {
                            fullPageReload(`/profile/${os.username}`, "window");
                          }}
                          className={`${
                            darkMode ? "text-white" : "text-black"
                          } p-2 flex flex-row items-center cursor-pointer hover:bg-[#EA334E] hover:text-white font-medium`}
                        >
                          <span className="relative h-8 w-8 flex">
                            {valuesLoaded && (
                              <Image
                                src={imgSrcs[os.id]}
                                alt="user"
                                width={30}
                                height={30}
                                className="border border-white rounded-full"
                                onError={() => handleImageError(os.id)}
                              />
                            )}
                          </span>
                          <span>{os.username}</span>
                        </span>
                      );
                    })}
                  </span>
                </span>
              )}
            </span>
          )}
        </span>

        <div
          className={`pb-2 pr-4 text-sm ${
            darkMode ? "text-white" : "text-slate-600"
          } block font-normal`}
        >
          <span
            onClick={() => {
              fullPageReload("/home", "window");
            }}
            className={
              currentRoute == "/home" || currentRoute == "/create"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15.858"
              height="16.987"
              viewBox="0 0 19.858 20.987"
            >
              <g id="torii-gate" transform="translate(0 -42.669)">
                <g
                  id="Gruppe_3248"
                  data-name="Gruppe 3248"
                  transform="translate(0 42.669)"
                >
                  <path
                    id="Pfad_4689"
                    data-name="Pfad 4689"
                    d="M19.759,42.854a.368.368,0,0,0-.4-.173,38.6,38.6,0,0,1-9.425,1.037A38.592,38.592,0,0,1,.5,42.681a.368.368,0,0,0-.4.173.638.638,0,0,0-.069.534l.827,2.623a.44.44,0,0,0,.347.328c.019,0,.84.1,2.083.2l-.109,2.423H2.068a.479.479,0,0,0-.414.525v2.1a.479.479,0,0,0,.414.525h.956L2.483,63.1a.612.612,0,0,0,.112.392.378.378,0,0,0,.3.166H4.551a.471.471,0,0,0,.413-.492l.545-11.051h8.841l.545,11.051a.471.471,0,0,0,.413.492h1.655a.378.378,0,0,0,.3-.166.612.612,0,0,0,.112-.392l-.541-10.985h.956a.479.479,0,0,0,.414-.525v-2.1a.479.479,0,0,0-.414-.525H16.68l-.109-2.423c1.243-.107,2.064-.2,2.083-.2A.44.44,0,0,0,19,46.012l.827-2.623A.638.638,0,0,0,19.759,42.854ZM8.688,48.965H5.662l.1-2.24c.926.057,1.921.1,2.921.125v2.114Zm2.482,0V46.851c1-.023,1.995-.069,2.921-.125l.1,2.24Z"
                    transform="translate(0 -42.669)"
                    fill={
                      currentRoute == "/home" || currentRoute == "/create"
                        ? "#EA334E"
                        : darkMode
                        ? "white"
                        : "#5d6879"
                    }
                  />
                </g>
              </g>
            </svg>

            <span>Home</span>
            {/* </div> */}
          </span>
          <span>
            <span
              // href={"/explore"}
              onClick={() => {
                fullPageReload("/explore", "window");
              }}
              className={
                currentRoute == "/explore"
                  ? `${
                      darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                    } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                  : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16.318"
                height="16.318"
                viewBox="0 0 22.318 22.318"
              >
                <g
                  id="Layer_32"
                  data-name="Layer 32"
                  transform="translate(-3 -2.998)"
                >
                  <path
                    id="Pfad_4696"
                    data-name="Pfad 4696"
                    d="M24.933,9.54a.77.77,0,0,1-1.418.414.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093A.377.377,0,0,0,20.4,9.66a.385.385,0,0,0-.294.162A1.154,1.154,0,1,1,19.161,8a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,0,1,.77.77ZM5.309,5.692a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,1,1-.648,1.184.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093.385.385,0,0,0-.6.033,1.154,1.154,0,1,1-.94-1.821ZM3,14.158A11.126,11.126,0,0,1,4.5,8.587a1.9,1.9,0,0,0,2.09-.3,2.369,2.369,0,0,0,2.7.1,1.539,1.539,0,1,0,1.024-2.69c-.044,0-.088,0-.131.006a2.286,2.286,0,0,0-1.3-1.367A11.132,11.132,0,0,1,22.266,6.5a2.283,2.283,0,0,0-2.279.917,1.9,1.9,0,0,0-.825-.185,1.924,1.924,0,1,0,1.277,3.36,2.369,2.369,0,0,0,2.7.1,1.52,1.52,0,0,0,1.691.231,11.074,11.074,0,0,1-1.75,9.922l-3.633-5.738a2.854,2.854,0,0,0-2.423-1.333H11.292a2.854,2.854,0,0,0-2.424,1.333L5.237,20.843A11.168,11.168,0,0,1,3,14.158Zm16.605,2.635a1.919,1.919,0,0,1-1.214.443,1.893,1.893,0,0,1-1.385-.6.385.385,0,0,0-.646.147,2.306,2.306,0,0,1-2.125,1.6.374.374,0,0,0-.077-.007,2.306,2.306,0,0,1-2.2-1.6.385.385,0,0,0-.647-.148,1.893,1.893,0,0,1-1.385.6,1.924,1.924,0,0,1-1.21-.44l.8-1.27a2.088,2.088,0,0,1,1.773-.975h5.733a2.088,2.088,0,0,1,1.773.975ZM3.314,25.317,8.3,17.445a2.676,2.676,0,0,0,3.144.081,3.073,3.073,0,0,0,2.629,1.624.407.407,0,0,0,.087.01,3.071,3.071,0,0,0,2.716-1.625,2.676,2.676,0,0,0,3.147-.083L25,25.317Z"
                    transform="translate(0 0)"
                    fill={
                      currentRoute == "/explore"
                        ? "#EA334E"
                        : darkMode
                        ? "white"
                        : "#5d6879"
                    }
                  />
                </g>
              </svg>

              <span>Explore</span>
              {/* </div> */}
            </span>
          </span>
          <span
            // href={"/search"}
            onClick={() => {
              fullPageReload("/search", "window");
            }}
            className={
              currentRoute == "/search"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              className={`${
                currentRoute == "/search"
                  ? "#EA334E"
                  : darkMode
                  ? "text-white"
                  : "text-[#5d6879]"
              } rotate-12`}
              width="17.858"
              height="18.987"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>

            <span>Search</span>
            {/* </div> */}
          </span>
          <span
            // href={"/communities"}
            onClick={() => {
              fullPageReload("/communities"), "window"
            }}
            className={
              currentRoute == "/communities" ||
              currentRoute == "/communities/[community]"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17.318"
              height="20.966"
              viewBox="0 0 22.318 25.966"
            >
              <g id="maneki-neko" transform="translate(-38.923 -24.871)">
                <path
                  id="Pfad_4672"
                  data-name="Pfad 4672"
                  d="M85.59,158.787a2.831,2.831,0,0,1,.762-2.625,4.848,4.848,0,0,1-.692-.613c-.681.472-2.026.95-4.666,1.118a1.714,1.714,0,0,1-3.384,0,13.315,13.315,0,0,1-3.788-.674,3.711,3.711,0,0,0,.052,1.2,1.9,1.9,0,0,0,.6,1.038,3.3,3.3,0,0,0,.756.42,3.034,3.034,0,0,1,1.044.657,2.027,2.027,0,0,1,.495,1.374,3.437,3.437,0,0,1,.862.517,2.365,2.365,0,0,1,.9,1.618,2.511,2.511,0,0,1-.856,2.032c.989,0,2.294,0,3.254,0a2.51,2.51,0,0,1-.855-2.031,2.365,2.365,0,0,1,.9-1.618,4.154,4.154,0,0,1,3.045-.823c1.981.191,3.5,1.536,3.445,3.03a3.754,3.754,0,0,0,.643-.631,3.556,3.556,0,0,0,.731-1.842c-.081.005-.161.009-.241.009A2.983,2.983,0,0,1,85.59,158.787Z"
                  transform="translate(-30.587 -114.612)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={
                    currentRoute == "/communities" ||
                    currentRoute == "/communities/[community]"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
              </g>
            </svg>

            <span>Communities</span>
            {/* </div> */}
          </span>

          <span
            // href={"/leaderboard"}
            onClick={() => {
              fullPageReload("/leaderboard", "window");
            }}
            className={
              currentRoute == "/leaderboard"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18.399"
              height="20.944"
              viewBox="0 0 18.399 20.944"
            >
              <g id="podium" transform="translate(-4.768)">
                <g
                  id="Gruppe_3296"
                  data-name="Gruppe 3296"
                  transform="translate(9.715)"
                >
                  <g id="Gruppe_3295" data-name="Gruppe 3295">
                    <path
                      id="Pfad_4752"
                      data-name="Pfad 4752"
                      d="M148.347,3.429a.637.637,0,0,0-.5-.466l-2.2-.357L144.673.382a.587.587,0,0,0-1.1,0l-.983,2.224-2.2.357a.637.637,0,0,0-.5.466.741.741,0,0,0,.155.7l1.59,1.731-.376,2.444a.724.724,0,0,0,.244.67.561.561,0,0,0,.646.052l1.965-1.154,1.964,1.154a.56.56,0,0,0,.646-.052.724.724,0,0,0,.244-.67L146.6,5.862l1.59-1.731A.743.743,0,0,0,148.347,3.429Z"
                      transform="translate(-139.869)"
                      fill={
                        currentRoute == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3298"
                  data-name="Gruppe 3298"
                  transform="translate(10.901 10.439)"
                >
                  <g id="Gruppe_3297" data-name="Gruppe 3297">
                    <path
                      id="Pfad_4753"
                      data-name="Pfad 4753"
                      d="M177.776,255.185h-4.906a.652.652,0,0,0-.613.685v9.82h6.133v-9.82A.652.652,0,0,0,177.776,255.185Z"
                      transform="translate(-172.256 -255.185)"
                      fill={
                        currentRoute == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3300"
                  data-name="Gruppe 3300"
                  transform="translate(4.768 13.179)"
                >
                  <g id="Gruppe_3299" data-name="Gruppe 3299">
                    <path
                      id="Pfad_4754"
                      data-name="Pfad 4754"
                      d="M5.381,322.18a.652.652,0,0,0-.613.685V329.4a.516.516,0,0,0,.485.542H9.674V322.18Z"
                      transform="translate(-4.768 -322.18)"
                      fill={
                        currentRoute == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3302"
                  data-name="Gruppe 3302"
                  transform="translate(18.261 15.92)"
                >
                  <g id="Gruppe_3301" data-name="Gruppe 3301">
                    <path
                      id="Pfad_4755"
                      data-name="Pfad 4755"
                      d="M377.535,389.175h-4.293V394.2h4.422a.516.516,0,0,0,.485-.542v-3.8A.652.652,0,0,0,377.535,389.175Z"
                      transform="translate(-373.242 -389.175)"
                      fill={
                        currentRoute == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
              </g>
            </svg>
            <span>Leaderboard</span>
            {/* </div> */}
          </span>

          <span
            // href={"/earn"}
            onClick={() => {
              fullPageReload("/earn", "window");
            }}
            className={
              currentRoute == "/earn"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19.818"
              height="19.842"
              viewBox="0 0 19.818 22.944"
            >
              <g id="layer1" transform="translate(-1.059 -280.596)">
                <path
                  id="path4503"
                  d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                  transform="translate(0 0)"
                  fill={
                    currentRoute == "/earn"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
              </g>
            </svg>

            <span>{"Earn & Shop"}</span>
            {/* </div> */}
          </span>

          <span
            // href={"/settings"}
            onClick={() => {
              fullPageReload("/settings", "window");
            }}
            className={
              currentRoute == "/settings"
                ? `${
                    darkMode ? "bg-[#25272D]" : "bg-[#F9F9F9]"
                  } rounded text-[#EA334E] p-2.5 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-2 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20.116"
              height="20.113"
              viewBox="0 0 22.116 22.113"
            >
              <g
                id="ninja-blade"
                transform="matrix(0.966, 0.259, -0.259, 0.966, 1.141, -6.117)"
              >
                <path
                  id="Pfad_4702"
                  data-name="Pfad 4702"
                  d="M9.052,15.187a1.2,1.2,0,0,0-.953.686L5.033,22.538a.359.359,0,0,0,.477.477L12.052,20a1.2,1.2,0,0,0,.69-.982,1.23,1.23,0,0,1,2.448-.025,1.2,1.2,0,0,0,.686.953l6.666,3.069a.353.353,0,0,0,.148.032.364.364,0,0,0,.256-.1.352.352,0,0,0,.072-.4L20,16a1.2,1.2,0,0,0-.982-.69,1.228,1.228,0,0,1-.852-1.993,1.206,1.206,0,0,1,.823-.451,1.209,1.209,0,0,0,.953-.686l3.069-6.669a.359.359,0,0,0-.477-.477L16,8.041a1.207,1.207,0,0,0-.693.986,1.221,1.221,0,0,1-.426.827,1.227,1.227,0,0,1-2.018-.8,1.209,1.209,0,0,0-.686-.95L5.506,5.029a.359.359,0,0,0-.477.477l3.015,6.543a1.186,1.186,0,0,0,.982.69,1.233,1.233,0,0,1,.906,1.917,1.189,1.189,0,0,1-.881.531Zm3.69-2.441a1.81,1.81,0,1,1,1.282,3.091,1.813,1.813,0,0,1-1.282-3.091Z"
                  transform="translate(0 0)"
                  className="text-zinc-200"
                  fill={
                    currentRoute == "/settings"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  className="text-zinc-200"
                  fill={
                    currentRoute == "/settings"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
              </g>
            </svg>

            <span>Settings</span>
          </span>
        </div>
        {communities &&
          communities.length > 0 &&
          (communities?.filter((community) => community.isAMember) || [])
            .length > 0 && (
            <div
              className={`${
                darkMode ? "text-white" : "text-[#5D6879]"
              } flex flex-col py-3 pr-4`}
            >
              <span
                className={`flex flex-col pt-3 border-t ${
                  darkMode ? "border-[#32353C]" : "border-[#D0D3DB]"
                }`}
              >
                <span className="pb-2 text-sm font-light">My Communities</span>
                {communities
                  .filter((myCommunity) => myCommunity.isAMember)
                  .slice(0, 3)
                  .map((community) => {
                    return (
                      <span
                        key={community.id}
                        onClick={() => {
                          fullPageReload(
                            `/communities/${community.name}`.replace(" ", "+"), "window"
                          );
                        }}
                        className={`${
                          darkMode ? "bg-[#1e1f24]" : "bg-white"
                        } cursor-pointer w-full flex flex-row rounded`}
                      >
                        <span className="relative h-8 w-8 flex my-auto">
                          <Image
                            src={community.avatar}
                            alt="post"
                            height={35}
                            width={35}
                            className={`rounded-full border ${
                              darkMode ? "border-white" : "border-black"
                            }`}
                          />
                        </span>
                        <span className="pl-1.5 flex flex-col text-sm">
                          <span className="font-normal">
                            {formatGroupName(community.name)}
                          </span>

                          <span className="font-light text-[0.7rem]">
                            {`${community.membersLength} ${
                              community.membersLength === 1
                                ? "Member"
                                : "Members"
                            }`}
                          </span>
                        </span>
                      </span>
                    );
                  })}
              </span>
              <span
                onClick={() => {
                  fullPageReload("/communities", "window");
                }}
                className={`cursor-pointer pt-1 pb-4 mb-3 border-b ${
                  darkMode ? "border-[#32353C]" : "border-[#D0D3DB]"
                } font-light text-[0.7rem] underline`}
              >
                View all communities
              </span>
            </div>
          )}

        <div className="text-[0.8rem] font-semibold w-full flex justify-center pr-4">
          <span
            onClick={() => {
              fullPageReload("/create", "window");
            }}
            className="rounded cursor-pointer w-full bg-[#EA334E] py-2 text-center text-white"
          >
            POST SOMETHING
          </span>
        </div>
      </div>
      {/* <span
        className={`${
          darkMode ? "text-white" : "text-black"
        } px-2 text-[11px] font-medium flex flex-col`}
      >
        <span className="flex flex-row space-x-1 items-center"> */}
      {/* <svg
            width="10px"
            height="10px"
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            className="iconify iconify--noto"
            preserveAspectRatio="xMidYMid meet"
          >
            <circle cx={63.93} cy={64} r={60} fill="#689f38" />
            <circle cx={60.03} cy={63.1} r={56.1} fill="#7cb342" />
            <path
              d="M23.93 29.7c4.5-7.1 14.1-13 24.1-14.8c2.5-.4 5-.6 7.1.2c1.6.6 2.9 2.1 2 3.8c-.7 1.4-2.6 2-4.1 2.5a44.64 44.64 0 0 0-23 17.4c-2 3-5 11.3-8.7 9.2c-3.9-2.3-3.1-9.5 2.6-18.3z"
              fill="#aed581"
            />
          </svg> */}
      {/* <span>{`Total Users Online: ${Math && placeholderUsers}`}</span> */}
      {/* </span> */}
      {/* {allUsers && (
          <span>{`Total Users Registered: ${
            allUsers.length + registeredAuth
          }`}</span>
        )} */}
      {/* </span> */}

     
      {/* <span className="bottom-1 absolute w-full space-x-2 flex flex-row bg-transparent justify-center items-center pb-2 px-4">
        <span
          className="cursor-pointer"
          onClick={() => {
            fullPageReload("https://x.com/luffyinutoken", "_blank");
          }}
        >
          <X width={4} height={4} />
        </span>
        <span
          className="cursor-pointer"
          onClick={() => {
            fullPageReload("https://t.me/LUFFYTOKEN_OFFICIAL", "_blank");
          }}
        >
          <Telegram width={6} height={6} />
        </span>
      </span> */}
      <span></span>
    </div>
  );
};
export default NavBar;
