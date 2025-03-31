import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import NavBar, { MobileNavBar } from "@/components/navBar";
import Image from "next/image";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import LargeRightBar from "@/components/largeRightBar";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
import CommentConfig from "@/components/commentConfig";
import SideBar from "@/components/sideBar";
import ExploreCard from "@/components/exploreCard";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json";
import dynamic from "next/dynamic";
import animationData from "@/assets/kianimation.json";
import CommentCard from "@/components/commentCard";
import ExploreActions from "@/components/exploreActions";
import CommentItem from "@/components/commentItem";
import PopupModal from "@/components/popupModal";
import ShareSystem from "@/components/shareSystem";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const PostActions = ({
  id,
  liked,
  likes,
  likePost,
  addBookmark,
  comments,
  views,
  bookmarked,
  users,
}) => {
  const router = useRouter();
  return likes !== null && views !== null && comments ? (
    <div className="p-2 w-fit bg-white shadow-xl rounded-full mx-auto flex flow-row items-center justify-between space-x-14">
      <div className="flex items-center space-x-2">
        {liked ? (
          <svg
            onClick={() => {
              likePost(id, users);
            }}
            className="cursor-pointer text-red-400"
            width="26px"
            height="26px"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
          </svg>
        ) : (
          <svg
            onClick={() => {
              likePost(id, users);
            }}
            className="cursor-pointer"
            fill="#000000"
            width="26px"
            height="26px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.16,5A6.29,6.29,0,0,0,12,4.36a6.27,6.27,0,0,0-8.16,9.48l6.21,6.22a2.78,2.78,0,0,0,3.9,0l6.21-6.22A6.27,6.27,0,0,0,20.16,5Zm-1.41,7.46-6.21,6.21a.76.76,0,0,1-1.08,0L5.25,12.43a4.29,4.29,0,0,1,0-6,4.27,4.27,0,0,1,6,0,1,1,0,0,0,1.42,0,4.27,4.27,0,0,1,6,0A4.29,4.29,0,0,1,18.75,12.43Z" />
          </svg>
        )}
        <div className="text-gray-800">{likes.length}</div>
      </div>

      <div
        onClick={() => {
          exploreAndAllDetails(post.post, explorePosts[post.newId]);
          // router.push(`${users.username}/post/${id}`);
        }}
        className="flex items-center space-x-2"
      >
        <svg
          className="cursor-pointer"
          fill="#000000"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,12,11Zm4,0a1,1,0,1,0,1,1A1,1,0,0,0,16,11ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,2.26,6.33l-2,2a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h9A10,10,0,0,0,12,2Zm0,18H5.41l.93-.93a1,1,0,0,0,.3-.71,1,1,0,0,0-.3-.7A8,8,0,1,1,12,20Z" />
        </svg>

        <div className="text-gray-800">{comments.length}</div>
      </div>

      <div className="flex items-center space-x-2">
        <svg
          className="cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <div className="text-gray-800">{views.length}</div>
      </div>
      <svg
        onClick={() => {
          addBookmark(id);
        }}
        className={`cursor-pointer w-5 h-5 ${
          bookmarked ? "text-[#EB4463]" : "text-black"
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
      </svg>
    </div>
  ) : (
    <span className="text-center text-[#EB4463]">{"..."}</span>
  );
};
export default function Explore() {
  const { sendNotification, postTimeAgo } = DappLibrary();
  const { fullPageReload } = PageLoadOptions();
  const [selectedCommentMedia, setSelectedCommentMedia] = useState(null);
  const [commentMediaFile, setCommentMediaFile] = useState(null);

  const commentMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCommentMediaFile(e.target.files);
      setSelectedCommentMedia(URL.createObjectURL(file));
    }
  };
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const {
    openComments,
    setOpenComments,
    originalPostValues,
    setOriginalExplorePosts,
    setExplorePosts,
    originalExplorePosts,
    explorePosts,
    setChosenTag,
    darkMode,
    userNumId,
    hashtagList,
    userData,
    setHashtagList,
    chosenTag,
    imagesFilter,
    videosFilter,
    tagsFilter,
    searchFilter,
    sideBarOpened,
    setPostOwnerDetails,
    commentValues,
    setCommentValues,
    commentMsg,
    setCommentMsg,
    parentId,
    setParentId,
    inputRef,
    newListOfComments,
    setNewListOfComments,
  } = useContext(UserContext);
  const [openPostOptions, setOpenPostOptions] = useState(false);

  const [fetchLoaded, setFetchLoaded] = useState(false);
  const [visibleExplorePosts, setVisibleExplorePosts] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(1);
  const [visibleEposts, setVisibleEposts] = useState([]);
  const [currentPiece, setCurrentPiece] = useState(1);
  const pieceSize = 50;

  const chunkSize = 50;
  const videoRef = useRef(null);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [reentry, setReentry] = useState(false);
  const [views, setViews] = useState(null);
  const [comments, setComments] = useState(null);

  const [likeAnimate, setLikeAnimate] = useState(false);
  const [unlikeAnimate, setUnlikeAnimate] = useState(false);
  const [reposts, setReposts] = useState(null);

  const [madeRepost, setMadeRepost] = useState(false);
  const [repostReentry, setRepostReentry] = useState(false);

  const triggerLikeAnimation = (triggerLike) => {
    if (triggerLike) {
      setLikeAnimate(true);
      setTimeout(() => setLikeAnimate(false), 1000);
    } else {
      setUnlikeAnimate(true);
      setTimeout(() => setUnlikeAnimate(false), 1000);
    }
  };

  const fetchReposts = (id) => {
    supabase
      .from("reposts")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setReposts(res.data);
          setMadeRepost(!!res.data.find((rt) => rt.userid === userNumId));
          setRepostReentry(true);
        }
      });
  };
  const getSelectedHashTag = (htag) => {
    if (htag === "all") {
      setExplorePosts(originalExplorePosts);
      setChosenTag("all");
    } else {
      if (htag[0] === chosenTag) {
        setChosenTag(null);
        setExplorePosts(originalExplorePosts);
      } else {
        setChosenTag(htag[0]);
        console.log(htag[0])

        const selectedTag = originalExplorePosts.filter(
          (post) =>
            post.post.content.toLowerCase().includes(htag[0].toLowerCase()) &&
            post.post.media !== null &&
            post.post.media !== undefined
        );
        setExplorePosts(selectedTag);
        setVisibleEposts(selectedTag)
        setVisibleExplorePosts(selectedTag)
      }
    }
  };

  const addBookmark = (id) => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchBookmarkStatus(id);
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("bookmarks")
          .insert({ postid: id, userid: userNumId })
          .then(() => {
            fetchBookmarkStatus(id);
          })
          .catch((e) => console.log(e));
      }
    }
  };

  const fetchBookmarkStatus = (id) => {
    supabase
      .from("bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === userNumId));
          setBookmarkReentry(true);
        }
      });
  };
  const likePost = (id, users) => {
    if (reentry) {
      setReentry(false);
      if (liked) {
        supabase
          .from("likes")
          .delete()
          .eq("postid", id)
          .eq("userid", userNumId)
          .then(() => {
            fetchLikes(id).then((res) => {
              if (res.error) {
                return;
              }
              triggerLikeAnimation(false);
            });
          });
      } else {
        supabase
          .from("likes")
          .insert({ postid: id, userid: userNumId })
          .then(() => {
            fetchLikes(id).then((res) => {
              if (res.error) {
                return;
              }
              triggerLikeAnimation(true);
            });
            sendNotification("likepost", users.id, likes, id);
          });
      }
    }
  };

  const fetchLikes = async (postid) => {
    const res = await supabase.from("likes").select().eq("postid", postid);

    if (res.data !== undefined && res.data !== null) {
      setLikes(res.data);
      setLiked(!!res.data.find((lk) => lk.userid === userNumId));
      setReentry(true);
    }
    return res;
  };
  const addView = (id) => {
    supabase
      .from("views")
      .insert({ postid: id, userid: userNumId })
      .then(() => {})
      .catch((e) => console.log(e));
  };
  const fetchViews = (id) => {
    supabase
      .from("views")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setViews(res.data);
          if (!!!res.data.find((lk) => lk.userid === userNumId)) {
            addView(id);
          }
        }
      })
      .catch((e) => console.log(e));
  };

  const fetchComments = (id) => {
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

  const postToggle = (nextPost) => {
    if (nextPost) {
      if (explorePosts[currentPost.newId + 1] === undefined) {
        return;
      }
      setCommentMsg("");
      setParentId(null);

      setPlayVideo(true);

      setCurrentPost(
        explorePosts[
          currentPost.newId + 1 < explorePosts.length
            ? currentPost.newId + 1
            : currentPost.newId
        ]
      );
      exploreAndAllDetails(
        explorePosts[currentPost.newId + 1].post,
        explorePosts[currentPost.newId + 1]
      );
    } else {
      if (explorePosts[currentPost.newId - 1] === undefined) {
        return;
      }

      setPlayVideo(true);

      setCurrentPost(
        explorePosts[
          currentPost.newId - 1 >= explorePosts[0].newId
            ? currentPost.newId - 1
            : currentPost.newId
        ]
      );
      exploreAndAllDetails(
        explorePosts[currentPost.newId - 1].post,
        explorePosts[currentPost.newId - 1]
      );
    }
  };

  const pauseAndPlayVideo = (action) => {
    if (videoRef.current) {
      if (action) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const togglePlayPause = () => {
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

  const resetStates = () => {
    setBookmarked(false);
    setBookmarkReentry(false);
    setLiked(false);
    setLikes(null);
    setReentry(false);
    setViews(null);
    setComments(null);
  };

  const exploreAndAllDetails = (postInfos, postInfosByNewId) => {
    if (selectedIndex !== null){
      
    } else{
      setComments(null);
      setCommentValues(null);
      resetStates();
  
      fetchLikes(postInfos.id);
      fetchReposts(postInfos.id);
      fetchViews(postInfos.id);
      fetchBookmarkStatus(postInfos.id);
      fetchComments(postInfos.id);
  
      setCurrentPost(postInfosByNewId);
      setOpenExplorer(true);
      pauseAndPlayVideo(true);
    }
   
  };

  const fetchExplorePosts = () => {
    const postObj = Array.from(
      new Map(
        originalPostValues
          .filter((post) => post.media?.match(/\.(mp4|mov|3gp)$/i))
          .map((post) => [post.id, post])
      ).values()
    ).map((post, index) => ({ newId: index, post }));

    setFetchLoaded(true);
    setOriginalExplorePosts(postObj);
    setExplorePosts(postObj);

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        setExplorePosts(
          postObj.filter((p) =>
            p.post.content.toLowerCase().includes(hash.toLowerCase())
          )
        );
        setChosenTag(hash);
      }
    }
  };

  const handleRepost = (id) => {
    if (repostReentry) {
      setRepostReentry(false);
      if (madeRepost) {
        setMadeRepost(false);
        setReposts(
          reposts.filter((rt) => {
            return rt.userid !== userNumId;
          })
        );
        supabase
          .from("reposts")
          .delete()
          .eq("postid", id)
          .eq("userid", userNumId)
          .then(async () => {
            setRepostReentry(true);
            // fetchReposts();
          });
      } else {
        setMadeRepost(true);
        setReposts([
          ...reposts,
          {
            postid: id,
            userid: userNumId,
          },
        ]);
        supabase
          .from("reposts")
          .insert({ postid: id, userid: userNumId })
          .then(async () => {
            setRepostReentry(true);
            // fetchReposts();
            // sendNotification("likepost", users.id, likes, id);
          });
      }
    }
  };

  const postComment = async (id) => {
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

          await supabase.from("comments").insert({
            postid: id,
            content: commentToSend,
            userid: userNumId,
            parentid: commentMsg.startsWith("@") ? parentId : null,
            media: mediaUrl,
          });
        }
      }
      setSelectedCommentMedia(null);
      setCommentMediaFile(null);
      setCommentMsg("");
      fetchComments(id);
    } else {
      if (commentMsg !== "" && currentPost) {
        let commentToSend = commentMsg;
        setCommentMsg("");
        supabase
          .from("comments")
          .insert({
            postid: id,
            content: commentToSend,
            userid: userNumId,
            parentid: commentToSend.startsWith("@") ? parentId : null,
            media: null,
          })
          .then(async () => {
            fetchComments(id);
          });
      }
    }
  };


  const [selectedIndex, setSelectedIndex] = useState(null);

  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX) return;

    const touchEndX = e.touches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 100) {
      setSelectedIndex(null)
      setTouchStartX(null);
    }
  };

  const [startX, setStartX] = useState(null);

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleMove = (e) => {
    if (!startX) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const swipeDistance = clientX - startX;

    if (swipeDistance > 100) {
      setSelectedIndex(null)
      setStartX(null);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (explorePosts) {
      setVisibleExplorePosts(explorePosts.slice(0, currentChunk * chunkSize));
    } else {
      if (originalExplorePosts) {
        setVisibleExplorePosts(
          originalExplorePosts.slice(0, currentChunk * chunkSize)
        );
      }
    }
  }, [explorePosts, originalExplorePosts, currentChunk, chunkSize]);

  useEffect(() => {
    if (videoRefs.current[selectedIndex]) {
      videoRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);

            // If the 8th post in the current chunk is visible, load more posts
            if (index === visibleExplorePosts.length - 2) {
              setCurrentChunk((prev) => prev + 1);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((video) => video && observer.observe(video));

    return () =>
      videoRefs.current.forEach((video) => video && observer.unobserve(video));
  }, [selectedIndex, visibleExplorePosts]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.play().catch(() => {});
          video.muted = isMuted;
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex, isMuted]);

  useEffect(() => {
    if (originalPostValues && !fetchLoaded) {
      fetchExplorePosts();
    }

    if (newListOfComments) {
      setCommentValues(newListOfComments);
      setNewListOfComments(null);
    }

    loadMorePosts();

    const handleKeyDown = (event) => {
      if (!currentPost) return; // Ensure currentPost exists before proceeding

      if (event.key === "ArrowRight") {
        postToggle(true); // Move forward
      } else if (event.key === "ArrowLeft") {
        postToggle(false); // Move backward
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentPost,
    fetchLoaded,
    originalPostValues,
    loadMorePosts,
    currentChunk,
    newListOfComments,
  ]);

  const loadMoreEposts = useCallback(() => {
    if (originalExplorePosts) {
      const nextChunk = originalExplorePosts.slice(0, currentPiece * pieceSize);
      setVisibleEposts(nextChunk);
    }
  }, [originalExplorePosts, currentPiece, pieceSize]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50
      ) {
        setCurrentPiece((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    loadMoreEposts();
  }, [currentChunk, loadMoreEposts]);

  const toggleMute = () => setIsMuted((prev) => !prev);
  return (
    <>
      <div className="w-full xl:hidden">
        {selectedIndex !== null ? <div
        id="scrollbar-remove"
        className={`xl:hidden h-screen snap-y snap-mandatory relative ${
          openComments
            ? "fixed top-0 left-0 overflow-hidden"
            : "overflow-y-auto"
        }`}
      >
        {visibleExplorePosts.map((post, index) => (
          <div
            key={post.newId}
            onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
            className={`bg-black relative h-screen flex justify-center items-center snap-center`}
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              data-index={index}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              src={post.post.media}
              loop
              playsInline
              muted={isMuted}
            />

            <div className="right-2 absolute top-2 max:h-[75vh] cursor-pointer text-white font-bold flex flex-col justify-between space-y-8 items-center">
              <svg
                id="shadowthis"
                xmlns="http://www.w3.org/2000/svg"
                width="5"
                height="19"
                viewBox="0 0 5 19"
              >
                <g
                  id="Gruppe_3324"
                  data-name="Gruppe 3324"
                  transform="translate(-1402 -145)"
                >
                  <circle
                    id="Ellipse_260"
                    data-name="Ellipse 260"
                    cx="2.5"
                    cy="2.5"
                    r="2.5"
                    transform="translate(1402 145)"
                    fill="#fff"
                  />
                  <circle
                    id="Ellipse_261"
                    data-name="Ellipse 261"
                    cx="2.5"
                    cy="2.5"
                    r="2.5"
                    transform="translate(1402 152)"
                    fill="#fff"
                  />
                  <circle
                    id="Ellipse_262"
                    data-name="Ellipse 262"
                    cx="2.5"
                    cy="2.5"
                    r="2.5"
                    transform="translate(1402 159)"
                    fill="#fff"
                  />
                </g>
              </svg>
              <span className="flex flex-col justify-center items-center space-y-8">
                <span className="flex flex-col justify-center items-center">
                  <span
                    onClick={() => {
                      fullPageReload(
                        `/profile/${(post.post.users.username, "window")}`
                      );
                    }}
                    className="relative h-12 w-12 flex"
                  >
                    <Image
                      src={post.post.users.avatar}
                      alt="user profile"
                      height={55}
                      width={55}
                      className="border border-white rounded-full"
                    />
                  </span>
                </span>

                <ExploreActions
                  id={post.post.id}
                  myProfileId={userNumId}
                  ownerDetails={post.post}
                />
                <svg
                  className={!openComments && "z-20"}
                  id="shadowthis"
                  onClick={toggleMute}
                  fill={isMuted ? "gray" : "white"}
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13,4V20a1,1,0,0,1-2,0V4a1,1,0,0,1,2,0ZM8,5A1,1,0,0,0,7,6V18a1,1,0,0,0,2,0V6A1,1,0,0,0,8,5ZM4,7A1,1,0,0,0,3,8v8a1,1,0,0,0,2,0V8A1,1,0,0,0,4,7ZM16,5a1,1,0,0,0-1,1V18a1,1,0,0,0,2,0V6A1,1,0,0,0,16,5Zm4,2a1,1,0,0,0-1,1v8a1,1,0,0,0,2,0V8A1,1,0,0,0,20,7Z" />
                </svg>
              </span>
            </div>
            <div className="absolute bottom-40 left-0 text-white w-fit px-8 flex flex-col justify-start">
              <span
                id="shadowthis"
                className="w-fit cursor-pointer text-lg font-semibold"
                onClick={() => {
                  fullPageReload(
                    `/profile/${(post.post.users.username, "window")}`
                  );
                }}
              >
                {post.post.users.username}
              </span>
              <span
                className="mb-16 text-sm font-bold break-words overflow-wrap break-word"
                id="textkit"
              >
                <CommentConfig text={post.post.content} tags={true} />
              </span>
            </div>
          </div>
        ))}

        {openComments && (
          <>
            <span id="comments-modal">
              <CommentCard openComments={openComments} />
            </span>
            <div
              onClick={() => {
                setOpenComments(false);
                setCommentMsg("");
              }}
              id="comments-overlay"
            ></div>
          </>
        )}
      </div> : 
      <div
        className={` ${
          darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"
        }`}
      >
        <div className="hidden lg:block z-40 sticky top-0">
          <LargeTopBar relationship={false} />
        </div>
        <div className="block xl:hidden z-40 sticky top-0">
          <SmallTopBar relationship={false} />
        </div>

        <mobile className="mb-5 flex flex-col xl:flex-row xl:space-x-2 w-full">
          <NavBar />

          <div className="w-full py-2 space-y-5 px-2 lg:pl-[16rem] xl:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] mt-2 xl:mt-0 flex flex-col">
            <div
              className={`border ${
                darkMode
                  ? "bg-[#1E1F24] border-[#292C33] text-white"
                  : "bg-white border-[#EEEDEF] text-black"
              } flex p-1.5 rounded w-full overflow-y-scroll`}
            >
              <div className="text-sm space-x-2 w-fit flex flex-row">
                <span
                  onClick={() => {
                    getSelectedHashTag("all");
                  }}
                  className={
                    chosenTag === "all"
                      ? "rounded bg-[#EB4463] text-white py-2 px-3.5 cursor-pointer"
                      : "py-2 px-3.5 cursor-pointer"
                  }
                >
                  All
                </span>
                {hashtagList !== null &&
                  hashtagList !== undefined &&
                  hashtagList.trending?.map((tag, index) => {
                    return (
                      <span
                        key={index}
                        onClick={() => {
                          getSelectedHashTag(tag);
                        }}
                        className={
                          chosenTag === tag[0]
                            ? "rounded bg-[#EB4463] text-white py-2 px-3.5 cursor-pointer"
                            : "py-2 px-3.5 cursor-pointer"
                        }
                      >
                        {tag[0].length > 10
                          ? tag[0].slice(0, 5).concat("...")
                          : tag[0]}
                      </span>
                    );
                  })}
              </div>
            </div>

            <div className="pb-12 h-fit grid gap-2 grid-cols-2 lg:grid-cols-3 mx-auto">
              {explorePosts !== null &&
                explorePosts !== undefined &&
                (visibleEposts.length > 0 ? (
                  <>
                    {visibleEposts.map((post, index) => {
                      return (
                        <ExploreCard
                          key={post.newId}
                          {...post.post}
                          myProfileId={userNumId}
                          exploreAndAllDetails={exploreAndAllDetails}
                          explorePosts={explorePosts}
                          post={post}
                          index={index}
                          setSelectedIndex={setSelectedIndex}
                        />
                      );
                    })}
                    {visibleEposts.length < explorePosts.length && (
                      <span>
                        <Lottie
                          animationData={darkMode ? darkloadscreen : loadscreen}
                        />
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full text-center text-slate-800">
                    {imagesFilter ? (
                      "Image filter result not found. No image media found"
                    ) : videosFilter ? (
                      "Video filter result not found. No video media found"
                    ) : tagsFilter ? (
                      <span className="flex flex-col justify-center items-center">
                        <p>Hashtag does not exist.</p>
                        <p>Perhaps it has been deleted by creators</p>
                      </span>
                    ) : searchFilter ? (
                      "Search not found. ない!"
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </div>
          </div>
         
        </mobile>

        {sideBarOpened && <SideBar />}

       
      </div>
      }
      </div>
      {<div
        className={`hidden xl:block ${
          darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"
        }`}
      >
        <div className="hidden xl:block block z-40 sticky top-0">
          <LargeTopBar relationship={false} />
        </div>
        <div className="xl:hidden block z-40 sticky top-0">
          <SmallTopBar relationship={false} />
        </div>

        <section className="mb-5 flex flex-col xl:flex-row xl:space-x-2 w-full">
          <NavBar />

          <div className="w-full py-2 space-y-5 px-2 lg:pl-[16rem] xl:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] mt-2 xl:mt-0 flex flex-col">
            <div
              className={`border ${
                darkMode
                  ? "bg-[#1E1F24] border-[#292C33] text-white"
                  : "bg-white border-[#EEEDEF] text-black"
              } flex p-1.5 rounded w-full overflow-y-scroll`}
            >
              <div className="text-sm space-x-2 w-fit flex flex-row">
                <span
                  onClick={() => {
                    getSelectedHashTag("all");
                  }}
                  className={
                    chosenTag === "all"
                      ? "rounded bg-[#EB4463] text-white py-2 px-3.5 cursor-pointer"
                      : "py-2 px-3.5 cursor-pointer"
                  }
                >
                  All
                </span>
                {hashtagList !== null &&
                  hashtagList !== undefined &&
                  hashtagList.trending?.map((tag, index) => {
                    return (
                      <span
                        key={index}
                        onClick={() => {
                          getSelectedHashTag(tag);
                        }}
                        className={
                          chosenTag === tag[0]
                            ? "rounded bg-[#EB4463] text-white py-2 px-3.5 cursor-pointer"
                            : "py-2 px-3.5 cursor-pointer"
                        }
                      >
                        {tag[0].length > 10
                          ? tag[0].slice(0, 5).concat("...")
                          : tag[0]}
                      </span>
                    );
                  })}
              </div>
            </div>

            <div className="pb-12 h-fit grid gap-2 lg:grid-cols-3 mx-auto">
              {explorePosts !== null &&
                explorePosts !== undefined &&
                (visibleEposts.length > 0 ? (
                  <>
                    {visibleEposts.map((post) => {
                      return (
                        <ExploreCard
                          key={post.newId}
                          {...post.post}
                          myProfileId={userNumId}
                          exploreAndAllDetails={exploreAndAllDetails}
                          explorePosts={explorePosts}
                          post={post}
                        />
                      );
                    })}
                    {visibleEposts.length < explorePosts.length && (
                      <span>
                        <Lottie
                          animationData={darkMode ? darkloadscreen : loadscreen}
                        />
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full text-center text-slate-800">
                    {imagesFilter ? (
                      "Image filter result not found. No image media found"
                    ) : videosFilter ? (
                      "Video filter result not found. No video media found"
                    ) : tagsFilter ? (
                      <span className="flex flex-col justify-center items-center">
                        <p>Hashtag does not exist.</p>
                        <p>Perhaps it has been deleted by creators</p>
                      </span>
                    ) : searchFilter ? (
                      "Search not found. ない!"
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="hidden lg:block sticky right-2 top-20 heighto">
            <LargeRightBar />
          </div>
        </section>

        {sideBarOpened && <SideBar />}

        {currentPost !== null && (
          <div
            id={openExplorer ? "explorer-modal" : "invisible"}
            className="text-white relative flex flex-row w-full px-2"
          >
            <div className="relative w-full h-fit max-h-[95vh] m-auto flex justify-center">
              <span
                className={`max:h-[85vh] overflow-y-scroll m-auto w-full md:w-[95%] lg:w-[80%] ${
                  currentPost.post.content
                    ? "flex flex-row items-center justify-between space-x-2"
                    : "flex flex-row items-center justify-between space-x-2"
                }`}
              >
                <span className="w-12 flex">
                  <span
                    onClick={() => {
                      postToggle(false);
                    }}
                    className="my-auto bg-white rounded-full h-7 w-7 flex justify-center items-center cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13.401"
                      height="11.71"
                      viewBox="0 0 13.401 11.71"
                    >
                      <g
                        id="up-arrow"
                        transform="translate(13.401 0) rotate(90)"
                      >
                        <g
                          id="Gruppe_3153"
                          data-name="Gruppe 3153"
                          transform="translate(0)"
                        >
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M43.935,7.733,38.351,13.32a.28.28,0,0,1-.4,0L32.389,7.733a.279.279,0,0,1,.2-.476h3.07V.279A.279.279,0,0,1,35.935,0H40.4a.279.279,0,0,1,.279.279V7.257h3.058a.279.279,0,0,1,.2.476Z"
                            transform="translate(-32.307 0)"
                            fill="#292c33"
                          />
                        </g>
                      </g>
                    </svg>
                  </span>
                </span>
                <span
                  className={`${
                    darkMode
                      ? "w-[85vw] bg-black text-white"
                      : "bg-white text-black"
                  } h-full max-h-[90vh] overflow-hidden p-0.5 rounded flex flex-row items-start justify-center`}
                >
                  <span
                    onClick={() => {
                      togglePlayPause();
                    }}
                    onDoubleClick={() => {
                      likePost(currentPost.post.id, currentPost.post.users);
                    }}
                    className="w-[60%]"
                  >
                    <video
                      className={`relative w-full min-h-[1vh] max-h-[88vh] rounded`}
                      src={currentPost.post.media}
                      ref={videoRef}
                      height={500}
                      width={500}
                      loop
                      autoPlay={playVideo}
                    ></video>
                  </span>
                  <span
                    id="scrollbar-remove"
                    className="w-[40%] min-w-[400px] h-full max-h-[90vh] overflow-y-scroll min-h-[1vh] pb-12 flex flex-col text-base justify-start text-start"
                  >
                    <div
                      className={`space-y-1 py-4 px-3 flex flex-col justify-center text-start`}
                    >
                      <span className="flex flex-row justify-between items-center">
                        <span
                          onClick={() => {
                            fullPageReload(
                              `/profile/${
                                (currentPost.post.users.username, "window")
                              }`
                            );
                          }}
                          // onClick={() => setIsExpanded(!isExpanded)}
                          className={`cursor-pointer flex flex-row justify-start items-center space-x-0 transition-transform duration-500 scale-100`}
                        >
                          <span className="relative h-9 w-9 flex">
                            <Image
                              src={currentPost.post.users.avatar}
                              alt="user profile"
                              height={35}
                              width={35}
                              className="rounded-full"
                            />
                          </span>

                          <span
                            className={`flex flex-col break-all overflow-wrap-word whitespace-preline`}
                          >
                            <span className="flex flex-row">
                              <span className="text-lg pl-2 pr-1 font-bold">
                                {currentPost.post.users.username}
                              </span>
                            </span>

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
                                {postTimeAgo(currentPost.post.created_at)}
                              </span>
                            </span>
                          </span>
                        </span>
                      </span>

                      {currentPost.post.content !== null &&
                        currentPost.post.content !== undefined &&
                        currentPost.post.content !== "" && (
                          <span className="font-semibold break-words overflow-wrap break-word">
                            <CommentConfig
                              text={currentPost.post.content}
                              tags={true}
                            />
                          </span>
                        )}

                      <div className="flex w-full flex-col justify-start">
                        <div className="flex flow-row items-center justify-between">
                          <div className="text-sm font-medium flex flex-row items-center space-x-4 bg-transparent pr-4 py-2">
                            <div className="flex items-center space-x-1">
                              {liked ? (
                                <svg
                                  onClick={() => {
                                    if (userData) {
                                      likePost(
                                        currentPost.post.id,
                                        currentPost.post.users
                                      );
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
                                      liked
                                        ? "#EB4463"
                                        : darkMode
                                        ? "#42494F"
                                        : "#adb6c3"
                                    }
                                  />
                                </svg>
                              ) : (
                                <svg
                                  onClick={() => {
                                    if (userData) {
                                      likePost(
                                        currentPost.post.id,
                                        currentPost.post.users
                                      );
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
                              <div className="text-[#728198]">
                                {likes && likes.length}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              <svg
                                onClick={() => {
                                  setPostOwnerDetails(currentPost.post);
                                  setCommentValues(comments);
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
                                {comments &&
                                  comments.filter((c) => c.parentid === null)
                                    .length}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              {madeRepost ? (
                                <svg
                                  onClick={() => {
                                    handleRepost(currentPost.post.id);
                                  }}
                                  className="cursor-pointer text-pastelGreen"
                                  fill={darkMode ? "#42494F" : "#adb6c3"}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="15.5"
                                  height="16.178"
                                  viewBox="0 0 18.5 16.178"
                                >
                                  <g
                                    id="repost"
                                    transform="translate(0 -32.133)"
                                  >
                                    <path
                                      id="Pfad_4757"
                                      data-name="Pfad 4757"
                                      d="M8.092,43.9a.542.542,0,0,0-.383-.159H5.729V36.7h1.78a.542.542,0,0,0,.383-.925L4.409,32.292a.542.542,0,0,0-.767,0L.159,35.775a.542.542,0,0,0,.383.925h1.78v7.586a2.864,2.864,0,0,0,2.864,2.864h4.845a.542.542,0,0,0,.383-.925Z"
                                      transform="translate(0)"
                                      fill={"#EB4463"}
                                    />
                                    <path
                                      id="Pfad_4758"
                                      data-name="Pfad 4758"
                                      d="M229.923,75.05a.542.542,0,0,0-.5-.335h-1.78V67.13a2.864,2.864,0,0,0-2.864-2.864h-4.845a.542.542,0,0,0-.383.925l2.322,2.322a.542.542,0,0,0,.383.159h1.98v7.044h-1.78a.542.542,0,0,0-.383.925l3.483,3.483a.542.542,0,0,0,.767,0l3.483-3.483a.542.542,0,0,0,.118-.591Z"
                                      transform="translate(-211.464 -30.971)"
                                      fill={"#EB4463"}
                                    />
                                  </g>
                                </svg>
                              ) : (
                                <svg
                                  onClick={() => {
                                    handleRepost(currentPost.post.id);
                                  }}
                                  className="cursor-pointer text-black"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18.5"
                                  height="16.178"
                                  viewBox="0 0 18.5 16.178"
                                >
                                  <g
                                    id="repost"
                                    transform="translate(0 -32.133)"
                                  >
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
                              <div className="text-[#728198]">
                                {reposts && reposts.length}
                              </div>
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
                              <div className="text-[#728198]">
                                {views && views.length}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-center items-center space-x-1">
                            <ShareSystem
                              postUrl={`https://animebook.io/${currentPost.post.users.username}/post/${currentPost.post.id}`}
                              custom={false}
                            />
                            <svg
                              onClick={() => {
                                setOpenPostOptions(true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="18.522"
                              height="16"
                              viewBox="0 0 12.522 16"
                            >
                              <path
                                id="flag_1_"
                                data-name="flag (1)"
                                d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                                transform="translate(-15.124 -7.12)"
                                fill={"#ADB6C3"}
                              />
                            </svg>

                            <svg
                              onClick={() => {
                                if (userData) {
                                  addBookmark(currentPost.post.id);
                                } else {
                                  fullPageReload("/signin");
                                }
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="16"
                              viewBox="0 0 13.909 17"
                              fill={bookmarked ? "#EB4463" : "#ADB6C3"}
                            >
                              <path
                                id="bookmark"
                                d="M15.909,2.318V16.227a.773.773,0,0,1-1.283.58L8.955,11.846,3.283,16.807A.773.773,0,0,1,2,16.227V2.318A2.325,2.325,0,0,1,4.318,0h9.273a2.325,2.325,0,0,1,2.318,2.318Z"
                                transform="translate(-2)"
                                fill={bookmarked ? "#EB4463" : "#ADB6C3"}
                              />
                            </svg>
                          </div>

                          {openPostOptions && (
                            <>
                              <PopupModal
                                success={"10"}
                                useruuid={currentPost.post.users.useruuid}
                                username={currentPost.post.users.username}
                                avatar={currentPost.post.users.avatar}
                                postid={currentPost.post.id}
                                setOpenPostOptions={setOpenPostOptions}
                                reportType={"post"}
                              />
                              <div
                                onClick={() => {
                                  setOpenPostOptions(false);
                                }}
                                id="tip-overlay"
                              ></div>
                            </>
                          )}
                        </div>

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
                              <Image
                                src={userData.avatar}
                                alt="user myprofile"
                                height={40}
                                width={40}
                                className="rounded-full"
                              />
                            </span>
                          )}
                          <span
                            className={`flex ${
                              selectedCommentMedia ? "flex-col" : "flex-row"
                            } justify-between items-center pr-2 w-full border rounded-2xl ${
                              darkMode
                                ? "bg-[#27292F] border-[#32353C]"
                                : "bg-[#F9F9F9] border-[#EEEDEF]"
                            }`}
                          >
                            <input
                              ref={inputRef}
                              value={commentMsg}
                              onChange={(e) => {
                                setCommentMsg(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  postComment(currentPost.post.id);
                                }
                              }}
                              maxLength={1900}
                              className={`${
                                darkMode ? "text-white" : "text-gray-800"
                              } text-sm w-full bg-transparent border-none focus:ring-0`}
                              placeholder="Comment on this post..."
                            />
                            {selectedCommentMedia ? (
                              <label htmlFor="input-post-file" className="relative h-[150px] w-full">
                                <Image
                                  src={selectedCommentMedia}
                                  alt="Invalid post media. Click to change"
                                  layout="fill"
                                  className="object-contain w-full h-full"
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
                            )}
                          </span>
                          <span
                            onClick={() => {
                              postComment(currentPost.post.id);
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
                        <span className="text-sm px-3 flex flex-row justify-between">
                          <span
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-black"
                            }`}
                          >
                            All Comments
                          </span>
                          <span className="space-x-2 flex flex-row items-center">
                            <span
                              className={darkMode ? "text-white" : "text-black"}
                            >
                              Sort by:
                            </span>
                            <select
                              onChange={(e) => {
                                // if (!cryptoCommunities || cryptoCommunities.length === 0){
                                //   return
                                // }
                                // const value = e.target.value;
                                // setCryptoCommunities((prevCommunities) => {
                                //   let sortedCommunities = [...prevCommunities];
                                //   if (value === "most_recent") {
                                //     sortedCommunities.sort(
                                //       (a, b) =>
                                //         new Date(b.created_at) - new Date(a.created_at)
                                //     );
                                //   } else if (value === "most_joined") {
                                //     sortedCommunities.sort(
                                //       (a, b) => b.membersLength - a.membersLength
                                //     );
                                //   } else{
                                //     sortedCommunities.sort(
                                //       (a, b) => b.membersLength - a.membersLength
                                //     );
                                //   }
                                //   return sortedCommunities;
                                // });
                              }}
                              className={`${
                                darkMode ? "text-white" : "text-black"
                              } text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none`}
                            >
                              <option value="default">Default</option>
                              <option value="most_recent">Recent</option>
                            </select>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="8.582"
                              height="9.821"
                              viewBox="0 0 8.582 9.821"
                              fill={darkMode ? "white" : "black"}
                            >
                              <g id="up-arrow" transform="translate(0)">
                                <g
                                  id="Gruppe_3153"
                                  data-name="Gruppe 3153"
                                  transform="translate(0)"
                                >
                                  <path
                                    id="Pfad_1769"
                                    data-name="Pfad 1769"
                                    d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                                    transform="translate(-32.307 0)"
                                    fill="#292c33"
                                  />
                                </g>
                              </g>
                            </svg>
                          </span>
                        </span>
                        <span
                          id="scrollbar-remove"
                          className="h-full overflow-y-auto px-3"
                        >
                          {commentValues &&
                            commentValues.map((comment) => {
                              return (
                                <CommentItem
                                  key={comment.id}
                                  comment={comment}
                                  comments={commentValues}
                                  setCommentMsg={setCommentMsg}
                                  setParentId={setParentId}
                                />
                              );
                            })}
                        </span>
                      </div>

                      {likeAnimate && (
                        <svg
                          id="heart-animation"
                          className="text-red-500"
                          width="150px"
                          height="150px"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 18"
                        >
                          <path d="M17.947 2.053a5.209 5.209 0 0 0-3.793-1.53A6.414 6.414 0 0 0 10 2.311 6.482 6.482 0 0 0 5.824.5a5.2 5.2 0 0 0-3.8 1.521c-1.915 1.916-2.315 5.392.625 8.333l7 7a.5.5 0 0 0 .708 0l7-7a6.6 6.6 0 0 0 2.123-4.508 5.179 5.179 0 0 0-1.533-3.793Z" />
                        </svg>
                      )}

                      {unlikeAnimate && (
                        <svg
                          id="unheart-animation"
                          width="180px"
                          height="180px"
                          viewBox="0 0 72 72"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          aria-hidden="true"
                          role="img"
                          className="iconify iconify--fxemoji"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <path
                            fill="#ef4444"
                            d="M39.1 54c1-.9 1-2.4.2-3.4l-7.6-8.8c-.8-.9-.7-2.2.1-3.1l.2-.1l8.4-8.1c.8-.7.9-1.9.3-2.7c0 0-6.7-10.2-6.8-10.4c-8-8-21.2-7.7-28.8 1C-.6 24.9-1.3 34.6 3.4 42C5 44.5 7 46.4 9.3 47.9l17.8 14.4c1 .8 2.5.8 3.4-.1l8.6-8.2z"
                          />
                          <path
                            fill="#ef4444"
                            d="M66.9 18.6c-5.7-6.6-14.5-8.4-22-5.6c-2.2.8-3.1 3.5-2 5.6l5.3 9.7l.1.2c.7 1.2.3 2.8-.7 3.6L37.8 40c-.6.5-.7 1.3-.3 1.9l6.9 9.6l.1.1c.5.7.4 1.6-.3 2.2L31.9 64.1c-.7.6-.7 1.6 0 2.1l1.8 1.4c1.4 1.1 3.4 1.1 4.8 0l24.3-19.8s.1 0 .1-.1c1.8-1.2 3.5-2.8 4.9-4.7c5.4-7.2 5.1-17.5-.9-24.4z"
                          />
                        </svg>
                      )}
                    </div>
                  </span>
                </span>

                <span className="h-screen w-12 flex flex-col justify-between">
                  <span
                    onClick={() => {
                      pauseAndPlayVideo(false);
                      setOpenExplorer(false);
                    }}
                    className="mt-10 bg-white text-xl cursor-pointer text-center items-center text-black h-8 w-8 rounded-full"
                  >
                    x
                  </span>
                  <span
                    onClick={() => {
                      postToggle(true);
                    }}
                    className="bg-white rounded-full h-7 w-7 flex items-center justify-center cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13.401"
                      height="11.71"
                      viewBox="0 0 13.401 11.71"
                    >
                      <g id="up-arrow" transform="translate(13.401) rotate(90)">
                        <g
                          id="Gruppe_3153"
                          data-name="Gruppe 3153"
                          transform="translate(0 0)"
                        >
                          <path
                            id="Pfad_1769"
                            data-name="Pfad 1769"
                            d="M11.628,5.668,6.044.082a.28.28,0,0,0-.4,0L.082,5.668a.279.279,0,0,0,.2.476h3.07v6.977a.279.279,0,0,0,.279.279H8.093a.279.279,0,0,0,.279-.279V6.145h3.058a.279.279,0,0,0,.2-.476Z"
                            fill="#292c33"
                          />
                        </g>
                      </g>
                    </svg>
                  </span>
                  <span>{/* Empty holder */}</span>
                </span>
              </span>
            </div>
          </div>
        )}

        {openExplorer && (
          <>
            <div id="stories-overlay" className="bg-black bg-opacity-80"></div>
          </>
        )}
      </div>}
      <MobileNavBar />
    </>
  );
}
