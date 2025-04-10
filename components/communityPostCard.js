import Image from "next/image";
import CommentConfig from "./commentConfig";
import PlusIcon from "./plusIcon";
import { useEffect, useState, useContext, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DappLibrary from "@/lib/dappLibrary";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import animationData from "@/assets/kianimation.json";
import dynamic from "next/dynamic";
import PopupModal from "./popupModal";
import ShareSystem from "./shareSystem";
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

export default function CommunityPostCard({
  id,
  media,
  content,
  created_at,
  users,
  ispoll,
  myProfileId,
  community,
  comments,
  focusPostId,
  fetchCommunityDetails
}) {
  const [openPostOptions, setOpenPostOptions] = useState(false)
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { sendNotification, postTimeAgo } = DappLibrary();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);
  const { fetchFollows } = Relationships();
  const {
    deletePost,
    setDeletePost,
    userData,
    darkMode,
    videoRef,
    handlePlay,
    activeVideo,
    allCommunityPolls
  } = useContext(UserContext);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(null);
  const [downvoted, setDownvoted] = useState(false);
  const [reentry, setReentry] = useState(false);
  const [downvoteReentry, setDownvoteReentry] = useState(false);
  const [followingObject, setFollowingObject] = useState(null);
  const [bookmarkReentry, setBookmarkReentry] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [open, setOpen] = useState(false)
const [pollLoadedData, setPollLoadedData] = useState(false)
  const deleteAction = () => {
    setDeletePost({ postid: id, media: media });
  };

  const addBookmark = () => {
    if (bookmarkReentry) {
      setBookmarkReentry(false);
      if (bookmarked) {
        supabase
          .from("community_bookmarks")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchBookmarkStatus();
          })
          .catch((e) => console.log(e));
      } else {
        supabase
          .from("community_bookmarks")
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
      .from("community_bookmarks")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
          setBookmarkReentry(true);
        }
      });
  };

  const upvotePost = () => {
    if (reentry) {
      setReentry(false);
      if (downvoted) {
        supabase
          .from("community_post_downvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchDownvotes();
          });
      }
      if (upvoted) {
        supabase
          .from("community_post_upvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchUpvotes();
          });
      } else {
        supabase
          .from("community_post_upvotes")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchUpvotes();
          });
      }
    }
  };

  const downvotePost = () => {
    if (downvoteReentry) {
      setDownvoteReentry(false);
      if (upvoted) {
        supabase
          .from("community_post_upvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchUpvotes();
          });
      }

      if (downvoted) {
        supabase
          .from("community_post_downvotes")
          .delete()
          .eq("postid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchDownvotes();
          });
      } else {
        supabase
          .from("community_post_downvotes")
          .insert({ postid: id, userid: myProfileId })
          .then(() => {
            fetchDownvotes();
          });
      }
    }
  };

  const fetchUpvotes = () => {
    supabase
      .from("community_post_upvotes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUpvotes(res.data);
          setUpvoted(!!res.data.find((up) => up.userid === myProfileId));
          setReentry(true);
        }
      });
  };

  const fetchDownvotes = () => {
    supabase
      .from("community_post_downvotes")
      .select()
      .eq("postid", id)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setDownvoted(!!res.data.find((dw) => dw.userid === myProfileId));
          setDownvoteReentry(true);
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

  
  const [imgSrc, setImgSrc] = useState(users.avatar);

  const [pollVotes, setPollVotes] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null);
  const [pollReentry, setPollReentry] = useState(false);

  const applyVote = (id, optionid) => {
    if (userData === undefined || userData === null) {
      fullPageReload("/signin");
      return;
    }
    if (pollReentry) {
      setPollReentry(false);
      if (selectedOption === optionid) {
        supabase
          .from("community_poll_votes")
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
          .from("community_poll_votes")
          .update({ optionid: optionid })
          .eq("pollid", id)
          .eq("userid", myProfileId)
          .then(() => {
            fetchPollVotes(id);
          });
      } else {
        supabase
          .from("community_poll_votes")
          .insert({ pollid: id, optionid: optionid, userid: myProfileId })
          .then((res) => {
            fetchPollVotes(id);
          });
      }
    }
  };
  const fetchPollVotes = (id) => {
    supabase
    .from("community_poll_votes")
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
  }

  useEffect(() => {
    if (users.id !== myProfileId) {
      fetchFollows(users.id).then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setFollowingObject(res.data);
          setAlreadyFollowed(
            !!res.data.find((rel) => rel.follower_userid === myProfileId)
          );
        }
      });
    }
    fetchUpvotes();
    if (!pollLoadedData && ispoll && allCommunityPolls){
      const pollObj = allCommunityPolls.find((poll) => poll.postid === id);
      const pollId = pollObj?.id;
      fetchPollVotes(pollId);
      setPollLoadedData(true);
    }
    fetchDownvotes();
    fetchBookmarkStatus();
  }, [pollLoadedData, allCommunityPolls]);

  return (
    comments &&
    upvotes !== null && (
      <div
        className={`${
          focusPostId
            ? "bg-transparent pb-4"
            : darkMode
            ? "border bg-[#1E1F24] border-[#292C33] text-white rounded-xl py-4"
            : "border bg-white border-[#EEEDEF] text-black rounded-xl py-4"
        } space-y-3 my-2 px-3 flex flex-col justify-center text-start`}
      >
        <span className="flex flex-row justify-between items-center">
          <span
            onClick={() => {
              fullPageReload(`/profile/${users.username}`);
            }}
            className="cursor-pointer flex flex-row justify-start items-center space-x-0"
          >
            <span className="relative h-9 w-9 flex">
              <Image
                src={imgSrc}
                alt="user profile"
                width={35}
                height={35}
                className="border border-black rounded-full object"
                onError={() =>
                  setImgSrc(
                    "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                  )
                }
              />
            </span>

            <span className="flex flex-col -space-y-1.5">
              <span className="flex flex-row items-center">
                <span className="pl-2 text-sm font-semibold">
                  {users.username}
                </span>
                <span className="-ml-1 h-6 w-8">
                  <Lottie animationData={animationData} />
                </span>
                <span className="flex items-center -ml-1.5 text-xs font-medium text-blue-400">
                  {parseFloat(parseFloat(users.ki).toFixed(2))}
                </span>
              </span>
              <span className="pl-2 flex flex-row items-center">
                <span className="flex flex-row items-center space-x-0.5 text-[0.7rem] text-[#728198]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="clock"
                    width="11"
                    height="11"
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
                  <span>{postTimeAgo(created_at)}</span>
                </span>
              </span>
            </span>
          </span>
          <span className="flex flex-row items-center space-x-1">

          {userData &&
            (router.pathname === "/profile/[user]" &&
            users.id === myProfileId ? (
              <span
                onClick={() => {
                  //deleteAction()
                }}
                className="cursor-pointer"
              >
                {/* <BinSvg pixels={"20px"} /> */}
              </span>
            ) : (
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
                fill={bookmarked ? "#04dbc4" : "#ADB6C3"}
              >
                <path
                  id="bookmark"
                  d="M15.909,2.318V16.227a.773.773,0,0,1-1.283.58L8.955,11.846,3.283,16.807A.773.773,0,0,1,2,16.227V2.318A2.325,2.325,0,0,1,4.318,0h9.273a2.325,2.325,0,0,1,2.318,2.318Z"
                  transform="translate(-2)"
                  fill={bookmarked ? "#04dbc4" : "#ADB6C3"}
                />
              </svg>
            ))}
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
            </span>
        </span>
        {content !== null && content !== undefined && content !== "" && (
          <span
          className={`${
            ispoll && "font-semibold"
          } text-sm leading-tight break-words whitespace-pre-wrap`}
            onClick={() => {
              fullPageReload(
                `/communities/${community.split("&")[0]}&${id}`,
                "window"
              );
            }}
            style={{ whiteSpace: "pre-wrap" }}
          >
            <CommentConfig text={content} tags={true} />
          </span>
        )}
        {ispoll &&
            allCommunityPolls &&
            allCommunityPolls
              .filter((poll) => poll.postid === id)
              .map((poll) => (
                <span key={poll.id} className="flex flex-col">
                  <span className="pb-2 text-sm leading-tight break-words whitespace-pre-wrap">
                    <CommentConfig text={poll.question} tags={true} />
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
                  {pollVotes && pollVotes.length && <span className="text-sm">{`${pollVotes.length} ${pollVotes.length === 1 ? 'vote' : 'votes'}`}</span>}
                </span>
              ))}
        <span className="relative w-full max-h-[600px] flex justify-center">
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
                  handlePlay(id);
                  setPlayVideo(true);

                  // if (!window.location.href.includes(`&${id}`)) {
                  //   fullPageReload(
                  //     `/communities/${community.split("&")[0]}&${id}`,
                  //     "window"
                  //   );
                  // } else {
                  //   togglePlayPause();
                  // }
                }}
                className="relative cursor-pointer flex justify-center items-center bg-black w-full"
              >
                <video
                  className="relative max-h-[600px]"
                  src={media}
                  crossOrigin="anonymous"
                  // ref={videoRef}
                  ref={(el) => (videoRef.current[id] = el)}
                  height={600}
                  width={600}
                  onPlay={() => handlePlay(id)}
                ></video>
                {(!playVideo || activeVideo !== id) && (
                  <svg
                    fill="white"
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
                    <rect x={0} y={0} width={36} height={36} fillOpacity={0} />
                  </svg>
                )}
              </span>
            ) : (
              <span
                className="cursor-pointer"
                onClick={() => {
                  fullPageReload(
                    `/communities/${community.split("&")[0]}&${id}`,
                    "window"
                  );
                }}
              >
                <Image
                  src={media}
                  alt="post"
                  width={600}
                  height={600}
                  className="rounded-lg object-cover"
                />
              </span>
            ))}
        </span>
        

        <div className="text-white flex flex-row justify-between items-center">
          <div className="flex flex-row items-center space-x-4 pr-4 py-2">
            <div className="cursor-pointer flex items-center space-x-1">
              <svg
                onClick={() => {
                  upvotePost();
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="14"
                viewBox="0 0 14 16"
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
                      d="M46.209,6.768,39.533.1a.335.335,0,0,0-.472,0L32.4,6.768a.333.333,0,0,0,.236.568h3.67v8.331a.334.334,0,0,0,.334.333h5.339a.334.334,0,0,0,.334-.333V7.336h3.656a.333.333,0,0,0,.236-.568Z"
                      transform="translate(-32.307)"
                      fill={
                        upvoted ? "#EB4463" : darkMode ? "#42494F" : "#adb6c3"
                      }
                    />
                  </g>
                </g>
              </svg>

              <div
                className={`py-0.5 px-2 text-sm font-normal rounded ${
                  darkMode
                    ? "text-[#AFB1B2] bg-[#292C33]"
                    : "text-[#728198] bg-[#F5F5F5]"
                }`}
              >
                {upvotes.length}
              </div>

              <svg
                onClick={() => {
                  downvotePost();
                }}
                xmlns="http://www.w3.org/2000/svg"
                id="up-arrow"
                width="12"
                height="14"
                viewBox="0 0 14 16"
              >
                <g
                  id="Gruppe_3153"
                  data-name="Gruppe 3153"
                  transform="translate(0)"
                >
                  <path
                    id="Pfad_1769"
                    data-name="Pfad 1769"
                    d="M46.209,9.232,39.533,15.9a.335.335,0,0,1-.472,0L32.4,9.232a.333.333,0,0,1,.236-.568h3.67V.333A.334.334,0,0,1,36.645,0h5.339a.334.334,0,0,1,.334.333V8.664h3.656a.333.333,0,0,1,.236.568Z"
                    transform="translate(-32.307)"
                    fill={
                      downvoted ? "#EB4463" : darkMode ? "#42494F" : "#adb6c3"
                    }
                  />
                </g>
              </svg>
            </div>

            <div
              onClick={() => {
                fullPageReload(
                  `/communities/${community.split("&")[0]}&${id}`,
                  "window"
                );
              }}
              className="cursor-pointer flex items-center space-x-1 justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14.002"
                height="14"
                viewBox="0 0 16.002 16"
              >
                <path
                  id="comment"
                  d="M.671,11.2.01,15.149a.743.743,0,0,0,.2.64A.732.732,0,0,0,.73,16a.748.748,0,0,0,.124-.007L4.8,15.331A7.863,7.863,0,0,0,8,16,8,8,0,1,0,0,8,7.863,7.863,0,0,0,.671,11.2Z"
                  fill={darkMode ? "#42494F" : "#adb6c3"}
                />
              </svg>

              <div
                className={`text-sm font-normal rounded ${
                  darkMode ? "text-[#AFB1B2]" : "text-[#728198]"
                }`}
              >
                {comments.filter((c) => c.parentid === null).length}
              </div>
              <svg
                onClick={() => {setOpenPostOptions(true)}}
                xmlns="http://www.w3.org/2000/svg"
                width="14.522"
                height="14"
                viewBox="0 0 12.522 16"
                className="pl-1"
              >
                <path
                  id="flag_1_"
                  data-name="flag (1)"
                  d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                  transform="translate(-15.124 -7.12)"
                  fill={darkMode ? "#42494F" : "#adb6c3"}
                />
              </svg>
            </div>
          </div>
          {/* <div className="flex flex-row space-x-2 items-center justify-center">
            {copied ? (
              <span
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/communities/${community}&${id}`
                  );
                }}
                className="text-black text-xs"
              >
                copied
              </span>
            ) : (
              <svg
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://animebook.io/communities/${community}&${id}`
                  );
                  setCopied(true);
                }}
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white cursor-pointer bg-pastelGreen p-1 rounded-full"
              >
                <path
                  d="M11.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L13 5.414V15a1 1 0 1 1-2 0V5.414L9.707 6.707a1 1 0 0 1-1.414-1.414l3-3zM4 11a2 2 0 0 1 2-2h2a1 1 0 0 1 0 2H6v9h12v-9h-2a1 1 0 1 1 0-2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9z"
                  fill="white"
                />
              </svg>
            )}
            <svg
              width="25px"
              height="25px"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              className="icon cursor-pointer bg-red-400 p-1 rounded-full"
            >
              <path
                fill="white"
                d="M288 128h608L736 384l160 256H288v320h-96V64h96v64z"
              />
            </svg>
          </div> */}
        </div>
        {open && (
                  <div
                    id="zMax"
                    className={`right-0 lg:right-[21%] border absolute mt-1 w-44 bg-black rounded-lg shadow-lg ${
                      darkMode
                        ? "border-gray-700 bg-[#1E1F24] text-white"
                        : "border-gray-300 bg-white text-black"
                    }`}
                  >
                    <ul className={`space-y-1`}>
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
                          <span>Delete</span>
                        </li>
                      )}

                      <ShareSystem
                        postUrl={`https://animebook.io/communities/${community.split("&")[0]}&${id}`}
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
                          <span>Report</span>
                        </li>
                      )}
                    </ul>
                  </div>
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
        {deletePost !== null && (
        <>
          <PopupModal success={"7"} isCommunity={true} fetchCommunityDetails={fetchCommunityDetails} />
          <div
            onClick={() => {
              setDeletePost(null);
            }}
            id="overlay"
            className="bg-black bg-opacity-80"
          ></div>
        </>
      )}
      </div>
    )
  );
}
