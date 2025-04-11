import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import GifPicker from "./gifPicker";
import DbUsers from "@/hooks/dbUsers";
import PollCreator from "./pollCreator";

const SmallPostContainer = ({setNewPost, communityId, community }) => {
  const { fullPageReload } = PageLoadOptions();
  const {
    userNumId,
    userData,
    darkMode,
    postValues,
    setPostValues,
    setOriginalPostValues,
    setCommunities,
  } = useContext(UserContext);
  const [openPoll, setOpenPoll] = useState(false)
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaContent, setMediaContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPost, setMediaPost] = useState(true);
  const [isImage, setIsImage] = useState(true);
  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const textareaRef = useRef(null);

  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSelected, setGifSelected] = useState(false);
  const [gifLink, setGifLink] = useState(null);
  const { fetchAllPosts, fetchAllReposts } = DbUsers();

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    const members = await supabase.from("community_relationships").select("*");

    if (
      data &&
      members !== undefined &&
      members !== null &&
      members.data !== null &&
      members.data !== undefined
    ) {
      const communityMembersCountMap = new Map();
      members.data.forEach((member) => {
        const communityId = member.communityid;
        communityMembersCountMap.set(
          communityId,
          (communityMembersCountMap.get(communityId) || 0) + 1
        );
      });
      const communitiesWithMembers = data.map((community) => ({
        ...community,
        membersLength: communityMembersCountMap.get(community.id) || 0,
      }));
      return { data: communitiesWithMembers };
    }
  };
  const fetchPosts = () => {
    fetchAllReposts().then((reposts) => {
      fetchAllPosts().then((result1) => {
        fetchCommunities().then(async (secondResult) => {
          if (secondResult !== undefined && secondResult !== null) {
            setCommunities(
              [...secondResult.data].sort(
                (a, b) => b.membersLength - a.membersLength
              )
            );
            const posts = reposts
              .map((repost) => {
                const originalPost = result1.data.find(
                  (post) => post.id === repost.postid
                );

                if (originalPost) {
                  return {
                    ...originalPost,
                    repostAuthor: repost.users,
                    repostQuote: repost.quote,
                    repostCreatedAt: repost.created_at,
                  };
                }
                return null;
              })
              .filter(Boolean)
              .concat(
                result1.data.filter(
                  (post) => !reposts.some((repost) => repost.postid === post.id)
                )
              )
              .sort((a, b) => {
                const dateA = new Date(
                  a.repostQuote ? a.repostCreatedAt : a.created_at
                );
                const dateB = new Date(
                  b.repostQuote ? b.repostCreatedAt : b.created_at
                );
                return dateB - dateA;
              });
            setOriginalPostValues(posts);
            setPostValues(posts);
          }
        });
      });
    });
  };
  const handleGifSelect = (gifUrl) => {
    setGifLink(gifUrl);
    // setInputValue((prev) => `${prev} ${gifUrl}`);
    setGifSelected(true);
    setSelectedMedia(gifUrl);
    setShowGifPicker(false);
  };

  const mediaChange = (e) => {
    setGifSelected(false);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMediaName(file.name);
      setMediaFile(e.target.files);
      if (
        file.name.endsWith("mp4") ||
        file.name.endsWith("MP4") ||
        file.name.endsWith("mov") ||
        file.name.endsWith("MOV") ||
        file.name.endsWith("3gp") ||
        file.name.endsWith("3GP")
      ) {
        setSelectedMedia(URL.createObjectURL(file));
        setIsImage(false);
      } else {
        setSelectedMedia(URL.createObjectURL(file));
        setIsImage(true);
      }
    }
  };
  const createPost = async () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    setPostLoading(true);
    if (gifLink) {
      await supabase.from("posts").insert({
        userid: userNumId,
        media: gifLink,
        content: content.trim() !== "" ? content.trim() : "",
      });
    
      setContent("");
      const textarea = textareaRef.current
      textarea.style.height = "2rem";
      setGifSelected(false);
      setSelectedMedia(null);
      setMediaFile(null);
      setShowGifPicker(false);
      fetchPosts();
      // fullPageReload("/home");
    } else if (mediaFile !== null) {
      for (const file of mediaFile) {
        const newName = Date.now() + file.name;

        const MAX_FILE_SIZE = 50 * 1024 * 1024;

        if (file.type.startsWith("video/") && file.size > MAX_FILE_SIZE) {
          setPostLoading(false);
          setErrorMsg("Video exceeds 50MB");
          return;
        }

        const bucketResponse = await supabase.storage
          .from("mediastore")
          .upload(
            `${communityId ? "community_posts/" + newName : newName}`,
            file
          );

        if (bucketResponse.data) {
          const mediaUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            "/storage/v1/object/public/mediastore/" +
            bucketResponse.data.path;
          if (communityId) {
            await supabase.from("community_posts").insert({
              userid: userNumId,
              media: mediaUrl,
              content: content.trim() !== "" ? content.trim() : "",
              communityid: parseInt(communityId),
            });
            fullPageReload(`/communities/${community}`, 'window');
          } else {
            await supabase.from("posts").insert({
              userid: userNumId,
              media: mediaUrl,
              content: content.trim() !== "" ? content.trim() : "",
            });
            // fullPageReload("/home");
            setContent("");
            const textarea = textareaRef.current
            textarea.style.height = "2rem";
      
            setGifSelected(false);
            setSelectedMedia(null);
            setMediaFile(null);
            setShowGifPicker(false);
            fetchPosts();
          }
        }
      }
    } else {
      if (content.trim() !== "") {
        if (communityId) {
          await supabase.from("community_posts").insert({
            userid: userNumId,
            media: null,
            content: content,
            communityid: parseInt(communityId),
          });
          fullPageReload(`/communities/${community}`, 'window');
          setContent("");
          const textarea = textareaRef.current
          textarea.style.height = "2rem";
    
          setGifSelected(false);
          setSelectedMedia(null);
          setMediaFile(null);
          setShowGifPicker(false);
          fetchPosts();
        } else {
          await supabase.from("posts").insert({
            userid: userNumId,
            media: null,
            content: content.trim(),
          });
          // fullPageReload("/home");
          setContent("");
          const textarea = textareaRef.current
          textarea.style.height = "2rem";
    
          setGifSelected(false);
          setSelectedMedia(null);
          setMediaFile(null);
          setShowGifPicker(false);

          fetchPosts();
        }
      } else {
        setPostLoading(true);
        setErrorMsg("Failed to post. Post is empty");
      }
    }

    if (router.pathname === "/create") {
      router.push("/home");
    }
    setPostLoading(false);
  };

  useEffect(() => {
    if (community) {
      setMediaPost(false);
    }
    // Media blob revoked after component is unmounted. Doing this to prevent memory leaks
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia]);
  return (
    <div
      className={`border rounded-sm p-4 flex flex-row w-full ${
        darkMode
          ? "bg-[#1e1f24] text-white border-[#292C33]"
          : "bg-white border-[#EEEDEF]"
      } justify-center items-center`}
    >
      <span
        className={`rounded-md border w-full p-2 ${
          openPoll ? 'border-none bg-transparent' : ( darkMode
            ? "bg-[#27292F] border-[#32353C] text-white"
            : "bg-[#F9F9F9] border-[#EEEDEF]")
        } relative flex flex-row ${
          showGifPicker ? "flex" : "justify-between items-center"
        } ${selectedMedia && "flex-col"} space-x-0`}
      >
        {openPoll ? <>
        <PollCreator setNewPost={setNewPost} darkMode={darkMode} setOpenPoll={setOpenPoll} userNumId={userNumId} postLoading={postLoading} setPostLoading={setPostLoading} errorMsg={errorMsg} setErrorMsg={setErrorMsg} communityId={communityId} community={community} fetchPosts={fetchPosts}/>
        </> :  <>
        {!showGifPicker && (
          <textarea
            value={content}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && content && content.length === 1) {
                setContent("");
              }
            }}
            onChange={(e) => {
              const textarea = textareaRef.current;
              if (textarea) {
                textarea.style.height = "2rem";
                textarea.style.height = `${textarea.scrollHeight}px`;
              }

              if (e.target.value && e.target.value.length < 1900) {
                setContent(e.target.value);
              }
            }}
            onInput={(e) => {
              // Ensure textarea shrinks when selecting and deleting text
              if (e.target.value === "") {
                setContent(""); // Reset content
                e.target.style.height = "2rem"; // Reset to h-8
              }
            }}
            ref={textareaRef}
            placeholder={`What's on your mind?`}
            className={`text-sm resize-none w-full bg-transparent ${
              darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
            } h-8 placeholder:text-xs border-none focus:outline-none focus:ring-0`}
          />
        )}
        <span className="flex flex-row space-x-1 justify-center items-center">
          {/* {!showGifPicker && !selectedMedia && (
            <svg
              onClick={() => {
                setShowGifPicker(true);
              }}
              width="24px"
              height="24px"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
            >
              <path
                d="M2.5 10.5H2V11H2.5V10.5ZM4.5 10.5V11H5V10.5H4.5ZM13.5 3.5H14V3.29289L13.8536 3.14645L13.5 3.5ZM10.5 0.5L10.8536 0.146447L10.7071 0H10.5V0.5ZM2 6V10.5H3V6H2ZM2.5 11H4.5V10H2.5V11ZM5 10.5V8.5H4V10.5H5ZM3 7H5V6H3V7ZM2 5V1.5H1V5H2ZM13 3.5V5H14V3.5H13ZM2.5 1H10.5V0H2.5V1ZM10.1464 0.853553L13.1464 3.85355L13.8536 3.14645L10.8536 0.146447L10.1464 0.853553ZM2 1.5C2 1.22386 2.22386 1 2.5 1V0C1.67157 0 1 0.671573 1 1.5H2ZM1 12V13.5H2V12H1ZM2.5 15H12.5V14H2.5V15ZM14 13.5V12H13V13.5H14ZM12.5 15C13.3284 15 14 14.3284 14 13.5H13C13 13.7761 12.7761 14 12.5 14V15ZM1 13.5C1 14.3284 1.67157 15 2.5 15V14C2.22386 14 2 13.7761 2 13.5H1ZM6 7H9V6H6V7ZM6 11H9V10H6V11ZM7 6.5V10.5H8V6.5H7ZM10.5 7H13V6H10.5V7ZM10 6V11H11V6H10ZM10.5 9H12V8H10.5V9Z"
                fill="gray"
              />
            </svg>
          )} */}
          {!selectedMedia && <svg 
            onClick={()=>{ setOpenPoll(true)}}
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="#EB4463"
            className="cursor-pointer"
          >
            <path d="M7 11h7v2H7zm0-4h10.97v2H7zm0 8h13v2H7zM4 4h2v16H4z" />
          </svg>}
          {selectedMedia &&  <span
                    onClick={() => {
                      setSelectedMedia(false)
                    }}
                    className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} font-bold text-sm flex justify-center cursor-pointer text-center items-center text-black h-fit w-fit p-1 rounded-md`}
                  >
                     <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1={18} y1={6} x2={6} y2={18} />
    <line x1={6} y1={6} x2={18} y2={18} />
  </svg>
                    
                  </span>}
          {selectedMedia ? (
            <label
              onClick={(e) => {
                if (gifSelected) {
                  setShowGifPicker(true);
                } else {
                  mediaChange(e);
                }
              }}
              htmlFor="input-post-file"
            >
              {isImage ? (
                <Image
                  src={selectedMedia}
                  alt="Invalid post media. Click to change"
                  height={300}
                  width={300}
                />
              ) : (
                <video width={300} height={300} src={selectedMedia} controls>
                  {`${mediaName} It seems your browser does not support video uploads`}
                </video>
              )}
              {!gifSelected && (
                <input
                  onChange={mediaChange}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                  id="input-post-file"
                />
              )}
            </label>
          ) : (
            !showGifPicker && (
              <label
                htmlFor="input-post-file"
                className="relative cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                >
                  <path
                    id="image"
                    d="M17,0H5A5,5,0,0,0,0,5V17a5,5,0,0,0,5,5H17a5,5,0,0,0,5-5V5a5,5,0,0,0-5-5ZM6.07,5a2,2,0,1,1-2,2,2,2,0,0,1,2-2ZM20,17a3.009,3.009,0,0,1-3,3H5a3.009,3.009,0,0,1-3-3v-.24l3.8-3.04a.668.668,0,0,1,.73-.05l2.84,1.7a2.624,2.624,0,0,0,3.36-.54l3.94-4.61a.642.642,0,0,1,.47-.22.614.614,0,0,1,.47.19L20,12.57Z"
                    fill={darkMode ? "#6A6B71" : "#4a5764"}
                  />
                </svg>

                <input
                  onChange={mediaChange}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                  id="input-post-file"
                />
              </label>
            )
          )}
        </span>

        {showGifPicker && (
          <span className="w-full">
            <GifPicker
              onGifSelect={handleGifSelect}
              darkMode={darkMode}
              setShowGifPicker={setShowGifPicker}
            />
          </span>
        )}</>}
      </span>

      {!openPoll && <span className="flex flex-col">
        {postLoading ? (
          <span className="mx-auto">
            <Spinner spinnerSize={"medium"} />
          </span>
        ) : (
          <>
            <span
              onClick={() => {
                if (mediaFile || content.trim() !== "" || gifLink) {
                  createPost();
                }
              }}
              className={`hidden lg:block rounded w-fit mx-auto hover:shadow cursor-pointer ml-4 px-7 py-1.5 bg-[#EB4463] text-sm font-medium text-center text-white`}
            >
              Post
            </span>
            <span
              onClick={() => {
                if (mediaFile || content.trim() !== "" || gifLink) {
                  createPost();
                }
              }}
              className={`ml-2 lg:hidden bg-[#EB4463] rounded-full h-9 w-9 flex justify-center items-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 21.5 21.5"
              >
                <g id="Icon" transform="translate(-1.25 -1.25)">
                  <path
                    id="Pfad_4721"
                    data-name="Pfad 4721"
                    d="M1.3,3.542a1.845,1.845,0,0,1,2.615-2.1l17.81,8.9a1.845,1.845,0,0,1,0,3.3l-17.81,8.9a1.845,1.845,0,0,1-2.615-2.1L3.17,13,14,12,3.17,11,1.305,3.542Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                </g>
              </svg>
            </span>
          </>
        )}
        {errorMsg !== "" && (
          <span className="text-sm w-full flex flex-row justify-center items-center">
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
      </span>}
    </div>
  );
};
export default SmallPostContainer;
