import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import CommentConfig from "@/components/commentConfig";
import PopupModal from "@/components/popupModal";
import CommentItem from "@/components/commentItem";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "../lib/userContext";
import DappLibrary from "@/lib/dappLibrary";
import ShareSystem from "@/components/shareSystem";

export default function ExploreBox({
  currentPost,
  setCurrentPost,
  darkMode,
  userData,
  allUserPosts,
  deskMode,
  setDeskMode,
  userNumId
}) {
  const { sendNotification, postTimeAgo } = DappLibrary();

  const {setParentId, inputRef} = useContext(UserContext)
  const { fullPageReload } = PageLoadOptions();
  const vidRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentValues, setCommentValues] = useState(null);
  const [postOwnerDetails, setPostOwnerDetails] = useState(null);
  const [madeRepost, setMadeRepost] = useState(false);
  const [repostReentry, setRepostReentry] = useState(false);
  const [reposts, setReposts] = useState(null);
  const [views, setViews] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [openPostOptions, setOpenPostOptions] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [playVideo, setPlayVideo] = useState(false);
  const [reentry, setReentry] = useState(false)
  const [bookmarkReentry, setBookmarkReentry] = useState(false)

  const postComment = (id) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
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
        })
        .then(async () => {
          fetchComments(id);
        });
    }
  };
  const pauseAndPlayVideo = (status) => {};

  const handleRepost = () => {};

  const postToggle = (nextPost) => {
    const sortedPosts = [...allUserPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at) );
    const currentIndex = sortedPosts.findIndex(post => post === currentPost);
    console.log(currentIndex)
  
    if (nextPost) {
      if (currentIndex + 1 >= sortedPosts.length) {
        return;
      }
      
      setPlayVideo(true);
      setCurrentPost(sortedPosts[currentIndex + 1]);
      resetStates()
    } else {
      if (currentIndex - 1 < 0) {
        return;
      }
      
      setPlayVideo(true);
      setCurrentPost(sortedPosts[currentIndex - 1]);
      resetStates()
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
  const fetchViews = (id) => {
    supabase
      .from("views")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setViews(res.data);
          
        }
      })
      .catch((e) => console.log(e));
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
        }
      });
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

  const fetchAll = (id) => {
    fetchLikes(id);
    fetchReposts(id);
    fetchViews(id);
    fetchBookmarkStatus(id);
    fetchComments(id);

    pauseAndPlayVideo(true);
  };

  const togglePlayPause = () => {
    if (vidRef.current) {
      if (vidRef.current.paused) {
        vidRef.current.play();
        setPlayVideo(true);
      } else {
        vidRef.current.pause();
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
    setCommentValues(null);
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

  useEffect(()=>{
    if (likes === null && currentPost){
      fetchAll(currentPost.id)
    }
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
  }, [likes])

  return (
    <div>
      {currentPost !== null && (
        <div
          id={"explorer-modal"}
          className="text-white relative flex flex-row w-full px-2"
        >
          <div className="relative w-full h-fit m-auto flex justify-center">
            <span
              className={`max:h-[85vh] overflow-y-scroll m-auto w-full md:w-[95%] lg:w-[80%] ${
                currentPost.content
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
                    <g id="up-arrow" transform="translate(13.401 0) rotate(90)">
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
                    likePost(currentPost.id, currentPost.users);
                  }}
                  className="w-[60%] m-auto"
                >
                  {currentPost.media.endsWith("mp4") ||
                  currentPost.media.endsWith("MP4") ||
                  currentPost.media.endsWith("mov") ||
                  currentPost.media.endsWith("MOV") ||
                  currentPost.media.endsWith("3gp") ||
                  currentPost.media.endsWith("3GP") ? (
                    <video
                      className={`relative w-full min-h-[1vh] max-h-[88vh] rounded`}
                      src={currentPost.media}
                      ref={vidRef}
                      height={500}
                      width={500}
                      loop
                      autoPlay={playVideo}
                      controls
                    ></video>
                  ) : (
                    <Image
                      src={currentPost.media}
                      height={500}
                      width={500}
                      className="mx-auto"
                    />
                  )}
                </span>
                <span id="scrollbar-remove" className="w-[40%] min-w-[400px] h-full max-h-[90vh] overflow-y-scroll min-h-[1vh] pb-12 flex flex-col text-base justify-start text-start">
                  <div
                    className={`space-y-1 py-4 px-3 flex flex-col justify-center text-start`}
                  >
                    <span className="flex flex-row justify-between items-center">
                      <span
                        onClick={() => {
                          fullPageReload(
                            `/profile/${(currentPost.users.username, "window")}`
                          );
                        }}
                        // onClick={() => setIsExpanded(!isExpanded)}
                        className={`cursor-pointer flex flex-row justify-start items-center space-x-0 transition-transform duration-500 scale-100`}
                      >
                        <span className="relative h-9 w-9 flex">
                          <Image
                            src={currentPost.users.avatar}
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
                            <span className="pl-2 pr-1 font-semibold">
                              {currentPost.users.username}
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
                              {postTimeAgo(currentPost.created_at)}
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>

                    {currentPost.content !== null &&
                      currentPost.content !== undefined &&
                      currentPost.content !== "" && (
                        <span
  className="break-words whitespace-pre-wrap"
  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
>
  <CommentConfig text={currentPost.content} tags={true} />
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
                                    likePost(currentPost.id, currentPost.users);
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
                                    likePost(currentPost.id, currentPost.users);
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
                                setPostOwnerDetails(currentPost);
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
                                  handleRepost(currentPost.id);
                                }}
                                className="cursor-pointer text-pastelGreen"
                                fill={darkMode ? "#42494F" : "#adb6c3"}
                                xmlns="http://www.w3.org/2000/svg"
                                width="15.5"
                                height="16.178"
                                viewBox="0 0 18.5 16.178"
                              >
                                <g id="repost" transform="translate(0 -32.133)">
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
                                  handleRepost(currentPost.id);
                                }}
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
                        <ShareSystem postUrl={`https://animebook.io/${currentPost.users.username}/post/${currentPost.id}`} custom={false}/>

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
                                addBookmark(currentPost.id);
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
                              useruuid={currentPost.users.useruuid}
                              username={currentPost.users.username}
                              avatar={currentPost.users.avatar}
                              postid={currentPost.id}
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
                              height={25}
                              width={25}
                              className="rounded-full"
                            />
                          </span>
                        )}
                        <span
                          className={`w-full border rounded-2xl ${
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
                                postComment(currentPost.id);
                              }
                            }}
                            maxLength={1900}
                            className={`${
                              darkMode ? "text-white" : "text-gray-800"
                            } text-xs w-full bg-transparent border-none focus:ring-0`}
                            placeholder="Comment on this post..."
                          />
                        </span>
                        <span
                          onClick={() => {
                            postComment(currentPost.id);
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
                      <span className="text-sm px-3 pt-3 flex flex-row justify-between">
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
                      <span className="h-full overflow-y-auto px-3">
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
                  </div>
                </span>
              </span>

              <span className="h-screen w-12 flex flex-col justify-between">
                <span
                  onClick={() => {
                    pauseAndPlayVideo(false);
                    setDeskMode(false);
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
    </div>
  );
}
