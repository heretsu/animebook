import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import Image from "next/image";
import CommentItem from "@/components/commentItem";
import supabase from "@/hooks/authenticateUser";
import PostCard from "@/components/postCard";
import DbUsers from "@/hooks/dbUsers";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useRouter } from "next/router";
import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import PopupModal from "@/components/popupModal";
import LargeRightBar from "@/components/largeRightBar";

export const getServerSideProps = async (context) => {
  const { postid } = context.query;
  return {
    props: {
      comments: postid,
    },
  };
};

export default function Postid({ comments }) {
  const videoRef = useRef(null);
  const router = useRouter();
  const postid = comments;
  const [viewMedia, setViewMedia] = useState(false);
  const {
    deletePost,
    setDeletePost,
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
  const [valuesLoaded, setValuesLoaded] = useState(false)
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
    if (!valuesLoaded){
      fetchSinglePostComments();
      setValuesLoaded(true)
    }
    if (newListOfComments) {
      setCommentValues(newListOfComments);
      setNewListOfComments(null);
    }
  }, [valuesLoaded, commentValues, postid, newListOfComments]);

  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <div className="lg:hidden block z-40 sticky top-0">
        <SmallTopBar relationship={false} />
      </div>
      <section className="mb-5 flex lg:flex-row lg:space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col">
          {postReferenced ? (
            <div
              id="scrollbar-remove"
              className={`w-full min-h-screen overflow-y-scroll md:max-h-screen rounded-xl md:rounded-none flex flex-col`}
            >
              <span className="h-12 my-2 flex flex-row items-center justify-between space-x-2">
                <span
                  onClick={() => {
                    router.push("/home");
                  }}
                  className={`border rounded ${
                    darkMode
                      ? "bg-[#1E1F24] border-[#292C33] text-white"
                      : "bg-white border-[#EEEDEF] text-black"
                  } h-full w-fit py-1 px-1.5 text-[0.7rem] cursor-pointer flex flex-row justify-center items-center space-x-1`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <g id="previous" transform="translate(-62 -41)">
                      <g
                        id="Gruppe_3288"
                        data-name="Gruppe 3288"
                        transform="translate(62 41)"
                      >
                        <path
                          id="Pfad_4744"
                          data-name="Pfad 4744"
                          d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm2.707,16.293a1,1,0,1,1-1.414,1.414l-5-5a1,1,0,0,1,0-1.414l5-5a1,1,0,0,1,1.414,1.414L10.414,12Z"
                          fill={darkMode ? "white" : "#292c33"}
                        />
                      </g>
                    </g>
                  </svg>
                  <span>Go Back</span>
                </span>

                <span
                  className={`text-xs w-fit border rounded ${
                    darkMode
                      ? "bg-[#1E1F24] border-[#292C33] text-white"
                      : "bg-white border-[#EEEDEF] text-black"
                  } p-2 h-full flex flex-1 flex-row justify-between items-center space-x-1`}
                >
                  <span className="flex flex-row items-center space-x-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17.637"
                      height="17.615"
                      viewBox="0 0 23.637 23.615"
                    >
                      <path
                        id="about"
                        d="M12.808,1A11.791,11.791,0,0,0,2.416,18.393l-1.36,4.533a1.312,1.312,0,0,0,1.257,1.69,1.337,1.337,0,0,0,.378-.055L7.223,23.2A11.808,11.808,0,1,0,12.808,1Zm0,5.248A1.312,1.312,0,1,1,11.5,7.56,1.312,1.312,0,0,1,12.808,6.248Zm1.312,13.12H12.808A1.312,1.312,0,0,1,11.5,18.055V12.808a1.312,1.312,0,1,1,0-2.624h1.312A1.312,1.312,0,0,1,14.12,11.5v5.248a1.312,1.312,0,1,1,0,2.624Z"
                        transform="translate(-1 -1)"
                        fill={darkMode ? "white" : "#292c33"}
                      />
                    </svg>
                    <span>{"Participate in this discussion!"}</span>
                  </span>

                  <span
                    // onClick={() => communityInputRef.current.scrollIntoView({ behavior: 'smooth' })}
                    className={`flex flex-row space-x-1 cursor-pointer text-sm text-white bg-[#EB4463] py-0.5 font-medium items-center px-3 rounded`}
                  >
                    <span>Comment</span>
                    <span>now</span>
                  </span>
                </span>
              </span>

              <span className="flex w-full items-center justify-center">
                <PostCard
                  id={postid}
                  media={postReferenced.media}
                  content={postReferenced.content}
                  created_at={postReferenced.created_at}
                  users={postReferenced.users}
                  myProfileId={userNumId}
                />
              </span>

              <span className="text-sm px-3 flex flex-row justify-between">
                <span
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  All Comments
                </span>
                <span className="space-x-2 flex flex-row items-center">
                  <span className={darkMode ? "text-white" : "text-black"}>
                    Sort by:
                  </span>
                  <select
                    onChange={(e) => {
                      // if (!cryptoCommunities || cryptoCommunities.length === 0){
                      //   return
                      // }
                      // const value = e.target.value;
                      // setCryptoCommunities((prevCommunities) => {
                      //   let sortedCommunities = [...prevCommunities];
                      //   if (value === "most_recent") {
                      //     sortedCommunities.sort(
                      //       (a, b) =>
                      //         new Date(b.created_at) - new Date(a.created_at)
                      //     );
                      //   } else if (value === "most_joined") {
                      //     sortedCommunities.sort(
                      //       (a, b) => b.membersLength - a.membersLength
                      //     );
                      //   } else{
                      //     sortedCommunities.sort(
                      //       (a, b) => b.membersLength - a.membersLength
                      //     );
                      //   }
                      //   return sortedCommunities;
                      // });
                    }}
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none`}
                  >
                    <option value="default">Default</option>
                    <option value="most_recent">Recent</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.582"
                    height="9.821"
                    viewBox="0 0 8.582 9.821"
                    fill={darkMode ? "white" : "black"}
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
                          d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                          transform="translate(-32.307 0)"
                          fill="#292c33"
                        />
                      </g>
                    </g>
                  </svg>
                </span>
              </span>
              <span className="mb-16 lg:mb-0">
                {commentValues &&
                  commentValues.map((comment) => {
                    return (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        comments={commentValues}
                        setCommentMsg={setCommentMsg}
                        setParentId={setParentId}
                      />
                    );
                  })}
              </span>
            </div>
          ) : (
            <span className="w-full text-gray-500 text-center">
              {"fetching post..."}
            </span>
          )}
        </div>
        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
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
            setViewMedia(false);
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
      {deletePost !== null && (
        <>
          <PopupModal success={"7"} />
          <div
            onClick={() => {
              setDeletePost(null);
            }}
            id="overlay"
            className="bg-black bg-opacity-80"
          ></div>
        </>
      )}
      <MobileNavBar />
    </main>
  );
}
