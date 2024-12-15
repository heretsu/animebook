import { useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import { useRouter } from "next/router";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animeBcc from "@/assets/animeBcc.png";

export const TopBarObjects = () => {
  const router = useRouter();
  const { fetchAllUsers, fetchAllPosts } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const [openUsers, setOpenUsers] = useState(null);

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
    userData,
    routedUser,
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
          post[0].content.toLowerCase().includes(e.target.value) ||
          post[0].content.toUpperCase().includes(e.target.value) ||
          post[0].users.username.toLowerCase().includes(e.target.value) ||
          post[0].users.username.toUpperCase().includes(e.target.value)
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

  const searchForItem = (e) => {
    if (e.target.value !== "") {
      if (!postValues || !allUserObject || !originalPostValues) {
        getAllSearchData();
      }
      const foundPosts =
        router.pathname === "/profile/[user]"
          ? originalPostValues
            ? originalPostValues.filter((post) => {
                if (
                  post.users.username.toLowerCase() === routedUser.toLowerCase()
                ) {
                  return post.content
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase());
                }
              })
            : []
          : originalPostValues
          ? originalPostValues.filter((post) =>
              post.content.toLowerCase().includes(e.target.value.toLowerCase())
            )
          : [];

      const foundExplorePosts = originalExplorePosts
        ? originalExplorePosts.filter((post) =>
            post[0].content.toLowerCase().includes(e.target.value.toLowerCase())
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
      let followingPostsArray = []
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
  };
};

export const SmallTopBar = ({ middleTab, relationship }) => {
  const { userData, sideBarOpened, setSideBarOpened } = useContext(UserContext);

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
  } = TopBarObjects();
  const { fullPageReload } = PageLoadOptions();

  return (
    <div id="fixed-topbar" className="lg:hidden flex flex-col">
      <div
        className={`py-1.5 px-2 flex flex-row w-full justify-between space-x-2 bg-white`}
      >
        {userData && userData.picture && <span
          onClick={() => {
            setSideBarOpened(true)
          }}
          className="cursor-pointer relative my-auto h-9 w-9 flex justify-center items-center flex-shrink-0"
        >
          <Image
            src={userData.picture}
            alt="anime book colored logo without font"
            height={50}
            width={50}
            className="rounded-full"
          />
        </span>}
        <span className="w-full flex flex-row items-center space-x-3">
          <span className="py-0 pl-3 w-full flex flex-row items-center rounded-lg bg-gray-100">
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
              className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
              placeholder="Search for users, images, hashtags and more!"
            />
          </span>

        </span>

        {(openSuggestions !== null || openUsers !== null) && (
          <span id="mobile-suggests" className="flex flex-col">
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
                      setPostValues(openSuggestions.foundPosts);
                    }
                    if (
                      router.pathname === "/explore" &&
                      openSuggestions.foundExplorePosts &&
                      openSuggestions.foundExplorePosts.length === 0
                    ) {
                      return;
                    } else {
                      setExplorePosts(openSuggestions.foundExplorePosts);
                    }

                    setOpenSuggestions(null);
                  }}
                  className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
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
                  className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
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
                    className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
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
      <div>
        {router.pathname !== "/explore" &&
          router.pathname !== "/profile/user" &&
          middleTab &&
          relationship && (
            <div id="anime-book-font" className="flex flex-row space-x-1 font-semibold w-full justify-center pt-2 px-1">
              <div
                onClick={getAllPosts}
                className={
                  followingPosts
                    ? "w-1/2 text-center text-[16px] cursor-pointer py-2 px-4 rounded-lg bg-white flex justify-center items-center border border-gray-200 text-gray-400"
                    : "w-1/2 text-center text-[16px] cursor-pointer flex flex-row justify-center bg-pastelGreen text-white py-2 px-4 items-center rounded-lg"
                }
              >
                For You
              </div>
              <div
                onClick={changePostsDisplayed}
                className={
                  followingPosts
                    ? "w-1/2 text-center text-[16px] cursor-pointer flex flex-row justify-center bg-pastelGreen text-white py-2 px-4 items-center rounded-lg space-x-1"
                    : "w-1/2 text-center text-[16px] cursor-pointer py-2 px-4 rounded-lg bg-white flex justify-center items-center border border-gray-200 text-gray-400"
                }
              >
                Following
              </div>
            </div>
          )}
          {sideBarOpened && <div onClick={()=>{setSideBarOpened(false)}} id="sidebar-overlay"></div>}
      </div>
    </div>
  );
};

const LargeTopBar = ({ relationship }) => {
  const router = useRouter();
  const { followingPosts, changePostsDisplayed, getAllPosts } = TopBarObjects();
  return (
    <>
      {router.pathname !== "/explore" &&
        router.pathname !== "/profile/[user]" &&
        relationship && (
          <div
            id="anime-book-font"
            className="w-full flex flex-row justify-between space-x-1 font-semibold"
          >
            <div
              onClick={getAllPosts}
              className={
                followingPosts
                  ? "text-xl w-full justify-center text-sm cursor-pointer py-1 px-4 bg-gray-100 flex items-center border border-gray-200 text-slate-600"
                  : "text-xl w-full justify-center text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center"
              }
            >
              FOR YOU
            </div>
            <div
              onClick={changePostsDisplayed}
              className={
                followingPosts
                  ? "text-xl w-full justify-center text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center space-x-1"
                  : "text-xl w-full justify-center text-sm cursor-pointer py-1 px-4 bg-white flex items-center border border-gray-200 text-slate-600"
              }
            >
              FOLLOWING
            </div>
          </div>
        )}
    </>
  );
};
export default LargeTopBar;
