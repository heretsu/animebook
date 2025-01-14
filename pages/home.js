import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import LargeRightBar from "@/components/largeRightBar";
import Posts from "@/components/posts";
import Stories from "@/components/stories";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import CommentCard from "@/components/commentCard";
import DappLibrary from "@/lib/dappLibrary";
import Spinner from "@/components/spinner";
import CommentConfig from "@/components/commentConfig";
import ReactPlayer from "react-player";
import SmallPostContainer from "@/components/smallPostContainer";
import SideBar from "@/components/sideBar";
import PopupModal from "@/components/popupModal";

export default function Home() {
  const [storyUploading, setStoryUploading] = useState(false);
  const { fetchStories, timeAgo, fetchViews, getUserFromUsername } = DappLibrary();
  const [errorMsg, setErrorMsg] = useState("");
  const [mediaContent, setMediaContent] = useState("");
  const router = useRouter();
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyToView, setStoryToView] = useState(null);
  const {
    openStories,
    setOpenStories,
    selectedMediaFile,
    setSelectedMediaFile,
    selectedMedia,
    setSelectedMedia,
    isImage,
    setIsImage,
    userNumId,
    userData,
    openComments,
    setOpenComments,
    storyValues,
    currentStory,
    setCurrentStory,
    storyViews,
    playVideo,
    setPlayVideo,
    sideBarOpened,
    deletePost,
    setDeletePost,
  } = useContext(UserContext);

  const closeStory = () => {
    setStoryIndex(0);
    setIsImage(true);
    setOpenStories(false);
    setSelectedMedia(null);
    setSelectedMediaFile(null);
    setMediaContent("");
  };
  const createStory = () => {
    if (selectedMediaFile !== null) {
      setStoryUploading(true);
      Object.setPrototypeOf(selectedMediaFile, FileList.prototype);
      for (const file of selectedMediaFile) {
        const newName = Date.now() + file.name;
        supabase.storage
          .from("mediastore")
          .upload("stories/" + newName, file)
          .then((result) => {
            if (result.data) {
              const mediaUrl =
                process.env.NEXT_PUBLIC_SUPABASE_URL +
                "/storage/v1/object/public/mediastore/" +
                result.data.path;

              supabase
                .from("stories")
                .insert({
                  userid: userNumId,
                  media: mediaUrl,
                  content: mediaContent,
                })
                .then(() => {
                  console.log("success");
                  fetchStories();
                  closeStory();
                  setStoryUploading(false);
                })
                .catch((err) => {
                  setErrorMsg("Failed to post. Try again");
                  console.log(err);
                  closeStory();
                  setStoryUploading(false);
                });
            }
          })
          .catch((err) => {
            setErrorMsg(
              "Failed to post. Check internet connection and try again"
            );
            console.log(err);
            closeStory();
            setStoryUploading(false);
          });
      }
    } else {
      setErrorMsg(
        "Photo or Video is required. Click on Text Post to make a text only post"
      );
      closeStory();
      setStoryUploading(false);
    }
  };
  const storyToggle = (nextStory) => {
    const userStories = [...currentStory.stories].reverse();
    if (nextStory) {
      if (storyIndex + 1 < userStories.length) {
        fetchViews(userStories[storyIndex + 1].dbIndex);
        setStoryToView(userStories[storyIndex + 1]);
        setStoryIndex(storyIndex + 1);
      } else {
        const n = storyValues.find((ns) => {
          return ns.newIndex === currentStory.newIndex + 1;
        });
        if (n === undefined) {
          console.log("end");
          return;
        }
        setStoryIndex(0);
        fetchViews(n.stories[0].dbIndex);
        setCurrentStory(n);
      }
    } else {
      if (storyIndex - 1 >= 0) {
        fetchViews(userStories[storyIndex - 1].dbIndex);
        setStoryToView(userStories[storyIndex - 1]);
        setStoryIndex(storyIndex - 1);
      } else {
        const ln = storyValues.find((ls) => {
          return ls.newIndex === currentStory.newIndex - 1;
        });
        if (ln === undefined) {
          console.log("start");
          return;
        }
        setStoryIndex(ln.stories.length - 1);
        fetchViews(ln.stories[0].dbIndex);
        setCurrentStory(ln);
      }
    }
  };

  const handleReferralAndUpdateUsers = async (userData, refData) => {
    try {
      // Insert referral record
      const referralResponse = await supabase
        .from("referrals")
        .insert({
          referrer: refData.username,
          referee: userData.username,
        });
  
      if (referralResponse.error) {
        console.log(`Referral insert failed: ${referralResponse.error.message}`);
        return
      }
  
      // Update referrer's `ki` value
      const referrerUpdateResponse = await supabase
        .from("users")
        .update({ ki: parseFloat(refData.ki) + 1.2 })
        .eq("id", refData.id);
  
      if (referrerUpdateResponse.error) {
        console.log(`Referrer update failed: ${referrerUpdateResponse.error.message}`);
        return
      }
  
      const userUpdateResponse = await supabase
        .from("users")
        .update({ ki: 1.2 })
        .eq("id", userData.id);
  
      if (userUpdateResponse.error) {
        console.log(`User update failed: ${userUpdateResponse.error.message}`);
        return
      }
  
    } catch (error) {
      console.error("Error handling referral:", error.message);
    }
  };  

  useEffect(() => {

    if (localStorage.getItem("referralCode") && userData) {
      const referrer = localStorage.getItem("referralCode").replace("-san", "").trim();
      if (referrer.toLowerCase().trim() === userData.username.toLowerCase().trim()){
        localStorage.removeItem("referralCode");
        return
      }
      const now = new Date();
      const createdAt = new Date(userData.created_at);

      if ((now - createdAt) / (1000 * 60) < 5) { //check if new user from 5 minutes ago
        const refData = getUserFromUsername(referrer)
        handleReferralAndUpdateUsers(userData, refData);
        localStorage.removeItem("referralCode");
      }
    }
    if (currentStory !== null) {
      //using ... to destructure array else if done directly the original array will be mutated (reversed as well)
      const userStories = [...currentStory.stories].reverse();
      setStoryToView(userStories[storyIndex]);
    }
  }, [currentStory, userData]);

  return (
    <main>
      <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
        {!openStories && <NavBar />}
        {!openStories && <SmallTopBar middleTab={true} relationship={true} />}
        <div
          className={
            "w-full lg:mt-20 pb-20 lg:pt-0 lg:pb-2 space-y-2 px-2 lg:pl-lPostCustom lg:pr-rPostCustom flex flex-col"
          }
        >
          <div className="topcont">
            <LargeTopBar relationship={true} />
          </div>
          {userData && <Stories />}
          {userData && <SmallPostContainer />}

          <Posts />
        </div>

        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
      </section>

      {sideBarOpened && <SideBar />}

      <MobileNavBar />
      {/* Stories presentation with useContext [stories] -> [app] -> [home] */}
      {/* First create your own story preview */}
      <div
        id={selectedMedia ? "stories-modal" : "invisible"}
        className="text-white relative flex flex-col w-full space-y-5 pb-16 px-1"
      >
        <div className="relative w-full h-[80vh] flex justify-center">
          {isImage ? (
            selectedMedia !== null && (
              <Image
                src={selectedMedia}
                alt="Story"
                height={600}
                width={600}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <video
              width={600}
              height={600}
              src={selectedMedia}
              autoPlay
              loop
            ></video>
          )}

          <div className="absolute inset-0 text-white flex flex-col justify-between p-2">
            <span className="flex flex-row justify-start items-center">
              <span className="cursor-pointer flex justify-start items-center space-x-2">
                {userData !== undefined && (
                  <Image
                    src={userData.avatar}
                    alt="user profile"
                    height={35}
                    width={35}
                    className="rounded-full"
                  />
                )}
                <span className="font-semibold">Me</span>
              </span>
            </span>
            {/* On story creation only. This is the stories action control */}
          </div>
        </div>
      </div>

      {/* Second view others story preview */}
      {currentStory !== null && storyToView !== null && (
        <div
          id={openStories ? "stories-modal" : "invisible"}
          className="text-white relative flex flex-col w-full space-y-5 pb-16 px-1"
        >
          <div className="relative w-full h-screen flex justify-center">
            {storyToView &&
              storyToView.media !== null &&
              (storyToView.media.endsWith("mp4") ||
              storyToView.media.endsWith("MP4") ||
              storyToView.media.endsWith("mov") ||
              storyToView.media.endsWith("MOV") ||
              storyToView.media.endsWith("3gp") ||
              storyToView.media.endsWith("3GP") ? (
                <ReactPlayer
                  url={storyToView.media}
                  playing={playVideo}
                  width="100%"
                  height="100%"
                  loop
                />
              ) : (
                <Image
                  src={storyToView.media}
                  alt="Story"
                  height={600}
                  width={600}
                  className="w-full h-full object-contain"
                />
              ))}

            <div className="absolute inset-0 text-white flex flex-col justify-between p-2">
              <span className="flex flex-row justify-start items-center">
                <span
                  onClick={() => {}}
                  className="z-10 cursor-pointer flex justify-start items-center space-x-2"
                >
                  <Image
                    src={currentStory.avatar}
                    alt="user profile"
                    height={35}
                    width={35}
                    className="rounded-full"
                  />
                  <span className="font-semibold">{currentStory.username}</span>
                  <span className="text-sm">
                    {storyToView && timeAgo(storyToView.created_at)}
                  </span>
                </span>
              </span>
              <span className="flex flex-row text-base w-full justify-center text-start">
                <span className="flex flex-col space-y-2 items-center">
                  <span className="bg-black px-2">
                    {storyToView && storyToView.content !== null && (
                      <CommentConfig text={storyToView.content} tags={true} />
                    )}
                  </span>
                  {currentStory.id === userNumId && (
                    <div
                      onClick={() => {
                        console.log("yooooo");
                      }}
                      className="z-10 cursor-pointer flex items-center space-x-1"
                    >
                      <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1 10c0-3.9 3.1-7 7-7s7 3.1 7 7h-1c0-3.3-2.7-6-6-6s-6 2.7-6 6H1zm4 0c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3zm1 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"
                        />
                      </svg>

                      <div className="text-white">
                        {storyViews !== null && storyViews !== undefined
                          ? storyViews.length
                          : 0}
                      </div>
                    </div>
                  )}
                </span>
              </span>
            </div>
            {/* Story Controllers */}
            <div
              id="stories-controllers"
              className="text-xl font-semibold px-2 lg:px-4 w-full absolute inset-0 flex flex-row justify-between items-center h-full"
            >
              <span
                onClick={() => {
                  storyToggle(false);
                }}
                className="bg-pastelGreen rounded-lg py-1 px-2 cursor-pointer"
              >
                {"<"}
              </span>
              <span
                onClick={() => {
                  storyToggle(true);
                }}
                className="bg-pastelGreen rounded-lg py-1 px-2 cursor-pointer"
              >
                {">"}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => {
          setPlayVideo(false);
          closeStory();
        }}
        id={
          openStories || selectedMedia !== null ? "stories-cancel" : "invisible"
        }
        className="cursor-pointer text-white font-bold justify-end items-center mt-4"
      >
        <span className="bg-pastelGreen text-xl py-1 px-2 rounded-lg">x</span>
      </div>
      {selectedMedia !== null && (
        <span
          id="stories-upload"
          className="flex flex-col justify-center space-y-3"
        >
          <span className="flex px-4 justify-center">
            <input
              value={mediaContent}
              onChange={(e) => {
                setMediaContent(e.target.value);
              }}
              className="w-full md:w-[90%] placeholder-gray-300 text-base w-full px-8 text-white rounded-3xl bg-slate-500 border-2 border-pastelGreen bg-opacity-60 focus:border-pastelGreen focus:ring-0"
              placeholder="add description..."
            />
          </span>

          {storyUploading ? (
            <span className="mx-auto">
              <Spinner spinnerSize={"medium"} />
            </span>
          ) : (
            <span
              onClick={() => {
                createStory();
              }}
              className="mx-auto w-fit cursor-pointer bg-pastelGreen py-2 px-10 rounded-lg font-medium text-lg text-white"
            >
              Upload
            </span>
          )}
        </span>
      )}
      {openStories || selectedMedia ? (
        <>
          <div id="stories-overlay" className="bg-black bg-opacity-80"></div>
        </>
      ) : (
        ""
      )}
      {openComments && (
        <>
          <span id="comments-modal">
            <CommentCard openComments={openComments} />
          </span>
          <div
            onClick={() => {
              setOpenComments(false);
            }}
            id="overlay"
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
    </main>
  );
}
