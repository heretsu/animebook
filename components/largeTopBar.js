import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import { useRouter } from "next/router";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animeBcc from "@/assets/animeBcc.png";
import DarkModeToggle from "./darkModeToggle";
import newLogo from "../assets/newLogo.png";
import { AvatarWithBorder } from "./AvatarProps";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";

export const TopBarObjects = () => {
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { fetchAllUsers, fetchAllPosts } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const [openUsers, setOpenUsers] = useState(null);
  const [imgSrc, setImgSrc] = useState("");

  const {
    allUserObject,
    setAllUserObject,
    followingPosts,
    setFollowingPosts,
    originalPostValues,
    postValues,
    setPostValues,
    userNumId,
    setSearchFilter,
    setTagsFilter,
    originalExplorePosts,
    setExplorePosts,
    darkMode,
    userData,
    routedUser,
    NotSignedIn,
    openPremium,
    setOpenPremium,
    currentCommunity,
    unreadMessagesLength,
    setUnreadMessagesLength,
    unreadCount,
  } = useContext(UserContext);

  const retrieveItem = (type) => {
    if (router.pathname === "/profile/[user]") {
      setOpenSuggestions(
        allUserObject.filter((user) =>
          user.username.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    } else if (router.pathname === "/explore") {
      const foundItems = originalExplorePosts.filter(
        (post) =>
          post.post.content.toLowerCase().includes(e.target.value) ||
          post.post.content.toUpperCase().includes(e.target.value) ||
          post.post.users.username.toLowerCase().includes(e.target.value) ||
          post.post.users.username.toUpperCase().includes(e.target.value)
      );
      setTagsFilter(false);
      setSearchFilter(true);
      setExplorePosts(foundItems);
    } else {
      const foundItems = originalPostValues.filter(
        (post) =>
          post.content.toLowerCase().includes(e.target.value) ||
          post.content.toUpperCase().includes(e.target.value) ||
          post.users.username.toLowerCase().includes(e.target.value) ||
          post.users.username.toUpperCase().includes(e.target.value)
      );
      setTagsFilter(false);
      setSearchFilter(true);
      setPostValues(foundItems);
    }
  };
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

  const [searchValue, setSearchValue] = useState("");
  const searchForItem = (e) => {
    if (e.target.value !== "") {
      if (!postValues || !allUserObject || !originalPostValues) {
        getAllSearchData();
      }
      setSearchValue(e.target.value);
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
              post.content.toLowerCase().includes(e.target.value.toLowerCase())
            )
          : [];

      const foundExplorePosts = originalExplorePosts
        ? originalExplorePosts.filter((post) =>
            post.post.content
              .toLowerCase()
              .includes(e.target.value.toLowerCase())
          )
        : [];

      const foundUsers = allUserObject
        ? allUserObject.filter((user) =>
            user.username.toLowerCase().includes(e.target.value.toLowerCase())
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

  const changePostsDisplayed = () => {
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    setFollowingPosts(true);
    fetchFollowing(userNumId).then((res) => {
      let followingPosts = false;
      let followingPostsArray = [];
      if (!postValues || !res.data || res.data.length === 0) {
        return;
      }
      if (
        router.pathname === "/explore" ||
        router.pathname === "/profile/[user]"
      ) {
        console.log("following decoy. cypher largetopbar.js");
        setFollowingPosts(true);
        return;
      }

      if (Array.isArray(res.data) && res.data.length > 0) {
        let i = res.data.length - 1;

        while (i >= 0) {
          const matches = postValues.filter(
            (rel) => rel.users.id === res.data[i].following_userid
          );
          followingPostsArray.push(...matches);
          i--;
        }
      }
      setPostValues(followingPostsArray);
    });
  };

  const getAllPosts = () => {
    fetchAllPosts().then((result) => {
      setPostValues(result.data);
      setFollowingPosts(false);
    });
  };
  return {
    NotSignedIn,
    followingPosts,
    getAllSearchData,
    changePostsDisplayed,
    getAllPosts,
    searchForItem,
    openSuggestions,
    setOpenSuggestions,
    setPostValues,
    openUsers,
    setOpenUsers,
    setExplorePosts,
    darkMode,
    searchValue,
    userData,
    imgSrc,
    setImgSrc,
    fullPageReload,
    openPremium,
    setOpenPremium,
    currentCommunity,
    unreadMessagesLength,
    setUnreadMessagesLength,
    unreadCount,
  };
};

export const SmallTopBar = ({ middleTab, relationship }) => {
  const {
    userData,
    sideBarOpened,
    setSideBarOpened,
    openPremium,
    setOpenPremium,
    currentCommunity,
  } = useContext(UserContext);

  const router = useRouter();
  const {
    followingPosts,
    changePostsDisplayed,
    getAllPosts,
    searchForItem,
    getAllSearchData,
    openSuggestions,
    setOpenSuggestions,
    setPostValues,
    setExplorePosts,
    openUsers,
    setOpenUsers,
    darkMode,
    searchValue,
    unreadMessagesLength,
    setUnreadMessagesLength,
    unreadCount,
  } = TopBarObjects();
  const { fullPageReload } = PageLoadOptions();
  useEffect(() => {}, [unreadMessagesLength]);

  return (
    <div
      id="fixed-topbar"
      className={`lg:hidden border-b ${
        darkMode ? "text-white border-[#292C33]" : "text-black border-[#EEEDEF]"
      } flex flex-col`}
    >
      <div
        className={`py-1.5 px-2 flex flex-row w-full justify-between ${
          darkMode ? "bg-[#1e1f24]" : "bg-white"
        }`}
      >
        {userData && userData.avatar && (
          <span className="w-fit flex flex-row justify-center items-center space-x-3">
            <span
              onClick={() => {
                setSideBarOpened(true);
              }}
              className="cursor-pointer relative my-auto h-12 w-12 flex justify-center items-center flex-shrink-0"
            >
              <Image
                src={userData.avatar}
                alt="anime book colored logo without font"
                height={50}
                width={50}
                className="rounded-full"
              />
            </span>
          </span>
        )}

        {relationship &&
          (router.pathname === "/profile/[user]" ? (
            <div
              className={`max-h-10 my-auto text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border ${
                darkMode
                  ? "bg-[#27292F] border-[#32353C]"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              }`}
            >
              <div
                onClick={() => {
                  setOpenPremium(false);
                }}
                className={
                  openPremium
                    ? "rounded w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    : `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center`
                }
              >
                Public
              </div>
              <div
                onClick={() => {
                  setOpenPremium(true);
                }}
                className={
                  openPremium
                    ? `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center space-x-1`
                    : "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                }
              >
                <span>Premium</span>
              </div>
            </div>
          ) : (
            <div
              className={`max-h-10 my-auto text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border ${
                darkMode
                  ? "bg-[#27292F] border-[#32353C]"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              }`}
            >
              <div
                onClick={getAllPosts}
                className={
                  followingPosts
                    ? "rounded w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    : `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center`
                }
              >
                For You
              </div>
              <div
                onClick={changePostsDisplayed}
                className={
                  followingPosts
                    ? `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center space-x-1`
                    : "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                }
              >
                Following
              </div>
            </div>
          ))}

        <span className="flex flex-row justify-center items-center space-x-3">
          <span
            onClick={() => {
              fullPageReload("/inbox", "window");
            }}
            className={`p-2 flex justify-center items-center rounded-full border ${
              darkMode
                ? "bg-[#27292F] border-[#32353C]"
                : "bg-[#F9F9F9] border-[#EEEDEF]"
            }`}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              fill={
                router.pathname === "/inbox" ||
                router.pathname === "/inbox/[message]"
                  ? "#EB4363"
                  : darkMode
                  ? "white"
                  : "black"
              }
            >
              <path d="M924.3 338.4a447.57 447.57 0 0 0-96.1-143.3 443.09 443.09 0 0 0-143-96.3A443.91 443.91 0 0 0 512 64h-2c-60.5.3-119 12.3-174.1 35.9a444.08 444.08 0 0 0-141.7 96.5 445 445 0 0 0-95 142.8A449.89 449.89 0 0 0 65 514.1c.3 69.4 16.9 138.3 47.9 199.9v152c0 25.4 20.6 46 45.9 46h151.8a447.72 447.72 0 0 0 199.5 48h2.1c59.8 0 117.7-11.6 172.3-34.3A443.2 443.2 0 0 0 827 830.5c41.2-40.9 73.6-88.7 96.3-142 23.5-55.2 35.5-113.9 35.8-174.5.2-60.9-11.6-120-34.8-175.6zM312.4 560c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.4 48-47.9 48zm199.6 0c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.5 48-47.9 48zm199.6 0c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.5 48-47.9 48z" />
            </svg>
            {unreadMessagesLength !== null &&
              unreadMessagesLength !== undefined &&
              unreadMessagesLength > 0 && (
                <span className="absolute ml-5 mt-7 bg-[#EB4463] rounded-full h-5 w-5 flex items-center justify-center text-white text-sm">
                  {unreadMessagesLength}
                </span>
              )}
          </span>
          <span
            onClick={() => {
              fullPageReload("/notifications", "window");
            }}
            className={`flex justify-center items-center p-2 rounded-full border ${
              darkMode
                ? "bg-[#27292F] border-[#32353C]"
                : "bg-[#F9F9F9] border-[#EEEDEF]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 22 22.002"
              fill={
                router.pathname === "/notifications"
                  ? "#EB4363"
                  : darkMode
                  ? "white"
                  : "black"
              }
            >
              <g id="bell" transform="translate(-1 0.002)">
                <path
                  id="Pfad_4717"
                  data-name="Pfad 4717"
                  d="M11,20a22.61,22.61,0,0,1-2.47-.15,2.494,2.494,0,0,0,4.94,0A22.61,22.61,0,0,1,11,20Z"
                  transform="translate(1)"
                />
                <path
                  id="Pfad_4718"
                  data-name="Pfad 4718"
                  d="M22.7,16.69C21.35,17.99,15.839,19,12,19S2.65,17.99,1.3,16.69a.933.933,0,0,1-.176-1.14A16.59,16.59,0,0,0,3.2,8,7.468,7.468,0,0,1,5.719,2.29,9.08,9.08,0,0,1,12,0a9.08,9.08,0,0,1,6.281,2.29A7.468,7.468,0,0,1,20.8,8a16.59,16.59,0,0,0,2.079,7.55A.933.933,0,0,1,22.7,16.69Z"
                />
              </g>
            </svg>
            {unreadCount !== null &&
              unreadCount !== undefined &&
              unreadCount > 0 && (
                <span className="absolute ml-5 mt-7 bg-[#EB4463] rounded-full h-5 w-5 flex items-center justify-center text-white text-sm">
                  {unreadCount}
                </span>
              )}
          </span>
          <span
            onClick={() => {
              fullPageReload("/search", "window");
            }}
            className={`justify-center items-center p-2 rounded-full border ${
              darkMode
                ? "bg-[#27292F] border-[#32353C]"
                : "bg-[#F9F9F9] border-[#EEEDEF]"
            }`}
          >
            <svg
              className="text-[#292C33] rotate-12"
              width="19.858"
              height="20.987"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="transparent"
              viewBox="0 0 20 20"
            >
              <path
                stroke={darkMode ? "white" : "#292C33"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </span>
        </span>

        {/*
        Search input 
        <span className="w-full flex flex-row items-center space-x-3">
          <span
            className={`py-0 pl-3 w-full flex flex-row items-center rounded-lg ${
              darkMode ? "bg-zinc-800" : "bg-gray-100"
            }`}
          >
            <svg
              className="w-4 h-3 text-gray-500"
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
              onChange={searchForItem}
              onClick={getAllSearchData}
              type="search"
              className={`w-full text-sm ${
                darkMode ? "text-white" : "text-gray-500"
              } bg-transparent border-none focus:ring-0 placeholder-gray-400`}
              placeholder="Search for users, images, hashtags and more!"
            />
          </span>
        </span> */}

        {sideBarOpened && (
          <div
            onClick={() => {
              setSideBarOpened(false);
            }}
            id="sidebar-overlay"
          ></div>
        )}

        {(openSuggestions !== null || openUsers !== null) && (
          <span
            id="mobile-suggests"
            className={`${
              darkMode ? "bg-[#1e1f24]" : "bg-white"
            } flex flex-col`}
          >
            {openSuggestions !== null && (
              <span className="w-full flex flex-col">
                <span
                  onClick={() => {
                    if (
                      router.pathname !== "/explore" &&
                      openSuggestions.foundPosts &&
                      openSuggestions.foundPosts.length === 0
                    ) {
                      return;
                    } else {
                      router.push(`/search?${searchValue}`);
                      // setPostValues(openSuggestions.foundPosts);
                    }
                    if (
                      router.pathname === "/explore" &&
                      openSuggestions.foundExplorePosts &&
                      openSuggestions.foundExplorePosts.length === 0
                    ) {
                      return;
                    } else {
                      router.push(`/search?${searchValue}`);
                      // setExplorePosts(openSuggestions.foundExplorePosts);
                    }

                    setOpenSuggestions(null);
                  }}
                  className={`p-2 ${
                    darkMode ? "text-white" : "text-black"
                  } flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                  className={`p-2 ${
                    darkMode ? "text-white" : "text-black"
                  } flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
                >
                  {`${openSuggestions.foundUsers.length} users found`}
                </span>
              </span>
            )}
            {openUsers !== null &&
              openUsers.length !== 0 &&
              openUsers.slice(0, 8).map((os) => {
                return (
                  <span
                    key={os.id}
                    onClick={() => {
                      fullPageReload(`/profile/${os.username}`);
                    }}
                    className={`p-2 flex flex-row ${
                      darkMode ? "text-white" : "text-black"
                    } items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
                  >
                    <span className="relative h-8 w-8 flex">
                      <Image
                        src={os.avatar}
                        alt="user"
                        width={30}
                        height={30}
                        className="border border-white rounded-full"
                      />
                    </span>
                    <span>{os.username}</span>
                  </span>
                );
              })}
          </span>
        )}
        {(openSuggestions !== null || openUsers !== null) && (
          <div
            onClick={() => {
              setOpenSuggestions(null);
              setOpenUsers(null);
            }}
            id="clear-overlay"
          ></div>
        )}
      </div>
    </div>
  );
};

const LargeTopBar = ({ relationship }) => {
  const { disconnectWallet } = ConnectionData();

  const logOut = async () => {
    try {
      try {
        disconnectWallet();
      } catch (e) {}
      await supabase.auth.signOut();
      router.push("/signin");
    } catch (error) {
      throw "a problem occurred";
    }
  };

  const router = useRouter();
  const {
    followingPosts,
    changePostsDisplayed,
    getAllPosts,
    searchValue,
    darkMode,
    userData,
    fullPageReload,
    NotSignedIn,
    openPremium,
    setOpenPremium,
    currentCommunity,
    unreadMessagesLength,
    setUnreadMessagesLength,
    unreadCount,
  } = TopBarObjects();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`${
        darkMode
          ? "text-white bg-[#1e1f24] border-[#292C33]"
          : "text-black bg-[#FFFFFF] border-[#EEEDEF]"
      } px-4 rounded-r py-3 w-full flex flex-row justify-between items-center`}
    >
      <span className="w-fit space-x-7 flex flex-row items-center justify-between">
        <span className="flex flex-row items-center space-x-0.5">
          <span className="relative h-12 w-12 flex rounded-full">
            <Image
              src={newLogo}
              alt="logo"
              width={70}
              height={70}
              className="rounded-full"
            />
          </span>
          <span className="font-semibold space-x-1">
            <span>Anime</span>
            <span>Book</span>
          </span>
        </span>
        <DarkModeToggle />
      </span>
      <span className="w-1/2 pl-7 flex flex-row justify-between items-center">
        {router.pathname === "/home" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14.858"
              height="24.987"
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
                    fill={darkMode ? "white" : "black"}
                  />
                </g>
              </g>
            </svg>
            <span>Home</span>
          </span>
        ) : router.pathname === "/search" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              className="text-[#5d6879] rotate-12"
              width="13.858"
              height="14.987"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke={darkMode ? "white" : "black"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span>Search</span>
          </span>
        ) : router.pathname === "/explore" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
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
                  fill={`${darkMode ? "white" : "black"}`}
                />
              </g>
            </svg>
            <span>Explore</span>
          </span>
        ) : router.pathname === "/communities" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
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
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
              </g>
            </svg>
            <span>Communities</span>
          </span>
        ) : router.pathname === "/communities/[community]" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
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
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={`${darkMode ? "white" : "black"}`}
                />
              </g>
            </svg>
            <span>
              {currentCommunity ? (
                <span className="flex flex-row space-x-1">
                  <span>Community</span>
                  <span className="font-medium">{">"}</span>
                  <span>
                    {currentCommunity
                      .split("&")[0]
                      .replace(/\+/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </span>
                </span>
              ) : (
                "Communities"
              )}
            </span>
          </span>
        ) : router.pathname === "/leaderboard" ? (
          <span className="flex flex-row space-x-2 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16.399"
              height="18.944"
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
                      fill={darkMode ? "white" : "black"}
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
                      fill={darkMode ? "white" : "black"}
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
                      fill={darkMode ? "white" : "black"}
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
                      fill={darkMode ? "white" : "black"}
                    />
                  </g>
                </g>
              </g>
            </svg>
            <span>Leaderboard</span>
          </span>
        ) : router.pathname === "/earn" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17.818"
              height="17.842"
              viewBox="0 0 19.818 22.944"
            >
              <g id="layer1" transform="translate(-1.059 -280.596)">
                <path
                  id="path4503"
                  d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                  transform="translate(0 0)"
                  fill={darkMode ? "white" : "black"}
                />
              </g>
            </svg>
            <span>Earn</span>
          </span>
        ) : router.pathname === "/settings" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
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
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  className="text-zinc-200"
                  fill={darkMode ? "white" : "black"}
                />
              </g>
            </svg>
            <span>Settings</span>
          </span>
        ) : router.pathname === "/profile/[user]" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20.419"
              height="20.751"
              viewBox="0 0 23.419 24.751"
              fill={darkMode ? "white" : "black"}
            >
              <g id="girl" transform="translate(0 0)">
                <path
                  id="Pfad_4745"
                  data-name="Pfad 4745"
                  d="M40.57,48.832c-.37.517-.8,1.143-.866,1.263a.366.366,0,0,1-.478.192.4.4,0,0,1-.189-.509,8.25,8.25,0,0,1,.55-.848l-1.3-.108.155.363a.4.4,0,0,1-.183.511.358.358,0,0,1-.484-.194l-.408-.958a.413.413,0,0,1,.039-.377A.366.366,0,0,1,37.723,48l2.583.213a.371.371,0,0,1,.3.229A.409.409,0,0,1,40.57,48.832Z"
                  transform="translate(-24.053 -38.718)"
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4746"
                  data-name="Pfad 4746"
                  d="M50.665,96.023a.36.36,0,0,1,.472.224c.006.016.41,1.149.895,2.98a17.336,17.336,0,0,1,2.889,2.291.4.4,0,0,1,.015.547.356.356,0,0,1-.517.016,16.44,16.44,0,0,0-2.109-1.756c.106.437.213.9.318,1.388a.388.388,0,0,1-.276.463.366.366,0,0,1-.438-.291c-.182-.847-.37-1.621-.549-2.3l0-.01c-.49-1.872-.9-3.035-.91-3.051A.394.394,0,0,1,50.665,96.023Z"
                  transform="translate(-40.843 -77.435)"
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4747"
                  data-name="Pfad 4747"
                  d="M34.643,69.477a.708.708,0,0,1,.846.047,2.148,2.148,0,0,1,.533,2.583.9.9,0,0,1-.569.545,2.175,2.175,0,0,1-1.314.029,1.413,1.413,0,0,1-.854-1.476A2.631,2.631,0,0,1,34.643,69.477Z"
                  transform="translate(-18.892 -55.947)"
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4748"
                  data-name="Pfad 4748"
                  d="M89,109.067a1.326,1.326,0,0,1,1.46-1.06,1.437,1.437,0,0,1,1.18,1.439l.024,1.754a.674.674,0,0,1-.178.468.6.6,0,0,1-.44.2h0l-1.654,0a1.406,1.406,0,0,1-1.372-1.233,1.467,1.467,0,0,1,.312-1.124,1.31,1.31,0,0,1,.669-.434Z"
                  transform="translate(-84.341 -87.112)"
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4749"
                  data-name="Pfad 4749"
                  d="M112.268,103.158a958.92,958.92,0,0,0,1.677-1.153,1.173,1.173,0,0,1,.965,1.174l.018,1.315a.6.6,0,0,1-.16.42.541.541,0,0,1-.4.175h0l-1.24,0a1.148,1.148,0,0,1-1.12-1.008h0A1.2,1.2,0,0,1,112.268,103.158Z"
                  transform="translate(-112.001 -82.273)"
                  fill={darkMode ? "white" : "black"}
                />
                <path
                  id="Pfad_4750"
                  data-name="Pfad 4750"
                  d="M.7,17.349a.362.362,0,0,1-.483.2.4.4,0,0,1-.187-.51,2.4,2.4,0,0,1,.394-.646l2.713-6.23A19.117,19.117,0,0,1,3.9,5.583,8.553,8.553,0,0,1,5.843,1.94,6.924,6.924,0,0,1,9.41.307,9.742,9.742,0,0,1,13.47.17a20.479,20.479,0,0,1,6.9,3.319A.389.389,0,0,1,20.5,3.7a24.941,24.941,0,0,1,.526,9.752,13.611,13.611,0,0,1-1.182,6.924,7.114,7.114,0,0,1,2.462,3.9.388.388,0,0,1-.273.465.366.366,0,0,1-.44-.288,6.391,6.391,0,0,0-2.116-3.391,13.739,13.739,0,0,1-3.07,3.251.386.386,0,0,1-.273.427.362.362,0,0,1-.432-.239,21.722,21.722,0,0,0-3.992-6.649l-.251-.12.084,1.205a.39.39,0,0,1-.215.381.352.352,0,0,1-.412-.083A12.666,12.666,0,0,1,8.4,13.956a11.826,11.826,0,0,0,.147,3.331.393.393,0,0,1-.211.435.354.354,0,0,1-.446-.13,9.145,9.145,0,0,1-.639-1.161A12.913,12.913,0,0,1,6.193,7.392q1.048-1.811,2.264-3.5a.4.4,0,0,0-.069-.542.353.353,0,0,0-.513.073A42.879,42.879,0,0,0,5.54,7.039.4.4,0,0,0,5.5,7.13a13.5,13.5,0,0,0,.92,9.3H6.289l.321.835A55.419,55.419,0,0,1,8.583,24.28a.388.388,0,0,1-.277.462.366.366,0,0,1-.437-.293,54.589,54.589,0,0,0-1.938-6.9L5.407,16.19a.4.4,0,0,1-.024-.127H4.939a5.747,5.747,0,0,1,.208,1.776A1.612,1.612,0,0,1,3.861,19.2a1.585,1.585,0,0,1-1.72-.726,2.713,2.713,0,0,1-.188-2.026,1.345,1.345,0,0,0-1.251.9Zm15.444,6.228A9.847,9.847,0,0,0,20.2,16.7a12.032,12.032,0,0,1-2.3,4.075.358.358,0,0,1-.517-.005.4.4,0,0,1,.008-.55c0-.01.391-1.334.753-3.16l-3.468,2.036a.355.355,0,0,1-.329.014l-1.08-.516a21.853,21.853,0,0,1,2.878,4.984ZM11.4,16.853l3.077,1.471s3.828-2.244,3.846-2.251a32.2,32.2,0,0,0,.481-4.43l-1.388-.594.07.552h.429a.387.387,0,0,1,0,.774h-.749a.373.373,0,0,1-.363-.336l-.2-1.547a.4.4,0,0,1,.138-.357.35.35,0,0,1,.361-.053l1.708.731a14.854,14.854,0,0,0-.271-2.875l-.836,1.056a.354.354,0,0,1-.384.123.381.381,0,0,1-.26-.322,13.941,13.941,0,0,0-1.224-4.11A10.115,10.115,0,0,1,13.575,8.03a.35.35,0,0,1-.4.052.391.391,0,0,1-.2-.37L13.1,5.45a14.71,14.71,0,0,0-2.058,6.273ZM2.756,18.06a.871.871,0,0,0,.956.387.893.893,0,0,0,.713-.733,4.527,4.527,0,0,0-.306-1.886c-.078-.257-.158-.522-.219-.779L3.7,14.17C2.321,16.6,2.5,17.643,2.756,18.06Zm-.583-2.376a13.71,13.71,0,0,1,1.278-2.56l-.279-1.192-1.656,3.8a2.2,2.2,0,0,1,.657-.051Z"
                  transform="translate(1.098 0)"
                  fill={darkMode ? "white" : "black"}
                />
              </g>
            </svg>
            <span>Profile</span>
          </span>
        ) : router.pathname === "/notifications" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22px"
              height="22px"
              viewBox="0 0 22 22.002"
              fill={darkMode ? "white" : "black"}
            >
              <g id="bell" transform="translate(-1 0.002)">
                <path
                  id="Pfad_4717"
                  data-name="Pfad 4717"
                  d="M11,20a22.61,22.61,0,0,1-2.47-.15,2.494,2.494,0,0,0,4.94,0A22.61,22.61,0,0,1,11,20Z"
                  transform="translate(1)"
                />
                <path
                  id="Pfad_4718"
                  data-name="Pfad 4718"
                  d="M22.7,16.69C21.35,17.99,15.839,19,12,19S2.65,17.99,1.3,16.69a.933.933,0,0,1-.176-1.14A16.59,16.59,0,0,0,3.2,8,7.468,7.468,0,0,1,5.719,2.29,9.08,9.08,0,0,1,12,0a9.08,9.08,0,0,1,6.281,2.29A7.468,7.468,0,0,1,20.8,8a16.59,16.59,0,0,0,2.079,7.55A.933.933,0,0,1,22.7,16.69Z"
                />
              </g>
            </svg>
            <span>Notifications</span>
          </span>
        ) : router.pathname === "/inbox" ||
          router.pathname === "/inbox/[message]" ? (
          <span className="flex flex-row space-x-1 items-center font-medium text-normal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20.18"
              height="20.178"
              viewBox="0 0 16.18 16.178"
            >
              <path
                id="comment"
                d="M.679,11.325.01,15.318a.751.751,0,0,0,.206.647.74.74,0,0,0,.522.213.756.756,0,0,0,.125-.007L4.856,15.5a7.95,7.95,0,0,0,3.236.677A8.089,8.089,0,1,0,0,8.089,7.951,7.951,0,0,0,.679,11.325Z"
                fill={darkMode ? "white" : "black"}
              />
            </svg>
            <span>Messages</span>
          </span>
        ) : (
          ""
        )}

        {relationship &&
          (router.pathname === "/profile/[user]" ? (
            <div
              className={`text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border ${
                darkMode
                  ? "bg-[#27292F] border-[#32353C]"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              }`}
            >
              <div
                onClick={() => {
                  setOpenPremium(false);
                }}
                className={
                  openPremium
                    ? "rounded w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    : `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center`
                }
              >
                Public
              </div>
              <div
                onClick={() => {
                  setOpenPremium(true);
                }}
                className={
                  openPremium
                    ? `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center space-x-1`
                    : "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                }
              >
                <span>Premium</span>
              </div>
            </div>
          ) : (
            <div
              className={`text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border ${
                darkMode
                  ? "bg-[#27292F] border-[#32353C]"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              }`}
            >
              <div
                onClick={getAllPosts}
                className={
                  followingPosts
                    ? "rounded w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    : `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center`
                }
              >
                For You
              </div>
              <div
                onClick={changePostsDisplayed}
                className={
                  followingPosts
                    ? `rounded w-full justify-center cursor-pointer flex flex-row border ${
                        darkMode
                          ? "bg-[#33353D] border-[#32353C]"
                          : "bg-[#FFFFFF] border-[#EEEDEF]"
                      } py-0.5 px-4 items-center space-x-1`
                    : "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                }
              >
                Following
              </div>
            </div>
          ))}

        <span></span>
      </span>

      <span className="h-12 w-1/4 cursor-pointer flex flex-row justify-end items-center space-x-20">
        <span className="flex flex-row space-x-2">
          <span
            onClick={() => {
              fullPageReload("/inbox", "window");
            }}
            className={`p-1.5 rounded-full border ${
              darkMode
                ? "bg-[#27292F] border-[#32353C]"
                : "bg-[#F9F9F9] border-[#EEEDEF]"
            }`}
          >
            <svg
              width="18px"
              height="18px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              fill={
                router.pathname === "/inbox" ||
                router.pathname === "/inbox/[message]"
                  ? "#EB4363"
                  : darkMode
                  ? "white"
                  : "black"
              }
            >
              <path d="M924.3 338.4a447.57 447.57 0 0 0-96.1-143.3 443.09 443.09 0 0 0-143-96.3A443.91 443.91 0 0 0 512 64h-2c-60.5.3-119 12.3-174.1 35.9a444.08 444.08 0 0 0-141.7 96.5 445 445 0 0 0-95 142.8A449.89 449.89 0 0 0 65 514.1c.3 69.4 16.9 138.3 47.9 199.9v152c0 25.4 20.6 46 45.9 46h151.8a447.72 447.72 0 0 0 199.5 48h2.1c59.8 0 117.7-11.6 172.3-34.3A443.2 443.2 0 0 0 827 830.5c41.2-40.9 73.6-88.7 96.3-142 23.5-55.2 35.5-113.9 35.8-174.5.2-60.9-11.6-120-34.8-175.6zM312.4 560c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.4 48-47.9 48zm199.6 0c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.5 48-47.9 48zm199.6 0c-26.4 0-47.9-21.5-47.9-48s21.5-48 47.9-48 47.9 21.5 47.9 48-21.5 48-47.9 48z" />
            </svg>
            {unreadMessagesLength !== null &&
              unreadMessagesLength !== undefined &&
              unreadMessagesLength > 0 && (
                <span className="absolute ml-2 -mt-1 bg-[#EB4463] rounded-full h-5 w-5 flex items-center justify-center text-white text-sm">
                  {unreadMessagesLength}
                </span>
              )}
          </span>
          <span
            onClick={() => {
              fullPageReload("/notifications", "window");
            }}
            className={`p-1.5 rounded-full border ${
              darkMode
                ? "bg-[#27292F] border-[#32353C]"
                : "bg-[#F9F9F9] border-[#EEEDEF]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18px"
              height="18px"
              viewBox="0 0 22 22.002"
              fill={
                router.pathname === "/notifications"
                  ? "#EB4363"
                  : darkMode
                  ? "white"
                  : "black"
              }
            >
              <g id="bell" transform="translate(-1 0.002)">
                <path
                  id="Pfad_4717"
                  data-name="Pfad 4717"
                  d="M11,20a22.61,22.61,0,0,1-2.47-.15,2.494,2.494,0,0,0,4.94,0A22.61,22.61,0,0,1,11,20Z"
                  transform="translate(1)"
                />
                <path
                  id="Pfad_4718"
                  data-name="Pfad 4718"
                  d="M22.7,16.69C21.35,17.99,15.839,19,12,19S2.65,17.99,1.3,16.69a.933.933,0,0,1-.176-1.14A16.59,16.59,0,0,0,3.2,8,7.468,7.468,0,0,1,5.719,2.29,9.08,9.08,0,0,1,12,0a9.08,9.08,0,0,1,6.281,2.29A7.468,7.468,0,0,1,20.8,8a16.59,16.59,0,0,0,2.079,7.55A.933.933,0,0,1,22.7,16.69Z"
                />
              </g>
            </svg>
            {unreadCount !== null &&
              unreadCount !== undefined &&
              unreadCount > 0 && (
                <span className="absolute ml-2 -mt-1 bg-[#EB4463] rounded-full h-5 w-5 flex items-center justify-center text-white text-sm">
                  {unreadCount}
                </span>
              )}
          </span>
        </span>
        <span className="flex flex-row justify-end items-center space-x-1">
          {userData ? (
            <span className="text-base flex flex-row items-center justify-start">
              <span
                onClick={() => {
                  if (!userData) {
                    router.push("/signin");
                  } else {
                    fullPageReload(`/profile/${userData.username}`, "window");
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
                className="cursor-pointer w-fit mx-auto bg-pastelGreen px-8 py-2 text-center text-white font-bold rounded-xl"
              >
                Login
              </span>
            )
          )}
          {userData && (
            <span className="relative flex items-center focus:outline-none flex-shrink-0">
              <AvatarWithBorder userInfo={userData} size={40} />
              <span
                onClick={() => setIsOpen(!isOpen)}
                id="highZ"
                className="absolute right-0 bottom-0 mt-1.5 rounded-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                >
                  <g
                    id="Gruppe_3343"
                    data-name="Gruppe 3343"
                    transform="translate(-1790 -61)"
                  >
                    <circle
                      id="Ellipse_273"
                      data-name="Ellipse 273"
                      cx="9.5"
                      cy="9.5"
                      r="9.5"
                      transform="translate(1790 61)"
                      fill="#e4e7e9"
                    />
                    <g id="down-arrow" transform="translate(1793.359 -32.952)">
                      <g
                        id="Gruppe_3303"
                        data-name="Gruppe 3303"
                        transform="translate(0 100.698)"
                      >
                        <path
                          id="Pfad_4756"
                          data-name="Pfad 4756"
                          d="M12.085,101.3l-.4-.405a.673.673,0,0,0-.95,0l-4.589,4.589-4.594-4.594a.674.674,0,0,0-.95,0l-.4.4a.672.672,0,0,0,0,.95l5.47,5.49a.687.687,0,0,0,.476.215h0a.687.687,0,0,0,.475-.215l5.465-5.475a.682.682,0,0,0,0-.957Z"
                          transform="translate(0 -100.698)"
                          fill="#2a2c32"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </span>

              {isOpen && (
                <div className={`mt-16 py-1 absolute right-0 border ${
                  darkMode ? "text-white bg-[#1E1F24] border-gray-500" : "text-black border-gray-300 bg-[#FFFFFF]"
                } cursor-pointer rounded-lg shadow-md text-sm`}>
                  <span
                    onClick={() => {
                      setIsOpen(false);
                      logOut();
                    }}
                    className="w-full pl-2 pr-4 text-left"
                  >
                    Logout
                  </span>
                </div>
              )}
            </span>
          )}
        </span>
      </span>
    </div>
  );
};
export default LargeTopBar;
