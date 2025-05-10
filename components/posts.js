import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "@/lib/userContext";
import PostCard from "./postCard";
import DbUsers from "@/hooks/dbUsers";
import Spinner from "./spinner";
import PlusIcon from "./plusIcon";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json";
import UnfollowButton from "./unfollowButton";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Posts = () => {
  const {
    youMayKnow,
    setYouMayKnow,
    newPeople,
    setNewPeople,
    originalPostValues,
    setOriginalPostValues,
    postValues,
    setPostValues,
    userNumId,
    storiesFilter,
    imagesFilter,
    videosFilter,
    tagsFilter,
    searchFilter,
    followingPosts,
    darkMode,
  } = useContext(UserContext);
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const { fullPageReload } = PageLoadOptions();
  const [currentFollowedUser, setCurrentFollowedUser] = useState(null);

  const unfollowsWithPosts = () => {
    const usersWithPosts = youMayKnow.filter((user) => {
      return originalPostValues.some((og) => og.users.id === user.id);
    });
    setNewPeople(usersWithPosts);
  };

  const [visiblePosts, setVisiblePosts] = useState([]); // Posts currently visible
  const [chunkSize] = useState(50); // Number of posts to load at a time
  const [currentChunk, setCurrentChunk] = useState(1); // Tracks the chunk to load
  const [ran, setRan] = useState(false);

  const loadMorePosts = useCallback(() => {
    const nextChunk = (postValues || originalPostValues).slice(
      0,
      currentChunk * chunkSize
    );
    setVisiblePosts(nextChunk);
  }, [postValues, originalPostValues, currentChunk, chunkSize]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50
      ) {
        setCurrentChunk((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Updating visible posts when currentChunk changes
  useEffect(() => {
    if (youMayKnow && originalPostValues && !ran) {
      unfollowsWithPosts();
      setRan(true);
    }
    loadMorePosts();
  }, [ran, youMayKnow, originalPostValues, currentChunk, loadMorePosts]);

  return (
    <div className="space-y-2">
      {postValues !== null &&
        postValues !== undefined &&
        (postValues.length > 0 ? (
          <>
            {visiblePosts.map((post) => (
              <PostCard key={post.id} {...post} myProfileId={userNumId} allPosts={postValues} />
            ))}
            {visiblePosts.length < postValues.length && (
              <span>
                <Lottie
                  animationData={darkMode ? darkloadscreen : loadscreen}
                />
              </span>
            )}
          </>
        ) : (
          <div className="w-full text-center text-slate-800">
            {storiesFilter ? (
              ""
            ) : imagesFilter ? (
              "Image filter result not found. No image posts yet"
            ) : videosFilter ? (
              "Video filter result not found. No video posts yet"
            ) : tagsFilter ? (
              <span className="flex flex-col justify-center items-center">
                <p>Hashtag does not exist.</p>
                <p>Perhaps it has been deleted by creators</p>
              </span>
            ) : searchFilter ? (
              "Search not found. ない!"
            ) : followingPosts ? (
              <div className="flex flex-col px-8">
                <span className="font-medium text-sm">
                  {"You don't follow anyone with a post"}
                </span>
                <span className="font-medium text-sm">
                  {"Follow new creators:"}
                </span>
                <span className="">
                  <span className="">
                    {newPeople &&
                      newPeople
                        .slice(0, newPeople.length - 1)
                        .map((thisUser) => {
                          return (
                            <span
                              key={thisUser.id}
                              className="py-1.5 border-b border-gray-200 flex flex-row justify-between items-center"
                            >
                              <span
                                onClick={() => {
                                  fullPageReload(
                                    `/profile/${thisUser.username}`, 'window'
                                  );
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
              </div>
            ) : postValues.length && postValues.length === 0 ? (
              <span className="text-gray-600">Nanimonai! No posts found</span>
            ) : (
              <span className="h-screen">
                {/* <Lottie
                  animationData={darkMode ? darkloadscreen : loadscreen}
                /> */}
              </span>
            )}
          </div>
        ))}
    </div>
  );
};
export default Posts;
