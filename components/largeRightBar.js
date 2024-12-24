import Image from "next/image";
import PlusIcon from "./plusIcon";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/userContext";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const LargeRightBar = () => {
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
    communities,
    routedUser, 
    darkMode
  } = useContext(UserContext);

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
      const media = post[0].media?.toLowerCase();
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
            post[0].content.toLowerCase().includes(htag[0].toLowerCase()) &&
            post[0].media !== null &&
            post[0].media !== undefined
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
    // Initialize counters for all hashtags and hashtags with media
    const allTagsCount = {};
    const tagsWithMediaCount = {};

    originalPostValues.forEach((post) => {
      const tags = post.content
        ? post.content.toLowerCase().match(/#\w+/g) || []
        : [];
      const uniqueTags = [...new Set(tags)];

      // Count hashtags for all posts
      uniqueTags.forEach((tag) => {
        allTagsCount[tag] = (allTagsCount[tag] || 0) + 1;
      });

      // If post has media, count hashtags for posts with media
      if (post.media !== null) {
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

  const formatGroupName = (text) => {
    return text
      .split("+")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (originalPostValues !== null && originalPostValues !== undefined) {
      fetchAllHashTags();
    }
    if (alreadyFollowed) {
      setSliceIndex(sliceIndex + 1);
    }
    fetchYouMayKnow();
  }, [originalPostValues, alreadyFollowed, userData]);

  return (
    <div className="h-screen overflow-scroll pb-22 flex">
      <div className="h-full flex flex-col rounded-xl w-72 pb-8 px-6 space-y-2">
        {router.pathname !== "/search" && (
          <span className={`${darkMode ? "bg-[#1e1f24]" : "bg-white"} flex flex-col justify-center items-center p-2`}>
            {
              <span className={`${darkMode ? 'bg-zinc-800' : 'bg-gray-100'} p-2 w-full flex flex-row items-center`}>
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
                  onChange={searchForItem}
                  onClick={getAllSearchData}
                  type="search"
                  className={`w-full text-sm ${darkMode ? 'text-white' : 'text-gray-500'} bg-transparent border-none focus:ring-0 placeholder-gray-400`}
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
                      className={`${darkMode ? 'text-white' : 'text-black'} p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                      className={`${darkMode ? 'text-white' : 'text-black'} p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                        className={`cursor-pointer text-sm hover:text-pastelGreen border ${darkMode ? 'border-white bg-white text-black' : 'border-gray-200 bg-gray-100 text-slate-400'} py-0.5 px-1.5 rounded-2xl`}
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
                            className={`${darkMode ? 'text-white' : 'text-black'} p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium`}
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
                  </span>
                )}
              </span>
            )}
          </span>
        )}
        {router.pathname !== "/profile/[user]" &&
          router.pathname !== "/search" &&
          hashtagList !== null &&
          hashtagList !== undefined &&
          hashtagList.trending?.length > 0 && (
            <span className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white'} pt-2 px-2`}>
              <p
                id="anime-book-font"
                className={`pb-1 text-xl ${darkMode ? 'text-white' : 'text-gray-600'} text-start font-semibold`}
              >
                TRENDING HASHTAGS
              </p>
              {hashtagList.trending.slice(0, 4).map((tag) => {
                return (
                  <div
                    key={tag}
                    className={`py-1.5 border-b ${darkMode ? 'border-black ' : 'border-gray-100'}text-sm flex flex-row justify-between`}
                  >
                    <span
                      onClick={() => {
                        // getSelectedHashTag(tag); 
                        fullPageReload('/search?'.concat(tag[0]))
                      }}
                      className="text-textGreen"
                    >
                      {tag[0]}
                    </span>
                    <span className="text-xs text-gray-400">{`${tag[1]} ${
                      tag[1] > 1 ? "posts" : "post"
                    }`}</span>
                  </div>
                );
              })}
            </span>
          )}
        {youMayKnow !== null &&
          youMayKnow !== undefined &&
          youMayKnow.length > 0 && (
            <span className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white'} pt-2 px-2`}>
              <p
                id="anime-book-font"
                className={`text-xl ${darkMode ? 'text-white' : 'text-gray-600'} text-start font-semibold`}
              >
                {router.pathname === "/search"
                  ? "Follow Others"
                  : "YOU MAY KNOW"}
              </p>

              <span className="">
                {youMayKnow
                  .slice(sliceIndex, 4 + sliceIndex)
                  .map((thisUser) => {
                    return (
                      <span
                        key={thisUser.id}
                        className={`py-1.5 border-b ${darkMode ? 'border-black' : 'border-gray-200'} flex flex-row justify-between items-center`}
                      >
                        <span
                          onClick={() => {
                            fullPageReload(`/profile/${thisUser.username}`);
                          }}
                          className="cursor-pointer flex justify-start items-center space-x-2"
                        >
                          <span className="relative h-8 w-8 flex">
                            <Image
                              alt="user profile"
                              src={thisUser.avatar}
                              height={35}
                              width={35}
                              className="rounded-full"
                            />
                          </span>
                          <span className={`${darkMode ? 'text-white' : 'text-black'} text-sm font-semibold`}>
                            {thisUser.username}
                          </span>
                        </span>

                        <PlusIcon
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

        {communities !== null &&
          communities !== undefined &&
          communities.length > 0 && (
            <span className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white'} pt-2 px-2 pb-4 flex flex-col`}>
              <p
                id="anime-book-font"
                className={`text-xl ${darkMode ? 'text-white' : 'text-gray-600'} text-start font-semibold`}
              >
                COMMUNITY OF THE DAY
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
                    className="object-cover"
                  />
                </span>
                <span id="anime-book-font" className={`w-full p-2 ${darkMode ? 'bg-black text-white': 'bg-slate-100'}`}>
                  {formatGroupName(communities[0].name)}
                </span>
              </span>
            </span>
          )}

        {router.pathname !== "/search" && (
          <span className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white'} p-2 text-sm flex flex-col items-start space-y-3`}>
            <p
              id="anime-book-font"
              className={`text-xl ${darkMode ? 'text-white' : 'text-gray-600'} text-start font-semibold`}
            >
              CONTENT PREFERENCES
            </p>

            <span className={`${darkMode ? 'text-white' : 'text-black'} flex flex-row items-center justify-start space-x-2`}>
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
                className={`w-4 h-4 text-pastelGreen ${darkMode ? 'bg-black' : 'bg-white'} border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
              />
              <span>Images</span>
            </span>
            <span className={`${darkMode ? 'text-white' : 'text-black'} flex flex-row items-center justify-start space-x-2`}>
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
                className={`w-4 h-4 text-pastelGreen ${darkMode ? 'bg-black' : 'bg-white'} border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
              />
              <span>Videos</span>
            </span>
            {router.pathname === "/home" && (
              <span className={`${darkMode ? 'text-white' : 'text-black'} flex flex-row items-center justify-start space-x-2`}>
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
                  className={`w-4 h-4 text-pastelGreen ${darkMode ? 'bg-black' : 'bg-white'} border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
                />
                <span>Stories</span>
              </span>
            )}
            {router.pathname === "/home" && (
              <span className={`${darkMode ? 'text-white' : 'text-black'} flex flex-row items-center justify-start space-x-2`}>
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
                  className={`w-4 h-4 text-pastelGreen ${darkMode ? 'bg-black' : 'bg-white'} border-pastelGreen rounded focus:text-pastelGreen focus:ring-0`}
                />
                <span>People</span>
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
export default LargeRightBar;
