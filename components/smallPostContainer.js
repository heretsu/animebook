import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import GifPicker from "./gifPicker";
import DbUsers from "@/hooks/dbUsers";

const SmallPostContainer = ({ communityId, community }) => {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, userData, darkMode, postValues, setPostValues, setOriginalPostValues, setCommunities } = useContext(UserContext);
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
const [gifLink, setGifLink] = useState(null)
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
              (post) =>
                !reposts.some(
                  (repost) => repost.postid === post.id
                )
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
          })
          setOriginalPostValues(
            posts
          );
          setPostValues(
            posts
          );
        }
      });
    });
  });
}
  const handleGifSelect = (gifUrl) => {
    setGifLink(gifUrl)
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
    if (gifLink){
      await supabase.from("posts").insert({
        userid: userNumId,
        media: gifLink,
        content: content.trim() !== "" ? content.trim() : "",
      });
      setContent('')
      setGifSelected(false);
      setSelectedMedia(null);
      setMediaFile(null)
      setShowGifPicker(false);
      fetchPosts()
      // fullPageReload("/home");
    }
    else if (mediaFile !== null) {
      for (const file of mediaFile) {
        const newName = Date.now() + file.name;
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
            fullPageReload(`/communities/${community}`);
          } else {
            await supabase.from("posts").insert({
              userid: userNumId,
              media: mediaUrl,
              content: content.trim() !== "" ? content.trim() : "",
            });
            // fullPageReload("/home");
            setContent('')
            setGifSelected(false);
            setSelectedMedia(null);
            setMediaFile(null)
            setShowGifPicker(false);
            fetchPosts()
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
          // fullPageReload(`/communities/${community}`);
          setContent('')
          setGifSelected(false);
            setSelectedMedia(null);
            setMediaFile(null)
            setShowGifPicker(false);
          fetchPosts()
        } else {
          await supabase.from("posts").insert({
            userid: userNumId,
            media: null,
            content: content.trim(),
          });
          // fullPageReload("/home");
          setContent('')
          setGifSelected(false);
            setSelectedMedia(null);
            setMediaFile(null)
            setShowGifPicker(false);

          fetchPosts();
        }
      } else {
        setPostLoading(true);
        setErrorMsg("Failed to post. Post is empty");
      }
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
      className={`p-4 flex flex-col space-y-4 shadow-lg w-full ${
        darkMode ? "bg-[#1e1f24] text-white" : "bg-white"
      } justify-center items-center`}
    >
      <span className="flex flex-row w-full justify-center space-x-2">
        <span
          id="anime-book-font"
          className={`w-full text-start text-xl ${
            darkMode ? "text-white" : "text-slate-600"
          }`}
        >
          {"POST SOMETHING.."}
        </span>
      </span>

      <span
        className={`w-full p-2 ${
          darkMode ? "bg-zinc-800 text-white" : "bg-gray-100"
        } relative flex flex-row ${
          showGifPicker ? "flex" : "justify-between items-center"
        } space-x-0`}
      >
        {!showGifPicker && (
          <span className="relative h-9 w-9 flex flex-shrink-0">
            <Image
              src={userData.avatar}
              alt="user profile"
              width={35}
              height={35}
              className="rounded-full object"
            />
          </span>
        )}
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
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
              }

              if (e.target.value && e.target.value.length < 1900) {
                setContent(e.target.value);
              }
            }}
            ref={textareaRef}
            placeholder={`What's on your mind...`}
            className={`text-sm resize-none w-full bg-transparent ${
              darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
            } border-none focus:outline-none focus:ring-0`}
          ></textarea>
        )}
        <span className="flex flex-row space-x-1 justify-center items-center">
          {!showGifPicker && !selectedMedia && (
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
          )}
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
                  height={30}
                  width={30}
                />
              ) : (
                <video width={30} height={30} src={selectedMedia} controls>
                  {`${mediaName} It seems your browser does not support video uploads`}
                </video>
              )}
              {!gifSelected && <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                id="input-post-file"
              />}
            </label>
          ) : (
            !showGifPicker && (
              <label
                htmlFor="input-post-file"
                className="relative cursor-pointer"
              >
                <svg
                  height="30"
                  width="30"
                  version="1.1"
                  id=""
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 218.168 218.168"
                  style={{ enableBackground: "new 0 0 218.168 218.168" }}
                  xmlSpace="preserve"
                  className={darkMode ? "text-white" : "text-black"}
                  fill="currentColor"
                >
                  <g opacity="0.3">
                    <g>
                      <g>
                        <path
                          d="M206.278,5.951H11.888C5.332,5.951,0,11.273,0,17.816v162.703c0,6.543,5.328,11.865,11.879,11.865h57.632
                    c9.057,12.016,23.401,19.833,39.573,19.833s30.516-7.817,39.573-19.833h57.65c6.541,0,11.861-5.322,11.861-11.865V17.816
                    C218.167,11.273,212.835,5.951,206.278,5.951z M109.083,204.284c-22.965,0-41.65-18.683-41.65-41.65
                    c0-22.967,18.685-41.65,41.65-41.65s41.65,18.683,41.65,41.65S132.049,204.284,109.083,204.284z M27.767,95.426v-1.088
                    c10.841-3.447,21.662-5.834,32.206-7.097c32.105-3.854,47.089,1.712,64.427,8.162c9.157,3.405,18.627,6.926,31.466,9.63
                    c9.465,1.995,21.069,3.537,34.534,4.59v0.283v22.979h-41.744c-9.057-12.016-23.401-19.833-39.573-19.833
                    s-30.516,7.818-39.573,19.833H27.767V95.426z M27.767,86.088V37.684H190.4v63.973c-12.85-1.024-23.913-2.494-32.899-4.388
                    c-12.26-2.58-21.451-6-30.337-9.305c-18.305-6.806-34.123-12.69-68.136-8.603C48.772,80.593,38.279,82.89,27.767,86.088z
                    M210.234,180.519L210.234,180.519c-0.001,2.169-1.763,3.932-3.929,3.932H153.54c3.249-6.594,5.126-13.982,5.126-21.817
                    s-1.876-15.222-5.125-21.817h40.825c2.19,0,3.967-1.774,3.967-3.967v-26.946v-3.967V33.718c0-2.192-1.776-3.967-3.967-3.967H23.8
                    c-2.19,0-3.967,1.774-3.967,3.967v57.741v3.967v41.425c0,2.192,1.776,3.967,3.967,3.967h40.826
                    c-3.249,6.594-5.126,13.982-5.126,21.817c0,7.835,1.876,15.222,5.126,21.817H11.879c-2.175,0-3.945-1.762-3.945-3.932V17.816
                    c0-2.169,1.774-3.932,3.955-3.932h194.39c2.18,0,3.955,1.762,3.955,3.932V180.519z"
                        />
                        <path
                          d="M162.633,77.351c8.749,0,15.867-7.116,15.867-15.867c0-8.751-7.118-15.867-15.867-15.867s-15.867,7.116-15.867,15.867
                    C146.766,70.235,153.884,77.351,162.633,77.351z M162.633,53.551c4.375,0,7.933,3.56,7.933,7.933
                    c0,4.373-3.558,7.933-7.933,7.933s-7.933-3.56-7.933-7.933C154.7,57.111,158.258,53.551,162.633,53.551z"
                        />
                        <path
                          d="M112.541,142.84c-1.406-2.495-5.509-2.495-6.915,0l-17.85,31.733c-0.691,1.228-0.678,2.731,0.033,3.947
                    s2.014,1.964,3.424,1.964h35.7c1.41,0,2.714-0.748,3.424-1.964c0.711-1.216,0.724-2.719,0.033-3.947L112.541,142.84z
                    M98.016,172.551l11.067-19.675l11.067,19.675H98.016z"
                        />
                      </g>
                    </g>
                  </g>
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
        )}
      </span>

      {(mediaFile || content.trim() !== "" || gifLink) && (
        <span className="flex flex-col">
          {postLoading ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span
              onClick={() => {
                createPost();
              }}
              className={`w-fit mx-auto hover:shadow cursor-pointer px-12 py-1 bg-pastelGreen text-center text-white font-bold`}
            >
              Post
            </span>
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
        </span>
      )}
    </div>
  );
};
export default SmallPostContainer;
