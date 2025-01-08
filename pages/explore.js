import { useState, useEffect, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import NavBar, { MobileNavBar } from "@/components/navBar";
import Image from "next/image";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import LargeRightBar from "@/components/largeRightBar";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ReactPlayer from "react-player";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
import CommentConfig from "@/components/commentConfig";
import SideBar from "@/components/sideBar";

export const PostActions = ({
  id,
  liked,
  likes,
  likePost,
  addBookmark,
  comments,
  views,
  bookmarked,
  users,
}) => {
  const router = useRouter();
  return likes !== null && views !== null && comments ? (
    <div className="p-2 w-fit bg-white shadow-xl rounded-full mx-auto flex flow-row items-center justify-between space-x-14">
      <div className="flex items-center space-x-2">
        {liked ? (
          <svg
            onClick={() => {
              likePost(id, users);
            }}
            className="cursor-pointer text-red-400"
            width="26px"
            height="26px"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
          </svg>
        ) : (
          <svg
            onClick={() => {
              likePost(id, users);
            }}
            className="cursor-pointer"
            fill="#000000"
            width="26px"
            height="26px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.16,5A6.29,6.29,0,0,0,12,4.36a6.27,6.27,0,0,0-8.16,9.48l6.21,6.22a2.78,2.78,0,0,0,3.9,0l6.21-6.22A6.27,6.27,0,0,0,20.16,5Zm-1.41,7.46-6.21,6.21a.76.76,0,0,1-1.08,0L5.25,12.43a4.29,4.29,0,0,1,0-6,4.27,4.27,0,0,1,6,0,1,1,0,0,0,1.42,0,4.27,4.27,0,0,1,6,0A4.29,4.29,0,0,1,18.75,12.43Z" />
          </svg>
        )}
        <div className="text-gray-800">{likes.length}</div>
      </div>

      <div
        onClick={() => {
          router.push(`${users.username}/post/${id}`);
        }}
        className="flex items-center space-x-2"
      >
        <svg
          className="cursor-pointer"
          fill="#000000"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z" />
        </svg>

        <div className="text-gray-800">{comments.length}</div>
      </div>

      <div className="flex items-center space-x-2">
        <svg
          className="cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <div className="text-gray-800">{views.length}</div>
      </div>
      <svg
        onClick={() => {
          addBookmark(id);
        }}
        className={`cursor-pointer w-5 h-5 ${
          bookmarked ? "text-pastelGreen" : "text-black"
        }`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill={bookmarked ? "currentColor" : "none"}
        viewBox="0 0 14 20"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m13 19-6-5-6 5V2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17Z"
        />
      </svg>
    </div>
  ) : (
    <span className="text-center text-pastelGreen">{"..."}</span>
  );
};

const Explore = () => {
  const { sendNotification } = DappLibrary();
  const { fullPageReload } = PageLoadOptions();
  const videoRef = useRef(null);
  const [fetchLoaded, setFetchLoaded] = useState(false);
  const {
    userNumId,
    originalPostValues,
    hashtagList,
    setHashtagList,
    originalExplorePosts,
    setOriginalExplorePosts,
    explorePosts,
    setExplorePosts,
    chosenTag,
    setChosenTag,
    imagesFilter,
    videosFilter,
    tagsFilter,
    searchFilter,
    sideBarOpened,
  } = useContext(UserContext);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [reentry, setReentry] = useState(false);
  const [views, setViews] = useState(null);
  const [comments, setComments] = useState(null);

  const [likeAnimate, setLikeAnimate] = useState(false);
  const [unlikeAnimate, setUnlikeAnimate] = useState(false);

  const triggerLikeAnimation = (triggerLike) => {
    if (triggerLike) {
      setLikeAnimate(true);
      setTimeout(() => setLikeAnimate(false), 1000);
    } else {
      setUnlikeAnimate(true);
      setTimeout(() => setUnlikeAnimate(false), 1000);
    }
  };

  const getSelectedHashTag = (htag) => {
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
  };

  const addBookmark = (id) => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchBookmarkStatus(id);
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("bookmarks")
          .insert({ postid: id, userid: userNumId })
          .then(() => {
            fetchBookmarkStatus(id);
          })
          .catch((e) => console.log(e));
      }
    }
  };
  const fetchBookmarkStatus = (id) => {
    supabase
      .from("bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === userNumId));
          setBookmarkReentry(true);
        }
      });
  };
  const likePost = (id, users) => {
    if (reentry) {
      setReentry(false);
      if (liked) {
        supabase
          .from("likes")
          .delete()
          .eq("postid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchLikes(id).then((res) => {
              if (res.error) {
                return;
              }
              triggerLikeAnimation(false);
            });
          });
      } else {
        supabase
          .from("likes")
          .insert({ postid: id, userid: userNumId })
          .then(() => {
            fetchLikes(id).then((res) => {
              if (res.error) {
                return;
              }
              triggerLikeAnimation(true);
            });
            sendNotification("likepost", users.id, likes, id);
          });
      }
    }
  };

  const fetchLikes = async (postid) => {
    const res = await supabase.from("likes").select().eq("postid", postid);

    if (res.data !== undefined && res.data !== null) {
      setLikes(res.data);
      setLiked(!!res.data.find((lk) => lk.userid === userNumId));
      setReentry(true);
    }
    return res;
  };
  const addView = (id) => {
    supabase
      .from("views")
      .insert({ postid: id, userid: userNumId })
      .then(() => {
        console.log("add view success");
      })
      .catch((e) => console.log(e));
  };
  const fetchViews = (id) => {
    supabase
      .from("views")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setViews(res.data);
          if (!!!res.data.find((lk) => lk.userid === userNumId)) {
            addView(id);
          }
        }
      })
      .catch((e) => console.log(e));
  };

  const fetchComments = (id) => {
    supabase
      .from("comments")
      .select(
        "id, created_at, content, posts(id), users(id, avatar, username), parentid"
      )
      .eq("postid", id)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setComments(res.data);
        }
      });
  };

  const fetchExplorePosts = () => {
    let a = 0;
    let sub = 0;
    let postObj = [];

    while (a < originalPostValues.length) {
      if (
        originalPostValues[a].media !== null &&
        originalPostValues[a].media !== undefined
      ) {
        postObj.push({ newId: sub, ...[originalPostValues[a]] });
        sub++;
      }
      a++;
    }
    setFetchLoaded(true);
    setOriginalExplorePosts(postObj);
    setExplorePosts(postObj);

    if (typeof window !== "undefined") {
      // Extract the hashtag from the URL
      const hash = window.location.hash;
      if (hash){
        setExplorePosts(postObj.filter(
          (post) =>
            post[0].content.toLowerCase().includes(hash.toLowerCase()) &&
            post[0].media !== null &&
            post[0].media !== undefined
        ))
        setChosenTag(hash)
      }
     
    }
  
  };

  const postToggle = (nextPost) => {
    if (nextPost) {
      if (explorePosts[currentPost.newId + 1] === undefined) {
        return;
      }
      if (
        (explorePosts[currentPost.newId + 1].newId < explorePosts.length &&
          explorePosts[currentPost.newId + 1][0].media.endsWith("mp4")) ||
        explorePosts[currentPost.newId + 1][0].media.endsWith("MP4") ||
        explorePosts[currentPost.newId + 1][0].media.endsWith("mov") ||
        explorePosts[currentPost.newId + 1][0].media.endsWith("MOV") ||
        explorePosts[currentPost.newId + 1][0].media.endsWith("3gp") ||
        explorePosts[currentPost.newId + 1][0].media.endsWith("3GP")
      ) {
        setPlayVideo(true);
      }
      setCurrentPost(
        explorePosts[
          currentPost.newId + 1 < explorePosts.length
            ? currentPost.newId + 1
            : currentPost.newId
        ]
      );
      exploreAndAllDetails(
        explorePosts[currentPost.newId + 1][0],
        explorePosts[currentPost.newId + 1]
      );
    } else {
      if (explorePosts[currentPost.newId - 1] === undefined) {
        return;
      }
      if (
        (explorePosts[currentPost.newId - 1].newId >= explorePosts[0].newId &&
          explorePosts[currentPost.newId - 1][0].media.endsWith("mp4")) ||
        explorePosts[currentPost.newId - 1][0].media.endsWith("MP4") ||
        explorePosts[currentPost.newId - 1][0].media.endsWith("mov") ||
        explorePosts[currentPost.newId - 1][0].media.endsWith("MOV") ||
        explorePosts[currentPost.newId - 1][0].media.endsWith("3gp") ||
        explorePosts[currentPost.newId - 1][0].media.endsWith("3GP")
      ) {
        setPlayVideo(true);
      }
      setCurrentPost(
        explorePosts[
          currentPost.newId - 1 >= explorePosts[0].newId
            ? currentPost.newId - 1
            : currentPost.newId
        ]
      );
      exploreAndAllDetails(
        explorePosts[currentPost.newId - 1][0],
        explorePosts[currentPost.newId - 1]
      );
    }
  };

  const pauseAndPlayVideo = (post, action) => {
    if (
      post.media.endsWith("mp4") ||
      post.media.endsWith("MP4") ||
      post.media.endsWith("mov") ||
      post.media.endsWith("MOV") ||
      post.media.endsWith("3gp") ||
      post.media.endsWith("3GP")
    ) {
      if (videoRef.current) {
        if (action) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlayVideo(true);
      } else {
        videoRef.current.pause();
        setPlayVideo(false);
      }
    }
  };

  const resetStates = () => {
    setBookmarked(false);
    setBookmarkReentry(false);
    setLiked(false);
    setLikes(null);
    setReentry(false);
    setViews(null);
    setComments(null);
  };

  const exploreAndAllDetails = (postInfos, postInfosByNewId) => {
    resetStates();

    fetchLikes(postInfos.id);
    fetchViews(postInfos.id);
    fetchBookmarkStatus(postInfos.id);
    fetchComments(postInfos.id);
    setCurrentPost(postInfosByNewId);

    setOpenExplorer(true);
    pauseAndPlayVideo(postInfos, true);
  };

  useEffect(() => {
      
    if (originalPostValues && !fetchLoaded) {
      fetchExplorePosts();
    }
  }, [fetchLoaded, originalPostValues]);
  return (
    <main>
      <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
        <NavBar />
        <SmallTopBar middleTab={true} />
        <div className="w-full py-2 space-y-5 px-2 lg:pl-lPostCustom lg:pr-rPostCustom mt-2 lg:mt-20 flex flex-col">
          <div className="topcont">
            <LargeTopBar relationship={true} />
          </div>
          <div className="text-gray-400 text-sm space-x-2 w-fit flex flex-row">
            {hashtagList !== null &&
              hashtagList !== undefined &&
              hashtagList.trending?.slice(0, 3).map((tag, index) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      getSelectedHashTag(tag);
                    }}
                    className={
                      chosenTag === tag[0]
                        ? "bg-pastelGreen text-white py-2 px-3.5 rounded-3xl cursor-pointer"
                        : "border border-gray-300 py-2 px-3.5 rounded-3xl cursor-pointer"
                    }
                  >
                    {tag[0].length > 10 ? tag[0].slice(0, 5).concat('...') : tag[0]}
                    
                  </span>
                );
              })}
          </div>

          <div className="pb-12 h-fit grid gap-2 grid-cols-3">
            {explorePosts !== null &&
              explorePosts !== undefined &&
              (explorePosts.length > 0 ? (
                explorePosts.map((post) => {
                  return (
                    <span
                      key={post.newId}
                      onClick={() => {
                        exploreAndAllDetails(post[0], explorePosts[post.newId]);
                      }}
                      className="cursor-pointer h-auto relative rounded-xl overflow-hidden"
                    >
                      {post[0].media !== null &&
                        post[0].media !== undefined &&
                        post[0].media !== "" &&
                        (post[0].media.endsWith("mp4") ||
                        post[0].media.endsWith("MP4") ||
                        post[0].media.endsWith("mov") ||
                        post[0].media.endsWith("MOV") ||
                        post[0].media.endsWith("3gp") ||
                        post[0].media.endsWith("3GP") ? (
                          <video
                            width={500}
                            height={500}
                            src={post[0].media}
                            autoPlay
                            loop
                            muted
                            className="w-full h-full rounded-lg object-cover"
                          ></video>
                        ) : (
                          <Image
                            src={post[0].media}
                            alt="Post"
                            height={500}
                            width={500}
                            className="w-full h-full object-cover"
                          />
                        ))}
                      <div className="absolute inset-0 text-white flex flex-col justify-end">
                        <span
                          onClick={() => {
                            fullPageReload(
                              `/profile/${post[0].users.username}`
                            );
                          }}
                          className="w-fit hover:underline pl-2 pb-2 flex flex-row justify-start items-center space-x-1"
                        >
                          <span className="relative h-8 w-8 flex">
                            <Image
                              src={post[0].users.avatar}
                              alt="user profile"
                              height={35}
                              width={35}
                              className="rounded-full border border-white"
                            />
                          </span>
                          <span className="font-semibold text-center text-sm">
                            {post[0].users.username}
                          </span>
                        </span>
                      </div>
                    </span>
                  );
                })
              ) : (
                <div className="w-full text-center text-slate-800">
                  {imagesFilter ? (
                    "Image filter result not found. No image media found"
                  ) : videosFilter ? (
                    "Video filter result not found. No video media found"
                  ) : tagsFilter ? (
                    <span className="flex flex-col justify-center items-center">
                      <p>Hashtag does not exist.</p>
                      <p>Perhaps it has been deleted by creators</p>
                    </span>
                  ) : searchFilter ? (
                    "Search not found. ない!"
                  ) : (
                    ""
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
      </section>

      {sideBarOpened && <SideBar />}
      <MobileNavBar />

      {currentPost !== null && (
        <div
          id={openExplorer ? "explorer-modal" : "invisible"}
          className="text-white relative flex flex-col w-full space-y-5 px-1"
        >
          <div 
            className="relative w-full h-screen flex justify-center"
          >
            {currentPost[0].media !== null &&
              currentPost[0].media !== undefined &&
              currentPost[0].media !== "" &&
              (currentPost[0].media.endsWith("mp4") ||
              currentPost[0].media.endsWith("MP4") ||
              currentPost[0].media.endsWith("mov") ||
              currentPost[0].media.endsWith("MOV") ||
              currentPost[0].media.endsWith("3gp") ||
              currentPost[0].media.endsWith("3GP") ? (
                <span
                  id="post-actions"
                  onClick={() => {
                    togglePlayPause();
                  }}
                  onDoubleClick={() => {
                    likePost(currentPost[0].id, currentPost[0].users);
                  }}
                  className="w-full"
                >
                  <video
                    className="relative w-full h-full max-w-[100%] m-auto"
                    src={currentPost[0].media}
                    ref={videoRef}
                    height={500}
                    width={500}
                    loop
                    autoPlay={playVideo}
                  ></video>
                </span>
              ) : (
                <span
                  id="post-actions"
                  onDoubleClick={() => {
                    likePost(currentPost[0].id, currentPost[0].users);
                  }}
                >
                  <Image
                    src={currentPost[0].media}
                    alt="Story"
                    height={500}
                    width={500}
                    className="
            w-full h-full object-contain max-w-[100%] m-auto"
                  />
                </span>
              ))}

            <div className="absolute inset-0 text-white flex flex-col justify-between p-2">
              <span className="flex flex-row justify-start items-center">
                <span
                  id="user-profile"
                  onClick={() => {
                    fullPageReload(`/profile/${currentPost[0].users.username}`);
                  }}
                  className="hover:underline cursor-pointer flex justify-start items-center space-x-2"
                >
                  <span className="relative h-8 w-8 flex">
                    <Image
                      src={currentPost[0].users.avatar}
                      alt="user profile"
                      height={35}
                      width={35}
                      className="rounded-full"
                    />
                  </span>
                  <span className="font-semibold">
                    {currentPost[0].users.username}
                  </span>
                </span>
              </span>
              <span
                id="post-actions"
                className="pb-12 flex flex-col text-base w-full justify-center text-start"
              >
                <span className="bg-black px-4 w-fit mx-auto">
                  <CommentConfig text={currentPost[0].content} tags={true} />
                </span>
                <PostActions
                  id={currentPost[0].id}
                  liked={liked}
                  likes={likes}
                  likePost={likePost}
                  bookmarked={bookmarked}
                  addBookmark={addBookmark}
                  comments={comments}
                  views={views}
                  users={currentPost[0].users}
                />
              </span>
              {likeAnimate && (
                <svg
                  id="heart-animation"
                  className="text-red-500"
                  width="150px"
                  height="150px"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                </svg>
              )}

              {unlikeAnimate && (
                <svg
                  id="unheart-animation"
                  width="180px"
                  height="180px"
                  viewBox="0 0 72 72"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  aria-hidden="true"
                  role="img"
                  className="iconify iconify--fxemoji"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    fill="#ef4444"
                    d="M39.1 54c1-.9 1-2.4.2-3.4l-7.6-8.8c-.8-.9-.7-2.2.1-3.1l.2-.1l8.4-8.1c.8-.7.9-1.9.3-2.7c0 0-6.7-10.2-6.8-10.4c-8-8-21.2-7.7-28.8 1C-.6 24.9-1.3 34.6 3.4 42C5 44.5 7 46.4 9.3 47.9l17.8 14.4c1 .8 2.5.8 3.4-.1l8.6-8.2z"
                  />
                  <path
                    fill="#ef4444"
                    d="M66.9 18.6c-5.7-6.6-14.5-8.4-22-5.6c-2.2.8-3.1 3.5-2 5.6l5.3 9.7l.1.2c.7 1.2.3 2.8-.7 3.6L37.8 40c-.6.5-.7 1.3-.3 1.9l6.9 9.6l.1.1c.5.7.4 1.6-.3 2.2L31.9 64.1c-.7.6-.7 1.6 0 2.1l1.8 1.4c1.4 1.1 3.4 1.1 4.8 0l24.3-19.8s.1 0 .1-.1c1.8-1.2 3.5-2.8 4.9-4.7c5.4-7.2 5.1-17.5-.9-24.4z"
                  />
                </svg>
              )}
            </div>
            {/* explore post Controllers */}
            <div className="text-xl font-semibold w-full absolute inset-0 flex flex-row justify-between items-center h-fit my-auto">
              <span
                onClick={() => {
                  postToggle(false);
                }}
                id="left-controller"
                className="bg-pastelGreen rounded-lg py-1 px-2 cursor-pointer"
              >
                {"<"}
              </span>
              <span
                onClick={() => {
                  postToggle(true);
                }}
                id="right-controller"
                className="bg-pastelGreen rounded-lg py-1 px-2 cursor-pointer"
              >
                {">"}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => {
          setOpenExplorer(false);
        }}
        id={openExplorer ? "stories-cancel" : "invisible"}
        className="cursor-pointer text-white font-bold justify-end items-center mt-4"
      >
        <span
          onClick={() => {
            pauseAndPlayVideo(currentPost[0], false);
          }}
          className="bg-pastelGreen text-xl py-1 px-2 rounded-lg"
        >
          x
        </span>
      </div>
      {openExplorer && (
        <>
          <div id="stories-overlay" className="bg-black bg-opacity-80"></div>
        </>
      )}
    </main>
  );
};
export default Explore;
