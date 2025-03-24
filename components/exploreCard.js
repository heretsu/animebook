import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import { useRouter } from "next/router";
import ReactPlayer from "react-player";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animationData from "@/assets/kianimation.json";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const BinSvg = ({ pixels }) => {
  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="red"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
      />
    </svg>
  );
};

export default function ExploreCard({
  id,
  media,
  content,
  created_at,
  users,
  myProfileId,
  exploreAndAllDetails,
  post,
  explorePosts,
  allPosts,
  index,
  setSelectedIndex
}) {
  const videoRef = useRef(null);
  const router = useRouter();
  const { fullPageReload } = PageLoadOptions();
  const {
    userData,
    videoPlayingId,
    commentValues,
    setCommentValues
  } = useContext(UserContext);
  const [comments, setComments] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [reentry, setReentry] = useState(false);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [views, setViews] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [viewReentry, setViewReentry] = useState(false);
  const [bookmarks, setBookmarks] = useState(null);

  const fetchBookmarkStatus = () => {
    supabase
      .from("bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarks(res.data)
          setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
          setBookmarkReentry(true);
        }
      });
  };

  const fetchLikes = () => {
    supabase
      .from("likes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setLikes(res.data);
          setLiked(!!res.data.find((lk) => lk.userid === myProfileId));
          setReentry(true);
        }
      });
  };

  const fetchViews = () => {
    supabase
      .from("views")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setViews(res.data);
          setViewed(!!res.data.find((lk) => lk.userid === myProfileId));
          setViewReentry(true);
        }
      })
      .catch((e) => console.log(e));
  };

  const fetchComments = () => {
    supabase
      .from("comments")
      .select(
        "id, created_at, content, posts(id), users(id, avatar, username), parentid, media"
      )
      .eq("postid", id)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setComments(res.data);
        }
      });
  };

  const [thumbnail, setThumbnail] = useState(null);

  const generateThumbnail = () => {
    const video = videoRef.current;

    if (!video) return;

    // Move the video to a specific time (e.g., 1 second)
    video.currentTime = 1;

    // Wait for the video to seek to the correct frame
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame of the video onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the thumbnail as a data URL
      const thumbnailDataURL = canvas.toDataURL("image/jpeg", 0.4); // 40% quality

      // Set the thumbnail state
      setThumbnail(thumbnailDataURL);
    });
    video.currentTime = 2;
  };

  const [loadedData, setLoadedData] = useState(false);

  const [randomComment, setRandomComment] = useState(null);
  useEffect(() => {
    if (!loadedData) {
      fetchLikes();
      fetchViews();
      fetchBookmarkStatus();
      fetchComments();
      setLoadedData(true);
    }

    // if (commentValues !== comments ){
    //   setCommentValues(comments)
    // }
  }, [loadedData]);

  return (likes && bookmarks && comments &&
    <span
      onClick={() => {
        if (index !== null){
          setSelectedIndex(index)
        } else{
          setCommentValues(comments);
          exploreAndAllDetails(post.post, explorePosts[post.newId]);  
        }
      }}
      className="cursor-pointer h-80 relative rounded-xl overflow-hidden"
    >
      {media !== null &&
        media !== undefined &&
        media !== "" &&
        (media.endsWith("mp4") ||
        media.endsWith("MP4") ||
        media.endsWith("mov") ||
        media.endsWith("MOV") ||
        media.endsWith("3gp") ||
        media.endsWith("3GP") ? (
         !thumbnail ? <video
            width={500}
            height={500}
            src={media}
            autoPlay
            loop
            crossOrigin="anonymous"
            muted
            className="w-full h-full rounded-lg object-cover"
            ref={videoRef}
            onLoadedData={generateThumbnail(videoRef.current)}
          ></video> : 
            <Image
              src={thumbnail}
              alt="Video Thumbnail"
              width={500}
              height={500}
              className="rounded-lg object-cover"
            />)
        
       : (
          <Image
            src={media}
            alt="Post"
            height={500}
            width={500}
            className="w-full h-full object-cover"
          />
        ))}
      <div className="absolute inset-0 text-white flex flex-col justify-end">
        <span className="w-full text-xs font-light flex flex-row justify-between pt-2 px-2 bg-black bg-opacity-30 backdrop-blur-md">
          <span
            onClick={() => {
              fullPageReload(`/profile/${users.username}`);
            }}
            className="w-fit hover:underline pb-2 flex flex-row justify-start items-center space-x-1"
          >
            <span className="relative h-8 w-8 flex">
              <Image
                src={users.avatar}
                alt="user profile"
                height={35}
                width={35}
                className="rounded-full border border-white"
              />
            </span>
            <span className="font-semibold text-center">
              {users.username}
            </span>
          </span>
          <span className="flex flex-row space-x-2.5">
            <span className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18.365"
                height="16.178"
                viewBox="0 0 18.365 16.178"
              >
                <path
                  id="heart_1_"
                  data-name="heart (1)"
                  d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                  transform="translate(0 -1.62)"
                  fill="#fff"
                />
              </svg>
              <span>{likes && likes.length}</span>
            </span>
            <span className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16.18"
                height="16.178"
                viewBox="0 0 16.18 16.178"
              >
                <path
                  id="comment"
                  d="M.679,11.324.01,15.317a.751.751,0,0,0,.206.647.74.74,0,0,0,.522.213.756.756,0,0,0,.125-.007L4.856,15.5a7.95,7.95,0,0,0,3.235.677A8.089,8.089,0,1,0,0,8.089,7.95,7.95,0,0,0,.679,11.324Z"
                  fill="#fff"
                />
              </svg>
              <span>{comments && comments.length}</span>
            </span>
            <span className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14.508"
                height="16.179"
                viewBox="0 0 14.508 16.179"
              >
                <path
                  id="bookmark"
                  d="M16.508,2.206V15.443a.734.734,0,0,1-.476.669.858.858,0,0,1-.862-.118L9.254,11.274,3.338,15.995a.868.868,0,0,1-.864.117A.736.736,0,0,1,2,15.443V2.206A2.326,2.326,0,0,1,4.418,0H14.09a2.326,2.326,0,0,1,2.418,2.206Z"
                  transform="translate(-2)"
                  fill="#fff"
                />
              </svg>
              <span>{bookmarks && bookmarks.length}</span>
            </span>
          </span>
        </span>
      </div>
    </span>
  );
}
