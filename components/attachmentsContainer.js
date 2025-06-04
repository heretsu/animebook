import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { MessageContext } from "@/lib/messageContext";
import GifPicker from "./gifPicker";
import StickerPicker from "./stickerPacker";

const AttachmentsContainer = ({ receiverid }) => {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, darkMode, userData } = useContext(UserContext);

  const {
    chatsObject,
    allChats,
    messageRefs,
    foundMessageIndices,
    setFoundMessageIndices,
    currentFoundIndex,
    setCurrentFoundIndex,
    setMessageItem,
    fetchChat,
    setChatsObject,
  } = useContext(MessageContext);
  const textareaRef = useRef(null);
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isImage, setIsImage] = useState(true);
  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [disable, setDisable] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [openSearchNav, setOpenSearchNav] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPacks, setShowPacks] = useState(false);

  const mediaChange = (e) => {
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

  const sendMessage = async (gifUrl) => {
    console.log(gifUrl);
    if (!disable) {
      setDisable(true);
      if (!userNumId) {
        fullPageReload("/signin");
        return;
      }
      if (gifUrl && gifUrl.length > 0) {
        supabase
          .from("conversations")
          .insert({
            senderid: userNumId,
            message: "",
            receiverid: receiverid,
            isread: false,
            attachments: [gifUrl],
          })
          .then(() => {
            setContent("");
            setDisable(false);
          })
          .catch((error) => {
            console.log("cypher e: ", error);
          });
      } else {
        if (content !== "" || mediaFile) {
          if (mediaFile !== null) {
            const contentMsg = content;
            setSelectedMedia(null);
            setContent("");
            let mediaUrls = [];
            for (const file of mediaFile) {
              const newName = Date.now() + file.name;
              const bucketResponse = await supabase.storage
                .from("mediastore")
                .upload(`${"conversations/" + newName}`, file);

              if (bucketResponse.data) {
                mediaUrls.push(
                  process.env.NEXT_PUBLIC_SUPABASE_URL +
                    "/storage/v1/object/public/mediastore/" +
                    bucketResponse.data.path
                );
              }
            }
            // setSelectedMedia(null);
            setMediaFile(null);

            supabase
              .from("conversations")
              .insert({
                senderid: userNumId,
                message: contentMsg,
                receiverid: receiverid,
                isread: false,
                attachments: mediaUrls.length > 0 ? mediaUrls : null,
              })
              .then((res) => {
                setContent("");
                setDisable(false);
              });
          } else {
            if (content !== "") {
              const contentMsg = content;
              setContent("");
              try {
                supabase
                  .from("conversations")
                  .insert({
                    senderid: userNumId,
                    message: contentMsg,
                    receiverid: receiverid,
                    isread: false,
                    attachments: null,
                  })
                  .then((res) => {
                    // setContent("");
                    fetchChat(receiverid).then((res) => {
                      setChatsObject(res.data);
                    });

                    setDisable(false);
                  })
                  .catch((e) => {
                    console.log(e);
                    setDisable(false);
                  });
              } catch (error) {
                console.log(error);
                setDisable(false);
              }
            }
          }
        }
      }
    }
  };

  const sendSelectedSticker = async (stickerUrl) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
   await  supabase
    .from("conversations")
    .insert({
      senderid: userNumId,
      message: '',
      receiverid: receiverid,
      isread: false,
      attachments: [stickerUrl],
    })
    setShowPacks(false)
  }

  const handleSearch = () => {
    if (content !== "" && chatsObject && chatsObject.length > 0) {
      const indices = chatsObject.reduce((acc, chat, index) => {
        if (chat.message.toLowerCase().includes(content.toLowerCase())) {
          acc.push(index);
        }
        return acc;
      }, []);
      setMessageItem(content);
      setFoundMessageIndices(indices); // Set all found indices
      setCurrentFoundIndex(0); // Reset to the first found index

      if (indices.length > 0 && messageRefs.current[indices[0]]?.current) {
        setTimeout(() => {
          messageRefs.current[indices[0]].current.scrollIntoView({
            block: "center",
          });
        }, 100);
      }
    } else {
      setFoundMessageIndices([]); // Clear found indices
      setCurrentFoundIndex(0); // Reset current index
    }
    setOpenSearchNav(true);
  };

  const activateSearchMode = () => {
    setSearchMode(true);
  };

  const scrollToNextResult = () => {
    if (foundMessageIndices.length > 0) {
      const nextIndex = (currentFoundIndex + 1) % foundMessageIndices.length;
      setCurrentFoundIndex(nextIndex);
      if (messageRefs.current[foundMessageIndices[nextIndex]]?.current) {
        setTimeout(() => {
          messageRefs.current[
            foundMessageIndices[nextIndex]
          ].current.scrollIntoView({ block: "center" }); // Removed smooth behavior
        }, 100);
      }
    }
  };

  const scrollToPrevResult = () => {
    if (foundMessageIndices.length > 0) {
      const prevIndex =
        (currentFoundIndex - 1 + foundMessageIndices.length) %
        foundMessageIndices.length;
      setCurrentFoundIndex(prevIndex);
      if (messageRefs.current[foundMessageIndices[prevIndex]]?.current) {
        setTimeout(() => {
          messageRefs.current[
            foundMessageIndices[prevIndex]
          ].current.scrollIntoView({ block: "center" }); // Removed smooth behavior
        }, 100);
      }
    }
  };

  const handleGifSelect = (gifUrl) => {
    // setSelectedMedia(gifUrl);
    setMediaFile(gifUrl);
    setShowGifPicker(false);
    sendMessage(gifUrl);
  };

  useEffect(() => {
    // Media blob revoked after component is unmounted. Doing this to prevent memory leaks
    return () => {
      if (selectedMedia) {
        URL.revokeObjectURL(selectedMedia);
      }
    };
  }, [selectedMedia]);
  return (
    <div className="pt-2 px-2 flex flex-col w-full justify-between items-center">
      {searchMode && (
        <span className="mx-auto px-1.5 py-0.5 bg-sky-200 border border-gray-300 text-sm rounded-t-lg">
          Search mode
        </span>
      )}
      <span className={`pt-2 px-2 flex flex-col w-full`}>
        <span className="w-full relative flex flex-row justify-between items-center">
          {userData && (
            <span className="hidden lg:flex h-8 w-8 flex-shrink-0">
              <Image
                src={userData.avatar}
                alt="post"
                height={45}
                width={45}
                className="rounded-full border border-black object-cover"
              />
            </span>
          )}

          {!showGifPicker && (
            <span
              className={`${
                darkMode ? "bg-[#27292F]" : "bg-white"
              } w-full flex flex-row justify-between rounded-[2rem] py-2 pr-2 lg:ml-2 mr-2`}
            >
              {showPacks ? (
                <span className="pr-1">
                  <StickerPicker onSelect={sendSelectedSticker} />
                </span>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                      textarea.style.height = "2rem";
                      textarea.style.height = `${textarea.scrollHeight}px`;
                    }
                    setContent(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !searchMode) {
                      e.preventDefault();
                      sendMessage();
                    } else if (e.key === "Enter" && e.shiftKey) {
                      e.preventDefault();
                      setContent((prev) => prev + "\n");
                    }
                  }}
                  ref={textareaRef}
                  maxLength={1900}
                  placeholder={
                    searchMode
                      ? "Search for messages in chat..."
                      : "Type something"
                  }
                  className={`resize-none ${
                    searchMode ? "h-8" : "h-8"
                  } bg-transparent w-full mx-2 text-xs font-semibold border-none focus:outline-none focus:ring-0`}
                />
              )}

              <span
                onClick={() => {
                  setShowPacks((prev) => !prev);
                }}
                className="h-full mr-1 my-auto bg-[#4a5764] rounded-lg"
              >
                <svg
                  fill={darkMode ? "#27292F" : "white"}
                  stroke={darkMode ? "#27292F" : "white"}
                  strokeWidth={1}
                  width="23px"
                  height="23px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20,11.5 L20,7.5 C20,5.56700338 18.4329966,4 16.5,4 L7.5,4 C5.56700338,4 4,5.56700338 4,7.5 L4,16.5 C4,18.4329966 5.56700338,20 7.5,20 L12.5,20 C13.3284271,20 14,19.3284271 14,18.5 L14,16.5 C14,14.5670034 15.5670034,13 17.5,13 L18.5,13 C19.3284271,13 20,12.3284271 20,11.5 Z M19.9266247,13.5532532 C19.522053,13.8348821 19.0303092,14 18.5,14 L17.5,14 C16.1192881,14 15,15.1192881 15,16.5 L15,18.5 C15,18.9222858 14.8952995,19.3201175 14.7104416,19.668952 C17.4490113,18.8255402 19.5186665,16.4560464 19.9266247,13.5532532 L19.9266247,13.5532532 Z M7.5,3 L16.5,3 C18.9852814,3 21,5.01471863 21,7.5 L21,12.5 C21,17.1944204 17.1944204,21 12.5,21 L7.5,21 C5.01471863,21 3,18.9852814 3,16.5 L3,7.5 C3,5.01471863 5.01471863,3 7.5,3 Z" />
                </svg>
              </span>

              {!showPacks &&
                (selectedMedia ? (
                  <label onClick={mediaChange} htmlFor="input-post-file">
                    {isImage ? (
                      <Image
                        src={selectedMedia}
                        alt="Invalid post media. Click to change"
                        height={30}
                        width={30}
                        className="rounded-lg"
                      />
                    ) : (
                      <video
                        width={30}
                        height={30}
                        src={selectedMedia}
                        controls
                      >
                        {`${mediaName} It seems your browser does not support video uploads`}
                      </video>
                    )}
                    <input
                      onChange={mediaChange}
                      className="hidden"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                      id="input-post-file"
                    />
                  </label>
                ) : (
                  <span className="flex flex-row space-x-1 justify-center items-center">
                    {/* {!searchMode && (
                    <span className="bg-[#5D6879] p-0.5 h-7 w-7 flex items-center justify-center rounded-full ">
                      <svg
                        onClick={() => {
                          activateSearchMode();
                        }}
                        className="bg-transparent cursor-pointer text-white block lg:hidden"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                        height="14px"
                        width="14px"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </span>
                  )} */}
                    <label
                      htmlFor="input-post-file"
                      className="relative cursor-pointer"
                    >
                      <span className="flex flex-row items-end">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                        >
                          <path
                            id="image"
                            d="M17,0H5A5,5,0,0,0,0,5V17a5,5,0,0,0,5,5H17a5,5,0,0,0,5-5V5a5,5,0,0,0-5-5ZM6.07,5a2,2,0,1,1-2,2,2,2,0,0,1,2-2ZM20,17a3.009,3.009,0,0,1-3,3H5a3.009,3.009,0,0,1-3-3v-.24l3.8-3.04a.668.668,0,0,1,.73-.05l2.84,1.7a2.624,2.624,0,0,0,3.36-.54l3.94-4.61a.642.642,0,0,1,.47-.22.614.614,0,0,1,.47.19L20,12.57Z"
                            fill="#4a5764"
                          />
                        </svg>
                      </span>
                      <input
                        onChange={mediaChange}
                        className="hidden"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                        id="input-post-file"
                      />
                    </label>
                  </span>
                ))}
            </span>
          )}

          {showGifPicker && (
            <span className="w-full">
              <GifPicker
                onGifSelect={handleGifSelect}
                darkMode={darkMode}
                setShowGifPicker={setShowGifPicker}
              />
            </span>
          )}
          {!showGifPicker && (
            <span className="flex flex-col justify-center items-center">
              {searchMode ? (
                <svg
                  onClick={() => {
                    setSearchMode(false);
                    setOpenSearchNav(false);
                  }}
                  width="12px"
                  height="12px"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer mr-2"
                >
                  <path
                    d="M1.5 1.5L13.5 13.5M1.5 13.5L13.5 1.5"
                    strokeWidth="2.5"
                    stroke={darkMode ? "white" : "gray"}
                  />
                </svg>
              ) : (
                <span className="flex flex-row space-x-1">
                  <span
                    className={`cursor-pointer rounded-full ${
                      darkMode ? "" : "border"
                    } p-2 flex justify-center items-center bg-[#EB4463]`}
                  >
                    <svg
                      onClick={sendMessage}
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
                          fill={darkMode ? "black" : "white"}
                          fillRule="evenodd"
                        />
                      </g>
                    </svg>
                  </span>
                </span>
              )}
            </span>
          )}
        </span>
        {searchMode && (
          <span className="pt-1 flex flex-row justify-center text-sm font-semibold space-x-3">
            <span
              onClick={() => {
                handleSearch();
              }}
              className="w-fit cursor-pointer text-white bg-pastelGreen rounded-lg px-2"
            >
              Search
            </span>
            {openSearchNav && (
              <span className={darkMode ? "text-white" : "text-gray-500"}>
                {foundMessageIndices.length}{" "}
                {foundMessageIndices.length === 1 ? "match" : "matches"}
              </span>
            )}

            <span
              onClick={() => {
                scrollToPrevResult();
              }}
              className={`${
                foundMessageIndices.length > 1
                  ? "bg-pastelGreen"
                  : "bg-gray-300"
              } ${
                !openSearchNav ? "hidden" : "flex"
              } justify-center items-center rounded px-1`}
            >
              <svg
                fill="white"
                width="14px"
                height="14px"
                viewBox="-78.5 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                stroke="white"
                strokeWidth={35}
              >
                <title>{"left"}</title>
                <path d="M257 64L291 98 128 262 291 426 257 460 61 262 257 64Z" />
              </svg>
            </span>
            <span
              onClick={() => {
                scrollToNextResult();
              }}
              className={`${
                foundMessageIndices.length > 1
                  ? "bg-pastelGreen"
                  : "bg-gray-300"
              } ${
                !openSearchNav ? "hidden" : "flex"
              } justify-center items-center rounded px-1`}
            >
              <svg
                fill="white"
                width="14px"
                height="14px"
                viewBox="-77 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                stroke="white"
                strokeWidth={35}
              >
                <title>{"right"}</title>
                <path d="M98 460L64 426 227 262 64 98 98 64 294 262 98 460Z" />
              </svg>
            </span>
          </span>
        )}
      </span>
    </div>
  );
};
export default AttachmentsContainer;
