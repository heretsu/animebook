import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import { SmallTopBar } from "@/components/largeTopBar";
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
  const { userNumId, communityInputRef } = useContext(UserContext);
  const [reentry, setReentry] = useState(false);
  const [joined, setJoined] = useState(false);
  const [comments, setComments] = useState([]);
  const [globalCommunityComments, setGlobalCommunityComments] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [commentMsg, setCommentMsg] = useState("");

  const router = useRouter();
  const [communityDetails, setCommunityDetails] = useState(null);
  const [newPost, setNewPost] = useState(false);
  const [focusPostId, setFocusPostId] = useState(undefined);
  const [commentPostLoading, setCommentPostLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCommunityComments = async () => {
    const { data } = await supabase
      .from("community_comments")
      .select(
        "id, created_at, content, community_posts(id), users(id, avatar, username), parentid"
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

  const postCommunityComment = () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    setCommentPostLoading(true);
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
    }
  };

  const fetchCommunityDetails = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("name", community.replace(' ', '+').toLowerCase().split("&")[0])
      // .eq("name", community.split("&")[0].toLowerCase());

    if (!data) {
      console.log("could not fetch communities data");
      return;
    }

    const posts = await supabase
      .from("community_posts")
      .select(
        "id, created_at, content, media, communityid, users(id, avatar, username, created_at, cover, bio)"
      )
      .eq("communityid", data[0].id)
      .order("created_at", {ascending: false})

    const members = await supabase
      .from("community_relationships")
      .select("*")
      .eq("communityid", data[0].id);
    if (community.split("&")[1]) {
      setFocusPostId(community.split("&")[1]);
    }

    if (userNumId) {setJoined(!!members.data.find((mb) => mb.userid === userNumId)); setReentry(true);
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
      .split(" ") // Split the string at ' '
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
    // return text
    //   .split("&")[0]
    //   .split("+") // Split the string at '+'
    //   .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    //   .join(" ");
  };

  const joinCommunity = async () => {
    if (!userNumId){
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
      fetchCommunityDetails();
      fetchCommunityComments();
    
  }, [userNumId]);

  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        {communityDetails ? (
          <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
            <SmallTopBar middleTab={true} />
            {focusPostId === undefined || focusPostId === null ? (
              <div className="w-full space-y-4 mt-2 lg:mt-20 flex flex-col">
                <span className="relative flex h-[150px] sm:h-[200px] w-full">
                  <Image
                    src={communityDetails.cover}
                    alt="user profile"
                    fill={true}
                    className="rounded-2xl object-cover"
                  />
                  <span className="p-1.5 rounded-2xl h-full bg-black text-xs md:text-sm rounded-b-2xl absolute inset-0 flex flex-col items-start justify-end text-white bg-opacity-30">
                    <span className="flex flex-row bg-white bg-opacity-30 w-full rounded-2xl">
                      <Image
                        src={communityDetails.avatar}
                        alt="post"
                        height={80}
                        width={80}
                        className="object-contain p-1 rounded-2xl"
                      />
                      <span className="pl-2.5 flex flex-col justify-center space-y-0.5 py-2 text-sm">
                        <span className="font-bold flex flex-row space-x-2 justify-start items-center">
                          <span>{formatGroupName(community)}</span>
                          {!joined && (
                            <span
                              onClick={joinCommunity}
                              className={`cursor-pointer relative border "border-[#74dc9c]" bg-white h-fit w-fit rounded-full`}
                            >
                              <svg
                                onClick={() => {}}
                                id="Capa_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                height={`15px`}
                                width={`15px`}
                                stroke="transparent"
                                fill={"#74dc9c"}
                                x="0px"
                                y="0px"
                                viewBox="0 0 52 52"
                                style={{
                                  enableBackground: "new 0 0 52 52",
                                }}
                                xmlSpace="preserve"
                              >
                                <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M38.5,28H28v11c0,1.104-0.896,2-2,2 s-2-0.896-2-2V28H13.5c-1.104,0-2-0.896-2-2s0.896-2,2-2H24V14c0-1.104,0.896-2,2-2s2,0.896,2,2v10h10.5c1.104,0,2,0.896,2,2 S39.604,28,38.5,28z" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className="font-medium flex flex-row text-[0.77rem] space-x-4">
                          <span>{`${communityDetails.posts.length} Posts`}</span>
                          <span>{`${communityDetails.members.length} Following`}</span>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
                <span className="flex flex-row w-full justify-between">
                  <span className="flex flex-row space-x-2 font-medium">
                    <span
                      onClick={() => {
                        joinCommunity();
                      }}
                      className={`cursor-pointer ${
                        joined ? "bg-gray-400" : "bg-pastelGreen"
                      } text-sm text-white py-2 px-3 rounded-lg`}
                    >
                      {joined ? "Leave" : "Join"}
                    </span>
                    <span
                      onClick={() => {
                        if (joined) {
                          setNewPost(true);
                        }
                      }}
                      className={`cursor-pointer text-sm text-white ${
                        joined ? "bg-pastelGreen" : "bg-gray-400"
                      } py-2 px-3 rounded-lg`}
                    >
                      {"Create a post"}
                    </span>
                  </span>
                  <span className="space-x-2">
                    <span className="font-semibold text-sm text-black">
                      {"Sort by:"}
                    </span>
                    <span className="cursor-pointer text-sm text-white py-1.5 px-2.5 bg-gray-400 rounded-xl">
                      Newest
                    </span>
                  </span>
                </span>

                {newPost ? (
                  <>
                    <PostContainer
                      communityId={communityDetails.id}
                      community={community}
                    />
                    <span
                      onClick={() => {
                        setNewPost(false);
                      }}
                      className="cursor-pointer shadow-lg font-medium mx-auto rounded-lg border-2 border-red-500 text-red-500 py-1 px-3"
                    >
                      Cancel
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <svg
                      onClick={() => {
                        router.push("/communities");
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
                    <CommunityPosts
                      posts={communityDetails.posts}
                      community={communityDetails.name}
                      globalCommunityComments={globalCommunityComments}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full mt-2 lg:mt-20 flex flex-col">
                <span className="relative flex h-[100px] w-full">
                  <Image
                    src={communityDetails.cover}
                    alt="user profile"
                    fill={true}
                    className="rounded-2xl object-cover shadow-xl"
                  />
                  <span className="p-2 rounded-2xl h-full bg-black text-xs md:text-sm rounded-b-2xl absolute inset-0 flex flex-col items-center justify-center text-white bg-opacity-30">
                    <span className="h-full flex flex-row bg-white bg-opacity-30 w-full rounded-2xl">
                      <Image
                        src={communityDetails.avatar}
                        alt="post"
                        height={80}
                        width={80}
                        className="object-contain p-1 rounded-2xl"
                      />
                      <span className="pl-2.5 flex flex-col justify-center space-y-0.5 py-2 text-sm">
                        <span className="font-bold flex flex-row space-x-2 justify-start items-center">
                          <span>{formatGroupName(communityDetails.name)}</span>
                          {!joined && (
                            <span
                              onClick={joinCommunity}
                              className={`cursor-pointer relative border "border-[#74dc9c]" bg-white h-fit w-fit rounded-full`}
                            >
                              <svg
                                onClick={() => {}}
                                id="Capa_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                height={`15px`}
                                width={`15px`}
                                stroke="transparent"
                                fill={"#74dc9c"}
                                x="0px"
                                y="0px"
                                viewBox="0 0 52 52"
                                style={{
                                  enableBackground: "new 0 0 52 52",
                                }}
                                xmlSpace="preserve"
                              >
                                <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M38.5,28H28v11c0,1.104-0.896,2-2,2 s-2-0.896-2-2V28H13.5c-1.104,0-2-0.896-2-2s0.896-2,2-2H24V14c0-1.104,0.896-2,2-2s2,0.896,2,2v10h10.5c1.104,0,2,0.896,2,2 S39.604,28,38.5,28z" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className="font-medium flex flex-row text-[0.77rem] space-x-4">
                          <span>{`${communityDetails.posts.length} Posts`}</span>
                          <span>{`${communityDetails.members.length} Following`}</span>
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
                {/* Back button */}
                <svg
                  onClick={() => {
                    setFocusPostId(undefined);
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
                <CommunityPostCard
                  {...communityDetails.posts.find(
                    (p) => p.id === parseInt(focusPostId)
                  )}
                  
                  myProfileId={userNumId}
                  community={community}
                  comments={comments}
                />
                <span className="py-4 flex flex-row justify-between">
                  <span className="font-medium">Comments</span>
                  <span className="space-x-2">
                    <span className="font-semibold text-sm text-black">
                      {"Sort by:"}
                    </span>
                    <span className="cursor-pointer text-sm text-white py-1.5 px-2.5 bg-gray-400 rounded-xl">
                      Newest
                    </span>
                  </span>
                </span>
                <span className="mb-4 text-sm bg-white bg-opacity-50 space-y-0.5 p-2 rounded-lg border border-slate-300">
                  <textarea
                    ref={communityInputRef}
                    onChange={(e) => {
                      setCommentMsg(e.target.value);
                    }}
                    value={commentMsg}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        postCommunityComment();
                      }
                    }}
                    placeholder="Write a comment"
                    className="resize-none text-sm bg-transparent text-gray-900 rounded-xl w-full bg-transparent border-none focus:ring-0"
                  />
                  <span className="text-white font-medium flex flex-row justify-end space-x-2">
                    <span
                      onClick={() => {
                        setCommentMsg("");
                      }}
                      className="cursor-pointer bg-slate-400 py-0.5 px-2.5 rounded-xl"
                    >
                      Cancel
                    </span>
                    {commentPostLoading ? (
                      <span className="font-bold text-slate-400">{"..."}</span>
                    ) : (
                      <span
                        onClick={() => {
                          postCommunityComment();
                        }}
                        className="cursor-pointer bg-pastelGreen py-0.5 px-2.5 rounded-xl"
                      >
                        Comment
                      </span>
                    )}
                  </span>
                </span>
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
              </div>
            )}
          </div>
        ) : (
          <span className="w-full italic text-sm text-gray-800 pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">{`得る Eru ${formatGroupName(
            community
          )} community...`}</span>
        )}
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Community;
