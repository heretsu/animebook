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
}) {
  const videoRef = useRef(null);
  const router = useRouter();
  const { sendNotification, postTimeAgo } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const {
    setOpenComments,
    setPostIdForComment,
    setCommentValues,
    deletePost,
    setDeletePost,
    userData,
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
        supabase
          .from("likes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(async () => {
            fetchLikes();
            if (users.id !== myProfileId) {
              await supabase
                .from("users")
                .update({
                  ki:
                    parseFloat(userData.ki) !== 0
                      ? parseFloat(userData.ki) - 0.1
                      : 0,
                })
                .eq("id", myProfileId);

              await supabase
                .from("users")
                .update({
                  ki:
                    parseFloat(users.ki) !== 0 ? parseFloat(users.ki) - 0.8 : 0,
                })
                .eq("id", users.id);
            }
          });
      } else {
        supabase
          .from("likes")
          .insert({ postid: id, userid: myProfileId })
          .then(async () => {
            fetchLikes();
            sendNotification("likepost", users.id, likes, id);
            console.log(users.id, myProfileId);
            if (users.id !== myProfileId) {
              await supabase
                .from("users")
                .update({ ki: parseFloat(userData.ki) + 0.1 })
                .eq("id", myProfileId);

              await supabase
                .from("users")
                .update({ ki: parseFloat(users.ki) + 0.8 })
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
    fetchLikes();
    fetchViews();
    fetchBookmarkStatus();
    fetchComments();
  }, [viewed, isBeingViewed]);

  return (
    likes !== null &&
    views !== null &&
    comments !== null && (
      <div
        ref={ref}
        className={`${
          router.pathname !== "/comments/[comments]" && "shadow-xl"
        } ${
          !media && "w-full"
        } bg-white space-y-3 py-4 px-3 flex flex-col justify-center text-start`}
      >
        <span className="flex flex-row justify-between items-center">
          <span
            onClick={() => {
              router.push(`/profile/${users.username}`);
            }}
            className="cursor-pointer flex flex-row justify-start items-center space-x-0"
          >
            <span className="relative h-9 w-9 flex">
              <Image
                src={users.avatar}
                alt="user profile"
                width={35}
                height={35}
                className="rounded-full object"
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
              <span className="text-slate-600">Following</span>
            ) : (
              <PlusIcon
                alreadyFollowed={alreadyFollowed}
                setAlreadyFollowed={setAlreadyFollowed}
                followerUserId={myProfileId}
                followingUserId={users.id}
                size={"19"}
                color={"default"}
              />
            ))}
        </span>
        <span
          onDoubleClick={() => {
            if (userData) {
              likePost();
            } else {
              PageLoadOptions().fullPageReload("/signin");
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
                  if (router.pathname !== "/comments/[comments]") {
                    router.push(`/comments/${id}`);
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
                    fill="white"
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
                  router.push(`/comments/${id}`);
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
              router.push(`/comments/${id}`);
            }}
            className="break-all overflow-wrap-word whitespace-preline"
          >
            <CommentConfig text={content} tags={true} />
          </span>
        )}

        <div className="flex flow-row items-center justify-between">
          <div className="flex items-center space-x-4 bg-white pr-4 py-2">
            <div className="flex items-center space-x-2">
              {liked ? (
                <svg
                  onClick={() => {
                    if (userData) {
                      likePost();
                    } else {
                      PageLoadOptions().fullPageReload("/signin");
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
                      PageLoadOptions().fullPageReload("/signin");
                    }
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

            <div className="flex items-center space-x-2">
              <svg
                onClick={() => {
                  setPostIdForComment(id);
                  setCommentValues(comments);
                  router.push(`/comments/${id}`);
                }}
                className="cursor-pointer"
                fill="#000000"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z" />
              </svg>

              <div className="text-gray-800">
                {comments.filter((c) => c.parentid === null).length}
              </div>
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
          </div>
          <div className="space-x-3 w-fit flex flex-row justify-center items-center">
            {copied ? (
              <span
                className="text-xs text-black font-light"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/comments/${id}`
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
                    `https://animebook.io/comments/${id}`
                  );
                  setCopied(true);
                }}
              >
                <path
                  d="M4.5 7.5L8.5 7.5M11 4L8.5 7.49542L11 11M14.5 2.4987C14.5 3.60198 13.604 4.49739 12.5 4.49739C11.396 4.49739 10.5 3.60198 10.5 2.4987C10.5 1.39542 11.396 0.5 12.5 0.5C13.604 0.5 14.5 1.39542 14.5 2.4987ZM14.5 12.4922C14.5 13.5954 13.604 14.4909 12.5 14.4909C11.396 14.4909 10.5 13.5954 10.5 12.4922C10.5 11.3889 11.396 10.4935 12.5 10.4935C13.604 10.4935 14.5 11.3889 14.5 12.4922ZM4.5 7.49543C4.5 8.59871 3.604 9.49413 2.5 9.49413C1.396 9.49413 0.5 8.59871 0.5 7.49543C0.5 6.39215 1.396 5.49673 2.5 5.49673C3.604 5.49673 4.5 6.39215 4.5 7.49543Z"
                  stroke="#000000"
                  strokeLinecap="square"
                />
              </svg>
            )}
            <svg
              onClick={() => {
                if (userData) {
                  addBookmark();
                } else {
                  PageLoadOptions().fullPageReload("/signin");
                }
              }}
              className="cursor-pointer w-5 h-5 text-black"
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
      </div>
    )
  );
}
