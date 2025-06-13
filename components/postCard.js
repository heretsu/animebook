import Image from "next/image";
import CommentConfig from "./commentConfig";
import PlusIcon from "./plusIcon";
import { useEffect, useState, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import PostInViewport from "@/lib/postInViewport";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
import ReactPlayer from "react-player";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animationData from "@/assets/kianimation.json";
import PopupModal from "./popupModal";
import UnfollowButton from "./unfollowButton";
import dynamic from "next/dynamic";
import ShareSystem from "./shareSystem";
import UserWithBadge from "./userWithBadge";
import { AvatarWithBorder } from "./AvatarProps";
import { useTranslation } from "react-i18next";
import StickerPicker from "./stickerPacker";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function PollOption({
  selectedOption,
  opts,
  percentage, // e.g. 0 to 100
  darkMode,
}) {
  // Clamp percentage between 0 and 100
  const safePct = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`
        relative w-full py-1 rounded-md overflow-hidden
        ${darkMode ? "bg-[#2D2F34]" : "bg-gray-200"}
      `}
    >
      {/* The bar behind everything */}
      <div
        className={`absolute top-0 left-0 h-full ${
          selectedOption !== null &&
          selectedOption !== undefined &&
          "bg-[#EB4463]"
        } transition-all duration-300`}
        style={{ width: `${safePct}%` }}
      />

      {/* Content above the bar */}
      <div className="relative flex items-center justify-between w-full h-full px-2 leading-tight break-words whitespace-pre-wrap">
        {/* Show percentage on the left (or right, up to you) */}
        {selectedOption !== null && selectedOption !== undefined && (
          <span className="text-white">{safePct}%</span>
        )}

        {/* The actual option text on the right */}
        <span className={`${darkMode ? "" : "text-black"}`}>
          <CommentConfig text={opts} tags={true} />
        </span>
      </div>
    </div>
  );
}

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

