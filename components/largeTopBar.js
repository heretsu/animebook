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
    fetchFollowing(userNumId).then((res) => {
      let followingPosts = [];
      if (!res.data) {
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
  const { userData } = useContext(UserContext);

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
        className={`py-3 px-2 flex flex-row w-full justify-between space-x-2 bg-white`}
      >
        <span
          onClick={() => {
            fullPageReload("/home");
          }}
          className="h-fit flex justify-center items-center"
        >
          <Image
            src={animeBcc}
            alt="anime book colored logo without font"
            height={50}
            width={50}
          />
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
              router.push("/earn");
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="22.317"
            height="19.842"
            viewBox="0 0 22.317 19.842"
          >
            <path
              id="sushi-roll"
              d="M21.078,14.516V10.534c0-1.882-2.483-3.3-5.78-3.3s-5.78,1.422-5.78,3.3v3.981C6.427,14.624,4.14,16,4.14,17.808v5.96c0,1.882,2.483,3.3,5.78,3.3,2.511,0,4.554-.825,5.379-2.055.825,1.23,2.868,2.055,5.379,2.055,3.3,0,5.78-1.422,5.78-3.3v-5.96c0-1.806-2.287-3.184-5.379-3.292ZM13.757,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0ZM9.92,20.311c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5S12.671,20.311,9.92,20.311Zm5.379-7.27c-2.752,0-4.979-1.121-4.979-2.507s2.227-2.5,4.979-2.5,4.979,1.109,4.979,2.5S18.05,13.042,15.3,13.042Zm3.837.777v.8c-.268.036-.525.088-.773.144v-.945a.4.4,0,0,1,.773,0ZM24.511,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0Zm-3.837-2.047c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5-2.223,2.5-4.975,2.5Zm0-4.129c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.228-.725,3.228-1.6-1.434-1.622-3.216-1.622ZM18.247,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.1-.144-1.71-.6-1.71-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.862,6.862,0,0,0-.653.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.577.629-1.71.773ZM9.9,16.182c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.224-.725,3.224-1.6-1.43-1.622-3.2-1.622ZM7.472,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.085-.144-1.694-.6-1.694-.773Zm2.4.381a7.266,7.266,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.861,6.861,0,0,0-.637.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.573.629-1.694.773ZM15.3,8.912c-1.782,0-3.228.725-3.228,1.622s1.446,1.622,3.228,1.622,3.228-.725,3.228-1.622S17.089,8.912,15.3,8.912Zm-2.4,1.622c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.129-.144-1.722-.6-1.722-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.973c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148A6.861,6.861,0,0,0,15.3,10.915Zm.7.4A6.048,6.048,0,0,1,16.973,10c.493.192.761.425.761.537A2.466,2.466,0,0,1,16,11.311Z"
              transform="translate(-4.14 -7.23)"
              fill={router.pathname === "/earn" ? "#04dbc4" : "#5d6879"}
            />
          </svg>

          <svg
            onClick={() => {
              fullPageReload(`/profile/${userData.username}`);
            }}
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
                  fill={router.pathname === "/profile" || router.pathname === "/profile/[user]" ? "#04dbc4" : "#5d6879"}
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
                  fill={router.pathname === "/profile" || router.pathname === "/profile/[user]" ? "#04dbc4" : "#5d6879"}
                />
              </g>
            </g>
            <g id="Gruppe_3256" data-name="Gruppe 3256">
              <g id="Gruppe_3255" data-name="Gruppe 3255">
                <path
                  id="Pfad_4699"
                  data-name="Pfad 4699"
                  d="M9.027,0A9.1,9.1,0,0,0,0,9.07v1.925C0,8.476,3.989,6.5,9.027,6.5s9.027,1.973,9.027,4.492V9.07A9.1,9.1,0,0,0,9.027,0Z"
                  fill={router.pathname === "/profile" || router.pathname === "/profile/[user]" ? "#04dbc4" : "#5d6879"}
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
                  fill={router.pathname === "/profile" || router.pathname === "/profile/[user]" ? "#04dbc4" : "#5d6879"}
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
                  fill={router.pathname === "/profile" || router.pathname === "/profile/[user]" ? "#04dbc4" : "#5d6879"}
                />
              </g>
            </g>
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
        {router.pathname !== "/explore" &&
          router.pathname !== "/profile/user" &&
          middleTab &&
          relationship && (
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
          )}
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
                  : "text-xl w-full justify-center text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center space-x-1"
              }
            >
              <span>FOR</span>
              <span>YOU</span>
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
