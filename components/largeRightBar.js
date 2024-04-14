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
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [displayContent, setDisplayContent] = useState({
    images: false,
    videos: false,
    stories: false,
    people: false,
  });

  const { fetchAllUsers } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [youMayKnow, setYouMayKnow] = useState(null);
  const {
    originalPostValues,
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
    userData
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
      console.log(htag[0])

      if (htag[0] === chosenTag) {
        setChosenTag(null);
        setExplorePosts(originalExplorePosts);
      } else {
        setChosenTag(htag[0]);
        const selectedTag = originalExplorePosts.filter(
          (post) =>
            (post[0].content.toLowerCase().includes(htag[0].toLowerCase())) &&
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
        const selectedTag = originalPostValues.filter(
          (post) =>
            post.content.toLowerCase().includes(htag[0].toLowerCase())
        );

        setPostValues(selectedTag);
      }
    }
  };
  const fetchYouMayKnow = async () => {
    if (userData){

    
    const followResult = await fetchFollowing(userNumId);
    fetchAllUsers().then((res) => {
      let unfollowedUsers = [];
      let i = 0;
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
    });}
  };

  const fetchAllHashTags = () => {
    // Initialize counters for all hashtags and hashtags with media
    const allTagsCount = {};
    const tagsWithMediaCount = {};

    originalPostValues.forEach((post) => {
      const tags = post.content.match(/#\w+/g) || [];
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

  useEffect(() => {
    if (originalPostValues !== null && originalPostValues !== undefined) {
      fetchAllHashTags();
    }
    if (alreadyFollowed) {
      console.log(alreadyFollowed);
      setSliceIndex(sliceIndex + 1);
    }
    fetchYouMayKnow();
  }, [originalPostValues, alreadyFollowed, userData]);

  return (
    <div className="h-screen pb-22 flex">
      <div className="h-full flex flex-col bg-white rounded-xl w-72 py-8 px-6">
        {router.pathname !== "/profile/[user]" &&
          hashtagList !== null &&
          hashtagList !== undefined &&
          hashtagList.trending?.length > 0 && (
            <span className="pb-8">
              <p className="pb-3 text-start font-semibold">Trending Hashtags</p>
              {hashtagList.trending.slice(0, 4).map((tag) => {
                return (
                  <div
                    key={tag}
                    className="text-sm flex flex-row justify-between"
                  >
                    <span
                      onClick={() => {
                        getSelectedHashTag(tag);
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
            <span className="pb-8">
              <p className="pb-3 text-start font-semibold">You may know</p>

              <span className="space-y-2">
                {youMayKnow
                  .slice(sliceIndex, 7 + sliceIndex)
                  .map((thisUser) => {
                    return (
                      <span
                        key={thisUser.id}
                        className="pr-2.5 bg-gray-100 border border-gray-200 rounded-3xl flex flex-row justify-between items-center"
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
                          <span className="text-sm font-semibold">
                            {thisUser.username}
                          </span>
                        </span>

                        <PlusIcon
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

        <p className="pb-3 text-start font-semibold">Content Filter</p>
        <div className="text-sm flex flex-col items-start space-y-3">
          <span className="flex flex-row items-center justify-start space-x-2">
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
              className="w-4 h-4 text-textGreen bg-white border-textGreen rounded focus:text-textGreen focus:ring-0"
            />
            <span>Images</span>
          </span>
          <span className="flex flex-row items-center justify-start space-x-2">
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
              className="w-4 h-4 text-red-400 bg-white border-red-400 rounded focus:text-red-400 focus:ring-0"
            />
            <span>Videos</span>
          </span>
          {router.pathname === "/home" && (
            <span className="flex flex-row items-center justify-start space-x-2">
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
                className="w-4 h-4 text-yellow-400 bg-white border-yellow-400 rounded focus:text-yellow-400 focus:ring-0"
              />
              <span>Stories</span>
            </span>
          )}
          {router.pathname === "/home" && (
            <span className="flex flex-row items-center justify-start space-x-2">
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
                className="w-4 h-4 text-blue-400 bg-white border-blue-400 rounded focus:text-blue-400 focus:ring-0"
              />
              <span>People</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default LargeRightBar;
