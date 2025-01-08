import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";
import CommunityCommentItemChild from "./communityCommentItemChild";

export default function CommunityCommentItem({
  comment,
  comments,
  setCommentMsg,
  setParentId,
}) {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, communityInputRef, userData, darkMode } = useContext(UserContext);
  const [upvotes, setUpVotes] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [commentChildren, setCommentChildren] = useState(null);
  const { postTimeAgo } = DappLibrary();

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
      .eq("commentid", comment.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUpVotes(res.data);
          setUpvoted(!!res.data.find((up) => up.userid === userNumId));
          setReentry(true);
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

  const replyComment = (parentCommentId, commentOwner) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    communityInputRef.current.focus();
  };
  const [imgSrc, setImgSrc] = useState(comment.users.avatar)

  useEffect(() => {
    fetchCommentUpvotes();
  }, []);
  return (
    upvotes !== null &&
    comment.parentid === null && (
      <span className="py-2 space-y-2">
        <span className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-black'} text-black space-y-3 py-4 px-3 rounded-xl flex flex-col justify-center text-start`}>
          <span className="flex flex-row justify-between items-center">
            <span
              onClick={() => {
                fullPageReload(`/profile/${comment.users.username}`);
              }}
              className="cursor-pointer flex flex-row justify-start items-center space-x-0"
            >
              <span className="relative h-9 w-9 flex">
                <Image
                  src={imgSrc}
                  alt="user profile"
                  width={35}
                  height={35}
                  className="rounded-full object"
                  onError={() => setImgSrc("https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png")}
                />
              </span>
              <span className="pl-2 pr-1 font-semibold">
                {comment.users.username}
              </span>
              <span className="text-[0.7rem] text-gray-400">
                {postTimeAgo(comment.created_at)}
              </span>
            </span>
          </span>
          {comment.content !== null &&
            comment.content !== undefined &&
            comment.content !== "" && (
              <span onClick={() => {}}>
                <CommentConfig text={comment.content} tags={true} />
              </span>
            )}
          <div className="text-white flex flex-row justify-between items-center">
            <div className="flex flex-row items-center space-x-4 pr-4 py-2">
              <div className="cursor-pointer py-0.5 px-2 rounded-3xl bg-slate-400 flex items-center space-x-1">
                <svg
                onClick={()=>{upvoteComment(comment.id)}}
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
                {/* <svg
                  width="12px"
                  height="12px"
                  viewBox="0 0 16 16"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rotate-180"
                >
                  <path
                    d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"
                    fill="white"
                  />
                </svg> */}
              </div>

              <div
                onClick={() => {
                  openChildComments();
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
                  {comments.filter((c) => c.parentid === comment.id).length}
                </div>
              </div>
              <div
                onClick={() => {
                  replyComment(comment.id, comment.users.username);
                }}
                className="cursor-pointer font-medium text-textGreen"
              >
                reply
              </div>
            </div>
            <div className="flex flex-row space-x-2 items-center justify-center">
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
        </span>
        {commentChildren !== null &&
          commentChildren.length > 0 &&
          commentChildren.map((commentChild) => {
            return (
              <CommunityCommentItemChild
                key={commentChild.id}
                commentChild={commentChild}
                setCommentMsg={setCommentMsg}
                setParentId={setParentId}
              />
            );
          })}
      </span>
    )
  );
}
