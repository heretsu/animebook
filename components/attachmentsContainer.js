import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const AttachmentsContainer = ({ receiverid }) => {
  const { fullPageReload } = PageLoadOptions();
  const { userNumId } = useContext(UserContext);
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isImage, setIsImage] = useState(true);
  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
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

  const sendMessage = async () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    if (content !== "" || !selectedMedia) {
      if (mediaFile !== null) {
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
        supabase
          .from("conversations")
          .insert({
            senderid: userNumId,
            message: content,
            receiverid: receiverid,
            isread: false,
            attachments: mediaUrls.length > 0 ? mediaUrls : null,
          })
          .then((res) => {
            setContent("");
            setSelectedMedia(null);
          });
      } else {
        if (content !== "") {
          try {
            supabase
              .from("conversations")
              .insert({
                senderid: userNumId,
                message: content,
                receiverid: receiverid,
                isread: false,
                attachments: null,
              })
              .then((res) => {
                setContent("");
                // console.log(res)
              })
              .catch((e) => console.log(e));
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
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
    <div className="p-2 flex flex-col w-full bg-white justify-between items-center">
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
      ) : (
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
      )}
      <span className="w-full py-2 pr-2 bg-gray-100 border border-gray-200 relative flex flex-row justify-between items-center space-x-0">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          
          placeholder={`Type your message...`}
          className="resize-none h-12 w-full bg-transparent text-black text-xs font-semibold border-none focus:outline-none focus:ring-0"
        />
        <span className="flex flex-col justify-center items-center space-y-1">
          <svg
            onClick={sendMessage}
            width="20px"
            height="20px"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            fill="gray"
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
        </span>
      </span>
    </div>
  );
};
export default AttachmentsContainer;
