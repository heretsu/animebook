import { useState, useEffect } from "react";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CommentItemChild from "./commentItemChild";
import CommentConfig from "./commentConfig";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function CommentItem({comment}) {
  const {fullPageReload} = PageLoadOptions()
  const {userNumId, commentValues, setCommentMsg, setParentId, inputRef, userData} = useContext(UserContext)
  const [likes, setLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [commentChildren, setCommentChildren] = useState(null);

  const likeComment = (id) => {
    if (userData === undefined || userData === null){
      fullPageReload('/signin');
      return;
    }
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
      .eq("commentid", comment.id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setLikes(res.data);
          setLiked(!!res.data.find((lk) => lk.userid === userNumId));
          setReentry(true);
        }
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
    if (userData === undefined || userData === null){
      fullPageReload('/signin');
      return;
    }
    setCommentMsg(`@${commentOwner} `);
    setParentId(parentCommentId);
    inputRef.current.focus();
  };
  const [imgSrc, setImgSrc] = useState(comment.users.avatar)

  useEffect(() => {
    fetchCommentLikes();
  }, []);
  return (
    likes !== null &&
    comment.parentid === null && (
      <span className="space-y-2">
        <span className="flex flex-row items-center space-x-2">

        <span onClick={()=>{fullPageReload(`/profile/${comment.users.username}`)}} className="relative h-8 w-8 flex">
          <Image
            src={imgSrc}
            alt="user"
            width={35}
            height={35}
            className="rounded-full"
            onError={() => setImgSrc("https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png")}
          />
        </span>

          <span className="text-start space-x-1 flex flex-col items-center w-fit rounded py-1 px-2 bg-pastelGreen text-white">
            <p className="w-full text-normal font-semibold">
              {comment.users.username}
            </p>
            <p className="w-full"><CommentConfig text={comment.content} tags={false}/></p>
            <span className="py-1 flex flex-row items-center w-full">
              <span
                onClick={() => {
                  replyComment(comment.id, comment.users.username);
                }}
                className="cursor-pointer font-semibold underline"
              >
                reply
              </span>
              {liked ? (
                <svg
                  onClick={() => {
                    likeComment(comment.id);
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
                    likeComment(comment.id);
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
              <svg
                onClick={() => {
                  openChildComments();
                }}
                className="cursor-pointer ml-4 mr-1"
                fill="white"
                width="16px"
                height="16px"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z" />
              </svg>
              <span className="text-sm">
                {commentValues.filter((a) => a.parentid === comment.id).length}
              </span>
            </span>
          </span>
        </span>
        {commentChildren !== null &&
          commentChildren.length > 0 &&
          commentChildren.map((commentChild) => {
            return(
              <CommentItemChild key={commentChild.id} commentChild={commentChild}/>
            )
          })}
      </span>
    )
  );
}
