import Image from "next/image";
import CommentConfig from "./commentConfig";
import PlusIcon from "./plusIcon";
import { useEffect, useState, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
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

export default function CommunityPostCard({
  id,
  media,
  content,
  created_at,
  users,
  myProfileId,
  community,
  comments,
}) {
  const videoRef = useRef(null);
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { sendNotification, postTimeAgo } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const { setDeletePost, userData, darkMode} = useContext(UserContext);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(null);
  const [downvoted, setDownvoted] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [downvoteReentry, setDownvoteReentry] = useState(false);
  const [followingObject, setFollowingObject] = useState(null);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  const deleteAction = () => {
    setDeletePost({ postid: id, media: media });
  };

  const addBookmark = () => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("community_bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("community_bookmarks")
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
      .from("community_bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
          setBookmarkReentry(true);
        }
      });
  };

  const upvotePost = () => {
    if (reentry) {
      setReentry(false);
      if (downvoted) {
        supabase
          .from("community_post_downvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchDownvotes();
          });
      }
      if (upvoted) {
        supabase
          .from("community_post_upvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchUpvotes();
          });
      } else {
        supabase
          .from("community_post_upvotes")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchUpvotes();
          });
      }
    }
  };

  const downvotePost = () => {
    if (downvoteReentry) {
      setDownvoteReentry(false);
      if (upvoted) {
        supabase
          .from("community_post_upvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchUpvotes();
          });
      }

      if (downvoted) {
        supabase
          .from("community_post_downvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchDownvotes();
          });
      } else {
        supabase
          .from("community_post_downvotes")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchDownvotes();
          });
      }
    }
  };

  const fetchUpvotes = () => {
    supabase
      .from("community_post_upvotes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUpvotes(res.data);
          setUpvoted(!!res.data.find((up) => up.userid === myProfileId));
          setReentry(true);
        }
      });
  };

  const fetchDownvotes = () => {
    supabase
      .from("community_post_downvotes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setDownvoted(!!res.data.find((dw) => dw.userid === myProfileId));
          setDownvoteReentry(true);
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
    fetchUpvotes();
    fetchDownvotes();
    fetchBookmarkStatus();
  }, []);

  return (
    comments &&
    upvotes !== null && (
      <div
        className={`${
          router !== "/comments/[comments]" && "shadow-sm"
        } ${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-black'} space-y-3 my-2 py-4 px-3 rounded-xl flex flex-col justify-center text-start`}
      >
        <span className="flex flex-row justify-between items-center">
          <span
            onClick={() => {
              fullPageReload(`/profile/${users.username}`);
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
            (router.pathname === "/profile/[user]" &&
            users.id === myProfileId ? (
              <span
                onClick={() => {
                  //deleteAction
                }}
                className="cursor-pointer"
              >
                {/* <BinSvg pixels={"20px"} /> */}
              </span>
            ) : (
              <svg
                onClick={() => {
                  if (userData) {
                    addBookmark();
                  } else {
                    fullPageReload("/signin");
                  }
                }}
                className="cursor-pointer w-5 h-5 text-[rgb(248 113 113)]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill={bookmarked ? "rgb(248 113 113)" : "none"}
                viewBox="0 0 14 20"
              >
                <path
                  stroke="rgb(248 113 113)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m13 19-6-5-6 5V2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17Z"
                />
              </svg>
            ))}
        </span>
        <span className="relative w-full max-h-[600px] flex justify-center">
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
                  if (!window.location.href.includes(`&${id}`)) {
                    fullPageReload(
                      `/communities/${community.split("&")[0]}&${id}`
                    );
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
                  fullPageReload(
                    `/communities/${community.split("&")[0]}&${id}`
                  );
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
            className="w-full break-all overflow-wrap-word whitespace-preline"
            onClick={() => {
              fullPageReload(`/communities/${community.split("&")[0]}&${id}`);
            }}
            style={{ whiteSpace: "pre-wrap" }}
          >
            <CommentConfig text={content} tags={true} />
          </span>
        )}

        <div className="text-white flex flex-row justify-between items-center">
          <div className="flex flex-row items-center space-x-4 pr-4 py-2">
            <div className="cursor-pointer py-0.5 px-2 rounded-3xl bg-slate-400 flex items-center space-x-1">
              <svg
                onClick={() => {
                  upvotePost();
                }}
                width="12px"
                height="12px"
                viewBox="0 0 16 16"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"
                  fill={upvoted ? "#74dc9c" : "white"}
                />
              </svg>

              <div className="font-medium">{upvotes.length}</div>
              <svg
                onClick={() => {
                  downvotePost();
                }}
                width="12px"
                height="12px"
                viewBox="0 0 16 16"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-180"
              >
                <path
                  d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"
                  fill={downvoted ? "#f87171" : "white"}
                />
              </svg>
            </div>

            <div
              onClick={() => {
                fullPageReload(`/communities/${community.split("&")[0]}&${id}`);
              }}
              className="cursor-pointer py-0.5 px-2 rounded-3xl bg-slate-400 text-white flex items-center space-x-1 justify-center"
            >
              <svg
                width="15px"
                height="15px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="white"
                  d="M736 504a56 56 0 1 1 0-112 56 56 0 0 1 0 112zm-224 0a56 56 0 1 1 0-112 56 56 0 0 1 0 112zm-224 0a56 56 0 1 1 0-112 56 56 0 0 1 0 112zM128 128v640h192v160l224-160h352V128H128z"
                />
              </svg>
              <div className="font-medium">
                {comments.filter((c) => c.parentid === null).length}
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {copied ? (
              <span
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/communities/${community}&${id}`
                  );
                }}
                className="text-black text-xs"
              >
                copied
              </span>
            ) : (
              <svg
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/communities/${community}&${id}`
                  );
                  setCopied(true);
                }}
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white cursor-pointer bg-pastelGreen p-1 rounded-full"
              >
                <path
                  d="M11.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L13 5.414V15a1 1 0 1 1-2 0V5.414L9.707 6.707a1 1 0 0 1-1.414-1.414l3-3zM4 11a2 2 0 0 1 2-2h2a1 1 0 0 1 0 2H6v9h12v-9h-2a1 1 0 1 1 0-2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"
                  fill="white"
                />
              </svg>
            )}
            <svg
              width="25px"
              height="25px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="icon cursor-pointer bg-red-400 p-1 rounded-full"
            >
              <path
                fill="white"
                d="M288 128h608L736 384l160 256H288v320h-96V64h96v64z"
              />
            </svg>
          </div>
        </div>
      </div>
    )
  );
}
