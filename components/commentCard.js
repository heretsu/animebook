import Image from "next/image";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import CommentItem from "./commentItem";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function CommentCard({ openComments }) {
  const { fullPageReload } = PageLoadOptions();
  const {
    userData,
    userNumId,
    commentValues,
    setCommentValues,
    parentId,
    setParentId,
    inputRef,
    commentRef,
    setOpenComments,
    postOwnerDetails,
    darkMode,
    newListOfComments,
    setNewListOfComments,
    commentMsg,
    setCommentMsg,
  } = useContext(UserContext);
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [commentPostLoading, setCommentPostLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [valuesLoaded, setValuesLoaded] = useState(false);

  const fetchSinglePostComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(
        "id, created_at, content, posts(id), users(id, avatar, username), parentid, media"
      )
      .eq("postid", postOwnerDetails.id)
      .order("created_at", { ascending: false });

    if (data) {
      setNewListOfComments(data);
      setCommentValues(data);
      setParentId(null);
      setCommentMsg("");
      setCommentPostLoading(false);
    } else {
      setErrorMsg("Failed to post comment. Try again");
    }
  };

  const postGlobalComment = () => {
    setCommentPostLoading(true);
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (commentMsg !== "") {
      const commentToSend = commentMsg;
      setCommentMsg("");

      supabase
        .from("comments")
        .insert({
          postid: postOwnerDetails.id,
          content: commentToSend,
          userid: userNumId,
          parentid: commentToSend.startsWith("@") ? parentId : null,
        })
        .then(async () => {
          await fetchSinglePostComments();
        });
    } else {
      setErrorMsg("You haven't made a comment yet. Try again");
      setCommentPostLoading(false);
    }
  };
  useEffect(() => {
    if (userData && userData.avatar && !valuesLoaded) {
      setImgSrc(userData.avatar);
      setValuesLoaded(true);
    }
    if (newListOfComments) {
      setCommentValues(newListOfComments);
      setNewListOfComments(null);
    }
  }, [commentMsg, userData, valuesLoaded, newListOfComments]);

  return (
    inputRef && <div
      id={openComments ? "comments" : "invisible"}
      className={`relative fixed px-2 text-sm ${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-gray-100 text-black'} w-[800px] mt-44 md:mt-80 rounded-t-xl h-screen relative flex flex-col w-full`}
    >
      <span className={`${darkMode ? 'border-[#32353C]' : 'border-[#EEEDEF]'} p-2 w-full flex flex-row justify-between border-b text-center font-semibold text-base`}>
        <span></span>
        <span>Comments</span>
        <svg
          onClick={() => {
            fullPageReload(
              `/${postOwnerDetails.users.username}/post/${postOwnerDetails.id}`,
              "window"
            );
            setOpenComments(false);
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

      <div className="pt-4 pb-40 flex flex-col space-y-2">
        {commentValues !== null && commentValues !== undefined ? (
          commentValues.length > 0 ? (
            commentValues.map((comment) => {
              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  comments={commentValues}
                  setCommentMsg={setCommentMsg}
                  setParentId={setParentId}
                  inputRef={inputRef}
                />
              );
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

      <div
        className={`mx-auto left-0 right-0 fixed bottom-0 border-t w-full pt-4 pb-8 px-4 ${
          darkMode
            ? "border-[#32353C] bg-[#27292F] text-white"
            : "border-[#EEEDEF] bg-[#F9F9F9] text-black"
        } flex flex-row justify-between items-center`}
      >
        {userData && (
          <span
            // onClick={() => {
            //   fullPageReload(`/profile/${userData.username}`, "window");
            // }}
            className="relative flex h-8 w-8 flex flex-shrink-0"
          >
            <Image
              src={userData.avatar}
              alt="user myprofile"
              height={40}
              width={40}
              className="rounded-full"
            />
          </span>
        )}
        <span
          className={`w-full border rounded-2xl ${
            darkMode
              ? "bg-[#27292F] border-[#32353C]"
              : "bg-[#F9F9F9] border-[#EEEDEF]"
          }`}
        >
          <input
            ref={router.pathname === '/home' ? inputRef : commentRef}
            value={commentMsg}
            onChange={(e) => {
              setCommentMsg(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                postGlobalComment();
              }
            }}
            maxLength={1900}
            className={`${
              darkMode ? "text-white" : "text-gray-800"
            } text-xs w-full bg-transparent border-none focus:ring-0`}
            placeholder="Comment on this post..."
          />
        </span>
        <span
          onClick={() => {
            postGlobalComment();
          }}
          className={`rounded-full border h-8 w-8 flex justify-center items-center ${
            darkMode
              ? "bg-[#27292F] border-[#32353C]"
              : "bg-[#F9F9F9] border-[#EEEDEF]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 21.5 21.5"
          >
            <g id="Icon" transform="translate(-1.25 -1.25)">
              <path
                id="Pfad_4721"
                data-name="Pfad 4721"
                d="M1.3,3.542a1.845,1.845,0,0,1,2.615-2.1l17.81,8.9a1.845,1.845,0,0,1,0,3.3l-17.81,8.9a1.845,1.845,0,0,1-2.615-2.1L3.17,13,14,12,3.17,11,1.305,3.542Z"
                fill={darkMode ? "#6A6B71" : "#5d6879"}
                fillRule="evenodd"
              />
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
}
