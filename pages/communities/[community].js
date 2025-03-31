import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import PlusIcon from "@/components/plusIcon";
import Image from "next/image";
import onePiece from "@/assets/onePiece.jpg";
import CommunityPosts from "@/components/communityPosts";
import CommunityPostCard from "@/components/communityPostCard";
import { useEffect, useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import PostContainer from "@/components/postContainer";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import CommunityCommentItem from "@/components/communityCommentItem";
import SideBar from "@/components/sideBar";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json";
import dynamic from "next/dynamic";
import LargeRightBar from "@/components/largeRightBar";
import SmallPostContainer from "@/components/smallPostContainer";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const getServerSideProps = async (context) => {
  const { community } = context.query;

  return {
    props: {
      community,
    },
  };
};

const Community = ({ community }) => {
  const { fullPageReload } = PageLoadOptions();
  const {
    userNumId,
    communityInputRef,
    sideBarOpened,
    darkMode,
    userData,
    currentCommunity,
    setCurrentCommunity, allCommunityPolls, setAllCommunityPolls
  } = useContext(UserContext);
  const [reentry, setReentry] = useState(false);
  const [joined, setJoined] = useState(false);
  const [comments, setComments] = useState([]);
  const [globalCommunityComments, setGlobalCommunityComments] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [commentMsg, setCommentMsg] = useState("");
  const [selectedCommentMedia, setSelectedCommentMedia] = useState(null);
  const [commentMediaFile, setCommentMediaFile] = useState(null);

  const router = useRouter();
  const [communityDetails, setCommunityDetails] = useState(null);
  const [newPost, setNewPost] = useState(false);
  const [focusPostId, setFocusPostId] = useState(undefined);
  const [commentPostLoading, setCommentPostLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const commentMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCommentMediaFile(e.target.files);
      setSelectedCommentMedia(URL.createObjectURL(file));
    }
  };

  const fetchCommunityComments = async () => {
    const { data } = await supabase
      .from("community_comments")
      .select(
        "id, created_at, content, community_posts(id), users(id, avatar, username), parentid, media"
      )
      .order("created_at", { ascending: false });

    if (data) {
      if (community.split("&")[1]) {
        setComments(
          data.filter(
            (c) => c.community_posts.id === parseInt(community.split("&")[1])
          )
        );
      }

      setGlobalCommunityComments(data);
      setParentId(null);
      setCommentMsg("");
      setCommentPostLoading(false);
    } else {
      setErrorMsg("Failed to get comments");
    }
  };

  const postCommunityComment = async () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    setCommentPostLoading(true);
    if (commentMediaFile !== null) {
      for (const file of commentMediaFile) {
        const newName = Date.now() + file.name;

        const bucketResponse = await supabase.storage
          .from("mediastore")
          .upload(`${"community_comments/" + newName}`, file);

        if (bucketResponse.data) {
          const mediaUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            "/storage/v1/object/public/mediastore/" +
            bucketResponse.data.path;
          let commentToSend = commentMsg;

          supabase
        .from("community_comments")
        .insert({
          postid: community.split("&")[1],
          content: commentMsg,
          userid: userNumId,
          parentid: commentMsg.startsWith("@") ? parentId : null,
          media: mediaUrl
        })
        .then(async () => {
          setSelectedCommentMedia(null);
      setCommentMediaFile(null);
      setCommentMsg("");
          await fetchCommunityComments();
        });
        }
      }
      
    } 
    else{

    

    if (commentMsg !== "") {
      supabase
        .from("community_comments")
        .insert({
          postid: community.split("&")[1],
          content: commentMsg,
          userid: userNumId,
          parentid: commentMsg.startsWith("@") ? parentId : null,
        })
        .then(async () => {
          await fetchCommunityComments();
        });
    } else {
      setErrorMsg("You haven't made a comment yet. Try again");
      setCommentPostLoading(false);
    }}
  };

  const fetchCommunityDetails = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("name", community.replace(" ", "+").toLowerCase().split("&")[0]);
    // .eq("name", community.split("&")[0].toLowerCase());

    if (!data) {
      console.log("could not fetch communities data");
      return;
    }

    const posts = await supabase
      .from("community_posts")
      .select(
        "id, created_at, content, media, communityid, users(id, avatar, username, created_at, cover, bio, ki), ispoll"
      )
      .eq("communityid", data[0].id)
      .order("created_at", { ascending: false });

    const members = await supabase
      .from("community_relationships")
      .select("*")
      .eq("communityid", data[0].id);
    if (community.split("&")[1]) {
      setFocusPostId(community.split("&")[1]);
    }

    const polls = await supabase.from("community_polls").select("*")

    if (setAllCommunityPolls !== null && setAllCommunityPolls !== undefined && polls && polls.data){
      setAllCommunityPolls(polls.data)
    }
    if (userNumId) {
      setJoined(!!members.data.find((mb) => mb.userid === userNumId));
      setReentry(true);
    }

    if (data) {
      setCommunityDetails({
        ...data[0],
        posts: posts.data,
        members: members.data,
      });
    }
  };

  const formatGroupName = (text) => {
    return text
      .split("&")[0]
      .split("+") // Split the string at ' '
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
    // return text
    //   .split("&")[0]
    //   .split("+") // Split the string at '+'
    //   .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    //   .join(" ");
  };

  const joinCommunity = async () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    if (reentry && !joined) {
      setReentry(false);
      const { error } = await supabase
        .from("community_relationships")
        .insert({ userid: userNumId, communityid: communityDetails.id });
      if (error) {
        console.log(error);
      } else {
        setJoined(true);
      }
      setReentry(true);
    } else if (reentry && joined) {
      setReentry(false);
      const { error } = await supabase
        .from("community_relationships")
        .delete()
        .eq("userid", userNumId)
        .eq("communityid", communityDetails.id);
      if (error) {
        console.log(error);
      } else {
        setJoined(false);
      }
      setReentry(true);
    }
    fetchCommunityDetails();
  };

  useEffect(() => {
    if (currentCommunity === "") {
      setCurrentCommunity(community);
    }
    fetchCommunityDetails();
    fetchCommunityComments();
  }, [currentCommunity, userNumId]);

  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <section className="mb-5 flex lg:flex-row lg:space-x-2 w-full">
        <NavBar />
        {communityDetails ? (
          <div className="w-full pb-2 space-y-8 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col">
            <SmallTopBar relationship={false} />
            {focusPostId === undefined || focusPostId === null ? (
              <div className="px-2 lg:px-0 w-full space-y-4 mt-2 lg:mt-20 flex flex-col">
                {!newPost && (
                  <span className="flex flex-row w-full justify-between items-center h-11 space-x-2">
                    <span
                      onClick={() => {
                        router.push("/communities");
                      }}
                      className={`border rounded ${
                        darkMode
                          ? "bg-[#1E1F24] border-[#292C33] text-white"
                          : "bg-white border-[#EEEDEF] text-black"
                      } h-full px-3 text-[0.7rem] cursor-pointer flex flex-row justify-center items-center space-x-1`}
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
                      } p-1.5 px-2 h-full flex flex-1 flex-row justify-between items-center space-x-1`}
                    >
                      <span className="hidden lg:flex flex-row items-center space-x-1">
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
                        <span>
                          {
                            "Interact with the community and start a discussion!"
                          }
                        </span>
                      </span>
                      {/* <span
                        onClick={() => {
                          joinCommunity();
                        }}
                        className={`cursor-pointer ${
                          joined ? "bg-gray-400" : "bg-[#EB4463]"
                        } text-sm text-white py-2 px-3 rounded-lg`}
                      >
                        {joined ? "Leave" : "Join"}
                      </span> */}
                      <span
                        onClick={() => {
                          if (joined) {
                            setNewPost(true);
                          }
                        }}
                        className={`cursor-pointer text-sm text-white ${
                          joined ? "bg-[#EB4463]" : "bg-gray-400"
                        } h-full font-medium flex flex-row space-x-1 items-center py-1 px-3 rounded`}
                      >
                        <span>Post</span>
                        <span>now</span>
                      </span>
                    </span>
                  </span>
                )}

                <span className="relative flex h-[150px] sm:h-[200px] w-full">
                  <Image
                    src={communityDetails.cover}
                    alt="user profile"
                    fill={true}
                    className="border border-black rounded-md object-cover"
                  />
                  <span className="border-b border-black rounded-b-md h-full text-xs md:text-sm absolute inset-0 flex flex-col items-start justify-end text-white">
                    <span className="py-2 px-3 border-t border-x border-black flex flex-row justify-between items-center bg-white bg-opacity-30 backdrop-blur-md w-full rounded-b-md">
                      <span className="flex flex-row space-x-1.5 items-center">
                        <span className="relative h-10 w-10 flex">
                          <Image
                            src={communityDetails.avatar}
                            alt="community profile"
                            width={55}
                            height={55}
                            className="border border-white rounded-full"
                          />
                        </span>
                        <span className="text-sm font-semibold">
                          {formatGroupName(community)}
                        </span>
                      </span>
                      <span className="pl-2.5 flex flex-col justify-center space-y-0.5 py-2 text-sm">
                        <span className="font-bold flex flex-row space-x-2 justify-start items-center"></span>
                        <span className="flex flex-row items-center text-sm font-semibold space-x-4">
                          <span>{`${communityDetails.posts.length} Posts`}</span>
                          <span>{`${communityDetails.members.length} Members`}</span>
                          {!joined && (
                            <span
                              onClick={joinCommunity}
                              className={`bg-[#EB4463] px-4 h-full py-1 cursor-pointer relative border border-black rounded`}
                            >
                              Join
                            </span>
                          )}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>

                {newPost ? (
                  <>
                  <SmallPostContainer setNewPost={setNewPost} communityId={communityDetails.id}
                      community={community} />
                    <span
                      onClick={() => {
                        setNewPost(false);
                      }}
                      className="cursor-pointer shadow-lg font-medium mx-auto rounded-lg border-2 border-[#EB4463] text-[#EB4463] py-1 px-3"
                    >
                      Cancel
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <CommunityPosts
                      posts={communityDetails.posts}
                      community={communityDetails.name}
                      globalCommunityComments={globalCommunityComments}
                      fetchCommunityDetails={fetchCommunityDetails}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`${
                  darkMode ? "text-white" : "text-black"
                } px-2 lg:px-0 w-full mt-2 lg:mt-20 flex flex-col`}
              >
                <span className="mb-2 flex flex-row w-full justify-between items-center h-11 space-x-2">
                  <span
                    onClick={() => {
                      setFocusPostId(null);
                    }}
                    className={`border rounded ${
                      darkMode
                        ? "bg-[#1E1F24] border-[#292C33] text-white"
                        : "bg-white border-[#EEEDEF] text-black"
                    } h-full px-3 text-[0.7rem] cursor-pointer flex flex-row justify-center items-center space-x-1`}
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
                    } p-1.5 px-2 h-full flex flex-1 flex-row justify-between items-center space-x-1`}
                  >
                    <span className="hidden lg:flex flex-row items-center space-x-1">
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
                      <span>
                        {
                          "Interact with the community and participate in this discussion!"
                        }
                      </span>
                    </span>
                    {/* <span
                        onClick={() => {
                          joinCommunity();
                        }}
                        className={`cursor-pointer ${
                          joined ? "bg-gray-400" : "bg-[#EB4463]"
                        } text-sm text-white py-2 px-3 rounded-lg`}
                      >
                        {joined ? "Leave" : "Join"}
                      </span> */}
                    <span
                      onClick={() =>
                        communityInputRef.current.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                      className={`cursor-pointer text-sm text-white ${
                        joined ? "bg-[#EB4463]" : "bg-gray-400"
                      } h-full font-medium flex flex-row space-x-1 items-center py-1 px-3 rounded`}
                    >
                      <span>Comment</span>
                      <span>now</span>
                    </span>
                  </span>
                </span>

                <span className="relative flex h-fit w-full">
                  <Image
                    src={communityDetails.cover}
                    alt="user profile"
                    fill={true}
                    className="rounded-md border border-black object-cover"
                  />
                  <span className="w-full rounded-md h-full text-xs md:text-sm flex flex-col items-start justify-end text-white">
                    <span className="rounded-md py-2 px-3 border border-black flex flex-row justify-between items-center bg-white bg-opacity-30 backdrop-blur-md w-full">
                      <span className="flex flex-row space-x-1.5 items-center">
                        <span className="relative h-10 w-10 flex">
                          <Image
                            src={communityDetails.avatar}
                            alt="community profile"
                            width={55}
                            height={55}
                            className="border border-white rounded-full"
                          />
                        </span>
                        <span className="text-sm font-semibold">
                          {formatGroupName(community)}
                        </span>
                      </span>
                      <span className="pl-2.5 flex flex-col justify-center space-y-0.5 py-2 text-sm">
                        <span className="font-bold flex flex-row space-x-2 justify-start items-center"></span>
                        <span className="flex flex-row items-center text-sm font-semibold space-x-4">
                          <span>{`${communityDetails.posts.length} Posts`}</span>
                          <span>{`${communityDetails.members.length} Members`}</span>
                          {!joined && (
                            <span
                              onClick={joinCommunity}
                              className={`bg-[#EB4463] px-4 h-full py-1 cursor-pointer relative border border-black rounded`}
                            >
                              Join
                            </span>
                          )}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>

                <span
                  className={`mt-3 rounded-lg border ${
                    darkMode
                      ? "bg-[#1E1F24] border-[#292C33]"
                      : "bg-white border-[#EEEDEF]"
                  }`}
                >
                  <CommunityPostCard
                    {...communityDetails.posts.find(
                      (p) => p.id === parseInt(focusPostId)
                    )}
                    myProfileId={userNumId}
                    community={community}
                    comments={comments}
                    focusPostId={focusPostId}
                  />

                  <span
                    className={`border-t ${
                      darkMode ? "border-[#32353C]" : "border-[#D0D3DB]"
                    } px-3 pt-4 space-x-2 flex flex-row justify-between items-center`}
                  >
                    {userData && (
                      <span
                        // onClick={() => {
                        //   fullPageReload(`/profile/${userData.username}`, "window");
                        // }}
                        className="relative flex flex-shrink-0"
                      >
                        <Image
                          src={userData.avatar}
                          alt="user myprofile"
                          height={35}
                          width={35}
                          className="border border-black rounded-full"
                        />
                      </span>
                    )}
                    <span
                      className={`w-full border rounded-2xl flex ${selectedCommentMedia ? "flex-col" : "flex-row"} justify-between items-center pr-2 ${
                        darkMode
                          ? "bg-[#27292F] border-[#32353C]"
                          : "bg-[#F9F9F9] border-[#EEEDEF]"
                      }`}
                    >
                      <textarea
                        ref={communityInputRef}
                        value={commentMsg}
                        onChange={(e) => {
                          setCommentMsg(e.target.value);
                          e.target.style.height = '2rem'; // Reset height
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            postCommunityComment();
                          }
                        }}
                        maxLength={1900}
                        className={`${
                          darkMode ? "text-white" : "text-gray-800"
                        } h-8 flex items-center text-xs w-full bg-transparent border-none focus:ring-0 resize-none overflow-hidden`}
                        placeholder="Start discussing.."
                      />
                      {selectedCommentMedia ? (
                              <label htmlFor="input-post-file" className="relative h-[150px] w-full">
                                <Image
                                  src={selectedCommentMedia}
                                  alt="Invalid post media. Click to change"
                                  layout="fill"
                                  className="object-contain w-full h-full"
                                />

                                <input
                                  onChange={commentMediaChange}
                                  className="hidden"
                                  type="file"
                                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                                  id="input-post-file"
                                />
                              </label>
                            ) : (
                              <label
                                htmlFor="input-comment-file"
                                className="relative cursor-pointer"
                              >
                                <span className="flex flex-row items-end">
                                  <svg
                                    fill="#000000"
                                    width="20px"
                                    height="20px"
                                    viewBox="0 0 24 24"
                                    id="image"
                                    data-name="Flat Color"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="bg-[#5D6879] rounded-lg icon flat-color"
                                  >
                                    <rect
                                      id="primary"
                                      x={2}
                                      y={3}
                                      width={20}
                                      height={18}
                                      rx={2}
                                      style={{
                                        fill: "#5D6879",
                                      }}
                                    />
                                    <path
                                      id="secondary"
                                      d="M21.42,19l-6.71-6.71a1,1,0,0,0-1.42,0L11,14.59l-1.29-1.3a1,1,0,0,0-1.42,0L2.58,19a1,1,0,0,0-.29.72,1,1,0,0,0,.31.72A2,2,0,0,0,4,21H20a2,2,0,0,0,1.4-.56,1,1,0,0,0,.31-.72A1,1,0,0,0,21.42,19Z"
                                      style={{
                                        fill: "white",
                                      }}
                                    />
                                    <circle
                                      id="secondary-2"
                                      data-name="secondary"
                                      cx={11}
                                      cy={9}
                                      r={1.5}
                                      style={{
                                        fill: "white",
                                      }}
                                    />
                                  </svg>
                                </span>
                                <input
                                  onChange={commentMediaChange}
                                  className="hidden"
                                  type="file"
                                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                                  id="input-comment-file"
                                />
                              </label>
                            )}
                    </span>
                    <span
                      onClick={() => {
                        postCommunityComment();
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
                  </span>
                  <span className="text-sm px-3 pt-1 pb-0 flex flex-row justify-between">
                    <span className="font-semibold">All Comments</span>
                    <span className="space-x-2 flex flex-row items-center">
                      <span
                        className={darkMode ? "text-white" : "text-gray-500"}
                      >
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
                        className="text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none"
                      >
                        <option value="default">Relevance</option>
                        <option value="most_recent">Upvotes</option>
                        <option value="most_joined">Time</option>
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
                  <span className="">
                    {comments &&
                      comments.map((comment) => {
                        return (
                          <CommunityCommentItem
                            key={comment.id}
                            comment={comment}
                            comments={comments}
                            setCommentMsg={setCommentMsg}
                            setParentId={setParentId}
                          />
                        );
                      })}
                  </span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="w-full italic text-sm text-gray-800 pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
            <Lottie animationData={darkMode ? darkloadscreen : loadscreen} />
          </span>
        )}
        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
};
export default Community;
