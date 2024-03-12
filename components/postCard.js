import Image from "next/image";
import CommentConfig from "./commentConfig";
import PlusIcon from "./plusIcon";
import { useEffect, useState, useContext } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import PostInViewport from "@/lib/postInViewport";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
export default function PostCard({
  id,
  media,
  content,
  created_at,
  users,
  myProfileId,
}) {
  const router = useRouter();
  const { sendNotification } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const { setOpenComments, setPostIdForComment, setCommentValues } =
    useContext(UserContext);
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

  const [ref, isBeingViewed] = PostInViewport({
    threshold: 0.5,
  });

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
          .then(() => {
            fetchLikes();
          });
      } else {
        supabase
          .from("likes")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchLikes();
            sendNotification("likepost", users.id, likes, id);
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
      if (users.id !== myProfileId) {
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
        className="shadow-xl bg-white space-y-3 py-4 px-3 rounded-xl flex flex-col justify-center text-start"
      >
        <span className="flex flex-row justify-between items-center">
          <span
            onClick={() => {
              router.push(`/profile/${users.username}`);
            }}
            className="cursor-pointer flex justify-start items-center space-x-2"
          >
            <Image
              src={users.avatar}
              alt="user profile"
              height={35}
              width={35}
              className="rounded-full"
            />
            <span className="font-semibold">{users.username}</span>
          </span>

          {router.pathname !== "/profile/[user]" &&
            users.id !== myProfileId &&
            (alreadyFollowed === null ? (
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
        <span onDoubleClick={()=>{likePost()}} className="w-full flex justify-center">
          {media !== null &&
            media !== undefined &&
            media !== "" &&
            (media.endsWith("mp4") ||
            media.endsWith("MP4") ||
            media.endsWith("mov") ||
            media.endsWith("MOV") ||
            media.endsWith("3gp") ||
            media.endsWith("3GP") ? (
              <video
                width={500}
                height={500}
                src={media}
                controls
                className="w-full h-full rounded-lg object-contain"
              ></video>
            ) : (
              <Image
                src={media}
                alt="post"
                height={500}
                width={500}
                className="w-full h-full rounded-lg object-contain"
              />
            ))}
        </span>
        {content !== null && content !== undefined && content !== "" && (
          <CommentConfig text={content} tags={true} />
        )}

        <div className="flex flow-row items-center justify-between">
          <div className="flex items-center space-x-4 bg-white pr-4 py-2">
            <div className="flex items-center space-x-2">
              {liked ? (
                <svg
                  onClick={() => {
                    likePost();
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
                    likePost();
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
                  if (router.pathname === "/profile/[user]"){
                    router.push(`/comments/${id}`)
                  } else if(router.pathname === "/comments/[comments]"){
                    console.log('comment page')
                    return
                  } else{
                    setOpenComments(true);
                  }
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
          <svg
            onClick={() => {
              addBookmark();
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
    )
  );
}