export default function PostCard({
  id,
  media,
  content,
  created_at,
  users,
  ispoll,
  myProfileId,
  repostAuthor,
  repostQuote,
  repostCreatedAt,
  allPosts,
}) {
  // const videoRef = useRef(null);
  const { t } = useTranslation();

  const [translateVersion, setTranslateVersion] = useState(false);
  const commentRef = useRef(null);
  const [myTextComment, setMyTextComment] = useState("");
  const router = useRouter();
  const { sendNotification, postTimeAgo } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const { fullPageReload } = PageLoadOptions();
  const {
    setOpenComments,
    activeVideo,
    setPostOwnerDetails,
    setCommentValues,
    deletePost,
    setDeletePost,
    userData,
    darkMode,
    videoPlayingId,
    setVideoPlayingId,
    handlePlay,
    videoRef,
    inputRef,
    commentMsg,
    setCommentMsg,
    parentId: globalParentId,
    setNewListOfComments,
    allPolls,
    likesMvp,
    postsMvp,
    viewsMvp,
    refMvp,
    followMvp,
    repostMvp,
  } = useContext(UserContext);
  const [comments, setComments] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [reentry, setReentry] = useState(false);
  const [followingObject, setFollowingObject] = useState(null);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [views, setViews] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [viewReentry, setViewReentry] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [madeRepost, setMadeRepost] = useState(false);
  const [reposts, setReposts] = useState(null);
  const [repostReentry, setRepostReentry] = useState(false);
  const [openQuote, setOpenQuote] = useState(false);
  const [pressTimeout, setPressTimeout] = useState(null);
  const [quoteContent, setQuoteContent] = useState(null);
  const [openTipPost, setOpenTipPost] = useState(false);
  const [openPostOptions, setOpenPostOptions] = useState(false);
  const [myComment, setMyComment] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  const [randomComment, setRandomComment] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [pollLoadedData, setPollLoadedData] = useState(false);

  const [selectedCommentMedia, setSelectedCommentMedia] = useState(null);
  const [commentMediaFile, setCommentMediaFile] = useState(null);

  const commentMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCommentMediaFile(e.target.files);
      setSelectedCommentMedia(URL.createObjectURL(file));
    }
  };

  const [ref, isBeingViewed] = PostInViewport({
    threshold: 0.5,
  });

  const deleteAction = () => {
    setDeletePost({ postid: id, media: media });
  };

  const togglePlayPause = () => {
    setVideoPlayingId(id);

    setThumbnail(null);
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlayVideo(true);
      } else {
        videoRef.current.pause();
        setPlayVideo(false);
      }
    }
  };

  const postComment = async () => {
    console.log("here");
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    console.log("ya");
    if (commentMediaFile !== null) {
      console.log("hmm");
      for (const file of commentMediaFile) {
        const newName = Date.now() + file.name;

        const bucketResponse = await supabase.storage
          .from("mediastore")
          .upload(`${"comments/" + newName}`, file);

        if (bucketResponse.data) {
          const mediaUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            "/storage/v1/object/public/mediastore/" +
            bucketResponse.data.path;
          let commentToSend = myTextComment;
          setMyTextComment("");
          console.log(commentToSend);
          await supabase.from("comments").insert({
            postid: id,
            content: commentToSend,
            userid: myProfileId,
            parentid: myTextComment.startsWith("@") ? parentId : null,
            media: mediaUrl,
          });
        }
      }
      setSelectedCommentMedia(null);
      setCommentMediaFile(null);
      setMyTextComment("");
      fetchComments();
    } else {
      if (myTextComment !== "") {
        let commentToSend = myTextComment;
        setMyTextComment("");
        supabase
          .from("comments")
          .insert({
            postid: id,
            content: commentToSend,
            userid: myProfileId,
            parentid: myTextComment.startsWith("@") ? parentId : null,
            media: null,
          })
          .then(async () => {
            setMyComment(commentToSend);
            fetchComments();
          });
      }
    }
  };

  const postGlobalComment = async () => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (commentMediaFile !== null) {
      for (const file of commentMediaFile) {
        const newName = Date.now() + file.name;

        const bucketResponse = await supabase.storage
          .from("mediastore")
          .upload(`${"comments/" + newName}`, file);

        if (bucketResponse.data) {
          const mediaUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            "/storage/v1/object/public/mediastore/" +
            bucketResponse.data.path;
          let commentToSend = commentMsg;
          setCommentMsg("");
          await supabase.from("comments").insert({
            postid: id,
            content: commentToSend,
            userid: myProfileId,
            parentid: commentMsg.startsWith("@") ? globalParentId : null,
            media: mediaUrl,
          });
        }
      }
      setSelectedCommentMedia(null);
      setCommentMediaFile(null);
      fetchComments();
    } else {
      if (commentMsg !== "") {
        let commentToSend = commentMsg;
        setCommentMsg("");
        supabase
          .from("comments")
          .insert({
            postid: id,
            content: commentToSend,
            userid: myProfileId,
            parentid: commentMsg.startsWith("@") ? globalParentId : null,
            media: null,
          })
          .then(async () => {
            setMyComment(commentToSend);
            fetchComments();
          });
      }
    }
  };

  const addBookmark = () => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("bookmarks")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      }
    }
  };
  const fetchBookmarkStatus = () => {
    supabase
      .from("bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
          setBookmarkReentry(true);
        }
      });
  };

  const likePost = () => {
    if (reentry) {
      setReentry(false);
      if (liked) {
        setLiked(false);
        setLikes(
          likes.filter((lk) => {
            return lk.userid !== myProfileId;
          })
        );
        supabase
          .from("likes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(async () => {
            setReentry(true);
            // fetchLikes();
            if (users.id !== myProfileId) {
              await supabase
                .from("users")
                .update({
                  // ki:
                  //   parseFloat(users.ki) !== 0
                  //     ? parseFloat(users.ki) - 0.08
                  //     : 0,
                })
                .eq("id", users.id);
            }
          });
      } else {
        setLiked(true);
        setLikes([
          ...likes,
          {
            postid: id,
            userid: myProfileId,
          },
        ]);
        supabase
          .from("likes")
          .insert({ postid: id, userid: myProfileId })
          .then(async () => {
            setReentry(true);
            // fetchLikes();
            sendNotification("likepost", users.id, likes, id);
            if (users.id !== myProfileId) {
              // await supabase
              //   .from("users")
              //   .update({ ki: parseFloat(users.ki) + 0.08 })
              //   .eq("id", users.id);
            }
          });
      }
    }
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

  const handleRepost = (quoteWanted) => {
    if (repostReentry) {
      setRepostReentry(false);
      if (madeRepost) {
        setMadeRepost(false);
        setReposts(
          reposts.filter((rt) => {
            return rt.userid !== myProfileId;
          })
        );
        setQuoteContent("");
        supabase
          .from("reposts")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(async () => {
            setRepostReentry(true);
            // fetchReposts();
          });
      } else {
        if (quoteWanted) {
          setQuoteContent("");
          setOpenQuote(true);
          setRepostReentry(true);
        } else {
          setMadeRepost(true);
          setReposts([
            ...reposts,
            {
              postid: id,
              userid: myProfileId,
            },
          ]);
          setQuoteContent("");
          supabase
            .from("reposts")
            .insert({ postid: id, userid: myProfileId })
            .then(async () => {
              setRepostReentry(true);
              // fetchReposts();
              // sendNotification("likepost", users.id, likes, id);
            });
        }
      }
    }
  };

  const handleQuoteRepost = () => {
    if (repostReentry) {
      setRepostReentry(false);
      setMadeRepost(true);
      setReposts([
        ...reposts,
        {
          postid: id,
          userid: myProfileId,
          quote:
            quoteContent !== null && quoteContent !== "" ? quoteContent : null,
        },
      ]);
      setOpenQuote(false);

      supabase
        .from("reposts")
        .insert({ postid: id, userid: myProfileId, quote: quoteContent })
        .then(async () => {
          setQuoteContent("");
          setRepostReentry(true);
        });
    }
  };

  const fetchReposts = () => {
    supabase
      .from("reposts")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setReposts(res.data);
          setMadeRepost(!!res.data.find((rt) => rt.userid === myProfileId));
          setRepostReentry(true);
        }
      });
  };

  const addView = () => {
    if (viewReentry) {
      setViewReentry(false);
      if (viewed) {
        console.log("viewed");
      } else {
        supabase
          .from("views")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchViews();
          })
          .catch((e) => console.log(e));
      }
    }
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
          setCommentValues(res.data);
          setNewListOfComments(res.data);
        }
      });
  };
  const loadVideoSnippet = (e) => {
    if (e.target.buffered.length > 0) {
      const loadedPercentage =
        (e.target.buffered.end(0) / e.target.duration) * 100;
      if (loadedPercentage >= 50) {
        e.target.preload = "none";
      }
    }
  };

  const handlePressStart = () => {
    //for long press
    const timeout = setTimeout(() => {
      if (userData) {
        handleRepost(true);
      } else {
        fullPageReload("/signin");
      }
    }, 500);
    setPressTimeout(timeout);
  };

  const handlePressEnd = () => {
    if (pressTimeout) {
      clearTimeout(pressTimeout);
      setPressTimeout(null);
      if (userData) {
        handleRepost(false);
      } else {
        fullPageReload("/signin");
      }
    }
  };

  const [parentId, setParentId] = useState(null);
  const [postCount, setPostCount] = useState(null);

  function userSpecificPosts() {
    if (allPosts) {
      const filteredUserPosts = allPosts.filter((r) => {
        return r.users.useruuid === users.useruuid;
      });
      setPostCount(filteredUserPosts.length);
    }
  }

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
      const thumbnailDataURL = canvas.toDataURL("image/jpeg", 0.8); // 80% quality

      // Set the thumbnail state
      setThumbnail(thumbnailDataURL);
    });
    video.currentTime = 2;
  };

  const [imgSrc, setImgSrc] = useState(repostAuthor && repostAuthor.avatar);
  const [imgSrcOrigin, setImgSrcOrigin] = useState(users && users.avatar);
  const [isExpanded, setIsExpanded] = useState(false);

  const [commentReentry, setCommentReentry] = useState(false);
  const [commentLiked, setCommentLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState(null);
  const [loadedData, setLoadedData] = useState(false);
  const [pollVotes, setPollVotes] = useState(null);

  const [pollReentry, setPollReentry] = useState(false);
  const [showPacks, setShowPacks] = useState(false)

  const sendSelectedSticker = async (stickerUrl) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (router.pathname === "/[username]/post/[postid]") {
      await supabase.from("comments").insert({
        postid: id,
        content: '',
        userid: myProfileId,
        parentid: commentMsg.startsWith("@") ? globalParentId : null,
        media: stickerUrl,
      });
    } else {
      await supabase.from("comments").insert({
        postid: id,
        content: '',
        userid: myProfileId,
        parentid: myTextComment.startsWith("@") ? parentId : null,
        media: stickerUrl,
      });
    }
    setShowPacks(false)
    fetchComments();
  }


  const fetchCommentLikes = (id) => {
    supabase
      .from("comment_likes")
      .select()
      .eq("commentid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setCommentLikes(res.data);
          setCommentLiked(!!res.data.find((lk) => lk.userid === myProfileId));
          setCommentReentry(true);
        }
      });
  };

  const likeComment = (id) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (commentReentry) {
      setCommentReentry(false);
      if (commentLiked) {
        supabase
          .from("comment_likes")
          .delete()
          .eq("commentid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchCommentLikes(id);
          });
      } else {
        supabase
          .from("comment_likes")
          .insert({ commentid: id, userid: myProfileId })
          .then(() => {
            fetchCommentLikes(id);
          });
      }
    }
  };

  const replyComment = (parentCommentId, commentOwner) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    setMyTextComment(`@${commentOwner} `);
    setParentId(parentCommentId);
    commentRef.current.focus();
  };

  const applyVote = (id, optionid) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (pollReentry) {
      console.log("b", id, optionid);

      setPollReentry(false);
      if (selectedOption === optionid) {
        supabase
          .from("poll_votes")
          .delete()
          .eq("pollid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchPollVotes(id);
          });
      } else if (
        selectedOption !== null &&
        selectedOption !== undefined &&
        selectedOption !== optionid
      ) {
        supabase
          .from("poll_votes")
          .update({ optionid: optionid })
          .eq("pollid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchPollVotes(id);
          });
      } else {
        console.log("aaa", id, optionid);
        supabase
          .from("poll_votes")
          .insert({ pollid: id, optionid: optionid, userid: myProfileId })
          .then((res) => {
            fetchPollVotes(id);
          });
      }
    }
  };

  const fetchPollVotes = (id) => {
    supabase
      .from("poll_votes")
      .select()
      .eq("pollid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setPollVotes(res.data);
          setSelectedOption(
            res.data.find((lk) => lk.userid === myProfileId)?.optionid
          );
          setPollReentry(true);
        }
      });
  };

  useEffect(() => {
    if (users.id !== myProfileId) {
      fetchFollows(users.id).then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setFollowingObject(res.data);
          setAlreadyFollowed(
            !!res.data.find((rel) => rel.follower_userid === myProfileId)
          );

          userSpecificPosts();
        }
      });
    }
    if (comments && comments.length > 0 && !commentLikes) {
      const randomIndex = Math.floor(Math.random() * comments.length);
      setRandomComment(comments[randomIndex]);
      fetchCommentLikes(comments[randomIndex].id);
    }

    if (!viewed && isBeingViewed) {
      if (userData && users.id !== myProfileId) {
        addView();
      }
    }
    if (!loadedData) {
      fetchReposts();
      fetchLikes();
      fetchViews();
      fetchBookmarkStatus();
      fetchComments();
      setLoadedData(true);
    }
    if (!pollLoadedData && ispoll && allPolls) {
      const pollObj = allPolls.find((poll) => poll.postid === id);
      const pollId = pollObj?.id;
      fetchPollVotes(pollId);
      setPollLoadedData(true);
    }
  }, [
    loadedData,
    pollLoadedData,
    allPolls,
    viewed,
    isBeingViewed,
    videoPlayingId,
    comments,
  ]);

  return (
    likes !== null &&
    reposts !== null &&
    views !== null &&
    comments !== null && (
      <div className="w-full">
        <div
          ref={ref}
          className={`${
            router.pathname === "/[username]/post/[postid]" && "w-full"
          } ${!media && "w-full"} ${
            darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
          } mx-auto space-y-1 rounded-md py-4 px-3 flex flex-col justify-center text-start`}
        >
          {router.pathname === "/profile/[user]" &&
            repostAuthor &&
            repostAuthor.username && (
              <span className="text-xs text-slate-500 font-medium">
                {repostAuthor.username} reposted
              </span>
            )}
          {repostQuote && (
            <span className="flex flex-row justify-between items-center">
              <span
                onClick={() => {
                  fullPageReload(`/profile/${repostAuthor.username}`, "window");
                }}
                className="cursor-pointer flex flex-row justify-start items-center space-x-0"
              >
                {likesMvp && likesMvp.mostLikes[0].id === repostAuthor.id ? (
                  <UserWithBadge
                    avatar={likesMvp.mostLikes[0].avatar}
                    size={35}
                    mvpType={"likes"}
                  />
                ) : (
                  <span className="relative h-8 w-8 flex">
                    <AvatarWithBorder userInfo={repostAuthor} size={35} />
                  </span>
                )}

                <span className="flex flex-col">
                  <span className="flex flex-row items-center">
                    <span className="pl-2 pr-1 text-xs font-semibold">
                      {repostAuthor.username}
                    </span>
                    <span className="text-[0.7rem] text-gray-400">
                      reposted {postTimeAgo(repostCreatedAt)}
                    </span>
                  </span>
                  <span className="flex flex-row items-center">
                    <span className="h-4 w-6">
                      <Lottie animationData={animationData} />
                    </span>
                    <span className="absolute pl-6 text-[0.7rem] font-bold text-blue-400">
                      {parseFloat(parseFloat(repostAuthor.ki).toFixed(2))}
                    </span>
                  </span>
                </span>
              </span>
            </span>
          )}
          {repostQuote && (
            <span
              className={`${
                darkMode ? "text-white bg-gray-700" : "text-black bg-gray-100"
              } text-sm px-1 py-2 w-full rounded leading-tight break-words whitespace-pre-wrap`}
            >
              <CommentConfig text={repostQuote} tags={true} />{" "}
            </span>
          )}

          <span className="flex flex-row justify-between items-center">
            <span
              onClick={() => {
                fullPageReload(`/profile/${users.username}`, "window");
              }}
              // onClick={() => setIsExpanded(!isExpanded)}
              className={`cursor-pointer flex flex-row justify-start items-center space-x-0 transition-transform duration-500 ${
                isExpanded ? "scale-110 w-full" : "scale-100"
              }`}
            >
              {!isExpanded &&
                (likesMvp && likesMvp.mostLikes[0].id === users.id ? (
                  <UserWithBadge
                    avatar={likesMvp.mostLikes[0].avatar}
                    size={35}
                    mvpType={"likes"}
                  />
                ) : (
                  <span className="relative h-12 w-12 flex">
                    <AvatarWithBorder userInfo={users} size={35} />
                  </span>
                ))}

              <span className={`flex flex-col ${isExpanded && "w-full"}`}>
                {!isExpanded && (
                  <span className="flex flex-row">
                    <span className="pl-2 pr-1 font-semibold">
                      {users.username}
                    </span>

                    <span className="flex flex-row items-center">
                      <span className="h-6 w-8 -ml-2">
                        <Lottie animationData={animationData} />
                      </span>
                      <span className="absolute pl-4 text-xs font-semibold text-blue-400">
                        {parseFloat(parseFloat(users.ki).toFixed(2))}
                      </span>
                    </span>
                  </span>
                )}
                {!isExpanded && (
                  <span className="pl-2 flex flex-row justify-start space-x-0.5 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      id="clock"
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                    >
                      <g
                        id="Gruppe_3284"
                        data-name="Gruppe 3284"
                        transform="translate(5.996 3.016)"
                      >
                        <g id="Gruppe_3283" data-name="Gruppe 3283">
                          <path
                            id="Pfad_4719"
                            data-name="Pfad 4719"
                            d="M238.989,123.411l-1.813-1.359v-2.769a.5.5,0,0,0-1.007,0V122.3a.5.5,0,0,0,.2.4l2.014,1.51a.5.5,0,0,0,.6-.806Z"
                            transform="translate(-236.169 -118.779)"
                            fill="#728198"
                          />
                        </g>
                      </g>
                      <g id="Gruppe_3286" data-name="Gruppe 3286">
                        <g id="Gruppe_3285" data-name="Gruppe 3285">
                          <path
                            id="Pfad_4720"
                            data-name="Pfad 4720"
                            d="M6.5,0A6.5,6.5,0,1,0,13,6.5,6.507,6.507,0,0,0,6.5,0Zm0,11.993A5.493,5.493,0,1,1,11.993,6.5,5.5,5.5,0,0,1,6.5,11.993Z"
                            fill="#728198"
                          />
                        </g>
                      </g>
                    </svg>
                    <span className="text-[0.7rem] text-[#728198]">
                      {postTimeAgo(created_at)}
                    </span>
                  </span>
                )}
                {isExpanded && (
                  <span className="px-2 pt-2 pb-4 space-y-1 flex flex-col justify-center items-center">
                    <span className="relative flex h-[120px] w-full">
                      {users.cover ? (
                        <Image
                          src={users.cover}
                          alt="user profile"
                          fill={true}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-900 rounded-2xl"></div>
                      )}
                      <span className="text-xs md:text-sm rounded-b-2xl absolute inset-0 flex flex-col justify-between text-white">
                        <span className="absolute border border-gray-500 ml-2 mt-2 flex flex-row items-center justify-center rounded-2xl w-fit px-1 py-0.5 bg-gray-800 bg-opacity-70">
                          <span className="-ml-2 h-6 w-8">
                            <Lottie animationData={animationData} />
                          </span>
                          <span className="-ml-2 text-xs font-semibold text-white">
                            {parseFloat(parseFloat(users.ki).toFixed(2))}
                          </span>
                        </span>
                        <span className="w-full flex flex-row justify-end pt-2 pr-4"></span>
                        <span className="rounded-b-2xl space-y-0.5 w-full p-1 bg-gray-800 bg-opacity-70">
                          <span className="font-semibold flex flex-row w-full justify-between items-center">
                            <span className="flex flex-row justify-start items-center space-x-0.5">
                              <span className="relative h-5 w-5 flex">
                                <Image
                                  src={imgSrcOrigin}
                                  alt="user profile"
                                  width={35}
                                  height={35}
                                  className="rounded-full object-cover"
                                  onError={() =>
                                    setImgSrcOrigin(
                                      "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                                    )
                                  }
                                />
                              </span>
                              <span className="font-semibold text-xs pr-2">
                                {users.username}
                              </span>

                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <svg
                                  onClick={() => {
                                    if (userData) {
                                      addBookmark();
                                    } else {
                                      fullPageReload("/signin");
                                    }
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13.909"
                                  height="17"
                                  viewBox="0 0 13.909 17"
                                >
                                  <path
                                    id="bookmark"
                                    d="M15.909,2.318V16.227a.773.773,0,0,1-1.283.58L8.955,11.846,3.283,16.807A.773.773,0,0,1,2,16.227V2.318A2.325,2.325,0,0,1,4.318,0h9.273a2.325,2.325,0,0,1,2.318,2.318Z"
                                    transform="translate(-2)"
                                    fill={bookmarked ? "#EB4463" : "#adb6c3"}
                                  />
                                </svg>
                                {/* {userData &&
                                (users.id === myProfileId ? (
                                  <span className="text-sm">You</span>
                                ) : alreadyFollowed ? (
                                  <UnfollowButton
                                    alreadyFollowed={alreadyFollowed}
                                    setAlreadyFollowed={setAlreadyFollowed}
                                    followerUserId={myProfileId}
                                    followingUserId={users.id}
                                  />
                                ) : (
                                  <PlusIcon
                                    ymk={false}
                                    alreadyFollowed={alreadyFollowed}
                                    setAlreadyFollowed={setAlreadyFollowed}
                                    followerUserId={myProfileId}
                                    followingUserId={users.id}
                                    size={"19"}
                                    color={"default"}
                                  />
                                ))} */}
                              </span>
                            </span>
                            <span className="text-xs">
                              {postCount !== null &&
                                postCount !== undefined && (
                                  <span>{`${postCount} Posts`}</span>
                                )}
                            </span>
                          </span>
                          <p className="text-xs pb-1 max-h-10 break-words overflow-auto">
                            {users.bio !== null ? users.bio : "\u00A0"}
                          </p>
                        </span>
                      </span>
                    </span>
                    <button
                      className="w-full py-2 bg-blue-500 text-xs font-medium text-white rounded-md hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the expansion toggle
                        fullPageReload(`/profile/${users.username}`, "window");
                      }}
                    >
                      View Full Profile
                    </button>
                  </span>
                )}
              </span>
            </span>

            {
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <svg
                    onClick={() => {
                      if (userData) {
                        addBookmark();
                      } else {
                        fullPageReload("/signin");
                      }
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="17"
                    viewBox="0 0 14 17"
                    className="cursor-pointer"
                  >
                    <path
                      d="M15.909,2.318V16.227a.773.773,0,0,1-1.283.58L8.955,11.846,3.283,16.807A.773.773,0,0,1,2,16.227V2.318A2.325,2.325,0,0,1,4.318,0h9.273a2.325,2.325,0,0,1,2.318,2.318Z"
                      fill="#adb6c3"
                    />
                  </svg>
                  <svg
                    className="rotate-90 cursor-pointer"
                    onClick={() => setOpen(!open)}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="4"
                    viewBox="0 0 14 4"
                  >
                    <g transform="translate(-0.645 3.864) rotate(-90)">
                      <circle cx="2" cy="2" r="2" fill="#adb6c3" />
                      <circle
                        cx="2"
                        cy="2"
                        r="2"
                        transform="translate(0 5)"
                        fill="#adb6c3"
                      />
                      <circle
                        cx="2"
                        cy="2"
                        r="2"
                        transform="translate(0 10)"
                        fill="#adb6c3"
                      />
                    </g>
                  </svg>
                </div>

                {open && (
                  <div
                    id="zMax"
                    className={`border absolute right-0 mt-1 w-44 rounded-lg shadow-lg ${
                      darkMode
                        ? "border-gray-700 bg-[#1E1F24] text-white"
                        : "border-gray-300 bg-white text-black"
                    }`}
                  >
                    <ul className={`space-y-1`}>
                      <li
                        onClick={() => {
                          setTranslateVersion(true);
                          setOpen(false);
                        }}
                        className={`border-b ${
                          darkMode ? "border-gray-900" : "border-gray-100"
                        } px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer`}
                      >
                        <svg
                          width="15px"
                          height="15px"
                          viewBox="0 0 64 64"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke="#5f6877"
                          strokeWidth={5}
                          fill="none"
                        >
                          <path
                            d="M34.53,14.59s-1.6,18.21-24,32.78"
                            strokeLinecap="round"
                          />
                          <line
                            x1={7.35}
                            y1={14.59}
                            x2={41.46}
                            y2={14.59}
                            strokeLinecap="round"
                          />
                          <line
                            x1={24.4}
                            y1={9.08}
                            x2={24.4}
                            y2={14.59}
                            strokeLinecap="round"
                          />
                          <path
                            d="M16.76,22.05S25.2,36.8,32,41.33"
                            strokeLinecap="round"
                          />
                          <path
                            d="M33.55,54.92l10.74-25a.89.89,0,0,1,1.63,0l10.73,25"
                            strokeLinecap="round"
                          />
                          <line
                            x1={37.25}
                            y1={46.3}
                            x2={52.96}
                            y2={46.3}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{t("Translate")}</span>
                      </li>
                      {userData && users.id === myProfileId && (
                        <li
                          onClick={() => {
                            deleteAction();
                          }}
                          className={`border-b ${
                            darkMode ? "border-gray-900" : "border-gray-100"
                          } px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12.331"
                            height="15.854"
                            viewBox="0 0 12.331 15.854"
                          >
                            <g
                              id="delete_1_"
                              data-name="delete (1)"
                              transform="translate(-42.667)"
                            >
                              <g
                                id="Gruppe_3315"
                                data-name="Gruppe 3315"
                                transform="translate(42.667)"
                              >
                                <g
                                  id="Gruppe_3314"
                                  data-name="Gruppe 3314"
                                  transform="translate(0)"
                                >
                                  <path
                                    id="Pfad_4759"
                                    data-name="Pfad 4759"
                                    d="M64,95.9a1.761,1.761,0,0,0,1.762,1.762h7.046A1.761,1.761,0,0,0,74.569,95.9V85.333H64Z"
                                    transform="translate(-63.119 -81.81)"
                                    fill="#5d6879"
                                  />
                                  <path
                                    id="Pfad_4760"
                                    data-name="Pfad 4760"
                                    d="M51.915.881,51.034,0h-4.4L45.75.881H42.667V2.642H55V.881Z"
                                    transform="translate(-42.667)"
                                    fill="#5d6879"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                          <span>{t("Delete")}</span>
                        </li>
                      )}

                      <ShareSystem
                        postUrl={`https://animebook.io/${users.username}/post/${id}`}
                        custom={true}
                      />

                      {userData && users.id !== myProfileId && (
                        <li
                          onClick={() => {
                            setOpenPostOptions(true);
                          }}
                          className={`px-4 py-2 flex items-center space-x-2 ${
                            !darkMode && "hover:bg-gray-100"
                          } cursor-pointer`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="16"
                            viewBox="0 0 14 16"
                          >
                            <path
                              d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                              transform="translate(-15.124 -7.12)"
                              fill="#5f6877"
                            />
                          </svg>
                          <span>{t("Report")}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              // alreadyFollowed === null ? (
              //   ""
              // ) : alreadyFollowed ? (
              //   <span className="flex flex-row space-x-0.5">
              //     <span></span>
              //     <UnfollowButton
              //       alreadyFollowed={alreadyFollowed}
              //       setAlreadyFollowed={setAlreadyFollowed}
              //       followerUserId={myProfileId}
              //       followingUserId={users.id}
              //     />
              //   </span>
              // ) : (
              //   <span className="flex flex-row space-x-0.5 justify-center items-center">
              //     <PlusIcon
              //       ymk={false}
              //       alreadyFollowed={alreadyFollowed}
              //       setAlreadyFollowed={setAlreadyFollowed}
              //       followerUserId={myProfileId}
              //       followingUserId={users.id}
              //       size={"19"}
              //       color={"default"}
              //     />

              //     <svg
              //       onClick={() => {
              //         setOpenPostOptions(true);
              //       }}
              //       className="rotate-90 cursor-pointer"
              //       fill={darkMode ? "white" : "#000000"}
              //       width="18px"
              //       height="18px"
              //       viewBox="0 0 24 24"
              //       xmlns="http://www.w3.org/2000/svg"
              //     >
              //       <path d="M12,10a2,2,0,1,1-2,2A2,2,0,0,1,12,10ZM4,14a2,2,0,1,0-2-2A2,2,0,0,0,4,14Zm16-4a2,2,0,1,0,2,2A2,2,0,0,0,20,10Z" />
              //     </svg>
              //   </span>
              // )
            }
          </span>
          {content !== null && content !== undefined && content !== "" && (
            <span
              // onClick={() => {
              //   router.push(`/${users.username}/post/${id}`);
              // }}
              className={`${
                ispoll && "font-semibold"
              } text-sm leading-tight break-words whitespace-pre-wrap`}
            >
              <CommentConfig
                translateVersion={translateVersion}
                setTranslateVersion={setTranslateVersion}
                text={content}
                tags={true}
              />
            </span>
          )}
          {ispoll &&
            allPolls &&
            allPolls
              .filter((poll) => poll.postid === id)
              .map((poll) => (
                <span key={poll.id} className="flex flex-col">
                  <span className="pb-2 text-sm leading-tight break-words whitespace-pre-wrap">
                    <CommentConfig
                      translateVersion={translateVersion}
                      setTranslateVersion={setTranslateVersion}
                      text={poll.question}
                      tags={true}
                    />
                  </span>
                  {poll.options.length > 0 &&
                    poll.options.map((opts, index) => {
                      const votesForOption = pollVotes?.filter(
                        (pv) => pv.pollid === poll.id && pv.optionid === index
                      );
                      const voteCount = votesForOption?.length || 0;
                      const totalVotes =
                        pollVotes?.filter((pv) => pv.pollid === poll.id)
                          .length || 0;
                      const percentage =
                        totalVotes > 0
                          ? Math.round((voteCount / totalVotes) * 100)
                          : 0;
                      return (
                        <span
                          key={index}
                          onClick={() => {
                            if (selectedOption === index) {
                              setSelectedOption(null);
                              applyVote(poll.id, index);
                            } else {
                              setSelectedOption(index);
                              applyVote(poll.id, index);
                            }
                          }}
                          className={`${
                            darkMode
                              ? "bg-[#292C33] border-[#32353C]"
                              : "bg-[#F9F9F9] border-[#EEEDEF]"
                          } h-fit mb-1.5 rounded-md cursor-pointer text-sm`}
                        >
                          <PollOption
                            selectedOption={selectedOption}
                            opts={opts}
                            percentage={percentage}
                            darkMode={darkMode}
                          />
                        </span>
                      );
                    })}
                  {pollVotes && pollVotes.length && (
                    <span className="text-sm">{`${pollVotes.length} ${
                      pollVotes.length === 1 ? "vote" : "votes"
                    }`}</span>
                  )}
                </span>
              ))}

          <span
            onDoubleClick={() => {
              if (userData) {
                likePost();
              } else {
                fullPageReload("/signin");
              }
            }}
            className={`relative ${
              router.pathname === "/home" ||
              router.pathname === "/profile/[user]"
                ? "w-full max-h-[600px]"
                : "max-h-[600px]"
            } flex justify-center items-center`}
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
                <span
                  onClick={() => {
                    // togglePlayPause();
                    handlePlay(id);
                    setPlayVideo(true);
                    // if (
                    //   router.pathname !==
                    //   ("/comments/[comments]" || "[username]/post/[postid]")
                    // ) {
                    //   router.push(`/${users.username}/post/${id}`);
                    // } else {
                    //   togglePlayPause();
                    // }
                  }}
                  className="mx-auto relative cursor-pointer flex justify-center items-center bg-black w-full"
                >
                  <video
                    className={`${
                      router.pathname === "/home" ||
                      router.pathname === "/profile/[user]"
                        ? "w-full max-h-[600px]"
                        : "max-h-[600px]"
                    } mx-auto relative`}
                    src={media}
                    crossOrigin="anonymous"
                    // ref={videoRef}
                    ref={(el) => (videoRef.current[id] = el)}
                    height={600}
                    width={600}
                    onPlay={() => handlePlay(id)}
                    controls

                    // onProgress={(e) => {
                    //   loadVideoSnippet(e);
                    // }}
                  ></video>
                  {/* {!thumbnail && <video
                  className="relative max-h-[600px]"
                  src={media}
                  crossOrigin="anonymous"
                  ref={videoRef}
                  height={600}
                  width={600}
                  
                  // onProgress={(e) => {
                  //   loadVideoSnippet(e);
                  // }}
                  onLoadedData={generateThumbnail(videoRef.current)}
                ></video>}
                {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt="Video Thumbnail"
                      width={600}
                      height={600}
                      className="rounded-lg object-cover"
                    />
                )} */}
                  {(!playVideo || activeVideo !== id) && (
                    <svg
                      fill={"white"}
                      width="70px"
                      height="70px"
                      viewBox="0 0 36 36"
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="absolute m-auto bg-black bg-opacity-20 p-2 rounded-full"
                    >
                      <title>{"play-solid"}</title>
                      <path
                        className="clr-i-solid clr-i-solid-path-1"
                        d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
                      />
                      <rect
                        x={0}
                        y={0}
                        width={36}
                        height={36}
                        fillOpacity={0}
                      />
                    </svg>
                  )}
                </span>
              ) : (
                <span
                  className="w-full cursor-pointer"
                  onClick={() => {
                    if (router.pathname === "/[username]/post/[postid]") {
                      setPreview(true);
                    } else {
                      router.push(`/${users.username}/post/${id}`);
                    }
                  }}
                >
                  <Image
                    src={media}
                    alt="post"
                    width={600}
                    height={600}
                    className={`${
                      router.pathname === "/home" ||
                      router.pathname === "/profile/[user]"
                        ? "w-full max-h-[600px] object-cover"
                        : "max-h-[600px] object-contain"
                    } mx-auto rounded-lg`}
                  />
                </span>
              ))}
          </span>

          <div className="flex w-full flex-col justify-start">
            <div className="flex flow-row items-center justify-between">
              <div className="text-sm font-medium flex flex-row items-center space-x-4 bg-transparent pr-4 py-2">
                <div className="flex items-center space-x-1">
                  {liked ? (
                    <svg
                      onClick={() => {
                        if (userData) {
                          likePost();
                        } else {
                          fullPageReload("/signin");
                        }
                      }}
                      fill="#EB4463"
                      xmlns="http://www.w3.org/2000/svg"
                      width="22.365"
                      height="22.178"
                      viewBox="0 0 18.365 16.178"
                    >
                      <path
                        id="heart_1_"
                        data-name="heart (1)"
                        d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                        transform="translate(0 -1.62)"
                        fill={
                          liked ? "#EB4463" : darkMode ? "#42494F" : "#adb6c3"
                        }
                      />
                    </svg>
                  ) : (
                    <svg
                      onClick={() => {
                        if (userData) {
                          likePost();
                        } else {
                          fullPageReload("/signin");
                        }
                      }}
                      className="cursor-pointer"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      width="22.365"
                      height="22.178"
                      viewBox="0 0 18.365 16.178"
                    >
                      <path
                        id="heart_1_"
                        data-name="heart (1)"
                        d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                        transform="translate(0 -1.62)"
                        fill={darkMode ? "#42494F" : "#adb6c3"}
                      />
                    </svg>
                  )}
                  <div className="text-[#728198]">{likes.length}</div>
                </div>

                <div className="flex items-center space-x-1">
                  <svg
                    onClick={() => {
                      setPostOwnerDetails(id);
                      setCommentValues(comments);
                      router.push(`/${users.username}/post/${id}`);
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18.18"
                    height="18.178"
                    viewBox="0 0 16.18 16.178"
                  >
                    <path
                      id="comment"
                      d="M.679,11.325.01,15.318a.751.751,0,0,0,.206.647.74.74,0,0,0,.522.213.756.756,0,0,0,.125-.007L4.856,15.5a7.95,7.95,0,0,0,3.236.677A8.089,8.089,0,1,0,0,8.089,7.951,7.951,0,0,0,.679,11.325Z"
                      fill={darkMode ? "#42494F" : "#adb6c3"}
                    />
                  </svg>

                  <div className="text-[#728198]">
                    {comments.filter((c) => c.parentid === null).length}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {madeRepost ? (
                    <svg
                      onMouseDown={handlePressStart}
                      onMouseUp={handlePressEnd}
                      onTouchStart={handlePressStart}
                      onTouchEnd={handlePressEnd}
                      className="cursor-pointer text-pastelGreen"
                      fill={darkMode ? "#42494F" : "#adb6c3"}
                      xmlns="http://www.w3.org/2000/svg"
                      width="18.5"
                      height="16.178"
                      viewBox="0 0 18.5 16.178"
                    >
                      <g id="repost" transform="translate(0 -32.133)">
                        <path
                          id="Pfad_4757"
                          data-name="Pfad 4757"
                          d="M8.092,43.9a.542.542,0,0,0-.383-.159H5.729V36.7h1.78a.542.542,0,0,0,.383-.925L4.409,32.292a.542.542,0,0,0-.767,0L.159,35.775a.542.542,0,0,0,.383.925h1.78v7.586a2.864,2.864,0,0,0,2.864,2.864h4.845a.542.542,0,0,0,.383-.925Z"
                          transform="translate(0)"
                          fill={"#04dbc4"}
                        />
                        <path
                          id="Pfad_4758"
                          data-name="Pfad 4758"
                          d="M229.923,75.05a.542.542,0,0,0-.5-.335h-1.78V67.13a2.864,2.864,0,0,0-2.864-2.864h-4.845a.542.542,0,0,0-.383.925l2.322,2.322a.542.542,0,0,0,.383.159h1.98v7.044h-1.78a.542.542,0,0,0-.383.925l3.483,3.483a.542.542,0,0,0,.767,0l3.483-3.483a.542.542,0,0,0,.118-.591Z"
                          transform="translate(-211.464 -30.971)"
                          fill={"#04dbc4"}
                        />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      onMouseDown={handlePressStart}
                      onMouseUp={handlePressEnd}
                      onTouchStart={handlePressStart}
                      onTouchEnd={handlePressEnd}
                      className="cursor-pointer text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18.5"
                      height="16.178"
                      viewBox="0 0 18.5 16.178"
                    >
                      <g id="repost" transform="translate(0 -32.133)">
                        <path
                          id="Pfad_4757"
                          data-name="Pfad 4757"
                          d="M8.092,43.9a.542.542,0,0,0-.383-.159H5.729V36.7h1.78a.542.542,0,0,0,.383-.925L4.409,32.292a.542.542,0,0,0-.767,0L.159,35.775a.542.542,0,0,0,.383.925h1.78v7.586a2.864,2.864,0,0,0,2.864,2.864h4.845a.542.542,0,0,0,.383-.925Z"
                          transform="translate(0)"
                          fill={darkMode ? "#42494F" : "#adb6c3"}
                        />
                        <path
                          id="Pfad_4758"
                          data-name="Pfad 4758"
                          d="M229.923,75.05a.542.542,0,0,0-.5-.335h-1.78V67.13a2.864,2.864,0,0,0-2.864-2.864h-4.845a.542.542,0,0,0-.383.925l2.322,2.322a.542.542,0,0,0,.383.159h1.98v7.044h-1.78a.542.542,0,0,0-.383.925l3.483,3.483a.542.542,0,0,0,.767,0l3.483-3.483a.542.542,0,0,0,.118-.591Z"
                          transform="translate(-211.464 -30.971)"
                          fill={darkMode ? "#42494F" : "#adb6c3"}
                        />
                      </g>
                    </svg>
                  )}
                  <div className="text-[#728198]">{reposts.length}</div>
                </div>

                <div className="flex items-center space-x-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17.176"
                    height="17.178"
                    viewBox="0 0 16.176 16.178"
                  >
                    <g
                      id="noun-sharingan-5340043"
                      transform="translate(-27.476 -27.489)"
                    >
                      <path
                        id="Pfad_4724"
                        data-name="Pfad 4724"
                        d="M39.553,28.542A8.088,8.088,0,1,0,42.6,39.561,8.088,8.088,0,0,0,39.553,28.542Zm1.764,11.8a4,4,0,0,0-.212-1.049.388.388,0,0,0-.586-.187h0a1.394,1.394,0,0,1-1.319.1,5.138,5.138,0,0,1-7.186.09,1.387,1.387,0,0,1-.507.129,3.512,3.512,0,0,1-2.935-1.207,3.916,3.916,0,0,0,1.02.334.392.392,0,0,0,.449-.417h0a1.39,1.39,0,0,1,.553-1.193,5.145,5.145,0,0,1,3.593-6.324,1.351,1.351,0,0,1,.147-.5,3.513,3.513,0,0,1,2.547-1.9,3.952,3.952,0,0,0-.812.719.388.388,0,0,0,.126.6h0a1.376,1.376,0,0,1,.719,1.078,5.141,5.141,0,0,1,3.794,4.951,5.256,5.256,0,0,1-.151,1.243,1.383,1.383,0,0,1,.359.359A3.554,3.554,0,0,1,41.317,40.345Z"
                        transform="translate(0)"
                        fill={darkMode ? "#42494F" : "#adb6c3"}
                      />
                      <path
                        id="Pfad_4725"
                        data-name="Pfad 4725"
                        d="M43.245,37.92a1.593,1.593,0,0,1-.072.162,1.383,1.383,0,0,1-2.515-.162,4.534,4.534,0,0,0-3.09,5.461.945.945,0,0,1,.176-.025A1.383,1.383,0,0,1,38.9,45.609a4.523,4.523,0,0,0,6.187-.083,1.436,1.436,0,0,1-.1-.14,1.387,1.387,0,0,1,.406-1.915,1.358,1.358,0,0,1,.981-.2,4.514,4.514,0,0,0-3.129-5.35Zm-1.3,6.284a1.944,1.944,0,1,1,1.944-1.944A1.944,1.944,0,0,1,41.945,44.2Z"
                        transform="translate(-6.376 -6.683)"
                        fill={darkMode ? "#42494F" : "#adb6c3"}
                      />
                    </g>
                  </svg>
                  <div className="text-[#728198]">{views.length}</div>
                </div>
              </div>

              <div className="space-x-3 w-fit flex flex-row justify-center items-center">
                {userData && users.id !== myProfileId && (
                  <div
                    className="text-sm space-x-1 rounded-md text-white py-1 px-3 bg-[#EB4463] flex flex-row items-center"
                    onClick={() => {
                      setOpenTipPost(true);
                    }}
                  >
                    <svg
                      width="15px"
                      height="20px"
                      viewBox="0 0 15 15"
                      fill="white"
                      stroke="white"
                      strokeWidth="0.5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7 1V0H8V1H9.5C11.433 1 13 2.567 13 4.5H12C12 3.11929 10.8807 2 9.5 2H5.5C4.11929 2 3 3.11929 3 4.5C3 5.88071 4.11929 7 5.5 7H9.5C11.433 7 13 8.567 13 10.5C13 12.433 11.433 14 9.5 14H8V15H7V14H5.5C3.567 14 2 12.433 2 10.5H3C3 11.8807 4.11929 13 5.5 13H9.5C10.8807 13 12 11.8807 12 10.5C12 9.11929 10.8807 8 9.5 8H5.5C3.567 8 2 6.433 2 4.5C2 2.567 3.567 1 5.5 1H7Z"
                        fill="white"
                      />
                    </svg>
                    <span>{"Tip"}</span>
                  </div>
                )}

                {/* {copied ? (
              <span
                className={`text-xs ${
                  darkMode ? "text-white" : "text-black"
                } font-light`}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/${users.username}/post/${id}`
                  );
                }}
              >
                copied
              </span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                strokeWidth={1.2}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/${users.username}/post/${id}`
                  );
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 500);
                }}
              >
                <path
                  d="M4.5 7.5L8.5 7.5M11 4L8.5 7.49542L11 11M14.5 2.4987C14.5 3.60198 13.604 4.49739 12.5 4.49739C11.396 4.49739 10.5 3.60198 10.5 2.4987C10.5 1.39542 11.396 0.5 12.5 0.5C13.604 0.5 14.5 1.39542 14.5 2.4987ZM14.5 12.4922C14.5 13.5954 13.604 14.4909 12.5 14.4909C11.396 14.4909 10.5 13.5954 10.5 12.4922C10.5 11.3889 11.396 10.4935 12.5 10.4935C13.604 10.4935 14.5 11.3889 14.5 12.4922ZM4.5 7.49543C4.5 8.59871 3.604 9.49413 2.5 9.49413C1.396 9.49413 0.5 8.59871 0.5 7.49543C0.5 6.39215 1.396 5.49673 2.5 5.49673C3.604 5.49673 4.5 6.39215 4.5 7.49543Z"
                  stroke={darkMode ? "white" : "#000000"}
                  strokeLinecap="square"
                />
              </svg>
            )}
            <svg
              onClick={() => {
                if (userData) {
                  addBookmark();
                } else {
                  fullPageReload("/signin");
                }
              }}
              className={`cursor-pointer w-5 h-5 ${
                darkMode ? "text-white" : "text-black"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill={bookmarked ? "currentColor" : "none"}
              viewBox="0 0 14 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m13 19-6-5-6 5V2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17Z"
              />
            </svg> */}
              </div>
            </div>
            {
              // router.pathname !== '/[username]/post/[postid]' &&
              <div
                className={`border-t ${
                  darkMode ? "border-[#32353C]" : "border-[#EEEDEF]"
                } pt-4 space-x-2 flex flex-row justify-between items-center`}
              >
                {userData && (
                  <span
                    // onClick={() => {
                    //   fullPageReload(`/profile/${userData.username}`, "window");
                    // }}
                    className="relative flex flex-shrink-0"
                  >
                    <AvatarWithBorder userInfo={userData} size={30} />
                  </span>
                )}
                <span
                  className={`w-full flex flex-row justify-between items-center pr-2 border rounded-2xl ${
                    darkMode
                      ? "bg-[#27292F] border-[#32353C]"
                      : "bg-[#F9F9F9] border-[#EEEDEF]"
                  }`}
                >
                  {showPacks ? <span className="pr-1"><StickerPicker onSelect={sendSelectedSticker}/></span> : <input
                    ref={
                      router.pathname === "/[username]/post/[postid]"
                        ? inputRef
                        : commentRef
                    }
                    value={
                      router.pathname === "/[username]/post/[postid]"
                        ? commentMsg
                        : myTextComment
                    }
                    onChange={(e) => {
                      if (router.pathname === "/[username]/post/[postid]") {
                        setCommentMsg(e.target.value);
                      } else {
                        setMyTextComment(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        console.log("clicked");
                        if (router.pathname === "/[username]/post/[postid]") {
                          postGlobalComment();
                        } else {
                          postComment();
                        }
                      }
                    }}
                    maxLength={1900}
                    className={`${
                      darkMode ? "text-white" : "text-gray-800"
                    } text-xs w-full bg-transparent border-none focus:ring-0`}
                    placeholder="Comment on this post..."
                  />}

                  <span onClick={()=>{setShowPacks(prev => !prev)}} className="h-full mr-1 bg-[#5D6879] rounded-lg">
                    <svg
                      fill="white"
                      stroke="white"
                      strokeWidth={1}
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20,11.5 L20,7.5 C20,5.56700338 18.4329966,4 16.5,4 L7.5,4 C5.56700338,4 4,5.56700338 4,7.5 L4,16.5 C4,18.4329966 5.56700338,20 7.5,20 L12.5,20 C13.3284271,20 14,19.3284271 14,18.5 L14,16.5 C14,14.5670034 15.5670034,13 17.5,13 L18.5,13 C19.3284271,13 20,12.3284271 20,11.5 Z M19.9266247,13.5532532 C19.522053,13.8348821 19.0303092,14 18.5,14 L17.5,14 C16.1192881,14 15,15.1192881 15,16.5 L15,18.5 C15,18.9222858 14.8952995,19.3201175 14.7104416,19.668952 C17.4490113,18.8255402 19.5186665,16.4560464 19.9266247,13.5532532 L19.9266247,13.5532532 Z M7.5,3 L16.5,3 C18.9852814,3 21,5.01471863 21,7.5 L21,12.5 C21,17.1944204 17.1944204,21 12.5,21 L7.5,21 C5.01471863,21 3,18.9852814 3,16.5 L3,7.5 C3,5.01471863 5.01471863,3 7.5,3 Z" />
                    </svg>
                  </span>

                  {!showPacks && (selectedCommentMedia ? (
                    <label htmlFor="input-post-file">
                      <Image
                        src={selectedCommentMedia}
                        alt="Invalid post media. Click to change"
                        height={30}
                        width={30}
                      />

                      <input
                        onChange={commentMediaChange}
                        className="hidden"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                        id="input-post-file"
                      />
                    </label>
                  ) : (
                    <label
                      htmlFor="input-comment-file"
                      className="relative cursor-pointer"
                    >
                      <span className="flex flex-row items-end">
                        <svg
                          fill="#000000"
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          id="image"
                          data-name="Flat Color"
                          xmlns="http://www.w3.org/2000/svg"
                          className="bg-[#5D6879] rounded-lg icon flat-color"
                        >
                          <rect
                            id="primary"
                            x={2}
                            y={3}
                            width={20}
                            height={18}
                            rx={2}
                            style={{
                              fill: "#5D6879",
                            }}
                          />
                          <path
                            id="secondary"
                            d="M21.42,19l-6.71-6.71a1,1,0,0,0-1.42,0L11,14.59l-1.29-1.3a1,1,0,0,0-1.42,0L2.58,19a1,1,0,0,0-.29.72,1,1,0,0,0,.31.72A2,2,0,0,0,4,21H20a2,2,0,0,0,1.4-.56,1,1,0,0,0,.31-.72A1,1,0,0,0,21.42,19Z"
                            style={{
                              fill: "white",
                            }}
                          />
                          <circle
                            id="secondary-2"
                            data-name="secondary"
                            cx={11}
                            cy={9}
                            r={1.5}
                            style={{
                              fill: "white",
                            }}
                          />
                        </svg>
                      </span>
                      <input
                        onChange={commentMediaChange}
                        className="hidden"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                        id="input-comment-file"
                      />
                    </label>
                  ))}
                </span>
                <span
                  onClick={() => {
                    router.pathname === "/[username]/post/[postid]"
                      ? postGlobalComment()
                      : postComment();
                  }}
                  className={`rounded-full border h-8 w-8 flex justify-center items-center ${
                    darkMode
                      ? "bg-[#27292F] border-[#32353C]"
                      : "bg-[#F9F9F9] border-[#EEEDEF]"
                  }`}
                >
                  <svg
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
                        fill={darkMode ? "#6A6B71" : "#5d6879"}
                        fillRule="evenodd"
                      />
                    </g>
                  </svg>
                </span>
              </div>
            }
            {randomComment && commentLikes && router.pathname === "/home" && (
              <span className={`flex flex-col space-y-1.5`}>
                <span className="pt-1.5 pb-1 text-start font-semibold text-sm">
                  All comments
                </span>

                {myComment ? (
                  <span className="flex flex-row items-center justify-between w-full">
                    <span className={`flex flex-row ${myComment.media ? 'items-start' : 'items-center'}`}>
                      <span className="relative flex h-6 w-6 flex-shrink-0">
                        <AvatarWithBorder userInfo={userData} size={35} />
                      </span>
                      <span className="pl-2 text-[0.8rem] flex flex-col">
                        <span className="flex flex-row space-x-1">
                          <span className="font-semibold">
                            {userData.username}
                            {":"}
                          </span>

                          {myComment.media && (
                  <span className="w-full flex flex-row justify-start items-start">
                    <span className="w-full flex flex-col items-start justify-start">
                      <span className="flex justify-start items-start w-full mr-2 relative">
                        <Image
                          src={myComment.media}
                          alt="user profile"
                          height={300}
                          width={300}
                          className={`pt-1 relative w-12 h-18 rounded-lg object-cover`}
                        />
                      </span>
                    </span>
                  </span>
                )}
                          <span>{myComment}</span>
                        </span>
                        <span
                          className={`${
                            darkMode ? "text-[#6A6B71]" : "text-[#728198]"
                          } flex flex-row items-center items-center space-x-1`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12.004"
                            height="14.17"
                            viewBox="0 0 13.004 15.17"
                          >
                            <g id="ICON" transform="translate(-7.833 -3.5)">
                              <path
                                id="Pfad_4726"
                                data-name="Pfad 4726"
                                d="M18.646,16.365a7.552,7.552,0,0,1-1.37,1.089.383.383,0,1,0,.39.66A9.607,9.607,0,0,0,19.7,16.377a5.561,5.561,0,0,0,.54-.618.522.522,0,0,0,.078-.408.416.416,0,0,0-.2-.246,6.57,6.57,0,0,0-.816-.26,8.934,8.934,0,0,0-2.842-.366.383.383,0,1,0,.019.766,8.31,8.31,0,0,1,2.379.268,15.1,15.1,0,0,1-1.495.343c-3.041.638-5.881.1-7.309-2.967C8.888,10.376,9.183,7.076,9.1,4.372a.383.383,0,1,0-.766.024c.087,2.8-.182,6.214,1.032,8.818,1.6,3.435,4.754,4.108,8.161,3.393.375-.079.751-.149,1.119-.241Z"
                                fill="#728198"
                                stroke="#728198"
                                stroke-width="1"
                                fillRule="evenodd"
                              />
                            </g>
                          </svg>
                          <span
                            onClick={() => {
                              router.push(`/${users.username}/post/${id}`);
                            }}
                            className="cursor-pointer underline"
                          >
                            Reply
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row">
                      <div className="flex items-center space-x-1">
                        <svg
                          onClick={() => {
                            router.push(`/${users.username}/post/${id}`);
                          }}
                          className="cursor-pointer"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          width="15.365"
                          height="15.178"
                          viewBox="0 0 18.365 16.178"
                        >
                          <path
                            id="heart_1_"
                            data-name="heart (1)"
                            d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                            transform="translate(0 -1.62)"
                            fill={darkMode ? "#42494F" : "#adb6c3"}
                          />
                        </svg>

                        <div className="text-[0.75rem] text-[#728198]">{0}</div>
                      </div>
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-row items-center justify-between w-full">
                    <span className={`flex flex-row ${randomComment.media ? 'items-start' : 'items-center'}`}>
                      <span
                        // onClick={() => {
                        //   fullPageReload(`/profile/${userData.username}`, "window");
                        // }}
                        className="relative flex h-6 w-6 flex-shrink-0"
                      >
                        <Image
                          src={randomComment.users.avatar}
                          alt="user myprofile"
                          height={35}
                          width={35}
                          className="rounded-full"
                        />
                      </span>
                      <span className="pl-2 text-[0.8rem] flex flex-col">
                        <span className="flex flex-row space-x-1">
                          <span className="font-semibold">
                            {randomComment.users.username}
                            {":"}
                          </span>

                          {randomComment.media && (
                  <span className="w-full flex flex-row justify-start items-start">
                    <span className="w-full flex flex-col items-start justify-start">
                      <span className="flex justify-start items-start w-full mr-2 relative">
                        <Image
                          src={randomComment.media}
                          alt="user profile"
                          height={300}
                          width={300}
                          className={`pt-1 relative w-12 h-18 rounded-lg object-cover`}
                        />
                      </span>
                    </span>
                  </span>
                )}
                          <span>{randomComment.content}</span>
                        </span>
                        <span
                          className={`${
                            darkMode ? "text-[#6A6B71]" : "text-[#728198]"
                          } flex flex-row items-center items-center space-x-1`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12.004"
                            height="14.17"
                            viewBox="0 0 13.004 15.17"
                          >
                            <g id="ICON" transform="translate(-7.833 -3.5)">
                              <path
                                id="Pfad_4726"
                                data-name="Pfad 4726"
                                d="M18.646,16.365a7.552,7.552,0,0,1-1.37,1.089.383.383,0,1,0,.39.66A9.607,9.607,0,0,0,19.7,16.377a5.561,5.561,0,0,0,.54-.618.522.522,0,0,0,.078-.408.416.416,0,0,0-.2-.246,6.57,6.57,0,0,0-.816-.26,8.934,8.934,0,0,0-2.842-.366.383.383,0,1,0,.019.766,8.31,8.31,0,0,1,2.379.268,15.1,15.1,0,0,1-1.495.343c-3.041.638-5.881.1-7.309-2.967C8.888,10.376,9.183,7.076,9.1,4.372a.383.383,0,1,0-.766.024c.087,2.8-.182,6.214,1.032,8.818,1.6,3.435,4.754,4.108,8.161,3.393.375-.079.751-.149,1.119-.241Z"
                                fill="#728198"
                                stroke="#728198"
                                stroke-width="1"
                                fillRule="evenodd"
                              />
                            </g>
                          </svg>
                          <span
                            onClick={() => {
                              replyComment(
                                randomComment.id,
                                randomComment.users.username
                              );
                            }}
                            className="underline"
                          >
                            Reply
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row">
                      <div className="flex items-center space-x-1">
                        {commentLiked ? (
                          <svg
                            onClick={() => {
                              if (userData) {
                                likeComment(randomComment.id);
                              } else {
                                fullPageReload("/signin");
                              }
                            }}
                            fill="#EB4463"
                            xmlns="http://www.w3.org/2000/svg"
                            width="15.365"
                            height="15.178"
                            viewBox="0 0 18.365 16.178"
                          >
                            <path
                              id="heart_1_"
                              data-name="heart (1)"
                              d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                              transform="translate(0 -1.62)"
                              fill={"#EB4463"}
                            />
                          </svg>
                        ) : (
                          <svg
                            onClick={() => {
                              if (userData) {
                                likeComment(randomComment.id);
                              } else {
                                fullPageReload("/signin");
                              }
                            }}
                            className="cursor-pointer"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            width="15.365"
                            height="15.178"
                            viewBox="0 0 18.365 16.178"
                          >
                            <path
                              id="heart_1_"
                              data-name="heart (1)"
                              d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
                              transform="translate(0 -1.62)"
                              fill={darkMode ? "#42494F" : "#adb6c3"}
                            />
                          </svg>
                        )}
                        <div className="text-[0.75rem] text-[#728198]">
                          {commentLikes && commentLikes.length}
                        </div>
                      </div>
                    </span>
                  </span>
                )}
                {comments &&
                  comments.filter((c) => c.parentid === null).length &&
                  comments.filter((c) => c.parentid === null).length > 1 && (
                    <span
                      onClick={() => {
                        router.push(`/${users.username}/post/${id}`);
                      }}
                      className={`border-t ${
                        darkMode ? "border-[#32353C]" : "border-[#EEEDEF]"
                      } cursor-pointer pt-2 w-full flex flex-row text-center justify-center underline text-xs text-[#EB4463]`}
                    >
                      View all comments
                    </span>
                  )}
              </span>
            )}
          </div>

          {preview && (
            <>
              <div
                onClick={() => {
                  setPreview(false);
                }}
                id="imagePreview"
              >
                <Image
                  src={media}
                  alt="user profile"
                  height={2000}
                  width={2000}
                  className="h-screen"
                />
              </div>
              <div
                onClick={() => {
                  setPreview(false);
                }}
                id="dark-overlay"
                className="bg-black"
              ></div>
            </>
          )}

          {openQuote && (
            <>
              <div
                id="modal-visible"
                className={`flex flex-col py-2 px-2 w-full relative ${
                  darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
                } rounded-lg`}
              >
                <span className="pl-3 pb-1 text-start font-semibold">
                  Quoted Repost
                </span>
                <textarea
                  value={quoteContent !== null ? quoteContent : ""}
                  onChange={(e) => {
                    setQuoteContent(e.target.value);
                  }}
                  maxLength={160}
                  placeholder="What do you think of this post..."
                  className="bg-transparent font-medium text-sm h-18 resize-none w-full px-2 border-none focus:outline-none focus:ring-0"
                ></textarea>

                <span className="pb-4 text-sm text-white text-center flex flex-row justify-end font-semibold">
                  <span
                    onClick={() => {
                      handleQuoteRepost();
                    }}
                    className={`${
                      darkMode ? "" : "border border-gray-100"
                    } bg-pastelGreen py-1 w-[70px] rounded-lg cursor-pointer`}
                  >
                    Repost
                  </span>
                </span>
              </div>
              <div
                onClick={() => {
                  setOpenQuote(false);
                }}
                id="overlay"
              ></div>
            </>
          )}

          {openPostOptions && (
            <>
              <PopupModal
                success={"10"}
                useruuid={users.useruuid}
                username={users.username}
                avatar={users.avatar}
                postid={id}
                setOpenPostOptions={setOpenPostOptions}
              />
              <div
                onClick={() => {
                  setOpenPostOptions(false);
                }}
                id="tip-overlay"
              ></div>
            </>
          )}

          {openTipPost && (
            <>
              <PopupModal
                success={"6"}
                username={users.username}
                useruuid={users.useruuid}
                destSolAddress={users.solAddress ? users.solAddress : null}
                avatar={users.avatar}
                destinationAddress={users.address}
                userDestinationId={users.id}
                post={true}
              />
              <div
                onClick={() => {
                  setOpenTipPost(false);
                }}
                id="tip-overlay"
              ></div>
            </>
          )}
        </div>
      </div>
    )
  );
}
