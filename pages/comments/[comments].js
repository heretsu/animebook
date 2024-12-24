import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import Image from "next/image";
import CommentItem from "@/components/commentItem";
import supabase from "@/hooks/authenticateUser";
import PostCard from "@/components/postCard";
import DbUsers from "@/hooks/dbUsers";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useRouter } from "next/router";
export const getServerSideProps = async (context) => {
  const { comments } = context.query;
  return {
    props: {
      comments,
    },
  };
};

export default function Comments({ comments }) {
  const videoRef = useRef(null);
  const router = useRouter();
  const postid = comments;
  const [viewMedia, setViewMedia] = useState(false);
  const {
    userData,
    userNumId,
    commentValues,
    setCommentValues,
    commentMsg,
    setCommentMsg,
    parentId,
    setParentId,
    inputRef,
    darkMode
  } = useContext(UserContext);
  const [errorMsg, setErrorMsg] = useState("");
  const [commentPostLoading, setCommentPostLoading] = useState(false);
  const [postReferenced, setPostReferenced] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);

  const { fetchPost } = DbUsers();

  const fetchSinglePostComments = async () => {
    const post = await fetchPost(postid);
    if (post.error) {
      setErrorMsg("Failed to get post:", post.error);
      console.log(post.error);
      return;
    }
    setPostReferenced(post.data[0]);

    const { data } = await supabase
      .from("comments")
      .select(
        "id, created_at, content, posts(id), users(id, avatar, username), parentid"
      )
      .eq("postid", postid)
      .order("created_at", { ascending: false });

    if (data) {
      setCommentValues(data);
      setParentId(null);
      setCommentMsg("");
      setCommentPostLoading(false);
    } else {
      setErrorMsg("Failed to get comments");
    }
  };

  const postComment = () => {
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    setCommentPostLoading(true);
    if (commentMsg !== "") {
      supabase
        .from("comments")
        .insert({
          postid: postid,
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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlayVideo(true);
      } else {
        videoRef.current.pause();
        setPlayVideo(false);
      }
    }
  };

  useEffect(() => {
    fetchSinglePostComments();
  }, [postid]);

  return (
    <main className={`${darkMode ? 'text-white' : 'text-black'} w-full`}>
      <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
        <div className="w-full py-2 px-2 flex flex-col">
          {postReferenced ? (
            <div className="flex flex-col md:flex-row">
              <span
              onClick={() => {
                if (postReferenced.media && postReferenced.media.toLowerCase().endsWith("webp") ||
                postReferenced.media.toLowerCase().endsWith("jpg") ||
                postReferenced.media.toLowerCase().endsWith("jpeg") ||
                postReferenced.media.toLowerCase().endsWith("png") ||
                postReferenced.media.toLowerCase().endsWith("svg") ||
                postReferenced.media.toLowerCase().endsWith("gif")){
                  setViewMedia(true);
                }
                
              }}
                className={
                  postReferenced.media
                    ? "hidden md:flex h-screen w-full bg-black items-center justify-center"
                    : "w-0"
                }
              >
                {postReferenced.media &&
                  (postReferenced.media.endsWith("mp4") ||
                  postReferenced.media.endsWith("MP4") ||
                  postReferenced.media.endsWith("mov") ||
                  postReferenced.media.endsWith("MOV") ||
                  postReferenced.media.endsWith("3gp") ||
                  postReferenced.media.endsWith("3GP") ? (
                    <span
                      onClick={togglePlayPause}
                      className="relative cursor-pointer flex justify-center items-center bg-black w-full"
                    >
                      <video
                        className="max-h-screen max-w-[100%] m-auto"
                        ref={videoRef}
                        src={postReferenced.media}
                        height={600}
                        width={600}
                        loop
                      ></video>
                      {!playVideo && (
                        <svg
                          fill="white"
                          width="70px"
                          height="70px"
                          viewBox="0 0 36 36"
                          preserveAspectRatio="xMidYMid meet"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          className="absolute m-auto bg-black bg-opacity-20 p-2 rounded-full"
                        >
                          <title>{"play-solid"}</title>
                          <path
                            className="clr-i-solid clr-i-solid-path-1"
                            d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
                          />
                          <rect
                            x={0}
                            y={0}
                            width={36}
                            height={36}
                            fillOpacity={0}
                          />
                        </svg>
                      )}
                    </span>
                  ) : (
                    <Image
                      src={postReferenced.media}
                      alt="post"
                      width={600}
                      height={600}
                      className="object-contain w-full max-w-[100%] m-auto"
                    />
                  ))}
              </span>
              <div
                className={`${
                  !postReferenced.media ? "w-full" : "md:w-1/3"
                } min-h-screen md:max-h-screen rounded-xl md:rounded-none flex flex-col`}
              >
                <svg
                  onClick={() => {
                    router.push("/home");
                  }}
                  width="35px"
                  height="35px"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="my-2 cursor-pointer"
                >
                  <rect
                    width={48}
                    height={48}
                    fill="white"
                    fillOpacity={0.01}
                  />
                  <path
                    d="M31 36L19 24L31 12"
                    stroke="gray"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="hidden md:flex">
                  <PostCard
                    id={postid}
                    content={postReferenced.content}
                    created_at={postReferenced.created_at}
                    users={postReferenced.users}
                    myProfileId={userNumId}
                  />
                </span>
                <span className="flex md:hidden">
                  <PostCard
                    id={postid}
                    media={postReferenced.media}
                    content={postReferenced.content}
                    created_at={postReferenced.created_at}
                    users={postReferenced.users}
                    myProfileId={userNumId}
                  />
                </span>
                <div className="my-3 px-2 space-x-2 flex flex-row items-center h-fit">
                  {userData && (
                    <span className="flex h-8 w-8">

                    
                      <Image
                        src={userData.avatar}
                        alt="user profile"
                        height={35}
                        width={35}
                        className="relative rounded-full"
                      />
                      </span>
                    
                  )}
                  <div className={`${darkMode ? 'bg-gray-700 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-gray-800'} border w-full flex flex-row items-center justify-center pr-2`}>
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
                      className="focus:border-none focus:outline-none focus:ring-0 rounded-xl w-full bg-transparent border border-transparent focus:ring-0"
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
                        stroke={darkMode ? "#e2e8f0" : "#000000"}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1={22} y1={2} x2={11} y2={13} />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </div>
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
                <div className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white'} flex flex-col pb-2 md:min-h-0 md:h-full md:overflow-scroll rounded-xl px-2 space-y-2`}>
                  <span className="p-2 w-full border-b border-gray-400 text-center font-semibold text-base">
                    Comments
                  </span>
                  {commentValues !== null && commentValues !== undefined ? (
                    commentValues.length > 0 ? (
                      commentValues.map((comment) => {
                        return (
                          <>
                            <CommentItem key={comment.id} comment={comment} />
                          </>
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
              </div>
            </div>
          ) : (
            <span className="w-full text-gray-500 text-center">
              {"fetching comments..."}
            </span>
          )}
        </div>
      </section>
      {
        <div
          id={viewMedia ? "explorer-modal" : "invisible"}
          className="h-screen text-white w-full p-2"
        >
          
          <span className="m-auto relative">
            {postReferenced && postReferenced.media && (
              <Image
                src={postReferenced.media}
                alt="post"
                width={600}
                height={600}
                className="object-cover w-full max-h-[100%] max-w-[100%] m-auto"
              />
            )}
          </span>
        </div>
      }
      <div
        
        id={viewMedia ? "stories-cancel" : "invisible"}
        className="cursor-pointer text-white font-bold justify-end items-center mt-4"
      >
        <span
          onClick={() => {
            setViewMedia(false)
          }}
          className="bg-pastelGreen text-xl py-1 px-2 rounded-lg"
        >
          x
        </span>
      </div>
      {viewMedia && (
        <>
          <div
            onClick={() => {
              setViewMedia(false);
            }}
            id="stories-overlay"
            className="bg-black bg-opacity-80"
          ></div>
        </>
      )}
    </main>
  );
}
