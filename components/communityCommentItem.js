import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";
import CommunityCommentItemChild from "./communityCommentItemChild";
import PopupModal from "./popupModal";
import { BinSvg } from "./communityPostCard";

export default function CommunityCommentItem({
  comment,
  comments,
  setCommentMsg,
  setParentId,
}) {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, communityInputRef, userData, darkMode } =
    useContext(UserContext);
  const [openPostOptions, setOpenPostOptions] = useState(false);
  const [upvotes, setUpVotes] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [commentChildren, setCommentChildren] = useState(null);
  const { postTimeAgo } = DappLibrary();
  const [downvoted, setDownvoted] = useState(false);
  const [downvoteReentry, setDownvoteReentry] = useState(false);

  const upvoteComment = (id) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (reentry) {
      setReentry(false);
      if (downvoted) {
        supabase
          .from("community_comment_downvotes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentDownvotes();
          });
      }

      if (upvoted) {
        supabase
          .from("community_comment_upvotes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentUpvotes();
          });
      } else {
        supabase
          .from("community_comment_upvotes")
          .insert({ commentid: id, userid: userNumId })
          .then(() => {
            fetchCommentUpvotes();
          });
      }
    }
  };

  const downvoteComment = (id) => {
    if (downvoteReentry) {
      setDownvoteReentry(false);
      if (upvoted) {
        supabase
          .from("community_comment_upvotes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentUpvotes();
          });
      }

      if (downvoted) {
        supabase
          .from("community_comment_downvotes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentDownvotes();
          });
      } else {
        supabase
          .from("community_comment_downvotes")
          .insert({ commentid: id, userid: userNumId })
          .then(() => {
            fetchCommentDownvotes();
          });
      }
    }
  };

  const fetchCommentUpvotes = () => {
    supabase
      .from("community_comment_upvotes")
      .select()
      .eq("commentid", comment.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUpVotes(res.data);
          setUpvoted(!!res.data.find((up) => up.userid === userNumId));
          setReentry(true);
        }
      });
  };

  const fetchCommentDownvotes = () => {
    supabase
      .from("community_comment_downvotes")
      .select()
      .eq("commentid", comment.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setDownvoted(!!res.data.find((up) => up.userid === userNumId));
          setDownvoteReentry(true);
        }
      });
  };

  const openChildComments = () => {
    if (commentChildren === null) {
      setCommentChildren(
        comments.filter((a) => a.parentid === comment.id).reverse()
      );
    } else {
      setCommentChildren(null);
    }
  };

  const deleteComment = () => {
    supabase
      .from("community_comments")
      .delete()
      .eq("id", comment.id)
      .eq("userid", userNumId)
      .then((res) => {
        setUpVotes(null)
      });
  };

  const replyComment = (parentCommentId, commentOwner) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    communityInputRef.current.focus();
  };
  const [imgSrc, setImgSrc] = useState(comment.users.avatar);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    fetchCommentUpvotes();
    fetchCommentDownvotes();
  }, []);
  return (
    upvotes !== null &&
    comment.parentid === null && (
      <span className="space-y-0">
        <span
          className={`${
            darkMode ? "text-white" : "text-black bg-white"
          } text-black pt-0.5 px-3 rounded-xl flex flex-col justify-center text-start`}
        >
          <span className="flex flex-row justify-between items-center">
            <span
              
              className="cursor-pointer flex flex-row justify-start items-start space-x-0"
            >
              <span onClick={() => {
                fullPageReload(`/profile/${comment.users.username}`);
              }} className="relative h-6 w-6 flex">
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

              <span className="pl-0.5 flex flex-col items-start">
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
                          className="pt-1 relative max-h-[600px] mx-auto rounded-lg object-cover w-full"
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
                  className="cursor-pointer underline"
                >
                  Reply
                </span>
              </span>

              <span className="flex flex-row items-center space-x-2 py-2">
                <span className="cursor-pointer flex items-center space-x-1">
                  <svg
                    onClick={() => {
                      upvoteComment(comment.id);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="14"
                    viewBox="0 0 14 16"
                  >
                    <g id="up-arrow" transform="translate(0)">
                      <g
                        id="Gruppe_3153"
                        data-name="Gruppe 3153"
                        transform="translate(0)"
                      >
                        <path
                          id="Pfad_1769"
                          data-name="Pfad 1769"
                          d="M46.209,6.768,39.533.1a.335.335,0,0,0-.472,0L32.4,6.768a.333.333,0,0,0,.236.568h3.67v8.331a.334.334,0,0,0,.334.333h5.339a.334.334,0,0,0,.334-.333V7.336h3.656a.333.333,0,0,0,.236-.568Z"
                          transform="translate(-32.307)"
                          fill={
                            upvoted
                              ? "#EB4463"
                              : darkMode
                              ? "#42494F"
                              : "#adb6c3"
                          }
                        />
                      </g>
                    </g>
                  </svg>

                  <span
                    className={`py-0.5 px-2 text-sm rounded ${
                      darkMode
                        ? "text-[#AFB1B2] bg-[#292C33]"
                        : "text-[#728198] bg-[#F5F5F5]"
                    }`}
                  >
                    {upvotes.length}
                  </span>
                </span>

                <svg
                  onClick={() => {
                    downvoteComment(comment.id);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="14"
                  viewBox="0 0 14 16"
                  className="rotate-180 cursor-pointer"
                >
                  <g id="up-arrow" transform="translate(0)">
                    <g
                      id="Gruppe_3153"
                      data-name="Gruppe 3153"
                      transform="translate(0)"
                    >
                      <path
                        id="Pfad_1769"
                        data-name="Pfad 1769"
                        d="M46.209,6.768,39.533.1a.335.335,0,0,0-.472,0L32.4,6.768a.333.333,0,0,0,.236.568h3.67v8.331a.334.334,0,0,0,.334.333h5.339a.334.334,0,0,0,.334-.333V7.336h3.656a.333.333,0,0,0,.236-.568Z"
                        transform="translate(-32.307)"
                        fill={
                          downvoted
                            ? "#EB4463"
                            : darkMode
                            ? "#42494F"
                            : "#adb6c3"
                        }
                      />
                    </g>
                  </g>
                </svg>

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
                    className={`text-sm font-normal rounded ${
                      darkMode ? "text-[#AFB1B2]" : "text-[#728198]"
                    }`}
                  >
                    {comments.filter((c) => c.parentid === comment.id).length}
                  </span>
                </span>
              </span>
              <svg
                onClick={() => {setOpenPostOptions(true)}}
                xmlns="http://www.w3.org/2000/svg"
                width="12.522"
                height="14"
                viewBox="0 0 12.522 16"
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
        {commentChildren !== null &&
          commentChildren.length > 0 &&
          commentChildren
            .slice(0, expand ? commentChildren.length : 1)
            .map((commentChild) => {
              return (
                <CommunityCommentItemChild
                  key={commentChild.id}
                  commentChild={commentChild}
                  setCommentMsg={setCommentMsg}
                  setParentId={setParentId}
                />
              );
            })}
        <span className="flex justify-end w-full space-y-2">
          {commentChildren && commentChildren.length > 1 && (
            <span className="flex justify-end w-full space-y-2">
              {" "}
              <span
                onClick={() => {
                  setExpand(!expand);
                }}
                className="w-11/12 py-2 px-3 cursor-pointer underline text-xs text-[#EB4463]"
              >
                {!expand ? "View more comments" : "See less"}
              </span>
            </span>
          )}
        </span>

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
