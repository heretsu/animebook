import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { MessageContext } from "@/lib/messageContext";
import GifPicker from "./gifPicker";

const AttachmentsContainer = ({ receiverid }) => {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, darkMode} = useContext(UserContext);

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
      setChatsObject
   
  } = useContext(MessageContext);

  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isImage, setIsImage] = useState(true);
  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [disable, setDisable] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [openSearchNav, setOpenSearchNav] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
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
    if (!disable) {
      setDisable(true);
      if (!userNumId) {
        fullPageReload("/signin");
        return;
      }
      if (gifUrl){
        supabase
        .from("conversations")
        .insert({
          senderid: userNumId,
          message: '',
          receiverid: receiverid,
          isread: false,
          attachments: [gifUrl],
        })
        .then((res) => {
          setContent("");
          setDisable(false);
        });
      } 
      else{
      if (content !== "" || mediaFile) {
        if (mediaFile !== null) {
          const contentMsg = content;
          setSelectedMedia(null);
          setContent('')
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
            setContent('')
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
      }}
    }
  };

  const handleSearch = () => {
    if (content !== "" && chatsObject && chatsObject.length > 0) {
      const indices = chatsObject.reduce((acc, chat, index) => {
        if (chat.message.toLowerCase().includes(content.toLowerCase())) {
          acc.push(index);
        }
        return acc;
      }, []);
      setMessageItem(content)
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
    setOpenSearchNav(true)
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
    setMediaFile(gifUrl)
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
    <div className="p-2 pb-12 flex flex-col w-full justify-between items-center">
      {selectedMedia ? (
        <label onClick={mediaChange} htmlFor="input-post-file">
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
          <input
            onChange={mediaChange}
            className="hidden"
            type="file"
            accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
            id="input-post-file"
          />
        </label>
      ) : searchMode ? (
        <span className="mx-auto px-1.5 py-0.5 bg-sky-200 border border-gray-300 text-sm rounded-t-lg">
          Search mode
        </span>
      ) : (
        <span className="flex flex-row space-x-1 justify-center items-center"> 
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
        <label htmlFor="input-post-file" className="relative cursor-pointer">
          <span className="flex flex-row items-end space-x-0">
            <svg
              fill="#000000"
              width="35px"
              height="35px"
              viewBox="0 0 24 24"
              id="image"
              data-name="Flat Color"
              xmlns="http://www.w3.org/2000/svg"
              className="icon flat-color"
            >
              <rect
                id="primary"
                x={2}
                y={3}
                width={20}
                height={18}
                rx={2}
                style={{
                  fill: "rgb(0, 0, 0)",
                }}
              />
              <path
                id="secondary"
                d="M21.42,19l-6.71-6.71a1,1,0,0,0-1.42,0L11,14.59l-1.29-1.3a1,1,0,0,0-1.42,0L2.58,19a1,1,0,0,0-.29.72,1,1,0,0,0,.31.72A2,2,0,0,0,4,21H20a2,2,0,0,0,1.4-.56,1,1,0,0,0,.31-.72A1,1,0,0,0,21.42,19Z"
                style={{
                  fill: "rgb(44, 169, 188)",
                }}
              />
              <circle
                id="secondary-2"
                data-name="secondary"
                cx={11}
                cy={9}
                r={1.5}
                style={{
                  fill: "rgb(44, 169, 188)",
                }}
              />
            </svg>
            <span className="font-semibold text-pastelGreen">+</span>
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
      )}
      <span className={`${darkMode ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-black border-gray-200'} py-2 px-2 border flex flex-col w-full`}>
        <span className="w-full relative flex flex-row justify-between items-center">
          {!searchMode && (
            <svg
              onClick={() => {
                activateSearchMode();
              }}
              className="cursor-pointer text-gray-500 block lg:hidden"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              height="18px"
              width="18px"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          )}
          {!showGifPicker && <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            maxLength={1900}
            placeholder={
              searchMode
                ? "Search for messages in chat..."
                : "Type your message..."
            }
            className={`resize-none ${
              searchMode ? "h-8" : "h-12"
            } w-full bg-transparent text-xs font-semibold border-none focus:outline-none focus:ring-0`}
          />}
          
          {showGifPicker && (
          <span className="w-full">
            <GifPicker
              onGifSelect={handleGifSelect}
              darkMode={darkMode}
              setShowGifPicker={setShowGifPicker}
            />
          </span>
        )}
          {!showGifPicker && <span className="flex flex-col justify-center items-center">
            {searchMode ? (
              <svg
                onClick={() => {
                  setSearchMode(false);
                  setOpenSearchNav(false)
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
              <svg
                onClick={sendMessage}
                width="20px"
                height="20px"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                fill={darkMode ? "#04dbc4" : "gray"}
                className="cursor-pointer"
              >
                <title>{"send"}</title>
                <g id="Layer_2" data-name="Layer 2">
                  <g id="invisible_box" data-name="invisible box">
                    <rect width={48} height={48} fill="none" />
                  </g>
                  <g id="icons_Q2" data-name="icons Q2">
                    <path d="M44.9,23.2l-38-18L6,5A2,2,0,0,0,4,7l6,18L4,43a2,2,0,0,0,2,2l.9-.2,38-18A2,2,0,0,0,44.9,23.2ZM9.5,39.1l4-12.1H24a2,2,0,0,0,0-4H13.5l-4-12.1L39.3,25Z" />
                  </g>
                </g>
              </svg>
            )}
          </span>}
        </span>
        {searchMode && (
          <span className="flex flex-row text-sm font-semibold space-x-3">
            <span
              onClick={() => {
                handleSearch();
              }}
              className="cursor-pointer text-white bg-pastelGreen rounded-lg w-fit px-2"
            >
              Search
            </span>
            {openSearchNav && <span className={darkMode ? "text-white" : "text-gray-500"}>
              {foundMessageIndices.length}{" "}
              {foundMessageIndices.length === 1 ? "match" : "matches"}
            </span>}

            <span onClick={()=>{scrollToPrevResult()}} className={`${foundMessageIndices.length > 1 ? 'bg-pastelGreen' : 'bg-gray-300'} ${!openSearchNav ? 'hidden' : 'flex'} justify-center items-center rounded px-1`}>
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
            <span onClick={() => {
                scrollToNextResult();
              }} className={`${foundMessageIndices.length > 1 ? 'bg-pastelGreen' : 'bg-gray-300'} ${!openSearchNav ? 'hidden' : 'flex'} justify-center items-center rounded px-1`}>
             
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
