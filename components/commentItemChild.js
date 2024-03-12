import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function CommentItemChild({commentChild}) {
  const {fullPageReload} = PageLoadOptions()
  const { userNumId, setCommentMsg, setParentId, inputRef } = useContext(UserContext);
  const [likes, setLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reentry, setReentry] = useState(false);

  const likeComment = (id) => {
    if (reentry) {
      setReentry(false);
      if (liked) {
        supabase
          .from("comment_likes")
          .delete()
          .eq("commentid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchCommentLikes();
          });
      } else {
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
  useEffect(() => {
    fetchCommentLikes();
  }, []);

  const replyComment = (parentCommentId, commentOwner) => {
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    inputRef.current.focus();
  };
  return (
    likes !== null && 
    <span className="ml-12 flex flex-row items-center space-x-2">
      <span onClick={()=>{fullPageReload(`/profile/${commentChild.users.username}`)}}><Image
        src={commentChild.users.avatar}
        alt="user profile"
        height={35}
        width={35}
        className="rounded-full"
      />
      </span>
      <span className="text-start space-x-1 flex flex-col items-center w-fit rounded-xl py-1 px-2 bg-slate-400 text-white">
        <p className="w-full text-normal font-semibold">
          {commentChild.users.username}
        </p>
        <p className="w-full"><CommentConfig text={commentChild.content} tags={false}/></p>
        <span className="py-1 flex flex-row items-center w-full">
          <span
            onClick={() => {
                
              replyComment(commentChild.parentid, commentChild.users.username);
            }}
            className="cursor-pointer font-semibold underline"
          >
            reply
          </span>
          {liked ? (
            <svg
              onClick={() => {
                likeComment(commentChild.id);
              }}
              className="cursor-pointer text-red-400 ml-4 mr-1"
              width="16px"
              height="16px"
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
                likeComment(commentChild.id);
              }}
              className="cursor-pointer ml-4 mr-1"
              fill="white"
              width="16px"
              height="16px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.16,5A6.29,6.29,0,0,0,12,4.36a6.27,6.27,0,0,0-8.16,9.48l6.21,6.22a2.78,2.78,0,0,0,3.9,0l6.21-6.22A6.27,6.27,0,0,0,20.16,5Zm-1.41,7.46-6.21,6.21a.76.76,0,0,1-1.08,0L5.25,12.43a4.29,4.29,0,0,1,0-6,4.27,4.27,0,0,1,6,0,1,1,0,0,0,1.42,0,4.27,4.27,0,0,1,6,0A4.29,4.29,0,0,1,18.75,12.43Z" />
            </svg>
          )}
          <span className="text-sm">{likes.length}</span>
        </span>
      </span>
    </span>
  );
}
