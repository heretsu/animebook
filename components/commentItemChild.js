import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { BinSvg } from "./communityPostCard";

export default function CommentItemChild({ commentChild, comment }) {
  const { fullPageReload } = PageLoadOptions();
  const {
    userNumId,
    setCommentMsg,
    setParentId,
    inputRef,
    userData,
    darkMode,
  } = useContext(UserContext);
  const [likes, setLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reentry, setReentry] = useState(false);

  const likeComment = (id) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (reentry) {
      setReentry(false);

      if (liked) {
        setLiked(false);
        setLikes(likes ? likes.filter((lk) => lk.userid !== userNumId) : []);
        supabase
          .from("comment_likes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentLikes();
          });
      } else {
        setLiked(true);
        setLikes(
          likes
            ? [...likes, { commentid: id, userid: userNumId }]
            : [{ commentid: id, userid: userNumId }]
        );
        supabase
          .from("comment_likes")
          .insert({ commentid: id, userid: userNumId })
          .then(() => {
            fetchCommentLikes();
          });
      }
    }
  };

  const fetchCommentLikes = () => {
    supabase
      .from("comment_likes")
      .select()
      .eq("commentid", commentChild.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setLikes(res.data);
          setLiked(!!res.data.find((lk) => lk.userid === userNumId));
          setReentry(true);
        }
      });
  };

  const deleteComment = () => {
    supabase
      .from("comments")
      .delete()
      .eq("id", commentChild.id)
      .eq("userid", userNumId)
      .then((res) => {
        setLikes(null);
      });
  };

  const replyComment = (parentCommentId, commentOwner) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    inputRef.current.focus();
  };
  const [imgSrc, setImgSrc] = useState(commentChild.users.avatar);

  useEffect(() => {
    fetchCommentLikes();
  }, []);

  return (
    likes !== null && (
      <span className="flex justify-end w-full space-y-2">
        <span
          className={`bg-transparent ${
            darkMode ? "text-white" : "text-black"
          } w-11/12 pb-2 px-3 rounded-xl flex flex-col justify-center text-start`}
        >
          <span className="flex flex-row justify-between items-center">
            <span className="cursor-pointer flex flex-row justify-start items-start space-x-1">
              <span
                onClick={() => {
                  fullPageReload(`/profile/${commentChild.users.username}`);
                }}
                className="relative h-6 w-6 flex flex-shrink-0"
              >
                <Image
                  src={imgSrc}
                  alt="user profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={() =>
                    setImgSrc(
                      "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                    )
                  }
                />
              </span>
              <span className="pl-0.5 flex flex-col items-start">
                
                  <span className="text-sm break-words overflow-wrap break-word">
                    <CommentConfig
                      username={commentChild.users.username}
                      text={commentChild.content}
                      tags={false}
                    />
                  </span>
                  {commentChild.media && (
                  <span className="w-full flex flex-row justify-start items-start">
                    <span className="flex flex-col items-start justify-start">
                      <span className="flex justify-start items-start w-80 h-[200px] mr-2 relative">
                        <Image
                          src={commentChild.media}
                          alt="user profile"
                          layout="fill" // Makes the image fill the container
                          objectFit="contain" // Ensures the whole image is visible
                          className="rounded" // Optional: Adds rounded corners
                        />
                      </span>


                    </span>
                  </span>)}
                

                <span className="-mt-1 flex flex-row justify-between items-center space-x-2 pr-4">
                  <span
                    className={`${
                      darkMode ? "text-[#6A6B71]" : "text-[#728198]"
                    } flex flex-row items-center items-center space-x-1`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12.004"
                      height="14.17"
                      viewBox="0 0 13.004 15.17"
                    >
                      <g id="ICON" transform="translate(-7.833 -3.5)">
                        <path
                          id="Pfad_4726"
                          data-name="Pfad 4726"
                          d="M18.646,16.365a7.552,7.552,0,0,1-1.37,1.089.383.383,0,1,0,.39.66A9.607,9.607,0,0,0,19.7,16.377a5.561,5.561,0,0,0,.54-.618.522.522,0,0,0,.078-.408.416.416,0,0,0-.2-.246,6.57,6.57,0,0,0-.816-.26,8.934,8.934,0,0,0-2.842-.366.383.383,0,1,0,.019.766,8.31,8.31,0,0,1,2.379.268,15.1,15.1,0,0,1-1.495.343c-3.041.638-5.881.1-7.309-2.967C8.888,10.376,9.183,7.076,9.1,4.372a.383.383,0,1,0-.766.024c.087,2.8-.182,6.214,1.032,8.818,1.6,3.435,4.754,4.108,8.161,3.393.375-.079.751-.149,1.119-.241Z"
                          fill="#728198"
                          stroke="#728198"
                          strokeWidth="1"
                          fillRule="evenodd"
                        />
                      </g>
                    </svg>
                    <span
                      onClick={() => {
                        replyComment(comment.id, commentChild.users.username);
                      }}
                      className="text-sm cursor-pointer underline"
                    >
                      Reply
                    </span>
                  </span>

                  <span className="flex flex-row items-center space-x-2 pr-4">
                    <span className="cursor-pointer flex items-center space-x-1">
                      <svg
                        onClick={() => {
                          if (userData) {
                            likeComment(commentChild.id);
                          } else {
                            fullPageReload("/signin");
                          }
                        }}
                        className="cursor-pointer"
                        fill={
                          liked ? "#EB4463" : darkMode ? "#42494F" : "#adb6c3"
                        }
                        xmlns="http://www.w3.org/2000/svg"
                        width="14px"
                        height="14px"
                        viewBox="0 0 18.365 16.178"
                      >
                        <path
                          id="heart_1_"
                          data-name="heart (1)"
                          d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                          transform="translate(0 -1.62)"
                          fill={
                            liked ? "#EB4463" : darkMode ? "#42494F" : "#adb6c3"
                          }
                        />
                      </svg>

                      <span
                        className={`py-0.5 px-2 text-sm font-normal text-[#728198] ${
                          darkMode
                            ? "text-[#AFB1B2]"
                            : "text-[#728198]"
                        }`}
                      >
                        {likes.length}
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    )
  );
}
