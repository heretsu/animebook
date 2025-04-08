import Image from "next/image";
import PlusIcon from "./plusIcon";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/userContext";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";
import free from "@/assets/chibis/free.jpg";

const LargeRightBar = () => {
  const { getUserFromUsername } = DappLibrary();
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const [openUsers, setOpenUsers] = useState(null);
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [displayContent, setDisplayContent] = useState({
    images: false,
    videos: false,
    stories: false,
    people: false,
  });

  const { fetchAllUsers, fetchAllPosts } = DbUsers();
  const { fetchFollowing } = Relationships();
  const {
    setMediasClicked,
    currentUserWatchlist,
    setCurrentUserWatchlist,
    currentUserChibis,
    setCurrentUserChibis,
    clickFollower,
    setClickFollower,
    clickFollowing,
    setClickFollowing,
    allSubscriptions,
    followerObject,
    followingObject,
    communities,
    youMayKnow,
    setYouMayKnow,
    originalPostValues,
    allUserObject,
    setAllUserObject,
    postValues,
    setPostValues,
    userPostValues,
    setUserPostValues,
    userNumId,
    setStoriesFilter,
    setImagesFilter,
    setVideosFilter,
    setTagsFilter,
    setSearchFilter,
    hashtagList,
    setHashtagList,
    originalExplorePosts,
    setExplorePosts,
    chosenTag,
    setChosenTag,
    userData,
    fetchCommunities,
    routedUser,
    darkMode,
  } = useContext(UserContext);
  const [routedUserData, setRoutedUserData] = useState(null);
  const [userCommunities, setUserCommunities] = useState(null);

  const toggleContentFilter = (postContents) => {
    if (router.pathname === "/explore") {
      mediaPostFilter(postContents);
    } else {
      allPostFilter(postContents);
    }
  };
  const mediaPostFilter = (postContents) => {
    setChosenTag("");
    if (!postContents.images && !postContents.videos) {
      setImagesFilter(false);
      setVideosFilter(false);
      setExplorePosts(originalExplorePosts);
      return true;
    }
    const filteredPosts = originalExplorePosts.filter((post) => {
      const media = post.post.media?.toLowerCase();
      if (
        postContents.images &&
        media &&
        (media.endsWith("jpg") ||
          media.endsWith("png") ||
          media.endsWith("gif") ||
          media.endsWith("svg"))
      ) {
        setImagesFilter(true);
        return true;
      }
      if (
        postContents.videos &&
        media &&
        (media.endsWith("mp4") ||
          media.endsWith("mov") ||
          media.endsWith("3gp"))
      ) {
        setVideosFilter(true);
        return true;
      }
      return false;
    });
    setExplorePosts(filteredPosts);
  };

  const allPostFilter = (postContents) => {
    if (
      !postContents.images &&
      !postContents.videos &&
      !postContents.stories &&
      !postContents.people
    ) {
      setStoriesFilter(false);
      setImagesFilter(false);
      setVideosFilter(false);
      if (router.pathname === "/profile/[user]") {
        setPostValues(userPostValues);
      } else {
        setPostValues(originalPostValues);
      }
      return true;
    }
    if (router.pathname === "/profile/[user]") {
      getFilteredPosts(postContents, userPostValues);
    } else {
      getFilteredPosts(postContents, originalPostValues);
    }
  };

  const getFilteredPosts = (postContents, pValues) => {
    const filteredPosts = pValues.filter((post) => {
      const media = post.media?.toLowerCase();
      if (
        postContents.images &&
        media &&
        (media.endsWith("jpg") ||
          media.endsWith("png") ||
          media.endsWith("gif") ||
          media.endsWith("svg"))
      ) {
        setImagesFilter(true);
        return true;
      }
      if (
        postContents.videos &&
        media &&
        (media.endsWith("mp4") ||
          media.endsWith("mov") ||
          media.endsWith("3gp"))
      ) {
        setVideosFilter(true);
        return true;
      }
      if (postContents.people) {
        return true;
      }

      if (postContents.stories) {
        setStoriesFilter(true);
        return false;
      }

      return false;
    });
    setPostValues(filteredPosts);
  };

  const getSelectedHashTag = (htag) => {
    if (router.pathname === "/explore") {
      console.log(htag[0]);

      if (htag[0] === chosenTag) {
        setChosenTag(null);
        setExplorePosts(originalExplorePosts);
      } else {
        setChosenTag(htag[0]);
        const selectedTag = originalExplorePosts.filter(
          (post) =>
            post.post.content.toLowerCase().includes(htag[0].toLowerCase()) &&
            post.post.media !== null &&
            post.post.media !== undefined
        );
        setExplorePosts(selectedTag);
      }
    } else {
      setSearchFilter(false);
      setTagsFilter(true);
      if (htag[0] === chosenTag) {
        setChosenTag(null);
        setPostValues(originalPostValues);
      } else {
        setChosenTag(htag[0]);
        const selectedTag = originalPostValues.filter((post) =>
          post.content.toLowerCase().includes(htag[0].toLowerCase())
        );

        setPostValues(selectedTag);
      }
    }
  };

  const fetchYouMayKnow = async () => {
    if (userData) {
      const followResult = await fetchFollowing(userNumId);
      if (followResult.data) {
        fetchAllUsers().then((res) => {
          let unfollowedUsers = [];
          let i = 0;
          if (res.data && res.data.length > 0) {
            while (i < res.data.length) {
              if (userNumId !== res.data[i].id) {
                if (
                  !!followResult.data.find(
                    (rel) => rel.following_userid === res.data[i].id
                  )
                ) {
                } else {
                  unfollowedUsers.push(res.data[i]);
                }
              }
              i++;
            }
            setYouMayKnow(unfollowedUsers);
          }
        });
      }
    }
  };

  const fetchAllHashTags = () => {
    const allTagsCount = {};
    const tagsWithMediaCount = {};

const now = new Date();
const cutoff = router.pathname === "/explore" ? new Date(now.getTime() - 24 * 90 * 60 * 60 * 1000) : new Date(now.getTime() - 24 * 7 * 60 * 60 * 1000); // 90 days for explore . 24 hours for other

const filteredPosts = originalPostValues.filter((post) => {
  const createdAtDate = new Date(post.created_at);

  return createdAtDate >= cutoff;
});

filteredPosts.forEach((post) => {
  const tags = post.content
    ? post.content.toLowerCase().match(/#\w+/g) || []
    : [];
  const uniqueTags = [...new Set(tags)];

  uniqueTags.forEach((tag) => {
    allTagsCount[tag] = (allTagsCount[tag] || 0) + 1;
  });

  if (
  post.media !== null && post.media !== undefined && (post.media.toLowerCase().endsWith('mp4') || post.media.toLowerCase().endsWith('3gp'))
  
) {
    uniqueTags.forEach((tag) => {
      tagsWithMediaCount[tag] = (tagsWithMediaCount[tag] || 0) + 1;
    });
  }
});
   
    const trendingTagsWithMedia = Object.entries(tagsWithMediaCount).sort(
      (a, b) => b[1] - a[1]
    );

    
    const trendingAllTags = Object.entries(allTagsCount).sort(
      (a, b) => b[1] - a[1]
    );

    setHashtagList({
      trending:
        router.pathname === "/explore"
          ? trendingTagsWithMedia
          : trendingAllTags,
    });
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

  const [searchedWord, setSearchedWord] = useState("");
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

  const formatGroupName = (text) => {
    return text
      .split("+")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const [imgSrcs, setImgSrcs] = useState("");
  const [valuesLoaded, setValuesLoaded] = useState(false);

  const handleImageError = (id) => {
    setImgSrcs((prev) => ({
      ...prev,
      [id]: "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
    }));
  };

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
    if (originalPostValues !== null && originalPostValues !== undefined) {
      fetchAllHashTags();
    }
    if (alreadyFollowed) {
      setSliceIndex(sliceIndex + 1);
    }
    if (userCommunities === null && routedUser) {
      fetchAllUsers().then((res) => {
        if (res && res.data) {
          const user = res.data.find(
            (usr) =>
              usr.username.toLowerCase().trim() ===
              routedUser.toLowerCase().trim()
          );
          if (user) {
            fetchCommunities(user.id).then(({ data }) => {
              setUserCommunities(data);

              setRoutedUserData(user);
            });
          }
        }
      });
    }
    fetchYouMayKnow();
  }, [
    userCommunities,
    routedUser,
    valuesLoaded,
    openUsers,
    originalPostValues,
    alreadyFollowed,
    userData,
  ]);

  return (
    <div id="rightbar" className="mt-2 invisible lg:visible fixed h-screen h-fit overflow-hidden block">
      <div className="h-full flex flex-col rounded-xl w-full pb-8 space-y-2">
        {/* {router.pathname !== "/search" && (
          <span
            className={`${
              darkMode ? "bg-[#1e1f24]" : "bg-white"
            } flex flex-col justify-center items-center p-2`}
          >
            {
              <span
                className={`${
                  darkMode ? "bg-zinc-800" : "bg-gray-100"
                } p-2 w-full flex flex-row items-center`}
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
                  className={`w-full text-sm ${
                    darkMode ? "text-white" : "text-gray-500"
                  } bg-transparent border-none focus:ring-0 placeholder-gray-400`}
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
                        router.push(`/search?${searchedWord}`);
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
                      } p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                      } p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                        className={`cursor-pointer text-sm hover:text-pastelGreen border ${
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
                              fullPageReload(`/profile/${os.username}`);
                            }}
                            className={`${
                              darkMode ? "text-white" : "text-black"
                            } p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
        )} */}
        {router.pathname === "/profile/[user]" && routedUserData ? (
          <span
            className={`${
              darkMode
                ? "bg-[#1e1f24] border-[#292C33]"
                : "bg-white border-[#EEEDEF]"
            } flex flex-col rounded border py-2.5 px-3.5`}
          >
            <span
              className={`pb-1 ${
                darkMode ? "text-white" : "text-black"
              } text-start flex flex-row space-x-1 font-semibold`}
            >
              <span>About</span> <span>{routedUserData.username}</span>
            </span>
            <span
              className={`text-xs ${darkMode ? "text-white" : "text-black"}`}
            >
              {routedUserData.bio}
            </span>

            <span
              className={`border ${
                darkMode ? "bg-[#1E1F24] border-[#292C33] text-white" : "bg-[#F9F9F9] border-[#EEEDEF] text-black"
              } text-sm rounded-lg my-3 justify-center items-center flex flex-col`}
            >
              {followerObject && followingObject && userPostValues && (
                <span className="px-2 py-2 flex flex-row space-x-3">
                  <span className="flex flex-col justify-center items-center">
                    <span className="font-semibold">
                      {userPostValues.length}
                    </span>
                    <span className={`${darkMode && 'text-[#ADB6C3]'} `}>{"Posts"}</span>
                  </span>
                  <span className="flex flex-col justify-center items-center">
                    <span className="font-semibold">
                      {followingObject.length}
                    </span>
                    <span
                      onClick={() => {
                        setClickFollowing(false);
                        setClickFollower(true);
                      }}
                      className={`${darkMode && 'text-[#ADB6C3]'} underline`}
                    >
                      {"Followers"}
                    </span>
                  </span>
                  <span className="flex flex-col justify-center items-center">
                    <span className="font-semibold">
                      {followerObject.length}
                    </span>
                    <span
                      onClick={() => {
                        setClickFollower(false);
                        setClickFollowing(true);
                      }}
                      className={`${darkMode && 'text-[#ADB6C3]'} underline`}
                    >
                      {"Following"}
                    </span>
                  </span>
                </span>
              )}
              {allSubscriptions && allSubscriptions.length && (
                <span
                  className={`border-t ${
                    darkMode ? "border-[#292C33]" : "border-[#EEEDEF]"
                  } font-semibold py-1 text-center w-full`}
                >
                  {`${allSubscriptions.length} monthly subscriber${
                    allSubscriptions.length > 1 ? "s" : ""
                  }`}
                </span>
              )}
            </span>
          </span>
        ) : (
          hashtagList !== null &&
          hashtagList !== undefined &&
          hashtagList.trending?.length > 0 && (
            <span
              className={`${
                darkMode
                  ? "bg-[#1e1f24] border-[#292C33]"
                  : "bg-white border-[#EEEDEF]"
              } rounded border py-2.5 px-3.5`}
            >
              <p
                className={`flex flex-row space-x-1 justify-start items-center pb-1 text-base ${
                  darkMode ? "text-white" : "text-black"
                } text-start font-semibold`}
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14.016"
                    height="18.355"
                    viewBox="0 0 16.016 21.355"
                    fill={darkMode ? "white" : "black"}
                  >
                    <g id="fire" transform="translate(-64 0)">
                      <g
                        id="Gruppe_3287"
                        data-name="Gruppe 3287"
                        transform="translate(64 0)"
                      >
                        <path
                          id="Pfad_4727"
                          data-name="Pfad 4727"
                          d="M79.97,12.5a12.586,12.586,0,0,0-3.036-6.942c-1.211-1.63-2.257-3.038-2.257-5.115a.445.445,0,0,0-.242-.4.441.441,0,0,0-.462.034A11.315,11.315,0,0,0,69.8,6.12a19.7,19.7,0,0,0-.457,4.512c-1.814-.388-2.225-3.1-2.23-3.131a.445.445,0,0,0-.635-.338c-.1.046-2.335,1.184-2.466,5.729-.009.151-.01.3-.01.454a8.017,8.017,0,0,0,8.008,8.007.062.062,0,0,0,.018,0h.006a8.017,8.017,0,0,0,7.985-8.007C80.016,13.125,79.97,12.5,79.97,12.5Zm-7.962,7.961a2.764,2.764,0,0,1-2.669-2.843c0-.053,0-.107,0-.173a3.606,3.606,0,0,1,.281-1.413A1.625,1.625,0,0,0,71.092,17.1a.445.445,0,0,0,.445-.445,8.9,8.9,0,0,1,.171-2.024,4.3,4.3,0,0,1,.9-1.706,5.732,5.732,0,0,0,.917,1.683,5.069,5.069,0,0,1,1.14,2.778c.006.076.011.153.011.236A2.764,2.764,0,0,1,72.008,20.464Z"
                          transform="translate(-64 0)"
                        />
                      </g>
                    </g>
                  </svg>
                </span>
                <span>Trending</span>
                {router.pathname !== "/explore" && <span
                  className={`text-[0.7rem] font-light ${
                    darkMode
                      ? "bg-[#27292F] text-white"
                      : "bg-[#F5F5F5] text-[#728198]"
                  } rounded px-1 py-[0.001rem] w-fit h-fit`}
                >
                  24H
                </span>}
              </p>
              {hashtagList.trending.slice(0, 5).map((tag) => {
                return (
                  <div
                    key={tag}
                    className={`py-1.5 text-xs flex flex-row justify-between`}
                  >
                    <span
                      onClick={() => {
                        // getSelectedHashTag(tag);
                        fullPageReload("/search?".concat(tag[0]));
                      }}
                      className={`${
                        darkMode ? "text-white" : "text-[#728198]"
                      } text-[0.9rem]`}
                    >
                      {tag[0].replace("#", "").charAt(0).toUpperCase() +
                        tag[0].slice(2)}
                    </span>
                    <span
                      className={`rounded w-[80px] text-center py-0.5 text-xs ${
                        darkMode
                          ? "bg-[#27292F] text-white"
                          : "bg-[#F5F5F5] text-[#728198]"
                      }`}
                    >{`${tag[1]} ${tag[1] > 1 ? "posts" : "post"}`}</span>
                  </div>
                );
              })}
            </span>
          )
        )}
        {router.pathname === "/profile/[user]" && routedUserData
          ? ""
          : // <span
            //   className={`${
            //     darkMode
            //       ? "bg-[#1e1f24] border-[#292C33]"
            //       : "bg-white border-[#EEEDEF]"
            //   } rounded border py-2.5 px-3.5`}
            // >
            //   chibis
            // </span>
            youMayKnow !== null &&
            youMayKnow !== undefined &&
            youMayKnow.length > 0 && (
              <span
                className={`${
                  darkMode
                    ? "bg-[#1e1f24] border-[#292C33]"
                    : "bg-white border-[#EEEDEF]"
                } rounded border py-2.5 px-3.5`}
              >
                <p
                  className={`text-base ${
                    darkMode ? "text-white" : "text-black"
                  } text-start font-semibold pb-0.5`}
                >
                  {router.pathname === "/search"
                    ? "Follow Others"
                    : "Find new Nakamas"}
                </p>

                <span className="">
                  {youMayKnow
                    .slice(sliceIndex, 3 + sliceIndex)
                    .map((thisUser) => {
                      return (
                        <span
                          key={thisUser.id}
                          className={`py-1.5 flex flex-row justify-between items-center`}
                        >
                          <span
                            onClick={() => {
                              fullPageReload(`/profile/${thisUser.username}`);
                            }}
                            className="cursor-pointer flex justify-start items-center space-x-1"
                          >
                            <span className="relative h-8 w-8 flex">
                              <Image
                                alt="user profile"
                                src={thisUser.avatar}
                                height={35}
                                width={35}
                                className="rounded-full border border-black"
                              />
                            </span>
                            <span
                              className={`${
                                darkMode
                                  ? "text-white"
                                  : "text-[#728198] text-[0.9rem]"
                              } text-sm font-normal`}
                            >
                              {thisUser.username}
                            </span>
                          </span>

                          <PlusIcon
                            ymk={true}
                            sideBar={true}
                            alreadyFollowed={alreadyFollowed}
                            setAlreadyFollowed={setAlreadyFollowed}
                            followerUserId={userNumId}
                            followingUserId={thisUser.id}
                            size={"19"}
                            color={"default"}
                          />
                        </span>
                      );
                      
                    })}
                    
                  {/* <span className="text-xs underline text-textGreen">{"Show more..."}</span> */}
                </span>
              </span>
            )}
             {router.pathname === "/profile/[user]" &&
          routedUserData &&
          currentUserChibis &&
          currentUserChibis.length > 0 && (
            <span
              className={`${
                darkMode
                  ? "bg-[#1e1f24] border-[#292C33] text-white"
                  : "bg-white border-[#EEEDEF] text-black"
              } flex flex-col rounded border py-2.5`}
            >
              <span className="font-semibold text-sm pb-1 px-3.5">
                Highlighted Chibis
              </span>
              <span className="overflow-hidden px-3.5 relative w-full flex flex-row justify-start gap-1">
                {currentUserChibis.slice(0, 1).map((cb) => (
                  <span
                    key={cb.id}
                    className="relative flex flex-col items-center w-16 rounded-lg"
                    onClick={()=>{setMediasClicked('animes')}}
                  >
                    <Image
                      src={free}
                      alt="chibi"
                      className="rounded-lg w-16 h-16 object-cover"
                    />

                    
                  </span>
                ))}
                
                
              </span>
            </span>
          )}

        {router.pathname === "/profile/[user]" &&
          routedUserData &&
          currentUserWatchlist &&
          currentUserWatchlist.length > 0 && (
            <span
              className={`${
                darkMode
                  ? "bg-[#1e1f24] border-[#292C33] text-white"
                  : "bg-white border-[#EEEDEF] text-black"
              } flex flex-col rounded border py-2.5`}
            >
              <span className="font-semibold text-sm pb-1 px-3.5">
                Recently watched
              </span>
              <span className="overflow-hidden px-3.5 relative w-full flex flex-row justify-start gap-1">
                {currentUserWatchlist.slice(0, 3).map((awl) => (
                  <span
                    key={awl.id}
                    className="relative flex flex-col items-center w-16 rounded-lg"
                    onClick={()=>{setMediasClicked('animes')}}
                  >
                    <img
                      src={awl.image}
                      alt="anime"
                      className="rounded-lg w-16 h-16 object-cover"
                    />

                    <span className="h-6 overflow-hidden absolute bottom-0 w-full bg-white bg-opacity-70 text-black text-xs text-center py-1 rounded-b-lg">
                      {awl.title.length > 8
                        ? awl.title.slice(0, 8) + "..."
                        : awl.title}
                    </span>
                  </span>
                ))}
                
                
              </span>
            </span>
          )}

        {router.pathname === "/profile/[user]" && routedUserData ? (
          <span
            className={`${
              darkMode
                ? "bg-[#1e1f24] border-[#292C33] text-white"
                : "bg-white border-[#EEEDEF] text-black"
            } flex flex-col rounded border py-2.5 px-3.5`}
          >
            <span className="font-semibold text-sm pb-1">Communities</span>
            {userCommunities &&
              userCommunities
                .filter((myCommunity) => myCommunity.isAMember)
                .slice(0, 3)
                .map((community) => {
                  return (
                    <span
                      key={community.id}
                      onClick={() => {
                        fullPageReload(
                          `/communities/${community.name}`.replace(" ", "+")
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
                            community.membersLength === 1 ? "Member" : "Members"
                          }`}
                        </span>
                      </span>
                    </span>
                  );
                })}
          </span>
        ) : (
          communities !== null &&
          communities !== undefined &&
          communities.length > 0 && (
            <span
              className={`${
                darkMode
                  ? "bg-[#1e1f24] border-[#292C33]"
                  : "bg-white border-[#EEEDEF]"
              } flex flex-col rounded border py-2.5 px-3.5`}
            >
              <p
                className={`text-base ${
                  darkMode ? "text-white" : "text-black"
                } text-start font-semibold pb-2`}
              >
                Explore new communities
              </p>
              <span
                onClick={() => {
                  fullPageReload(
                    `/communities/${communities[0].name}`.replace(" ", "+")
                  );
                }}
                className="cursor-pointer flex flex-col"
              >
                <span className="h-24 w-full relative">
                  <Image
                    src={communities[0].avatar}
                    alt="anime community"
                    height={500}
                    width={500}
                    className="object-cover rounded-lg border border-black"
                  />
                </span>
                <span
                  className={`w-full text-base font-normal ${
                    darkMode ? "text-white" : "text-[#728198]"
                  }`}
                >
                  {formatGroupName(communities[0].name)}
                </span>
              </span>
            </span>
          )
        )}
        <span
          className={`${
            darkMode
              ? "bg-[#1e1f24] border-[#292C33]"
              : "bg-white border-[#EEEDEF]"
          } text-xs text-[#728198] flex flex-row justify-between rounded border py-2.5 px-3.5`}
        >
          <span
            onClick={() => {
              fullPageReload("https://x.com/luffyinutoken", "_blank");
            }}
            className="underline cursor-pointer"
          >
            Twitter
          </span>
          <span
            onClick={() => {
              fullPageReload("https://t.me/LUFFYTOKEN_OFFICIAL", "_blank");
            }}
            className="underline cursor-pointer"
          >
            Telegram
          </span>
          <span
            onClick={() => {
              fullPageReload("/privacy-policy", "window");
            }}
            className="underline cursor-pointer"
          >
            Privacy Policy
          </span>
        </span>

        {/*     
        {router.pathname !== "/search" && (
          <span
            className={`${
              darkMode ? "bg-[#1e1f24]" : "bg-white"
            } p-2 text-sm flex flex-col items-start space-y-3`}
          >
            <p
              className={`text-xl ${
                darkMode ? "text-white" : "text-gray-600"
              } text-start font-semibold`}
            >
              CONTENT PREFERENCES
            </p>

            <span
              className={`${
                darkMode ? "text-white" : "text-black"
              } flex flex-row items-center justify-start space-x-2`}
            >
              <input
                type="checkbox"
                value=""
                onChange={(e) => {
                  const newState = {
                    ...displayContent,
                    images: e.target.checked,
                  };

                  setDisplayContent(newState);

                  toggleContentFilter(newState);
                }}
                className={`w-4 h-4 text-pastelGreen ${
                  darkMode ? "bg-black" : "bg-white"
                } border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
              />
              <span>Images</span>
            </span>
            <span
              className={`${
                darkMode ? "text-white" : "text-black"
              } flex flex-row items-center justify-start space-x-2`}
            >
              <input
                type="checkbox"
                value=""
                onChange={(e) => {
                  const newState = {
                    ...displayContent,
                    videos: e.target.checked,
                  };

                  setDisplayContent(newState);

                  toggleContentFilter(newState);
                }}
                className={`w-4 h-4 text-pastelGreen ${
                  darkMode ? "bg-black" : "bg-white"
                } border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
              />
              <span>Videos</span>
            </span>
            {router.pathname === "/home" && (
              <span
                className={`${
                  darkMode ? "text-white" : "text-black"
                } flex flex-row items-center justify-start space-x-2`}
              >
                <input
                  type="checkbox"
                  value=""
                  onChange={(e) => {
                    const newState = {
                      ...displayContent,
                      stories: e.target.checked,
                    };

                    setDisplayContent(newState);

                    toggleContentFilter(newState);
                  }}
                  className={`w-4 h-4 text-pastelGreen ${
                    darkMode ? "bg-black" : "bg-white"
                  } border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
                />
                <span>Stories</span>
              </span>
            )}
            {router.pathname === "/home" && (
              <span
                className={`${
                  darkMode ? "text-white" : "text-black"
                } flex flex-row items-center justify-start space-x-2`}
              >
                <input
                  type="checkbox"
                  value=""
                  onChange={(e) => {
                    const newState = {
                      ...displayContent,
                      people: e.target.checked,
                    };

                    setDisplayContent(newState);

                    toggleContentFilter(newState);
                  }}
                  className={`w-4 h-4 text-pastelGreen ${
                    darkMode ? "bg-black" : "bg-white"
                  } border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
                />
                <span>People</span>
              </span>
            )}
          </span>
        )} */}
      </div>
    </div>
  );
};
export default LargeRightBar;
