import Image from "next/image";
import { useState, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import CommentItem from "./commentItem";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function CommentCard({ openComments }) {
  const {
    userData,
    postIdForComment,
    userNumId,
    commentValues,
    setCommentValues,
    commentMsg,
    setCommentMsg,
    parentId,
    setParentId,
    inputRef,
    setOpenComments,
  } = useContext(UserContext);
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [commentPostLoading, setCommentPostLoading] = useState(false);

  const fetchSinglePostComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(
        "id, created_at, content, posts(id), users(id, avatar, username), parentid"
      )
      .eq("postid", postIdForComment)
      .order("created_at", { ascending: false });

    if (data) {
      setCommentValues(data);
      setParentId(null);
      setCommentMsg("");
      setCommentPostLoading(false);
    } else {
      setErrorMsg("Failed to post comment. Try again");
    }
  };

  const postComment = () => {
    setCommentPostLoading(true);
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    if (commentMsg !== "") {
      supabase
        .from("comments")
        .insert({
          postid: postIdForComment,
          content: commentMsg,
          userid: userNumId,
          parentid: commentMsg.startsWith("@") ? parentId : null,
        })
        .then(async () => {
          await fetchSinglePostComments();
        });
    } else {
      setErrorMsg("You haven't made a comment yet. Try again");
      setCommentPostLoading(false);
    }
  };

  return (
    <div
      id={openComments ? "comments" : "invisible"}
      className="px-2 text-sm text-gray-800 bg-white w-[800px] mt-44 md:mt-80 rounded-xl border border-gray-400 h-screen relative flex flex-col w-full pb-16"
    >
      <span className="p-2 w-full flex flex-row justify-between border-b border-gray-400 text-center font-semibold text-base">
        <span></span>
        <span>Comments</span>
        <svg
          onClick={() => {
            setOpenComments(false);
            router.push(`/comments/${postIdForComment}`);
          }}
          className="cursor-pointer"
          width="22px"
          height="22px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#000000"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="miter"
        >
          <line x1={22} y1={2} x2={15} y2={9} />
          <line x1={9} y1={15} x2={2} y2={22} />
          <polyline points="16 2 22 2 22 8" />
          <polyline points="8 22 2 22 2 16" />
        </svg>
      </span>
      <div className="pt-5 space-x-2 flex flex-row items-center h-fit">
        <span className="relative h-8 w-8 flex">
          {userData &&
            <Image
              src={userData.avatar}
              alt="user profile"
              height={35}
              width={35}
              className="absolute rounded-full"
            />
          }
        </span>
        <input
          ref={inputRef}
          value={commentMsg}
          onChange={(e) => {
            setCommentMsg(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              postComment();
            }
          }}
          maxLength={1900}
          className="text-gray-800 rounded-xl w-full bg-slate-100 border-none focus:ring-0"
          placeholder="Leave a comment"
        />
        {commentPostLoading ? (
          <span className="flex items-center justify-center my-auto font-bold text-lg text-slate-400 h-full">
            {"..."}
          </span>
        ) : (
          <svg
            onClick={() => {
              postComment();
            }}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1={22} y1={2} x2={11} y2={13} />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </div>
      {errorMsg !== "" && (
        <span className="pt-1 text-sm w-full flex flex-row justify-center items-center">
          <svg
            fill="red"
            width="20px"
            height="20px"
            viewBox="0 -8 528 528"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>{"fail"}</title>
            <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
          </svg>
          <p className="text-red-500">{errorMsg}</p>
        </span>
      )}
      <div className="pt-4 flex flex-col space-y-2">
        {commentValues !== null && commentValues !== undefined ? (
          commentValues.length > 0 ? (
            commentValues.map((comment) => {
              return <CommentItem key={comment.id} comment={comment} />;
            })
          ) : (
            <span className="w-full text-gray-500 text-center">
              Be the first to comment
            </span>
          )
        ) : (
          <span className="w-full text-gray-500 text-center">
            fetching comments...
          </span>
        )}
      </div>
    </div>
  );
}
