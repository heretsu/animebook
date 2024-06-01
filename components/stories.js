import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/userContext";
import DappLibrary from "@/lib/dappLibrary";
import supabase from "@/hooks/authenticateUser";

const Stories = () => {
  const { fetchStories, fetchViews } = DappLibrary();
  const {
    setOpenStories,
    setSelectedMediaFile,
    setSelectedMedia,
    storyValues,
    userData,
    setIsImage,
    setCurrentStory,
    userNumId,
    setPlayVideo
  } = useContext(UserContext);

  const mediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (
        file.name.endsWith("mp4") ||
        file.name.endsWith("MP4") ||
        file.name.endsWith("mov") ||
        file.name.endsWith("MOV") ||
        file.name.endsWith("3gp") ||
        file.name.endsWith("3GP")
      ) {
        setIsImage(false);
      } else {
        setIsImage(true);
      }
      setSelectedMediaFile({
        ...e.target.files,
        length: e.target.files.length,
      });
      setSelectedMedia(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div
      id="stories-container"
      className="font-semibold space-x-1.5 relative w-full items-start flex flex-row bg-transparent"
    >
      <label
        id="stories"
        htmlFor="input-file"
        className="relative w-[4.5rem] h-28 overflow-hidden cursor-pointer"
      >
        {userData !== undefined && (
          <Image
            src={userData.avatar}
            alt="Story"
            height={28}
            width={40}
            className="relative w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 text-white bg-black bg-opacity-50 flex flex-col justify-center items-center p-2">
          <div className="font-medium text-3xl self-center w-6 h-6 flex items-center justify-center">
            +
          </div>
          <span className="text-[9px]">New Story</span>
        </div>

        <input
          onChange={mediaChange}
          className="hidden"
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/mp4, video/mov, video/quicktime"
          id="input-file"
        />
      </label>

      {storyValues.length !== 0 &&
        storyValues.map((story) => {
          return (
            <div
              onClick={() => {
                fetchViews(
                  storyValues[story.newIndex].stories[
                    storyValues[story.newIndex].stories.length - 1
                  ].dbIndex
                );
                setPlayVideo(true)
                setCurrentStory(storyValues[story.newIndex]);
                setOpenStories(true);
              }}
              key={story.useruuid}
              id="stories"
              className="relative w-16 h-28 overflow-hidden cursor-pointer"
            >
              {story.stories[0].media.endsWith("mp4") ||
              story.stories[0].media.endsWith("MP4") ||
              story.stories[0].media.endsWith("mov") ||
              story.stories[0].media.endsWith("MOV") ||
              story.stories[0].media.endsWith("3gp") ||
              story.stories[0].media.endsWith("3GP") ? (
                <video
                  width={40}
                  height={40}
                  src={story.stories[0].media}
                ></video>
              ) : (
                <Image
                  src={story.stories[0].media}
                  alt="Story"
                  height={40}
                  width={40}
                  className="w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 text-white flex flex-col justify-end">
                <p className="flex flex-row justify-center h-[2rem] w-full text-center bg-black blur"></p>
                <p className="absolute flex flex-row text-[9px] w-full justify-center text-start">
                  {story.username}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default Stories;
