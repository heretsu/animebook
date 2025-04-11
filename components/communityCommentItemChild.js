import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";
import { BinSvg } from "./communityPostCard";

export default function CommunityCommentItemChild({
  commentChild,
  setCommentMsg,
  setParentId,
}) {
  const { postTimeAgo } = DappLibrary();
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, communityInputRef, userData, darkMode } =
    useContext(UserContext);
  const [upvotes, setUpVotes] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [reentry, setReentry] = useState(false);

  const upvoteComment = (id) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (reentry) {
      setReentry(false);
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

  const fetchCommentUpvotes = () => {
    supabase
      .from("community_comment_upvotes")
      .select()
      .eq("commentid", commentChild.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUpVotes(res.data);
          setUpvoted(!!res.data.find((up) => up.userid === userNumId));
          setReentry(true);
        }
      });
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
  const [imgSrc, setImgSrc] = useState(commentChild.users.avatar);

  useEffect(() => {
    fetchCommentUpvotes();
  }, []);

  return (
    upvotes && (
      <span className="flex justify-end w-full space-y-2">
        <span
          className={`bg-transparent ${
            darkMode ? "text-white" : "text-black"
          } w-11/12 pb-0.5 px-3 rounded-xl flex flex-col justify-center text-start`}
        >
          <span className="flex flex-row justify-between items-center">
            <span
             
              className="cursor-pointer flex flex-row justify-start items-start space-x-0"
            >
              <span  onClick={() => {
                fullPageReload(`/profile/${commentChild.users.username}`);
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
                  <div className="flex flex-row items-center space-x-2 pr-4">
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
                    replyComment(commentChild.id, commentChild.users.username);
                  }}
                  className="cursor-pointer underline"
                >
                  Reply
                </span>
              </span>

              <span className="flex flex-row items-center space-x-2 pr-4">
                <span className="cursor-pointer flex items-center space-x-1">
                  <svg
                    onClick={() => {
                      upvoteComment(commentChild.id);
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
                    className={`py-0.5 px-2 text-sm font-normal rounded text-[#728198] ${
                      darkMode
                        ? "text-[#AFB1B2] bg-[#292C33]"
                        : "text-[#728198] bg-[#F5F5F5]"
                    }`}
                  >
                    {upvotes.length}
                  </span>
                  {commentChild.users.id === userNumId && <span
                      onClick={() => {
                        deleteComment();
                      }}
                    > <BinSvg pixels={"15"} />
                    </span>}
                </span>
              </span>
            </div>
              </span>
            </span>
          </span>

            
        </span>
      </span>
    )
  );
}
