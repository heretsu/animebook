import Image from "next/image";
import CommentConfig from "./commentConfig";
import PlusIcon from "./plusIcon";
import { useEffect, useState, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import PostInViewport from "@/lib/postInViewport";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
import ReactPlayer from "react-player";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Lottie from "lottie-react";
import animationData from "@/assets/kianimation.json";
import PopupModal from "./popupModal";
import UnfollowButton from "./unfollowButton";

export const BinSvg = ({ pixels }) => {
  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="red"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
      />
    </svg>
  );
};

export default function PostCard({
  id,
  media,
  content,
  created_at,
  users,
  myProfileId,
  repostAuthor,
  repostQuote,
  repostCreatedAt,
}) {
  const videoRef = useRef(null);
  const router = useRouter();
  const { sendNotification, postTimeAgo } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const { fullPageReload } = PageLoadOptions();
  const {
    setOpenComments,
    setPostIdForComment,
    setCommentValues,
    deletePost,
    setDeletePost,
    userData,
    darkMode,
  } = useContext(UserContext);
  const [comments, setComments] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [reentry, setReentry] = useState(false);
  const [followingObject, setFollowingObject] = useState(null);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [views, setViews] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [viewReentry, setViewReentry] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [madeRepost, setMadeRepost] = useState(false);
  const [reposts, setReposts] = useState(null);
  const [repostReentry, setRepostReentry] = useState(false);
  const [openQuote, setOpenQuote] = useState(false);
  const [pressTimeout, setPressTimeout] = useState(null);
  const [quoteContent, setQuoteContent] = useState(null);
  const [openTipPost, setOpenTipPost] = useState(false);
  const [openPostOptions, setOpenPostOptions] = useState(false)

  const [ref, isBeingViewed] = PostInViewport({
    threshold: 0.5,
  });

  const deleteAction = () => {
    setDeletePost({ postid: id, media: media });
  };

  const addBookmark = () => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("bookmarks")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      }
    }
  };
  const fetchBookmarkStatus = () => {
    supabase
      .from("bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
          setBookmarkReentry(true);
        }
      });
  };

  const likePost = () => {
    if (reentry) {
      setReentry(false);
      if (liked) {
        setLiked(false);
        setLikes(
          likes.filter((lk) => {
            return lk.userid !== myProfileId;
          })
        );
        supabase
          .from("likes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(async () => {
            setReentry(true);
            // fetchLikes();
            if (users.id !== myProfileId) {
              await supabase
                .from("users")
                .update({
                  ki:
                    parseFloat(users.ki) !== 0
                      ? parseFloat(users.ki) - 0.08
                      : 0,
                })
                .eq("id", users.id);
            }
          });
      } else {
        setLiked(true);
        setLikes([
          ...likes,
          {
            postid: id,
            userid: myProfileId,
          },
        ]);
        supabase
          .from("likes")
          .insert({ postid: id, userid: myProfileId })
          .then(async () => {
            setReentry(true);
            // fetchLikes();
            sendNotification("likepost", users.id, likes, id);
            if (users.id !== myProfileId) {
              await supabase
                .from("users")
                .update({ ki: parseFloat(users.ki) + 0.08 })
                .eq("id", users.id);
            }
          });
      }
    }
  };

  const fetchLikes = () => {
    supabase
      .from("likes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setLikes(res.data);
          setLiked(!!res.data.find((lk) => lk.userid === myProfileId));
          setReentry(true);
        }
      });
  };

  const handleRepost = (quoteWanted) => {
    if (repostReentry) {
      setRepostReentry(false);
      if (madeRepost) {
        setMadeRepost(false);
        setReposts(
          reposts.filter((rt) => {
            return rt.userid !== myProfileId;
          })
        );
        setQuoteContent("");
        supabase
          .from("reposts")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(async () => {
            setRepostReentry(true);
            // fetchReposts();
          });
      } else {
        if (quoteWanted) {
          setQuoteContent("");
          setOpenQuote(true);
          setRepostReentry(true);
        } else {
          setMadeRepost(true);
          setReposts([
            ...reposts,
            {
              postid: id,
              userid: myProfileId,
            },
          ]);
          setQuoteContent("");
          supabase
            .from("reposts")
            .insert({ postid: id, userid: myProfileId })
            .then(async () => {
              setRepostReentry(true);
              // fetchReposts();
              // sendNotification("likepost", users.id, likes, id);
            });
        }
      }
    }
  };

  const handleQuoteRepost = () => {
    if (repostReentry) {
      setRepostReentry(false);
      setMadeRepost(true);
      setReposts([
        ...reposts,
        {
          postid: id,
          userid: myProfileId,
          quote:
            quoteContent !== null && quoteContent !== "" ? quoteContent : null,
        },
      ]);
      setOpenQuote(false);

      supabase
        .from("reposts")
        .insert({ postid: id, userid: myProfileId, quote: quoteContent })
        .then(async () => {
          setQuoteContent("");
          setRepostReentry(true);
        });
    }
  };

  const fetchReposts = () => {
    supabase
      .from("reposts")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setReposts(res.data);
          setMadeRepost(!!res.data.find((rt) => rt.userid === myProfileId));
          setRepostReentry(true);
        }
      });
  };

  const addView = () => {
    if (viewReentry) {
      setViewReentry(false);
      if (viewed) {
        console.log("viewed");
      } else {
        supabase
          .from("views")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchViews();
          })
          .catch((e) => console.log(e));
      }
    }
  };
  const fetchViews = () => {
    supabase
      .from("views")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setViews(res.data);
          setViewed(!!res.data.find((lk) => lk.userid === myProfileId));
          setViewReentry(true);
        }
      })
      .catch((e) => console.log(e));
  };

  const fetchComments = () => {
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
  const loadVideoSnippet = (e) => {
    if (e.target.buffered.length > 0) {
      const loadedPercentage =
        (e.target.buffered.end(0) / e.target.duration) * 100;
      if (loadedPercentage >= 50) {
        e.target.preload = "none";
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

  const handlePressStart = () => {
    //for long press
    const timeout = setTimeout(() => {
      if (userData) {
        handleRepost(true);
      } else {
        fullPageReload("/signin");
      }
    }, 500);
    setPressTimeout(timeout);
  };

  const handlePressEnd = () => {
    if (pressTimeout) {
      clearTimeout(pressTimeout);
      setPressTimeout(null);
      if (userData) {
        handleRepost(false);
      } else {
        fullPageReload("/signin");
      }
    }
  };

  const [imgSrc, setImgSrc] = useState(repostAuthor && repostAuthor.avatar)
  const [imgSrcOrigin, setImgSrcOrigin] = useState(users && users.avatar)

  useEffect(() => {
    if (users.id !== myProfileId) {
      fetchFollows(users.id).then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setFollowingObject(res.data);
          setAlreadyFollowed(
            !!res.data.find((rel) => rel.follower_userid === myProfileId)
          );
        }
      });
    }
    if (!viewed && isBeingViewed) {
      if (userData && users.id !== myProfileId) {
        addView();
      }
    }
    fetchReposts();
    fetchLikes();
    fetchViews();
    fetchBookmarkStatus();
    fetchComments();
  }, [viewed, isBeingViewed]);

  return (
    likes !== null &&
    reposts !== null &&
    views !== null &&
    comments !== null && (
      <div
        ref={ref}
        className={`${
          router.pathname !== ("/comments/[comments]" || "/[username]/post/[postid]") && "shadow-xl"
        } ${!media && "w-full"} ${
          darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
        } space-y-1 py-4 px-3 flex flex-col justify-center text-start`}
      >
        {router.pathname === "/profile/[user]" &&
          repostAuthor &&
          repostAuthor.username && (
            <span className="text-xs text-slate-500 font-medium">
              {repostAuthor.username} reposted
            </span>
          )}
        {repostQuote && (
          <span className="flex flex-row justify-between items-center">
            <span
              onClick={() => {
                fullPageReload(`/profile/${repostAuthor.username}`);
              }}
              className="cursor-pointer flex flex-row justify-start items-center space-x-0"
            >
              <span className="relative h-8 w-8 flex">
                <Image
                  src={imgSrc}
                  alt="user profile"
                  width={35}
                  height={35}
                  className="rounded-full object-cover"
                  onError={() => setImgSrc("https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png")}
                />
              </span>

              <span className="flex flex-col">
                <span className="flex flex-row items-center">
                  <span className="pl-2 pr-1 text-xs font-semibold">
                    {repostAuthor.username}
                  </span>
                  <span className="text-[0.7rem] text-gray-400">
                    reposted {postTimeAgo(repostCreatedAt)}
                  </span>
                </span>
                <span className="flex flex-row items-center">
                  <span className="h-4 w-6">
                    <Lottie animationData={animationData} />
                  </span>
                  <span className="absolute pl-6 text-[0.7rem] font-bold text-blue-400">
                    {parseFloat(parseFloat(repostAuthor.ki).toFixed(2))}
                  </span>
                </span>
              </span>
            </span>
          </span>
        )}
        {repostQuote && (
          <span
            className={`${
              darkMode ? "text-white bg-gray-700" : "text-black bg-gray-100"
            } px-1 py-2 w-full rounded`}
          >
            <CommentConfig text={repostQuote} tags={true} />{" "}
          </span>
        )}

        <span className="flex flex-row justify-between items-center">
          <span
            onClick={() => {
              fullPageReload(`/profile/${users.username}`);
            }}
            className="cursor-pointer flex flex-row justify-start items-center space-x-0"
          >
            <span className="relative h-9 w-9 flex">
              <Image
                src={imgSrcOrigin}
                alt="user profile"
                width={35}
                height={35}
                className="rounded-full object-cover"
                onError={() => setImgSrcOrigin("https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png")}
              />
            </span>

            <span className="flex flex-col">
              <span className="flex flex-row">
                <span className="pl-2 pr-1 font-semibold">
                  {users.username}
                </span>
                <span className="text-[0.7rem] text-gray-400">
                  {postTimeAgo(created_at)}
                </span>
              </span>
              <span className="flex flex-row items-center">
                <span className="h-6 w-8">
                  <Lottie animationData={animationData} />
                </span>
                <span className="absolute pl-6 text-xs font-bold text-blue-400">
                  {parseFloat(parseFloat(users.ki).toFixed(2))}
                </span>
              </span>
            </span>
          </span>

          {userData &&
            (users.id === myProfileId ? (
              <span onClick={deleteAction} className="cursor-pointer">
                <BinSvg pixels={"20px"} />
              </span>
            ) : alreadyFollowed === null ? (
              ""
            ) : alreadyFollowed ? (
              <span className="flex flex-row space-x-0.5">
                <span></span>
                <UnfollowButton
                  alreadyFollowed={alreadyFollowed}
                  setAlreadyFollowed={setAlreadyFollowed}
                  followerUserId={myProfileId}
                  followingUserId={users.id}
                />
              </span>
            ) : (
              <span className="flex flex-row space-x-0.5 justify-center items-center">
                <PlusIcon
                ymk={false}
                  alreadyFollowed={alreadyFollowed}
                  setAlreadyFollowed={setAlreadyFollowed}
                  followerUserId={myProfileId}
                  followingUserId={users.id}
                  size={"19"}
                  color={"default"}
                />
                
                <svg
                onClick={()=>{
                  setOpenPostOptions(true)
                }}
                className="rotate-90 cursor-pointer"
                  fill={darkMode ? "white" : "#000000"}
                  width="18px"
                  height="18px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12,10a2,2,0,1,1-2,2A2,2,0,0,1,12,10ZM4,14a2,2,0,1,0-2-2A2,2,0,0,0,4,14Zm16-4a2,2,0,1,0,2,2A2,2,0,0,0,20,10Z" />
                </svg>
              </span>
            ))}
        </span>
        <span
          onDoubleClick={() => {
            if (userData) {
              likePost();
            } else {
              fullPageReload("/signin");
            }
          }}
          className="relative w-full max-h-[600px] flex justify-center"
        >
          {media !== null &&
            media !== undefined &&
            media !== "" &&
            (media.endsWith("mp4") ||
            media.endsWith("MP4") ||
            media.endsWith("mov") ||
            media.endsWith("MOV") ||
            media.endsWith("3gp") ||
            media.endsWith("3GP") ? (
              <span
                onClick={() => {
                  if (router.pathname !== ("/comments/[comments]" || "[username]/post/[postid]")) {
                    router.push(`/${users.username}/post/${id}`);
                  } else {
                    togglePlayPause();
                  }
                }}
                className="relative cursor-pointer flex justify-center items-center bg-black w-full"
              >
                <video
                  className="relative max-h-[600px]"
                  src={media}
                  ref={videoRef}
                  height={600}
                  width={600}
                  loop
                  onProgress={(e) => {
                    loadVideoSnippet(e);
                  }}
                ></video>
                {!playVideo && (
                  <svg
                    fill={"white"}
                    width="70px"
                    height="70px"
                    viewBox="0 0 36 36"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className="absolute m-auto bg-black bg-opacity-20 p-2 rounded-full"
                  >
                    <title>{"play-solid"}</title>
                    <path
                      className="clr-i-solid clr-i-solid-path-1"
                      d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
                    />
                    <rect x={0} y={0} width={36} height={36} fillOpacity={0} />
                  </svg>
                )}
              </span>
            ) : (
              <span
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/${users.username}/post/${id}`);
                }}
              >
                <Image
                  src={media}
                  alt="post"
                  width={600}
                  height={600}
                  className="rounded-lg object-cover"
                />
              </span>
            ))}
        </span>
        {content !== null && content !== undefined && content !== "" && (
          <span
            onClick={() => {
              router.push(`/${users.username}/post/${id}`);
            }}
            className="break-all overflow-wrap-word whitespace-preline"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <CommentConfig text={content} tags={true} />
          </span>
        )}

        <div className="flex flow-row items-center justify-between">
          <div className="flex items-center space-x-4 bg-transparent pr-4 py-2">
            <div className="flex items-center space-x-2">
              {liked ? (
                <svg
                  onClick={() => {
                    if (userData) {
                      likePost();
                    } else {
                      fullPageReload("/signin");
                    }
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
                    if (userData) {
                      likePost();
                    } else {
                      fullPageReload("/signin");
                    }
                  }}
                  className="cursor-pointer"
                  fill={darkMode ? "white" : "#000000"}
                  width="26px"
                  height="26px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.16,5A6.29,6.29,0,0,0,12,4.36a6.27,6.27,0,0,0-8.16,9.48l6.21,6.22a2.78,2.78,0,0,0,3.9,0l6.21-6.22A6.27,6.27,0,0,0,20.16,5Zm-1.41,7.46-6.21,6.21a.76.76,0,0,1-1.08,0L5.25,12.43a4.29,4.29,0,0,1,0-6,4.27,4.27,0,0,1,6,0,1,1,0,0,0,1.42,0,4.27,4.27,0,0,1,6,0A4.29,4.29,0,0,1,18.75,12.43Z" />
                </svg>
              )}
              <div className={darkMode ? "text-white" : "text-gray-800"}>
                {likes.length}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                onClick={() => {
                  setPostIdForComment(id);
                  setCommentValues(comments);
                  router.push(`/${users.username}/post/${id}`);
                }}
                className="cursor-pointer"
                fill={darkMode ? "white" : "#000000"}
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z" />
              </svg>

              <div className={`${darkMode ? "text-white" : "text-gray-800"}`}>
                {comments.filter((c) => c.parentid === null).length}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {madeRepost ? (
                <svg
                  onMouseDown={handlePressStart}
                  onMouseUp={handlePressEnd}
                  onTouchStart={handlePressStart}
                  onTouchEnd={handlePressEnd}
                  className="cursor-pointer text-pastelGreen"
                  fill="currentColor"
                  width="22px"
                  height="22px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 4a2 2 0 0 0-2 2v6H0l4 4 4-4H5V6h7l2-2H5zm10 4h-3l4-4 4 4h-3v6a2 2 0 0 1-2 2H6l2-2h7V8z" />
                </svg>
              ) : (
                <svg
                  onMouseDown={handlePressStart}
                  onMouseUp={handlePressEnd}
                  onTouchStart={handlePressStart}
                  onTouchEnd={handlePressEnd}
                  className="cursor-pointer text-black"
                  fill={darkMode ? "white" : "#000000"}
                  width="22px"
                  height="22px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 4a2 2 0 0 0-2 2v6H0l4 4 4-4H5V6h7l2-2H5zm10 4h-3l4-4 4 4h-3v6a2 2 0 0 1-2 2H6l2-2h7V8z" />
                </svg>
              )}
              <div className={darkMode ? "text-white" : "text-gray-800"}>
                {reposts.length}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                className="cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                width="16px"
                height="16px"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? "white" : "#000000"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div className={darkMode ? "white" : "text-gray-800"}>
                {views.length}
              </div>
            </div>
          </div>

          <div className="space-x-3 w-fit flex flex-row justify-center items-center">
          {userData && users.id !== myProfileId && <div
              className="flex items-center"
              onClick={() => {
                setOpenTipPost(true);
              }}
            >
              <svg
                width="18px"
                height="18px"
                className="text-blue-500"
                stroke={darkMode ? "white" : ""}
                fill="currentColor"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 19.928 19.928"
                style={{
                  enableBackground: "new 0 0 19.928 19.928",
                }}
                xmlSpace="preserve"
              >
                <g>
                  <path
                    style={{
                      fill: "#010002",
                    }}
                    d="M11.273,3.18l-0.242-0.766c-0.096-0.305-0.228-0.603-0.393-0.884 c-0.545-0.926-1.18-1.328-1.425-1.352C9.122,0.373,9.136,1.12,9.701,2.081c0.538,0.916,1.165,1.318,1.417,1.351 C11.118,3.432,11.273,3.18,11.273,3.18z M13.731,2.081c0.564-0.961,0.578-1.708,0.488-1.903c-0.245,0.023-0.882,0.424-1.427,1.352 c-0.166,0.282-0.297,0.58-0.393,0.884L12.154,3.19l0.163,0.252C12.549,3.411,13.185,3.01,13.731,2.081z M11.381,3.927h2.02v2.818 h4.908V3.958H13.7c0.372-0.273,0.75-0.698,1.061-1.225c0.67-1.142,0.768-2.328,0.217-2.651C14.883,0.027,14.776,0,14.66,0 c-0.561,0-1.335,0.617-1.893,1.562c-0.186,0.319-0.324,0.639-0.42,0.945c-0.096-0.306-0.232-0.626-0.42-0.945 C11.372,0.617,10.595,0,10.033,0C9.92,0,9.812,0.027,9.716,0.082c-0.548,0.323-0.45,1.509,0.219,2.651 c0.311,0.527,0.691,0.952,1.062,1.225h-4.61v2.787h4.994V3.927z M12.974,2.705c0.087-0.278,0.208-0.55,0.359-0.81 c0.498-0.849,1.082-1.216,1.309-1.237c0.08,0.177,0.068,0.862-0.447,1.741c-0.502,0.852-1.084,1.218-1.295,1.246l-0.15-0.23 C12.75,3.415,12.974,2.705,12.974,2.705z M10.502,2.399c-0.516-0.879-0.53-1.564-0.446-1.741c0.224,0.021,0.807,0.389,1.306,1.237 c0.152,0.257,0.271,0.529,0.361,0.81l0.22,0.701l-0.142,0.23C11.569,3.607,10.996,3.238,10.502,2.399z M13.568,7.636v3.146 c0.364,0.184,0.465,0.516,0.465,0.516s0.072-0.034,0.072,1.479c0,1.514-0.324,1.568-0.537,1.616v0.824c0,0,2.462-0.796,3.928-2.65 c0.532-0.673,0.822-0.505,0.822-0.505l-0.01-4.426C18.308,7.636,13.568,7.636,13.568,7.636z M11.381,7.636H6.386v2.572 c1.209,0,3.428,0,4.994,0V7.636H11.381z M0.028,10.264h2.855v9.663H0.028V10.264z M18.054,13.379 c-0.113-0.044-0.23-0.061-0.349-0.041c-0.897,0.165-2.255,3.501-5.789,2.538c0,0-1.034-0.334-1.425-0.574 c-0.346-0.191-1.08-0.628-1.68-1.084h1.68h1.889c0,0,0.146,0.009,0.315-0.029c0.231-0.053,0.508-0.194,0.508-0.576 c0-0.66,0-1.647,0-1.647s-0.11-0.548-0.508-0.749c-0.091-0.046-0.194-0.075-0.315-0.075c-0.186,0-0.924,0-1.889,0 c-1.711,0-4.133,0-5.453,0c-0.581,0-0.949,0-0.949,0v7.026c0,0,5.602,1.758,7.578,1.758c0,0,4.939,0.22,8.234-3.624 C19.902,16.303,19.043,13.763,18.054,13.379z"
                  />
                </g>
              </svg>
            </div>}

            {copied ? (
              <span
                className={`text-xs ${
                  darkMode ? "text-white" : "text-black"
                } font-light`}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/${users.username}/post/${id}`
                  );
                }}
              >
                copied
              </span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                strokeWidth={1.2}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/${users.username}/post/${id}`
                  );
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 500);
                }}
              >
                <path
                  d="M4.5 7.5L8.5 7.5M11 4L8.5 7.49542L11 11M14.5 2.4987C14.5 3.60198 13.604 4.49739 12.5 4.49739C11.396 4.49739 10.5 3.60198 10.5 2.4987C10.5 1.39542 11.396 0.5 12.5 0.5C13.604 0.5 14.5 1.39542 14.5 2.4987ZM14.5 12.4922C14.5 13.5954 13.604 14.4909 12.5 14.4909C11.396 14.4909 10.5 13.5954 10.5 12.4922C10.5 11.3889 11.396 10.4935 12.5 10.4935C13.604 10.4935 14.5 11.3889 14.5 12.4922ZM4.5 7.49543C4.5 8.59871 3.604 9.49413 2.5 9.49413C1.396 9.49413 0.5 8.59871 0.5 7.49543C0.5 6.39215 1.396 5.49673 2.5 5.49673C3.604 5.49673 4.5 6.39215 4.5 7.49543Z"
                  stroke={darkMode ? "white" : "#000000"}
                  strokeLinecap="square"
                />
              </svg>
            )}
            <svg
              onClick={() => {
                if (userData) {
                  addBookmark();
                } else {
                  fullPageReload("/signin");
                }
              }}
              className={`cursor-pointer w-5 h-5 ${
                darkMode ? "text-white" : "text-black"
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
        </div>
        {openQuote && (
          <>
            <div
              id="modal-visible"
              className={`max-w-[400px] flex flex-col py-2 px-2 w-full relative ${
                darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
              } rounded-lg`}
            >
              <span className="pl-3 pb-1 text-start font-semibold">
                Quoted Repost
              </span>
              <textarea
                value={quoteContent !== null ? quoteContent : ""}
                onChange={(e) => {
                  setQuoteContent(e.target.value);
                }}
                maxLength={160}
                placeholder="What do you think of this post..."
                className="bg-transparent font-medium text-sm h-18 resize-none w-full px-2 border-none focus:outline-none focus:ring-0"
              ></textarea>

              <span className="pb-4 text-sm text-white text-center flex flex-row justify-end font-semibold">
                <span
                  onClick={() => {
                    handleQuoteRepost();
                  }}
                  className={`${
                    darkMode ? "" : "border border-gray-100"
                  } bg-pastelGreen py-1 w-[70px] rounded-lg cursor-pointer`}
                >
                  Repost
                </span>
              </span>
            </div>
            <div
              onClick={() => {
                setOpenQuote(false);
              }}
              id="overlay"
            ></div>
          </>
        )}

        {
          openPostOptions && (
            <>
            <PopupModal
              success={"10"}
              useruuid={users.useruuid}
              username={users.username}
              postid={id}
              setOpenPostOptions={setOpenPostOptions}
            />
            <div
              onClick={() => {
                setOpenPostOptions(false);
              }}
              id="tip-overlay"
            ></div>
            </>
          )
        }

        {openTipPost && (
          <>
            <PopupModal
              success={"6"}
              username={users.username}
              useruuid={users.useruuid}
              destSolAddress={users.solAddress ? users.solAddress : null}
              avatar={users.avatar}
              destinationAddress={users.address}
              userDestinationId={users.id}
              post={true}
            />
            <div
              onClick={() => {
                setOpenTipPost(false);
              }}
              id="tip-overlay"
            ></div>
          </>
        )}
      </div>
    )
  );
}
