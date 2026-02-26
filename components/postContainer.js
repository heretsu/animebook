import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "../lib/userContext";
import Spinner from "./spinner";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export function GifPicker({ onGifSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState([]);

  const fetchGifs = async () => {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${searchTerm}&limit=10`
    );
    const data = await response.json();
    setGifs(data.data);
  };

  return (
    <div className="gif-picker">
      {/* <input
        type="text"
        placeholder="Search GIFs"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchGifs()}
      />
      <div className="gif-grid w-full bg-blue-200">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height.url}
            alt={gif.title}
            onClick={() => onGifSelect(gif.images.fixed_height.url)}
            className="gif-item"
          />
        ))}
      </div> */}
    </div>
  );
}

const PostContainer = ({ communityId, community }) => {
  const [showGifPicker, setShowGifPicker] = useState(false);

  const handleGifSelect = (gifUrl) => {
    setInputValue((prev) => `${prev} ${gifUrl}`);
    setShowGifPicker(false); // Close the GIF picker
  };

  const { fullPageReload } = PageLoadOptions();
  const { userNumId, darkMode } = useContext(UserContext);
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

  const createPost = async () => {
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    setPostLoading(true);
    if (mediaPost) {
      if (mediaFile !== null) {
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
                content: !mediaContent ? "" : mediaContent.trim(),
                communityid: parseInt(communityId),
              });
              fullPageReload(`/communities/${community.replace(/&.*/, "")}`);
            } else {
              await supabase.from("posts").insert({
                userid: userNumId,
                media: mediaUrl,
                content: !mediaContent ? "" : mediaContent.trim(),
              });
              fullPageReload("/home");
            }
          }
        }
      } else {
        setPostLoading(false);
        setErrorMsg(
          "Photo or Video is required. Click on Text Post to make a text only post"
        );
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
          fullPageReload(`/communities/${community.replace(/&.*/, "")}`);
        } else {
          await supabase.from("posts").insert({
            userid: userNumId,
            media: null,
            content: content.trim(),
          });
          fullPageReload("/home");
        }
      } else {
        setPostLoading(false);
        setErrorMsg("Failed to post. Post is empty");
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
    <div className={`p-4 flex flex-col space-y-4 rounded-xl shadow-lg w-full bg-white justify-center items-center`}>
      <span className="flex flex-row w-full justify-center space-x-2">
        <span
          onClick={() => {
            setErrorMsg("");
            setPostLoading(false);
            setMediaPost(true);
          }}
          className={`cursor-pointer rounded py-1 px-2 text-center ${
            mediaPost
              ? "bg-[#EB4463] text-white"
              : "bg-gray-100 border border-gray-200 text-gray-500"
          }`}
        >
          Media Post
        </span>
        <span
          onClick={() => {
            setErrorMsg("");
            setPostLoading(false);
            setMediaPost(false);
          }}
          className={`cursor-pointer rounded py-1 px-2 text-center ${
            !mediaPost
              ? "bg-[#EB4463] text-white"
              : "bg-gray-100 border border-gray-200 text-gray-500"
          }`}
        >
          Text Post
        </span>
      </span>
      {mediaPost ? (
        <>
          {selectedMedia ? (
            <label
              onClick={mediaChange}
              htmlFor="input-file"
              className="text-black w-full flex justify-center"
            >
              {isImage ? (
                <Image
                  src={selectedMedia}
                  alt="Invalid post media. Click to change"
                  height={300}
                  width={300}
                />
              ) : (
                <video width={150} height={150} src={selectedMedia} controls>
                  {`${mediaName} It seems your browser does not support video uploads`}
                </video>
              )}

              <input
                onChange={mediaChange}
                className="hidden"
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/svg, image/gif, video/3gp, video/mp4, video/mov, video/quicktime"
                id="input-file"
              />
            </label>
          ) : (
            <span className="w-full px-8">
              <label
                htmlFor="input-file"
                className="relative cursor-pointer py-4 w-full flex justify-center items-center border-2 border-gray-300 border-dashed"
              >
                <svg
                  height="150"
                  width="150"
                  version="1.1"
                  id=""
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 218.168 218.168"
                  style={{ enableBackground: "new 0 0 218.168 218.168" }}
                  xmlSpace="preserve"
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
                  id="input-file"
                />
                <div className="font-semibold text-center absolute inset-0 text-white bg-gray-700 bg-opacity-60 flex flex-col justify-center">
                  Upload Media
                </div>
              </label>
            </span>
          )}
          <textarea
            value={mediaContent}
            onChange={(e) => {
              if (e.target.value && e.target.value.length < 1900) {
                setMediaContent(e.target.value);
              }
            }}
            placeholder="Give us a description. Add tags to rank higher and get seen by others"
            className="h-18 resize-none w-full px-2 text-black border-none focus:outline-none focus:ring-0"
          />
        </>
      ) : (
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value && e.target.value.length < 1900) {
              setContent(e.target.value);
            }
          }}
          placeholder="Sodesuka. Tell us..."
          className="px-8 h-18 resize-none w-full px-2 text-black border-none focus:outline-none focus:ring-0"
        />
      )}
      <GifPicker onGifSelect={handleGifSelect} />
      <span className="pb-2 flex flex-col">
        {postLoading && (selectedMedia || content.trim() !== "") ? (
          <span className="mx-auto">
            <Spinner spinnerSize={"medium"} />
          </span>
        ) : (
          <span
            onClick={() => {
              createPost();
            }}
            className="w-fit mx-auto hover:shadow cursor-pointer px-12 py-1 bg-[#EB4463] text-center text-white font-bold border rounded-lg"
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
    </div>
  );
};
export default PostContainer;
