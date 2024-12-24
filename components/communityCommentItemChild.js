import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";

export default function CommunityCommentItemChild({ commentChild, setCommentMsg, setParentId }) {
   const {postTimeAgo} = DappLibrary()
    const { fullPageReload } = PageLoadOptions();
  const { userNumId, communityInputRef, userData, darkMode } =
    useContext(UserContext);
    const [upvotes, setUpVotes] = useState(null);
    const [upvoted, setUpvoted] = useState(false);
    const [reentry, setReentry] = useState(false);

  const upvoteComment = (id) => {
    if (userData === undefined || userData === null){
      fullPageReload('/signin');
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

  const replyComment = (parentCommentId, commentOwner) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    communityInputRef.current.focus();
  };
  
  useEffect(() => {
    fetchCommentUpvotes();
  }, []);

  
  return (
    upvotes &&
        <span className="flex justify-end w-full space-y-2">
        <span className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-black'} w-11/12 space-y-3 py-4 px-3 rounded-xl flex flex-col justify-center text-start`}>
          <span className="flex flex-row justify-between items-center">
            <span
              onClick={() => {
                fullPageReload(`/profile/${commentChild.users.username}`);
              }}
              className="cursor-pointer flex flex-row justify-start items-center space-x-0"
            >
              <span className="relative h-9 w-9 flex">
                <Image
                  src={commentChild.users.avatar}
                  alt="user profile"
                  width={35}
                  height={35}
                  className="rounded-full object"
                />
              </span>
              <span className="pl-2 pr-1 font-semibold">
                {commentChild.users.username}
              </span>
              <span className="text-[0.7rem] text-gray-400">
                
                {postTimeAgo(commentChild.created_at)}
              </span>
            </span>
          </span>
          {commentChild.content !== null &&
            commentChild.content !== undefined &&
            commentChild.content !== "" && (
              <span onClick={() => {}}>
                <CommentConfig text={commentChild.content} tags={false} />
              </span>
            )}
          <div className="text-white flex flex-row justify-between items-center">
            <div className="flex flex-row items-center space-x-4 pr-4 py-2">
              <div className="cursor-pointer py-0.5 px-2 rounded-3xl bg-slate-400 flex items-center space-x-1">
                <svg
                onClick={()=>{upvoteComment(commentChild.id)}}
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
                
              </div>

              <div
                onClick={() => {
                  replyComment(commentChild.id, commentChild.users.username);
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
        
      </span>
    )
  
}
