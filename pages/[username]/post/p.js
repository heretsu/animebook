import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../../../lib/userContext";
import Image from "next/image";
import CommentItem from "@/components/commentItem";
import supabase from "@/hooks/authenticateUser";
import PostCard from "@/components/postCard";
import DbUsers from "@/hooks/dbUsers";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useRouter } from "next/router";
import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";

// RESTORE THIS WHEN USED
// export const getServerSideProps = async (context) => {
//   const { postid } = context.query;
//   return {
//     props: {
//       comments: postid,
//     },
//   };
// };

export default function Postid({ comments }) {
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
    newListOfComments,
    setNewListOfComments,
    darkMode,
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
        "id, created_at, content, posts(id), users(id, avatar, username), parentid, media"
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
    if (newListOfComments) {
      setCommentValues(newListOfComments);
      setNewListOfComments(null);
    }
  }, [postid, newListOfComments]);

  return ( ''
    // <main className={`${darkMode ? "bg-black" : "bg-[#F9F9F9]"}`}>
    //   <div className="hidden lg:block block z-40 sticky top-0">
    //     <LargeTopBar relationship={false} />
    //   </div>
    //   <div className="lg:hidden block z-40 sticky top-0">
    //     <SmallTopBar relationship={false} />
    //   </div>
    //   <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
    //     <div className="w-full py-2 px-2 flex flex-col">
    //       {postReferenced ? (
    //         <div className="flex flex-col md:flex-row">
    //           <span
    //             onClick={() => {
    //               if (
    //                 (postReferenced.media &&
    //                   postReferenced.media.toLowerCase().endsWith("webp")) ||
    //                 postReferenced.media.toLowerCase().endsWith("jpg") ||
    //                 postReferenced.media.toLowerCase().endsWith("jpeg") ||
    //                 postReferenced.media.toLowerCase().endsWith("png") ||
    //                 postReferenced.media.toLowerCase().endsWith("svg") ||
    //                 postReferenced.media.toLowerCase().endsWith("gif")
    //               ) {
    //                 setViewMedia(true);
    //               }
    //             }}
    //             className={
    //               postReferenced.media
    //                 ? "hidden md:flex h-screen w-full bg-black items-center justify-center"
    //                 : "w-0"
    //             }
    //           >
    //             {postReferenced.media &&
    //               (postReferenced.media.endsWith("mp4") ||
    //               postReferenced.media.endsWith("MP4") ||
    //               postReferenced.media.endsWith("mov") ||
    //               postReferenced.media.endsWith("MOV") ||
    //               postReferenced.media.endsWith("3gp") ||
    //               postReferenced.media.endsWith("3GP") ? (
    //                 <span
    //                   onClick={togglePlayPause}
    //                   className="relative cursor-pointer flex justify-center items-center bg-black w-full"
    //                 >
    //                   <video
    //                     className="max-h-screen w-full max-w-[100%] m-auto"
    //                     ref={videoRef}
    //                     src={postReferenced.media}
    //                     height={600}
    //                     width={600}
    //                     loop
    //                   ></video>
    //                   {!playVideo && (
    //                     <svg
    //                       fill="white"
    //                       width="70px"
    //                       height="70px"
    //                       viewBox="0 0 36 36"
    //                       preserveAspectRatio="xMidYMid meet"
    //                       xmlns="http://www.w3.org/2000/svg"
    //                       xmlnsXlink="http://www.w3.org/1999/xlink"
    //                       className="absolute m-auto bg-black bg-opacity-20 p-2 rounded-full"
    //                     >
    //                       <title>{"play-solid"}</title>
    //                       <path
    //                         className="clr-i-solid clr-i-solid-path-1"
    //                         d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
    //                       />
    //                       <rect
    //                         x={0}
    //                         y={0}
    //                         width={36}
    //                         height={36}
    //                         fillOpacity={0}
    //                       />
    //                     </svg>
    //                   )}
    //                 </span>
    //               ) : (
    //                 <Image
    //                   src={postReferenced.media}
    //                   alt="post"
    //                   width={600}
    //                   height={600}
    //                   className="object-contain w-full max-w-[100%] m-auto"
    //                 />
    //               ))}
    //           </span>
    //           <div
    //             className={`${
    //               !postReferenced.media ? "w-full" : "md:w-1/3"
    //             } min-h-screen overflow-y-scroll md:max-h-screen rounded-xl md:rounded-none flex flex-col`}
    //           >
    //             <span
    //               onClick={() => {
    //                 router.push("/home");
    //               }}
    //               className={`border rounded ${
    //                 darkMode
    //                   ? "bg-[#1E1F24] border-[#292C33] text-white"
    //                   : "bg-white border-[#EEEDEF] text-black"
    //               } w-fit my-2 py-1 px-1.5 text-[0.7rem] cursor-pointer flex flex-row justify-center items-center space-x-1`}
    //             >
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="18"
    //                 height="18"
    //                 viewBox="0 0 24 24"
    //               >
    //                 <g id="previous" transform="translate(-62 -41)">
    //                   <g
    //                     id="Gruppe_3288"
    //                     data-name="Gruppe 3288"
    //                     transform="translate(62 41)"
    //                   >
    //                     <path
    //                       id="Pfad_4744"
    //                       data-name="Pfad 4744"
    //                       d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm2.707,16.293a1,1,0,1,1-1.414,1.414l-5-5a1,1,0,0,1,0-1.414l5-5a1,1,0,0,1,1.414,1.414L10.414,12Z"
    //                       fill={darkMode ? "white" : "#292c33"}
    //                     />
    //                   </g>
    //                 </g>
    //               </svg>
    //               <span>Go Back</span>
    //             </span>

    //             {/* <span className="w-full hidden md:flex">
    //               <PostCard
    //                 id={postid}
    //                 content={postReferenced.content}
    //                 created_at={postReferenced.created_at}
    //                 users={postReferenced.users}
    //                 myProfileId={userNumId}
    //               />
    //             </span> */}
    //             <span className="flex">
    //               <PostCard
    //                 id={postid}
    //                 media={postReferenced.media}
    //                 content={postReferenced.content}
    //                 created_at={postReferenced.created_at}
    //                 users={postReferenced.users}
    //                 myProfileId={userNumId}
    //               />
    //             </span>

    //             <span className="text-sm px-3 py-3 flex flex-row justify-between">
    //               <span
    //                 className={`font-semibold ${
    //                   darkMode ? "text-white" : "text-black"
    //                 }`}
    //               >
    //                 All Comments
    //               </span>
    //               <span className="space-x-2 flex flex-row items-center">
    //                 <span className={darkMode ? "text-white" : "text-black"}>
    //                   Sort by:
    //                 </span>
    //                 <select
    //                   onChange={(e) => {
    //                     // if (!cryptoCommunities || cryptoCommunities.length === 0){
    //                     //   return
    //                     // }
    //                     // const value = e.target.value;
    //                     // setCryptoCommunities((prevCommunities) => {
    //                     //   let sortedCommunities = [...prevCommunities];
    //                     //   if (value === "most_recent") {
    //                     //     sortedCommunities.sort(
    //                     //       (a, b) =>
    //                     //         new Date(b.created_at) - new Date(a.created_at)
    //                     //     );
    //                     //   } else if (value === "most_joined") {
    //                     //     sortedCommunities.sort(
    //                     //       (a, b) => b.membersLength - a.membersLength
    //                     //     );
    //                     //   } else{
    //                     //     sortedCommunities.sort(
    //                     //       (a, b) => b.membersLength - a.membersLength
    //                     //     );
    //                     //   }
    //                     //   return sortedCommunities;
    //                     // });
    //                   }}
    //                   className={`${
    //                     darkMode ? "text-white" : "text-black"
    //                   } text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none`}
    //                 >
    //                   <option value="default">Default</option>
    //                   <option value="most_recent">Recent</option>
    //                   <option value="most_joined">Members</option>
    //                 </select>
    //                 <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   width="8.582"
    //                   height="9.821"
    //                   viewBox="0 0 8.582 9.821"
    //                   fill={darkMode ? "white" : "black"}
    //                 >
    //                   <g id="up-arrow" transform="translate(0)">
    //                     <g
    //                       id="Gruppe_3153"
    //                       data-name="Gruppe 3153"
    //                       transform="translate(0)"
    //                     >
    //                       <path
    //                         id="Pfad_1769"
    //                         data-name="Pfad 1769"
    //                         d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
    //                         transform="translate(-32.307 0)"
    //                         fill="#292c33"
    //                       />
    //                     </g>
    //                   </g>
    //                 </svg>
    //               </span>
    //             </span>
    //             <span className="overflow-y-scroll pt-2 px-3">
    //               {commentValues &&
    //                 commentValues.map((comment) => {
    //                   return (
    //                     <CommentItem
    //                       key={comment.id}
    //                       comment={comment}
    //                       comments={commentValues}
    //                       setCommentMsg={setCommentMsg}
    //                       setParentId={setParentId}
    //                     />
    //                   );
    //                 })}
    //             </span>
    //           </div>
    //         </div>
    //       ) : (
    //         <span className="w-full text-gray-500 text-center">
    //           {"fetching post..."}
    //         </span>
    //       )}
    //     </div>
    //   </section>
    //   {
    //     <div
    //       id={viewMedia ? "explorer-modal" : "invisible"}
    //       className="h-screen text-white w-full p-2"
    //     >
    //       <span className="m-auto relative">
    //         {postReferenced && postReferenced.media && (
    //           <Image
    //             src={postReferenced.media}
    //             alt="post"
    //             width={600}
    //             height={600}
    //             className="object-cover w-full max-h-[100%] max-w-[100%] m-auto"
    //           />
    //         )}
    //       </span>
    //     </div>
    //   }
    //   <div
    //     id={viewMedia ? "stories-cancel" : "invisible"}
    //     className="cursor-pointer text-white font-bold justify-end items-center mt-4"
    //   >
    //     <span
    //       onClick={() => {
    //         setViewMedia(false);
    //       }}
    //       className="bg-pastelGreen text-xl py-1 px-2 rounded-lg"
    //     >
    //       x
    //     </span>
    //   </div>
    //   {viewMedia && (
    //     <>
    //       <div
    //         onClick={() => {
    //           setViewMedia(false);
    //         }}
    //         id="stories-overlay"
    //         className="bg-black bg-opacity-80"
    //       ></div>
    //     </>
    //   )}
    //   <MobileNavBar />
    // </main>
  );
}
