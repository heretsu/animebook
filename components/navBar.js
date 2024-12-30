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

const NavBarDependencies = () => {
  const {
    allUsers,
    userData,
    myProfileRoute,
    NotSignedIn,
    notifyUserObject,
    setNotifyUserObject,
    userNumId,
    darkMode,
  } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(null);
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

  const [imgSrc, setImgSrc] = useState("");

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
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
  }, [initialized, router.pathname, notifyUserObject, userData]);

  return {
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
  const { imgSrc, setImgSrc, unreadCount, currentRoute, router, darkMode } =
    NavBarDependencies();

  return (
    <div
      id="anime-book-font"
      className="lg:invisible fixed text-[#5d6879] text-sm bottom-0 w-full"
    >
      <div
        id="navShadow2"
        className={`${
          darkMode ? "bg-black" : "bg-gray-100"
        } mx-auto w-full flex flex-row justify-between items-center py-2 px-3`}
      >
        <span
          onClick={() => {
            fullPageReload("/home");
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
                    currentRoute === "/home" || currentRoute === "/create"
                      ? "#04dbc4"
                      : "#5d6879"
                  }`}
                />
              </g>
            </g>
          </svg>
          {/* <span
            className={`${
              currentRoute === "/home" ? "text-pastelGreen" : "text-[#5d6879]"
            }`}
          >
            Home
          </span> */}
        </span>

        <span
          onClick={() => {
            fullPageReload("/explore");
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
                fill={`${currentRoute === "/explore" ? "#04dbc4" : "#5d6879"}`}
              />
            </g>
          </svg>
          {/* <span
            className={`${
              currentRoute === "/explore"
                ? "text-pastelGreen"
                : "text-[#5d6879]"
            }`}
          >
            Explore
          </span> */}
        </span>

        <span
          onClick={() => {
            fullPageReload("/search");
          }}
          className="flex flex-col justify-center items-center"
        >
          <svg
            className="text-[#5d6879] rotate-12"
            width="19.858"
            height="20.987"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke={`${currentRoute === "/search" ? "#04dbc4" : "#5d6879"}`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>

          {/* <span
            className={`${
              currentRoute === "/search"
                ? "text-pastelGreen"
                : "text-[#5d6879]"
            }`}
          >
            Search
          </span> */}
        </span>

        <span
          onClick={() => {
            router.push("/communities");
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
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
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
              />
            </g>
          </svg>
          {/* <span
            className={`${
              currentRoute === "/communities" ||
              currentRoute === "/communities/[community]"
                ? "text-pastelGreen"
                : "text-[#5d6879]"
            }`}
          >
            Communites
          </span> */}
        </span>

        <span
          onClick={() => {
            router.push("/notifications");
          }}
          className={"flex flex-col justify-center items-center"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22.317"
            height="22.337"
            viewBox="0 0 22.317 22.337"
          >
            <path
              id="Shape"
              d="M22.286,7.686A11.637,11.637,0,0,0,11.163,0,11.637,11.637,0,0,0,.04,7.686a.744.744,0,0,0,.335.87l9.639,6.026c.134.082.052-.019.052.286a1.116,1.116,0,0,0,.212.655L8.734,16.64a.372.372,0,0,0-.145.472A2.485,2.485,0,0,0,10.795,18.6a5.245,5.245,0,0,0,0,.83,1.116,1.116,0,0,0-.632,1.529l-.744.744a.372.372,0,1,0,.528.525l.744-.744a.551.551,0,0,0,.108.045v.42a.372.372,0,1,0,.744,0V21.5a.551.551,0,0,0,.108-.045l.744.744a.372.372,0,0,0,.528-.525l-.744-.744a1.116,1.116,0,0,0-.644-1.529,5.245,5.245,0,0,0,0-.83,2.485,2.485,0,0,0,2.206-1.488.372.372,0,0,0-.126-.458L12.07,15.513a1.116,1.116,0,0,0,.208-.632c0-.294-.078-.2.052-.286l9.62-6.038a.744.744,0,0,0,.335-.87ZM10.791,1.86a.372.372,0,1,1,.744,0V6.7a.372.372,0,1,1-.744,0ZM5.252,4.252a.372.372,0,1,1,.662-.331L7.4,6.9a.372.372,0,1,1-.662.331Zm1.533,7.44a4.412,4.412,0,0,1,.424-.852,5.052,5.052,0,0,1,.841-1.023l2.132,4Zm1.86-2.355a6.294,6.294,0,0,1,.978-.51,4.669,4.669,0,0,1,1.168-.272v4.836Zm2.79,11.368a.5.5,0,1,0-.007.011Zm-.272-5.454a.372.372,0,1,1,.372-.372A.372.372,0,0,1,11.163,15.252Zm.372-1.86V8.556a4.732,4.732,0,0,1,1.116.242,6.276,6.276,0,0,1,1.056.539Zm.61.439,2.132-4a4.836,4.836,0,0,1,.714.83,4.765,4.765,0,0,1,.551,1.045Zm4.929-9.579L15.586,7.228a.369.369,0,1,1-.662-.324l1.488-2.976a.372.372,0,1,1,.662.331Z"
              transform="translate(-0.004)"
              fill={`${
                currentRoute === "/notifications" ? "#04dbc4" : "#5d6879"
              }`}
            />
          </svg>
          <span className="absolute bg-pastelGreen text-xs h-fit font-semibold text-white px-1.5 bottom-6 rounded-md">
            {router.pathname !== "/notifications" &&
              unreadCount != 0 &&
              unreadCount}
          </span>

          {/* <span
            className={`${
              currentRoute === "/notifications"
                ? "text-pastelGreen"
                : "text-[#5d6879]"
            }`}
          >
            Notifications
          </span> */}
        </span>

        <span
          onClick={() => {
            router.push("/inbox");
          }}
          className={"flex flex-col justify-center items-center"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22.781"
            height="19.631"
            viewBox="0 0 22.781 19.631"
          >
            <g id="discuss" transform="translate(0.5 -36.519)">
              <path
                id="Pfad_1782"
                data-name="Pfad 1782"
                d="M120.18,43.57V42.337a2.129,2.129,0,0,1,2.127-2.127h6.062V37.87a.851.851,0,0,0-.851-.851H117.351a.851.851,0,0,0-.851.851v5.7Z"
                transform="translate(-111.544)"
                fill={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                stroke={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                strokeWidth="1"
              />
              <path
                id="Pfad_1783"
                data-name="Pfad 1783"
                d="M10.763,227.4a2.129,2.129,0,0,1-2.127-2.127v-4.254H.851A.851.851,0,0,0,0,221.87v6.764a.851.851,0,0,0,.851.851H3.106V231.4a.426.426,0,0,0,.427.426.419.419,0,0,0,.254-.086l2.988-2.252h4.243a.851.851,0,0,0,.851-.851V227.4H10.763Z"
                transform="translate(0 -176.172)"
                fill={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                stroke={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                strokeWidth="1"
              />
              <path
                id="Pfad_1784"
                data-name="Pfad 1784"
                d="M244.018,142.019H233.851a.851.851,0,0,0-.851.851v6.764a.851.851,0,0,0,.851.851h4.243l2.988,2.252a.419.419,0,0,0,.254.086.426.426,0,0,0,.427-.426v-1.912h2.255a.851.851,0,0,0,.851-.851V142.87A.851.851,0,0,0,244.018,142.019Z"
                transform="translate(-223.088 -100.533)"
                fill={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                stroke={`${
                  currentRoute === "/inbox" ||
                  currentRoute === "/inbox/[message]"
                    ? "#04dbc4"
                    : "#5d6879"
                }`}
                strokeWidth="1"
              />
            </g>
          </svg>
          {/* <span
            className={`${
              currentRoute === "/inbox" || currentRoute === "/inbox/[message]"
                ? "text-pastelGreen"
                : "text-[#5d6879]"
            }`}
          >
            Messages
          </span> */}
        </span>
      </div>
    </div>
  );
};

const NavBar = () => {
  const { fullPageReload } = PageLoadOptions();
  const {
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
        darkMode ? "bg-[#1e1f24] text-white" : "bg-white"
      } fixed invisible lg:visible h-screen py-2 flex flex-col`}
    >
      <div className="w-full h-full">
        <div
          onClick={() => {
            fullPageReload("/home");
          }}
          className="flex justify-start items-center"
        >
          <Image
            src={navLogo}
            alt="anime book colored logo"
            height={200}
            width={200}
            className="bg-[#04dbc4]"
          />
        </div>

        <div
          className={`pb-2 text-sm ${
            darkMode ? "text-white" : "text-slate-600"
          } block font-semibold`}
        >
          <div
            onClick={() => {
              fullPageReload("/home");
            }}
            className={
              currentRoute == "/home" || currentRoute == "/create"
                ? `${
                    darkMode
                      ? "bg-black border-l-2 border-pastelGreen "
                      : "bg-slate-100 border-l-2 border-slate-700"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
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
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
            </svg>

            <span>Home</span>
          </div>
          <div
            onClick={() => {
              fullPageReload("/explore");
            }}
            className={
              currentRoute == "/explore"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
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
                  fill={darkMode ? "white" : "#5d6879"}
                />
              </g>
            </svg>

            <span>Explore</span>
          </div>
          <div
            onClick={() => {
              fullPageReload("/search");
            }}
            className={
              currentRoute == "/search"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5  font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              className={`${
                darkMode ? "text-white" : "text-[#5d6879]"
              } rotate-12`}
              width="19.858"
              height="20.987"
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
          </div>
          <div
            onClick={() => {
              fullPageReload("/communities");
            }}
            className={
              currentRoute == "/communities" ||
              currentRoute == "/communities/[community]"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
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
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
              </g>
            </svg>

            <span>Communities</span>
          </div>

          <div
            onClick={() => {
              router.push("/notifications");
            }}
            className={
              currentRoute == "/notifications"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.317"
              height="22.337"
              viewBox="0 0 22.317 22.337"
            >
              <path
                id="Shape"
                d="M22.286,7.686A11.637,11.637,0,0,0,11.163,0,11.637,11.637,0,0,0,.04,7.686a.744.744,0,0,0,.335.87l9.639,6.026c.134.082.052-.019.052.286a1.116,1.116,0,0,0,.212.655L8.734,16.64a.372.372,0,0,0-.145.472A2.485,2.485,0,0,0,10.795,18.6a5.245,5.245,0,0,0,0,.83,1.116,1.116,0,0,0-.632,1.529l-.744.744a.372.372,0,1,0,.528.525l.744-.744a.551.551,0,0,0,.108.045v.42a.372.372,0,1,0,.744,0V21.5a.551.551,0,0,0,.108-.045l.744.744a.372.372,0,0,0,.528-.525l-.744-.744a1.116,1.116,0,0,0-.644-1.529,5.245,5.245,0,0,0,0-.83,2.485,2.485,0,0,0,2.206-1.488.372.372,0,0,0-.126-.458L12.07,15.513a1.116,1.116,0,0,0,.208-.632c0-.294-.078-.2.052-.286l9.62-6.038a.744.744,0,0,0,.335-.87ZM10.791,1.86a.372.372,0,1,1,.744,0V6.7a.372.372,0,1,1-.744,0ZM5.252,4.252a.372.372,0,1,1,.662-.331L7.4,6.9a.372.372,0,1,1-.662.331Zm1.533,7.44a4.412,4.412,0,0,1,.424-.852,5.052,5.052,0,0,1,.841-1.023l2.132,4Zm1.86-2.355a6.294,6.294,0,0,1,.978-.51,4.669,4.669,0,0,1,1.168-.272v4.836Zm2.79,11.368a.5.5,0,1,0-.007.011Zm-.272-5.454a.372.372,0,1,1,.372-.372A.372.372,0,0,1,11.163,15.252Zm.372-1.86V8.556a4.732,4.732,0,0,1,1.116.242,6.276,6.276,0,0,1,1.056.539Zm.61.439,2.132-4a4.836,4.836,0,0,1,.714.83,4.765,4.765,0,0,1,.551,1.045Zm4.929-9.579L15.586,7.228a.369.369,0,1,1-.662-.324l1.488-2.976a.372.372,0,1,1,.662.331Z"
                transform="translate(-0.004)"
                fill={darkMode ? "white" : "#5d6879"}
              />
            </svg>

            <span className="flex w-full justify-between items-center">
              <span>Notifications</span>
              <span className="bg-pastelGreen text-[0.77rem] h-fit font-bold text-white px-1.5 rounded-md">
                {router.pathname !== "/notifications" &&
                  unreadCount != 0 &&
                  unreadCount}
              </span>
            </span>
          </div>

          <div
            onClick={() => {
              router.push("/inbox");
            }}
            className={
              currentRoute == "/inbox" || currentRoute == "/inbox/[message]"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.781"
              height="19.631"
              viewBox="0 0 22.781 19.631"
            >
              <g id="discuss" transform="translate(0.5 -36.519)">
                <path
                  id="Pfad_1782"
                  data-name="Pfad 1782"
                  d="M120.18,43.57V42.337a2.129,2.129,0,0,1,2.127-2.127h6.062V37.87a.851.851,0,0,0-.851-.851H117.351a.851.851,0,0,0-.851.851v5.7Z"
                  transform="translate(-111.544)"
                  fill={darkMode ? "white" : "#5d6879"}
                  stroke={darkMode ? "white" : "#5d6879"}
                  strokeWidth="1"
                />
                <path
                  id="Pfad_1783"
                  data-name="Pfad 1783"
                  d="M10.763,227.4a2.129,2.129,0,0,1-2.127-2.127v-4.254H.851A.851.851,0,0,0,0,221.87v6.764a.851.851,0,0,0,.851.851H3.106V231.4a.426.426,0,0,0,.427.426.419.419,0,0,0,.254-.086l2.988-2.252h4.243a.851.851,0,0,0,.851-.851V227.4H10.763Z"
                  transform="translate(0 -176.172)"
                  fill={darkMode ? "white" : "#5d6879"}
                  stroke={darkMode ? "white" : "#5d6879"}
                  strokeWidth="1"
                />
                <path
                  id="Pfad_1784"
                  data-name="Pfad 1784"
                  d="M244.018,142.019H233.851a.851.851,0,0,0-.851.851v6.764a.851.851,0,0,0,.851.851h4.243l2.988,2.252a.419.419,0,0,0,.254.086.426.426,0,0,0,.427-.426v-1.912h2.255a.851.851,0,0,0,.851-.851V142.87A.851.851,0,0,0,244.018,142.019Z"
                  transform="translate(-223.088 -100.533)"
                  fill={darkMode ? "white" : "#5d6879"}
                  stroke={darkMode ? "white" : "#5d6879"}
                  strokeWidth="1"
                />
              </g>
            </svg>
            <span>Messages</span>
          </div>

          <div
            onClick={() => {
              router.push("/leaderboard");
            }}
            className={
              currentRoute == "/leaderboard"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="22.318px"
              height="25.966px"
              viewBox="0 0 180.763 180.763"
              className="text-slate-200"
              fill={darkMode ? "currentColor" : "#5d6879"}
              style={{
                enableBackground: "new 0 0 180.763 180.763",
              }}
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path d="M30.862,53.125c7.155,0,12.976-8.312,12.976-15.469c0-7.17-5.821-12.982-12.976-12.982 c-7.173,0-12.982,5.812-12.982,12.982C17.88,44.812,23.689,53.125,30.862,53.125z" />
                  <path d="M56.267,62.167c-0.091-0.375-0.171-0.749-0.347-1.093c-0.134-0.256-0.329-0.454-0.505-0.686 c-0.231-0.304-0.444-0.605-0.737-0.861c-0.231-0.192-0.505-0.311-0.767-0.466c-0.262-0.149-0.481-0.368-0.78-0.475 c-0.462-0.167-10.79-3.873-20.289-4.357l-1.303,2.606h-0.031l3.453,26.923l-4.098,7.17l-4.11-7.17l3.453-26.923h-0.037 l-1.303-2.606c-9.493,0.493-19.814,4.189-20.283,4.357c-0.298,0.107-0.518,0.326-0.785,0.481 c-0.262,0.149-0.524,0.262-0.755,0.454c-0.305,0.255-0.518,0.569-0.755,0.88c-0.165,0.225-0.347,0.411-0.487,0.66 c-0.183,0.351-0.262,0.725-0.359,1.111c-0.061,0.237-0.189,0.43-0.219,0.667l-4.11,36.949c-0.311,2.819,1.717,5.358,4.542,5.675 c0.189,0.019,0.377,0.03,0.572,0.03c2.582,0,4.798-1.942,5.091-4.561l3.745-33.661c0.433-0.131,0.914-0.268,1.425-0.411v35.028 l-4.08,50.796c-0.274,3.386,2.247,6.356,5.639,6.631c0.17,0.013,0.335,0.013,0.505,0.013c3.172,0,5.87-2.442,6.132-5.664 l3.69-45.905c0.767,0.335,1.602,0.529,2.49,0.529c0.883,0,1.717-0.194,2.479-0.529l3.69,45.905 c0.262,3.222,2.959,5.664,6.132,5.664c0.17,0,0.329,0,0.505-0.013c3.392-0.274,5.919-3.245,5.645-6.631l-4.086-50.796V66.861 c0.512,0.144,0.987,0.28,1.419,0.411l3.745,33.661c0.292,2.618,2.509,4.561,5.09,4.561c0.195,0,0.384-0.012,0.579-0.03 c2.813-0.311,4.841-2.855,4.53-5.675L56.486,62.84C56.461,62.596,56.333,62.396,56.267,62.167z" />
                  <path d="M116.793,38.885c-0.024-0.255-0.11-0.462-0.171-0.618l-0.109-0.332c-0.085-0.353-0.177-0.721-0.378-1.114 c-0.128-0.225-0.273-0.42-0.432-0.618l-0.201-0.262c-0.22-0.301-0.451-0.612-0.792-0.904c-0.194-0.167-0.42-0.292-0.651-0.417 l-0.219-0.125c-0.079-0.046-0.152-0.095-0.22-0.144c-0.177-0.125-0.39-0.283-0.682-0.387c-1.09-0.387-10.613-3.717-19.771-4.335 c6.363-1.757,10.984-9.277,10.984-15.869C104.151,6.174,97.978,0,90.396,0c-7.587,0-13.762,6.174-13.762,13.761 c0,6.591,4.622,14.112,10.985,15.869c-9.152,0.624-18.682,3.948-19.766,4.335c-0.292,0.104-0.518,0.268-0.7,0.393 c-0.073,0.049-0.14,0.107-0.219,0.144l-0.201,0.112c-0.207,0.113-0.438,0.234-0.652,0.411c-0.341,0.286-0.584,0.615-0.883,1.017 l-0.134,0.167c-0.146,0.186-0.298,0.374-0.408,0.6c-0.201,0.378-0.292,0.752-0.39,1.114l0.712,0.356l-0.816-0.019 c-0.061,0.155-0.146,0.356-0.17,0.603L59.89,75.815c-0.171,1.571,0.268,3.118,1.26,4.345c0.986,1.236,2.393,2.01,3.964,2.183 c3.227,0.326,6.168-2,6.527-5.218l3.604-32.498v33.302l-4.08,50.796c-0.152,1.839,0.426,3.642,1.632,5.054 c1.2,1.413,2.875,2.271,4.731,2.424c3.854,0.268,7.161-2.606,7.465-6.363l3.617-44.901c1.169,0.316,2.405,0.316,3.58,0 l3.617,44.901c0.286,3.574,3.312,6.388,6.898,6.388c0.189,0,0.372-0.013,0.566-0.024c1.846-0.152,3.526-1.011,4.731-2.424 c1.2-1.412,1.778-3.203,1.632-5.054l-4.086-50.732V44.621l3.611,32.498c0.354,3.218,3.282,5.55,6.521,5.218 c3.245-0.362,5.59-3.285,5.225-6.527L116.793,38.885z M78.193,13.773c0-6.729,5.475-12.203,12.203-12.203 s12.196,5.474,12.196,12.203c0,6.655-5.443,14.69-12.196,14.69C83.637,28.463,78.193,20.429,78.193,13.773z M90.597,32.187h-0.407 l-1.176-2.35c0.463,0.061,0.914,0.191,1.389,0.191s0.913-0.131,1.376-0.191L90.597,32.187z M93.69,59.722l-3.294,5.766 l-3.301-5.766l3.301-25.69L93.69,59.722z M115.508,80.815c-2.351,0.286-4.536-1.47-4.805-3.845l-3.738-33.658l-0.061-0.518 l-2.923-0.843v36.121l4.086,50.792c0.115,1.432-0.342,2.819-1.267,3.916c-0.932,1.096-2.235,1.76-3.66,1.875 c-2.947,0.207-5.565-2.01-5.803-4.932L93.562,82.73l-1.005,0.441c-1.406,0.618-2.94,0.618-4.348,0l-1.004-0.441l-3.775,46.994 c-0.225,2.776-2.582,4.956-5.358,4.956c-0.146,0-0.292-0.013-0.432-0.024c-1.438-0.115-2.74-0.779-3.666-1.875 c-0.932-1.097-1.382-2.484-1.267-3.916l4.086-50.859v-36.06l-2.923,0.843l-3.787,34.176c-0.262,2.368-2.442,4.125-4.811,3.845 c-1.157-0.131-2.192-0.697-2.917-1.607c-0.73-0.91-1.053-2.046-0.932-3.206l4.104-36.949c0.006-0.04,0.036-0.125,0.067-0.195 c0.042-0.119,0.097-0.234,0.17-0.536c0.073-0.298,0.134-0.56,0.256-0.779c0.067-0.131,0.158-0.231,0.243-0.344l0.256-0.329 c0.189-0.25,0.347-0.469,0.554-0.643c0.091-0.082,0.225-0.149,0.384-0.237l0.255-0.137c0.122-0.067,0.226-0.144,0.341-0.226 c0.122-0.085,0.231-0.161,0.323-0.198c0.426-0.155,10.382-3.706,19.552-4.284l1.004,2l-3.452,26.887l4.914,8.598l4.914-8.58 l-3.459-26.893l0.999-1.988c9.176,0.578,19.132,4.128,19.552,4.284c0.092,0.031,0.195,0.113,0.323,0.192 c0.109,0.082,0.225,0.158,0.334,0.225l0.263,0.143c0.14,0.076,0.279,0.144,0.383,0.237c0.201,0.168,0.366,0.387,0.628,0.743 l0.17,0.21c0.092,0.122,0.189,0.231,0.262,0.356c0.11,0.225,0.171,0.481,0.293,0.929c0.03,0.134,0.079,0.256,0.128,0.38 c0.03,0.076,0.061,0.158,0.066,0.201l4.11,36.949C119.618,78.397,117.895,80.547,115.508,80.815z" />
                  <path d="M149.93,53.125c7.155,0,12.977-8.312,12.977-15.469c0-7.17-5.821-12.982-12.977-12.982 c-7.167,0-12.981,5.812-12.981,12.982C136.948,44.812,142.757,53.125,149.93,53.125z" />
                  <path d="M175.56,62.846c-0.031-0.25-0.159-0.45-0.22-0.679c-0.104-0.375-0.177-0.749-0.359-1.093 c-0.134-0.256-0.329-0.454-0.505-0.686c-0.226-0.304-0.438-0.605-0.731-0.861c-0.231-0.192-0.505-0.311-0.767-0.466 c-0.262-0.149-0.481-0.368-0.779-0.475c-0.463-0.167-10.797-3.873-20.283-4.357l-1.315,2.606h-0.03l3.459,26.923l-4.11,7.17 l-4.104-7.17l3.453-26.923h-0.037l-1.303-2.606c-9.487,0.493-19.82,4.189-20.283,4.357c-0.299,0.107-0.518,0.326-0.785,0.481 c-0.256,0.149-0.524,0.262-0.749,0.454c-0.305,0.255-0.518,0.569-0.762,0.88c-0.158,0.225-0.347,0.411-0.48,0.66 c-0.177,0.351-0.262,0.725-0.359,1.111c-0.055,0.237-0.188,0.43-0.22,0.667l-4.104,36.949c-0.311,2.819,1.717,5.358,4.536,5.675 c0.195,0.019,0.378,0.03,0.572,0.03c2.576,0,4.805-1.942,5.091-4.561l3.738-33.661c0.438-0.131,0.914-0.268,1.425-0.411v35.028 l-4.085,50.796c-0.269,3.386,2.246,6.356,5.65,6.631c0.164,0.013,0.329,0.013,0.493,0.013c3.179,0,5.87-2.442,6.132-5.664 l3.689-45.905c0.762,0.335,1.596,0.529,2.484,0.529c0.884,0,1.724-0.194,2.484-0.529l3.696,45.905 c0.262,3.222,2.953,5.664,6.126,5.664c0.171,0,0.341,0,0.506-0.013c3.392-0.274,5.918-3.245,5.645-6.631l-4.086-50.796V66.861 c0.512,0.144,0.986,0.28,1.431,0.411l3.739,33.661c0.292,2.618,2.515,4.561,5.09,4.561c0.189,0,0.378-0.012,0.572-0.03 c2.819-0.311,4.854-2.855,4.537-5.675L175.56,62.846z" />
                  <polygon points="67.562,146.31 67.562,163.237 83.941,180.763 115.203,147.979 115.203,131.209 84.027,163.913  " />
                </g>
              </g>
            </svg>
            <span>Leaderboard</span>
          </div>

          <div
            onClick={() => {
              router.push("/earn");
            }}
            className={
              currentRoute == "/earn"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.317"
              height="19.842"
              viewBox="0 0 22.317 19.842"
            >
              <path
                id="sushi-roll"
                d="M21.078,14.516V10.534c0-1.882-2.483-3.3-5.78-3.3s-5.78,1.422-5.78,3.3v3.981C6.427,14.624,4.14,16,4.14,17.808v5.96c0,1.882,2.483,3.3,5.78,3.3,2.511,0,4.554-.825,5.379-2.055.825,1.23,2.868,2.055,5.379,2.055,3.3,0,5.78-1.422,5.78-3.3v-5.96c0-1.806-2.287-3.184-5.379-3.292ZM13.757,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0ZM9.92,20.311c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5S12.671,20.311,9.92,20.311Zm5.379-7.27c-2.752,0-4.979-1.121-4.979-2.507s2.227-2.5,4.979-2.5,4.979,1.109,4.979,2.5S18.05,13.042,15.3,13.042Zm3.837.777v.8c-.268.036-.525.088-.773.144v-.945a.4.4,0,0,1,.773,0ZM24.511,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0Zm-3.837-2.047c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5-2.223,2.5-4.975,2.5Zm0-4.129c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.228-.725,3.228-1.6-1.434-1.622-3.216-1.622ZM18.247,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.1-.144-1.71-.6-1.71-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.862,6.862,0,0,0-.653.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.577.629-1.71.773ZM9.9,16.182c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.224-.725,3.224-1.6-1.43-1.622-3.2-1.622ZM7.472,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.085-.144-1.694-.6-1.694-.773Zm2.4.381a7.266,7.266,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.861,6.861,0,0,0-.637.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.573.629-1.694.773ZM15.3,8.912c-1.782,0-3.228.725-3.228,1.622s1.446,1.622,3.228,1.622,3.228-.725,3.228-1.622S17.089,8.912,15.3,8.912Zm-2.4,1.622c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.129-.144-1.722-.6-1.722-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.973c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148A6.861,6.861,0,0,0,15.3,10.915Zm.7.4A6.048,6.048,0,0,1,16.973,10c.493.192.761.425.761.537A2.466,2.466,0,0,1,16,11.311Z"
                transform="translate(-4.14 -7.23)"
                className="text-gray-300"
                fill={darkMode ? "currentColor" : "#5d6879"}
              />
            </svg>

            <span>Earn</span>
          </div>
          <div
            onClick={() => {
              if (!userData) {
                router.push("/signin");
              } else {
                fullPageReload(`/profile/${userData.username}`);
              }
            }}
            className={
              myProfileRoute &&
              (currentRoute === "/profile/[user]" || currentRoute === "/edit")
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              id="ninja"
              xmlns="http://www.w3.org/2000/svg"
              width="21.904"
              height="21.904"
              viewBox="0 0 21.904 21.904"
            >
              <g
                id="Gruppe_3252"
                data-name="Gruppe 3252"
                transform="translate(0 10.995)"
              >
                <g id="Gruppe_3251" data-name="Gruppe 3251">
                  <path
                    id="Pfad_4697"
                    data-name="Pfad 4697"
                    d="M9.027,261.492C3.989,261.492,0,259.519,0,257v1.925a9.027,9.027,0,0,0,18.054,0V257C18.054,259.519,14.065,261.492,9.027,261.492Z"
                    transform="translate(0 -257)"
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
              <g
                id="Gruppe_3254"
                data-name="Gruppe 3254"
                transform="translate(1.283 7.786)"
              >
                <g id="Gruppe_3253" data-name="Gruppe 3253">
                  <path
                    id="Pfad_4698"
                    data-name="Pfad 4698"
                    d="M37.744,182C33.205,182,30,183.691,30,185.209s3.205,3.209,7.744,3.209,7.744-1.691,7.744-3.209S42.282,182,37.744,182Zm-1.351,4.779a.642.642,0,0,1-.861.287l-2.567-1.283a.642.642,0,0,1,.574-1.148l2.567,1.283A.642.642,0,0,1,36.392,186.779Zm6.13-1-2.567,1.283a.642.642,0,0,1-.574-1.148l2.567-1.283a.642.642,0,0,1,.574,1.148Z"
                    transform="translate(-30 -182)"
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
              <g id="Gruppe_3256" data-name="Gruppe 3256">
                <g id="Gruppe_3255" data-name="Gruppe 3255">
                  <path
                    id="Pfad_4699"
                    data-name="Pfad 4699"
                    d="M9.027,0A9.1,9.1,0,0,0,0,9.07v1.925C0,8.476,3.989,6.5,9.027,6.5s9.027,1.973,9.027,4.492V9.07A9.1,9.1,0,0,0,9.027,0Z"
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
              <g
                id="Gruppe_3258"
                data-name="Gruppe 3258"
                transform="translate(18.251 13.979)"
              >
                <g id="Gruppe_3257" data-name="Gruppe 3257">
                  <path
                    id="Pfad_4700"
                    data-name="Pfad 4700"
                    d="M429.625,326.97h-.752a3.721,3.721,0,0,1-1.228-.225,10.171,10.171,0,0,1-1.031,3.51,5.022,5.022,0,0,0,2.259.565h.752a.641.641,0,0,0,.642-.642v-2.567A.641.641,0,0,0,429.625,326.97Z"
                    transform="translate(-426.614 -326.745)"
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
              <g
                id="Gruppe_3260"
                data-name="Gruppe 3260"
                transform="translate(15.198 18.054)"
              >
                <g id="Gruppe_3259" data-name="Gruppe 3259">
                  <path
                    id="Pfad_4701"
                    data-name="Pfad 4701"
                    d="M358.753,422h-.748a10.471,10.471,0,0,1-2.75,3.052,5.162,5.162,0,0,0,2.745.8h.752a.641.641,0,0,0,.642-.642v-2.567A.641.641,0,0,0,358.753,422Z"
                    transform="translate(-355.256 -422)"
                    fill={darkMode ? "white" : "#5d6879"}
                  />
                </g>
              </g>
            </svg>

            <span>Profile</span>
          </div>
          <div
            onClick={() => {
              router.push("/settings");
            }}
            className={
              currentRoute == "/settings"
                ? `border-l-2 ${
                    darkMode
                      ? "border-pastelGreen bg-black"
                      : "border-slate-700 bg-slate-100"
                  } p-2.5 font-bold text-start cursor-pointer flex flex-row space-x-3 items-center`
                : "p-2.5 text-start cursor-pointer flex flex-row space-x-3 items-center"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.116"
              height="22.113"
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
                  fill={darkMode ? "currentColor" : "#5d6879"}
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  className="text-zinc-200"
                  fill={darkMode ? "currentColor" : "#5d6879"}
                />
              </g>
            </svg>

            <span>Settings</span>
          </div>
        </div>
        <div className="text-xl w-full flex justify-center px-2">
          <span
            onClick={() => {
              router.push("/create");
            }}
            id="anime-book-font"
            className="cursor-pointer w-full bg-pastelGreen py-2 text-center text-white"
          >
            POST SOMETHING
          </span>
        </div>
      </div>
      <span
        className={`${
          darkMode ? "text-white" : "text-black"
        } px-2 text-[11px] font-medium flex flex-col`}
      >
        <span className="flex flex-row space-x-1 items-center">
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
        </span>
        {allUsers && (
          <span>{`Total Users Registered: ${
            allUsers.length + registeredAuth
          }`}</span>
        )}
      </span>

      <div className="pb-4 text-xs flex flex-row justify-between">
        <span className="w-full py-3 cursor-pointer flex justify-start items-center space-x-1">
          {userData && (
            <span
              onClick={() => {
                fullPageReload(`/profile/${userData.username}`);
              }}
              className="pl-3 relative flex flex-shrink-0"
            >
              <Image
                src={imgSrc}
                alt="user myprofile"
                height={35}
                width={35}
                className="rounded-full"
                onError={() =>
                  setImgSrc(
                    "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                  )
                }
              />
            </span>
          )}
          {userData ? (
            <span className="text-sm flex flex-row items-center justify-start">
              <span
                onClick={() => {
                  if (!userData) {
                    router.push("/signin");
                  } else {
                    fullPageReload(`/profile/${userData.username}`);
                  }
                }}
                className="font-semibold"
              >
                {userData && userData.username}
              </span>{" "}
            </span>
          ) : (
            NotSignedIn && (
              <span
                onClick={() => {
                  fullPageReload("/signin");
                }}
                className="cursor-pointer w-fit mx-auto bg-pastelGreen px-8 mb-2 py-2 text-center text-white font-bold rounded-xl"
              >
                Login
              </span>
            )
          )}
        </span>

        {/* <span className="cursor-pointer underline">Terms of Service</span>
        <span className="cursor-pointer underline">Privacy Policy</span> */}
      </div>
      <span className="ml-1">
        <DarkModeToggle />
      </span>
      <span className="bottom-1 absolute w-full space-x-2 flex flex-row bg-transparent justify-center items-center pb-2 px-4">
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
      </span>
      <span></span>
    </div>
  );
};
export default NavBar;

{
  /* <span onClick={() => {
            router.push("/create");
          }}
          className="flex flex-col justify-center items-center">
<svg
          
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          height="28px"
          width="28px"
          stroke="transparent"
          fill="#5d6879"
          x="0px"
          y="0px"
          viewBox="0 0 52 52"
          style={{
            enableBackground: "new 0 0 52 52",
          }}
          xmlSpace="preserve"
        >
          <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M38.5,28H28v11c0,1.104-0.896,2-2,2 s-2-0.896-2-2V28H13.5c-1.104,0-2-0.896-2-2s0.896-2,2-2H24V14c0-1.104,0.896-2,2-2s2,0.896,2,2v10h10.5c1.104,0,2,0.896,2,2 S39.604,28,38.5,28z" />
        </svg>
        <span>Create</span>
</span> */
}
