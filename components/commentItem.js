import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "../lib/userContext";
import CommentItemChild from "./commentItemChild";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { BinSvg } from "./communityPostCard";
import PopupModal from "./popupModal";

export default function CommentItem({
  comment,
  comments,
  setCommentMsg,
  setParentId,
}) {
  const [openPostOptions, setOpenPostOptions] = useState(false);
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, commentValues, inputRef, userData, darkMode } =
    useContext(UserContext);
  const [likes, setLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [commentChildren, setCommentChildren] = useState(null);

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
          .then((res) => {
            fetchCommentLikes();
          });
      }
    }
  };

  const fetchCommentLikes = () => {
    supabase
      .from("comment_likes")
      .select()
      .eq("commentid", comment.id)
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
      .eq("id", comment.id)
      .eq("userid", userNumId)
      .then((res) => {
        setLikes(null);
      });
  };

  const openChildComments = () => {
    if (commentChildren === null) {
      setCommentChildren(
        commentValues.filter((a) => a.parentid === comment.id).reverse()
      );
    } else {
      setCommentChildren(null);
    }
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
  const [imgSrc, setImgSrc] = useState(comment.users.avatar);

  useEffect(() => {
    fetchCommentLikes();
    if (commentValues) {
      setCommentChildren(
        commentValues.filter((a) => a.parentid === comment.id).reverse()
      );
    }
  }, [commentValues]);
  return (
    likes !== null &&
    comment.parentid === null && (
      <span
        className={`mb-0 border-b ${
          darkMode ? "border-[#292C33]" : "border-[#D0D3DB]"
        } space-y-0 flex flex-col`}
      >
        <span
          className={`bg-transparent ${
            darkMode ? "text-white" : "text-black"
          } pt-2 px-3 flex flex-col justify-center text-start`}
        >
          <span className="flex flex-row justify-between items-center">
            <span className="w-full cursor-pointer flex flex-row justify-start items-start space-x-0">
              <span
                onClick={() => {
                  fullPageReload(
                    `/profile/${comment.users.username}`,
                    "window"
                  );
                }}
                className="relative h-6 w-6 flex flex-shrink-0"
              >
                <Image
                  src={imgSrc}
                  alt="user profile"
                  width={30}
                  height={30}
                  className="rounded-full object"
                  onError={() =>
                    setImgSrc(
                      "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                    )
                  }
                />
              </span>

              <span className="w-full pl-0.5 flex flex-col items-start">
                <span className="text-sm break-words overflow-wrap break-word">
                  <CommentConfig
                    username={comment.users.username}
                    text={comment.content}
                    tags={true}
                  />
                </span>
                {comment.media && (
                  <span className="w-full flex flex-row justify-start items-start">
                    <span className="w-full flex flex-col items-start justify-start">
                      <span className="flex justify-start items-start w-full mr-2 relative">
                        <Image
                          src={comment.media}
                          alt="user profile"
                          height={300}
                          width={300}
                          className={`pt-1 relative ${comment.media.startsWith('/stickers') ? 'w-20 h-30' : 'max-h-[600px] w-full mx-auto'} rounded-lg object-cover`}
                        />
                      </span>
                    </span>
                  </span>
                )}

                <span className="ml-1 -mt-2 flex flex-row items-center space-x-2 pr-4">
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
                        replyComment(comment.id, comment.users.username);
                      }}
                      className="text-sm cursor-pointer underline"
                    >
                      Reply
                    </span>
                  </span>

                  <span className="flex flex-row items-center space-x-2 pr-4 py-2">
                    <span className="cursor-pointer flex items-center space-x-1">
                      <svg
                        onClick={() => {
                          if (userData) {
                            likeComment(comment.id);
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
                        className={`py-0.5 px-2 text-sm ${
                          darkMode ? "text-[#AFB1B2]" : "text-[#728198]"
                        }`}
                      >
                        {likes.length}
                      </span>
                    </span>

                    <span
                      onClick={() => {
                        openChildComments();
                      }}
                      className="cursor-pointer flex items-center space-x-0.5 justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14.002"
                        height="14"
                        viewBox="0 0 16.002 16"
                      >
                        <path
                          id="comment"
                          d="M.671,11.2.01,15.149a.743.743,0,0,0,.2.64A.732.732,0,0,0,.73,16a.748.748,0,0,0,.124-.007L4.8,15.331A7.863,7.863,0,0,0,8,16,8,8,0,1,0,0,8,7.863,7.863,0,0,0,.671,11.2Z"
                          fill={darkMode ? "#42494F" : "#adb6c3"}
                        />
                      </svg>

                      <span
                        className={`text-sm font-normal ${
                          darkMode ? "text-[#AFB1B2]" : "text-[#728198]"
                        }`}
                      >
                        {
                          comments.filter((c) => c.parentid === comment.id)
                            .length
                        }
                      </span>
                    </span>
                    <svg
                      onClick={() => {
                        setOpenPostOptions(true);
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="12.522"
                      height="14"
                      viewBox="0 0 12.522 16"
                      className="pl-1"
                    >
                      <path
                        id="flag_1_"
                        data-name="flag (1)"
                        d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                        transform="translate(-15.124 -7.12)"
                        fill={darkMode ? "#42494F" : "#adb6c3"}
                      />
                    </svg>
                    {comment.users.id === userNumId && <span
                      onClick={() => {
                        deleteComment();
                      }}
                    > <BinSvg pixels={"15"} />
                    </span>}
                     
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
        {commentChildren !== null &&
          commentChildren.length > 0 &&
          commentChildren.map((commentChild) => {
            return (
              <CommentItemChild
                key={commentChild.id}
                commentChild={commentChild}
                comment={comment}
              />
            );
          })}

        {openPostOptions && (
          <>
            <PopupModal
              success={"10"}
              useruuid={comment.users.useruuid}
              username={comment.users.username}
              avatar={comment.users.avatar}
              postid={comment.id}
              setOpenPostOptions={setOpenPostOptions}
              reportType={"comment"}
            />
            <div
              onClick={() => {
                setOpenPostOptions(false);
              }}
              id="tip-overlay"
            ></div>
          </>
        )}
      </span>
    )
  );
}
