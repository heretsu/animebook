import { useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import { useRouter } from "next/router";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animeBcc from "@/assets/animeBcc.png"

export const TopBarObjects = () => {
  const router = useRouter();
  const { fetchAllUsers, fetchAllPosts } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [allowSearch, setAllowSearch] = useState(false);
  const [disableReentry, setDisableReentry] = useState(false);
  const [disableUsersReentry, setDisableUsersReentry] = useState(false);
  const [openUsers, setOpenUsers] = useState(null);

  const {
    allUserObject,
    setAllUserObject,
    followingPosts,
    setFollowingPosts,
    originalPostValues,
    setOriginalPostValues,
    postValues,
    setPostValues,
    userNumId,
    setSearchFilter,
    setTagsFilter,
    originalExplorePosts,
    explorePosts,
    setExplorePosts,
    userData,
    routedUser
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

      setSearchText(e.target.value.toLowerCase());
     
      const foundPosts =
        router.pathname === "/profile/[user]"
          ? originalPostValues
            ? originalPostValues.filter((post) => {
                if (post.users.username.toLowerCase() === routedUser.toLowerCase()) {
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
    fetchFollowing(userNumId).then((res) => {
      let followingPosts = [];
      if (!res.data){
        return
      }
      if (router.pathname === "/explore" || router.pathname === "/profile/[user]"){
        console.log('following decoy. cypher largetopbar.js')
        setFollowingPosts(true)
        return
      }
      
      let i = res.data.length - 1;
      if (res.data !== null && res.data !== undefined) {
        while (i >= 0) {
          followingPosts.push(
            postValues.find(
              (rel) => rel.users.id === res.data[i].following_userid
            )
          );
          i--;
        }
      }
      setPostValues(followingPosts);
      setFollowingPosts(true);
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
  const { userData, myProfileRoute } = useContext(UserContext);

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
  const [mobileSearchToggle, setMobileSearchToggle] = useState(false);
  const { fullPageReload } = PageLoadOptions();

  return (
    <div
      id="fixed-topbar"
      className="lg:hidden flex flex-col"
    >
      <div className={`py-3 px-2 flex flex-row w-full justify-between space-x-2 bg-white`}>
      <span
        onClick={() => {
          fullPageReload("/home");
        }}
        className="h-fit flex justify-center items-center"
      >
        <Image src={animeBcc} alt="anime book colored logo without font" height={50} width={50}/>
          
      </span>
      <span className="w-full flex flex-row items-center space-x-3">
          <span className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
            {/* search bar 3 out of 4 */}
            <svg
              className="w-4 h-4 text-gray-500"
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
          <svg
          onClick={() => {
            router.push("/notifications");
          }}
          className="cursor-pointer"
          width="34px"
          height="34px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke={
            router.pathname === "/notifications" ? "rgb(73, 169, 73)" : "gray"
          }
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="miter"
        >
          <path d="M19,14l2,4H3l2-4V9.29A7.2,7.2,0,0,1,11.78,2,7,7,0,0,1,19,9Z" />
          <path d="M16,18a4,4,0,1,1-8,0" />
        </svg>

        <svg
          onClick={() => {
            fullPageReload(`/profile/${userData.username}`);
          }}
          className="cursor-pointer w-[29px] h-[29px]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 18"
        >
          <path
            stroke={
              myProfileRoute &&
              (router.pathname === "/profile/[user]" || router.pathname === "/edit")
                ? "rgb(73, 169, 73)"
                : "gray"
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.1"
            d="M7 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-2 3h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"
          />
        </svg>
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
      {
      router.pathname !== "/explore" && router.pathname !== "/profile/user" && (middleTab && relationship && !mobileSearchToggle) && (
        <div className="flex flex-row space-x-1 font-semibold w-full justify-center pt-3 px-1">
          <div
            onClick={getAllPosts}
            className={
              followingPosts
                ? "w-1/2 text-center text-sm cursor-pointer py-3 px-4 rounded-lg bg-white flex justify-center items-center border border-gray-200 text-gray-400"
                : "w-1/2 text-center text-sm cursor-pointer flex flex-row justify-center bg-pastelGreen text-white py-3 px-4 items-center rounded-lg space-x-1"
            }
          >
            <span>For</span>
            <span>You</span>
          </div>
          <div
            onClick={changePostsDisplayed}
            className={
              followingPosts
                ? "w-1/2 text-center text-sm cursor-pointer flex flex-row justify-center bg-pastelGreen text-white py-3 px-4 items-center rounded-lg space-x-1"
                : "w-1/2 text-center text-sm cursor-pointer py-3 px-4 rounded-lg bg-white flex justify-center items-center border border-gray-200 text-gray-400"
            }
          >
            Following
          </div>
        </div>
      )
      }
      </div>
    </div>
  );
};

const LargeTopBar = ({ relationship }) => {
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
  return (
    <div className="flex flex-row w-full space-x-2 bg-white rounded-xl p-2">
      {router.pathname !== "/explore" && router.pathname !== "/profile/[user]" && relationship && (
        <div className="flex flex-row space-x-2 font-semibold">
          <div
            onClick={getAllPosts}
            className={
              followingPosts
                ? "text-sm cursor-pointer py-1 px-4 rounded-xl bg-gray-100 flex items-center border border-gray-200 text-gray-400"
                : "text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center rounded-xl space-x-1"
            }
          >
            <span>For</span>
            <span>You</span>
          </div>
          <div
            onClick={changePostsDisplayed}
            className={
              followingPosts
                ? "text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center rounded-xl space-x-1"
                : "text-sm cursor-pointer py-1 px-4 rounded-xl bg-gray-100 flex items-center border border-gray-200 text-gray-400"
            }
          >
            Following
          </div>
        </div>
      )}
      {/* search bar 4 out of 4 */}
      <div className="w-full flex flex-col">
        <div className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
          <svg
            className="w-4 h-4 text-gray-500"
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
        </div>
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
      </div>
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
  );
};
export default LargeTopBar;



// {
  // router.pathname !== "/explore" && router.pathname !== "/profile/[user]" && (middleTab && relationship) ? (
//   <>
//     {/* search bar 1 out of 4 */}
//     <span
//       onClick={() => {
//         setMobileSearchToggle(true);
//       }}
//       className={
//         mobileSearchToggle
//           ? "hidden"
//           : "flex sm:hidden flex-row justify-end items-center"
//       }
//     >
//       <svg
//         className="w-6 h-6 text-black"
//         aria-hidden="true"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 20 20"
//       >
//         <path
//           stroke="currentColor"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth="2"
//           d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
//         />
//       </svg>
//     </span>
//     {/* search bar 2 out of 4 */}
//     <span
//       className={mobileSearchToggle ? "w-full" : "hidden sm:flex w-full"}
//     >
//       <span className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
//         {/* search bar 3 out of 4 */}
//         <svg
//           className="w-4 h-4 text-gray-500"
//           aria-hidden="true"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 20 20"
//         >
//           <path
//             stroke="currentColor"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
//           />
//         </svg>
//         <input
//           onChange={searchForItem}
//           onClick={getAllSearchData}
//           type="search"
//           className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
//           placeholder="Search for users, images, hashtags and more!"
//         />
//       </span>
//     </span>
//   </>
// ) : (
//   <span className="w-full">
//     <span className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
//       {/* search bar 3 out of 4 */}
//       <svg
//         className="w-4 h-4 text-gray-500"
//         aria-hidden="true"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 20 20"
//       >
//         <path
//           stroke="currentColor"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth="2"
//           d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
//         />
//       </svg>
//       <input
//         onChange={searchForItem}
//         onClick={getAllSearchData}
//         type="search"
//         className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
//         placeholder="Search for users, images, hashtags and more!"
//       />
//     </span>
//   </span>
// )}