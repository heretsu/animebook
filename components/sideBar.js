import Image from "next/image";
import PlusIcon from "./plusIcon";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/userContext";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import ConnectionData from "@/lib/connectionData";
import supabase from "@/hooks/authenticateUser";
import DarkModeToggle from "./darkModeToggle";

const SideBar = () => {
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [displayContent, setDisplayContent] = useState({
    images: false,
    videos: false,
    stories: false,
    people: false,
  });

  const { fetchAllUsers } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [youMayKnow, setYouMayKnow] = useState(null);
  const {
    originalPostValues,
    setPostValues,
    userPostValues,
    userNumId,
    setStoriesFilter,
    setImagesFilter,
    setVideosFilter,
    originalExplorePosts,
    setExplorePosts,
    setChosenTag,
    userData,
    myRelationships,
    darkMode
  } = useContext(UserContext);

  const toggleContentFilter = (postContents) => {
    if (router.pathname === "/explore") {
      mediaPostFilter(postContents);
    } else {
      allPostFilter(postContents);
    }
  };
  const mediaPostFilter = (postContents) => {
    setChosenTag("");
    if (!postContents.images && !postContents.videos) {
      setImagesFilter(false);
      setVideosFilter(false);
      setExplorePosts(originalExplorePosts);
      return true;
    }
    const filteredPosts = originalExplorePosts.filter((post) => {
      const media = post.post.media?.toLowerCase();
      if (
        postContents.images &&
        media &&
        (media.endsWith("jpg") ||
          media.endsWith("png") ||
          media.endsWith("gif") ||
          media.endsWith("svg"))
      ) {
        setImagesFilter(true);
        return true;
      }
      if (
        postContents.videos &&
        media &&
        (media.endsWith("mp4") ||
          media.endsWith("mov") ||
          media.endsWith("3gp"))
      ) {
        setVideosFilter(true);
        return true;
      }
      return false;
    });
    setExplorePosts(filteredPosts);
  };

  const allPostFilter = (postContents) => {
    if (
      !postContents.images &&
      !postContents.videos &&
      !postContents.stories &&
      !postContents.people
    ) {
      setStoriesFilter(false);
      setImagesFilter(false);
      setVideosFilter(false);
      if (router.pathname === "/profile/[user]") {
        setPostValues(userPostValues);
      } else {
        setPostValues(originalPostValues);
      }
      return true;
    }
    if (router.pathname === "/profile/[user]") {
      getFilteredPosts(postContents, userPostValues);
    } else {
      getFilteredPosts(postContents, originalPostValues);
    }
  };

  const getFilteredPosts = (postContents, pValues) => {
    const filteredPosts = pValues.filter((post) => {
      const media = post.media?.toLowerCase();
      if (
        postContents.images &&
        media &&
        (media.endsWith("jpg") ||
          media.endsWith("png") ||
          media.endsWith("gif") ||
          media.endsWith("svg"))
      ) {
        setImagesFilter(true);
        return true;
      }
      if (
        postContents.videos &&
        media &&
        (media.endsWith("mp4") ||
          media.endsWith("mov") ||
          media.endsWith("3gp"))
      ) {
        setVideosFilter(true);
        return true;
      }
      if (postContents.people) {
        return true;
      }

      if (postContents.stories) {
        setStoriesFilter(true);
        return false;
      }

      return false;
    });
    setPostValues(filteredPosts);
  };

  const fetchYouMayKnow = async () => {
    if (userData) {
      const followResult = await fetchFollowing(userNumId);
      fetchAllUsers().then((res) => {
        let unfollowedUsers = [];
        let i = 0;
        if (res.data && res.data.length > 0) {
          while (i < res.data.length) {
            if (userNumId !== res.data[i].id) {
              if (
                !!followResult.data.find(
                  (rel) => rel.following_userid === res.data[i].id
                )
              ) {
              } else {
                unfollowedUsers.push(res.data[i]);
              }
            }
            i++;
          }
          setYouMayKnow(unfollowedUsers);
        }
      });
    }
  };

  const { disconnectWallet } = ConnectionData();

  const logOut = async () => {
    try {
      try {
        disconnectWallet();
      } catch (e) {}
      await supabase.auth.signOut();
      router.push("/signin");
    } catch (error) {
      throw "a problem occurred";
    }
  };

  useEffect(() => {
    if (alreadyFollowed) {
      setSliceIndex(sliceIndex + 1);
    }
    fetchYouMayKnow();
  }, [originalPostValues, alreadyFollowed, userData]);

  return (
    <div id="sidebar" className="h-screen overflow-scroll flex">
      <div className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-slate-500'} h-full flex flex-col w-full`}>
        <span className={`flex flex-row justify-between items-center ${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-gray-100 text-slate-500'} px-3 py-1.5`}>
          <span className="flex flex-row justify-center items-center space-x-2">
            {userData && (
              <span
                onClick={() => {
                  fullPageReload(`/profile/${userData.username}`, 'window');
                }}
                className="relative flex flex-col flex-shrink-0"
              >
                <Image
                  src={userData.avatar}
                  alt="user myprofile"
                  height={35}
                  width={35}
                  className="cursor-pointer rounded-full"
                />
              </span>
            )}
            <span className="flex flex-col">
              <span className="font-bold">{userData && userData.username}</span>
              {myRelationships !== null &&
                myRelationships !== undefined &&
                myRelationships.followings &&
                myRelationships.followers && (
                  <span className="text-xs font-bold">{`${myRelationships.followings.length} Following ${myRelationships.followers.length} ${myRelationships.followers.length === 1 ? 'Follower' : 'Followers'}`}</span>
                )}
            </span>
          </span>
          <svg
            onClick={() => {
              logOut();
            }}
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            height={21}
            width={21}
            viewBox="0 0 55 55"
            style={{
              enableBackground: "new 0 0 55 55",
            }}
            xmlSpace="preserve"
            className="cursor-pointer"
          >
            <g>
              <path
                stroke="#475569"
                strokeWidth={2}
                fill="#475569"
                d="M53.924,23.618c-0.051-0.123-0.125-0.234-0.217-0.327L41.708,11.293c-0.391-0.391-1.023-0.391-1.414,0 s-0.391,1.023,0,1.414L50.587,23H29.001c-0.553,0-1,0.447-1,1s0.447,1,1,1h21.586L40.294,35.293c-0.391,0.391-0.391,1.023,0,1.414 C40.489,36.902,40.745,37,41.001,37s0.512-0.098,0.707-0.293l11.999-11.999c0.093-0.092,0.166-0.203,0.217-0.326 C54.025,24.138,54.025,23.862,53.924,23.618z"
              />
              <path
                stroke="#475569"
                strokeWidth={2.5}
                fill="#475569"
                d="M36.001,29c-0.553,0-1,0.447-1,1v16h-10V8c0-0.436-0.282-0.821-0.697-0.953L8.442,2h26.559v16c0,0.553,0.447,1,1,1 s1-0.447,1-1V1c0-0.553-0.447-1-1-1h-34c-0.032,0-0.06,0.015-0.091,0.018C1.854,0.023,1.805,0.036,1.752,0.05 C1.658,0.075,1.574,0.109,1.493,0.158C1.467,0.174,1.436,0.174,1.411,0.192C1.38,0.215,1.356,0.244,1.328,0.269 c-0.017,0.016-0.035,0.03-0.051,0.047C1.201,0.398,1.139,0.489,1.093,0.589c-0.009,0.02-0.014,0.04-0.022,0.06 C1.029,0.761,1.001,0.878,1.001,1v46c0,0.125,0.029,0.243,0.072,0.355c0.014,0.037,0.035,0.068,0.053,0.103 c0.037,0.071,0.079,0.136,0.132,0.196c0.029,0.032,0.058,0.061,0.09,0.09c0.058,0.051,0.123,0.093,0.193,0.13 c0.037,0.02,0.071,0.041,0.111,0.056c0.017,0.006,0.03,0.018,0.047,0.024l22,7C23.797,54.984,23.899,55,24.001,55 c0.21,0,0.417-0.066,0.59-0.192c0.258-0.188,0.41-0.488,0.41-0.808v-6h11c0.553,0,1-0.447,1-1V30 C37.001,29.447,36.553,29,36.001,29z"
              />
            </g>
          </svg>
        </span>

        <span className="flex flex-col px-2 py-3 space-y-4 text-slate-500 text-[13px] font-bold">
          <span onClick={() => {
                fullPageReload(`/profile/${userData.username}`, "window");
              }} className="cursor-pointer w-fit flex flex-row items-center space-x-2">
            <svg
              id="ninja"
              xmlns="http://www.w3.org/2000/svg"
              width="21.904"
              height="21.904"
              viewBox="0 0 21.904 21.904"
            >
              <g
                id="Gruppe_3252"
                data-name="Gruppe 3252"
                transform="translate(0 10.995)"
              >
                <g id="Gruppe_3251" data-name="Gruppe 3251">
                  <path
                    id="Pfad_4697"
                    data-name="Pfad 4697"
                    d="M9.027,261.492C3.989,261.492,0,259.519,0,257v1.925a9.027,9.027,0,0,0,18.054,0V257C18.054,259.519,14.065,261.492,9.027,261.492Z"
                    transform="translate(0 -257)"
                    fill={
                      router.pathname === "/profile" ||
                      router.pathname === "/profile/[user]"
                        ? "#EA334E"
                        : (darkMode ? "white" : "#5d6879")
                    }
                  />
                </g>
              </g>
              <g
                id="Gruppe_3254"
                data-name="Gruppe 3254"
                transform="translate(1.283 7.786)"
              >
                <g id="Gruppe_3253" data-name="Gruppe 3253">
                  <path
                    id="Pfad_4698"
                    data-name="Pfad 4698"
                    d="M37.744,182C33.205,182,30,183.691,30,185.209s3.205,3.209,7.744,3.209,7.744-1.691,7.744-3.209S42.282,182,37.744,182Zm-1.351,4.779a.642.642,0,0,1-.861.287l-2.567-1.283a.642.642,0,0,1,.574-1.148l2.567,1.283A.642.642,0,0,1,36.392,186.779Zm6.13-1-2.567,1.283a.642.642,0,0,1-.574-1.148l2.567-1.283a.642.642,0,0,1,.574,1.148Z"
                    transform="translate(-30 -182)"
                    fill={
                      router.pathname === "/profile" ||
                      router.pathname === "/profile/[user]"
                        ? "#EA334E"
                        : (darkMode ? "white" : "#5d6879")
                    }
                  />
                </g>
              </g>
              <g id="Gruppe_3256" data-name="Gruppe 3256">
                <g id="Gruppe_3255" data-name="Gruppe 3255">
                  <path
                    id="Pfad_4699"
                    data-name="Pfad 4699"
                    d="M9.027,0A9.1,9.1,0,0,0,0,9.07v1.925C0,8.476,3.989,6.5,9.027,6.5s9.027,1.973,9.027,4.492V9.07A9.1,9.1,0,0,0,9.027,0Z"
                    fill={
                      router.pathname === "/profile" ||
                      router.pathname === "/profile/[user]"
                        ? "#EA334E"
                        : (darkMode ? "white" : "#5d6879")
                    }
                  />
                </g>
              </g>
              <g
                id="Gruppe_3258"
                data-name="Gruppe 3258"
                transform="translate(18.251 13.979)"
              >
                <g id="Gruppe_3257" data-name="Gruppe 3257">
                  <path
                    id="Pfad_4700"
                    data-name="Pfad 4700"
                    d="M429.625,326.97h-.752a3.721,3.721,0,0,1-1.228-.225,10.171,10.171,0,0,1-1.031,3.51,5.022,5.022,0,0,0,2.259.565h.752a.641.641,0,0,0,.642-.642v-2.567A.641.641,0,0,0,429.625,326.97Z"
                    transform="translate(-426.614 -326.745)"
                    fill={
                      router.pathname === "/profile" ||
                      router.pathname === "/profile/[user]"
                        ? "#EA334E"
                        : (darkMode ? "white" : "#5d6879")
                    }
                  />
                </g>
              </g>
              <g
                id="Gruppe_3260"
                data-name="Gruppe 3260"
                transform="translate(15.198 18.054)"
              >
                <g id="Gruppe_3259" data-name="Gruppe 3259">
                  <path
                    id="Pfad_4701"
                    data-name="Pfad 4701"
                    d="M358.753,422h-.748a10.471,10.471,0,0,1-2.75,3.052,5.162,5.162,0,0,0,2.745.8h.752a.641.641,0,0,0,.642-.642v-2.567A.641.641,0,0,0,358.753,422Z"
                    transform="translate(-355.256 -422)"
                    fill={
                      router.pathname === "/profile" ||
                      router.pathname === "/profile/[user]"
                        ? "#EA334E"
                        : (darkMode ? "white" : "#5d6879")
                    }
                  />
                </g>
              </g>
            </svg>
            <span
              className={`${
                router.pathname === "/profile" ||
                router.pathname === "/profile/[user]"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}
            >
              Profile
            </span>
          </span>
          <span
            onClick={() => {
              router.push("/settings");
            }}
            className="cursor-pointer w-fit flex flex-row items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.116"
              height="22.113"
              viewBox="0 0 22.116 22.113"
            >
              <g
                id="ninja-blade"
                transform="matrix(0.966, 0.259, -0.259, 0.966, 1.141, -6.117)"
              >
                <path
                  id="Pfad_4702"
                  data-name="Pfad 4702"
                  d="M9.052,15.187a1.2,1.2,0,0,0-.953.686L5.033,22.538a.359.359,0,0,0,.477.477L12.052,20a1.2,1.2,0,0,0,.69-.982,1.23,1.23,0,0,1,2.448-.025,1.2,1.2,0,0,0,.686.953l6.666,3.069a.353.353,0,0,0,.148.032.364.364,0,0,0,.256-.1.352.352,0,0,0,.072-.4L20,16a1.2,1.2,0,0,0-.982-.69,1.228,1.228,0,0,1-.852-1.993,1.206,1.206,0,0,1,.823-.451,1.209,1.209,0,0,0,.953-.686l3.069-6.669a.359.359,0,0,0-.477-.477L16,8.041a1.207,1.207,0,0,0-.693.986,1.221,1.221,0,0,1-.426.827,1.227,1.227,0,0,1-2.018-.8,1.209,1.209,0,0,0-.686-.95L5.506,5.029a.359.359,0,0,0-.477.477l3.015,6.543a1.186,1.186,0,0,0,.982.69,1.233,1.233,0,0,1,.906,1.917,1.189,1.189,0,0,1-.881.531Zm3.69-2.441a1.81,1.81,0,1,1,1.282,3.091,1.813,1.813,0,0,1-1.282-3.091Z"
                  transform="translate(0 0)"
                  fill={router.pathname === "/settings" ? "#EA334E" : (darkMode ? "white" : "#5d6879")}
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  fill={router.pathname === "/settings" ? "#EA334E" : (darkMode ? "white" : "#5d6879")}
                />
              </g>
            </svg>
            <span
              className={`${
                router.pathname === "/settings"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}
            >
              Settings
            </span>
          </span>

          <span
            onClick={() => {
              router.push("/leaderboard");
            }}
            className="cursor-pointer w-fit flex flex-row items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18.399"
              height="20.944"
              viewBox="0 0 18.399 20.944"
            >
              <g id="podium" transform="translate(-4.768)">
                <g
                  id="Gruppe_3296"
                  data-name="Gruppe 3296"
                  transform="translate(9.715)"
                >
                  <g id="Gruppe_3295" data-name="Gruppe 3295">
                    <path
                      id="Pfad_4752"
                      data-name="Pfad 4752"
                      d="M148.347,3.429a.637.637,0,0,0-.5-.466l-2.2-.357L144.673.382a.587.587,0,0,0-1.1,0l-.983,2.224-2.2.357a.637.637,0,0,0-.5.466.741.741,0,0,0,.155.7l1.59,1.731-.376,2.444a.724.724,0,0,0,.244.67.561.561,0,0,0,.646.052l1.965-1.154,1.964,1.154a.56.56,0,0,0,.646-.052.724.724,0,0,0,.244-.67L146.6,5.862l1.59-1.731A.743.743,0,0,0,148.347,3.429Z"
                      transform="translate(-139.869)"
                      fill={
                        router.pathname == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3298"
                  data-name="Gruppe 3298"
                  transform="translate(10.901 10.439)"
                >
                  <g id="Gruppe_3297" data-name="Gruppe 3297">
                    <path
                      id="Pfad_4753"
                      data-name="Pfad 4753"
                      d="M177.776,255.185h-4.906a.652.652,0,0,0-.613.685v9.82h6.133v-9.82A.652.652,0,0,0,177.776,255.185Z"
                      transform="translate(-172.256 -255.185)"
                      fill={
                        router.pathname == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3300"
                  data-name="Gruppe 3300"
                  transform="translate(4.768 13.179)"
                >
                  <g id="Gruppe_3299" data-name="Gruppe 3299">
                    <path
                      id="Pfad_4754"
                      data-name="Pfad 4754"
                      d="M5.381,322.18a.652.652,0,0,0-.613.685V329.4a.516.516,0,0,0,.485.542H9.674V322.18Z"
                      transform="translate(-4.768 -322.18)"
                      fill={
                        router.pathname == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
                <g
                  id="Gruppe_3302"
                  data-name="Gruppe 3302"
                  transform="translate(18.261 15.92)"
                >
                  <g id="Gruppe_3301" data-name="Gruppe 3301">
                    <path
                      id="Pfad_4755"
                      data-name="Pfad 4755"
                      d="M377.535,389.175h-4.293V394.2h4.422a.516.516,0,0,0,.485-.542v-3.8A.652.652,0,0,0,377.535,389.175Z"
                      transform="translate(-373.242 -389.175)"
                      fill={
                        router.pathname == "/leaderboard"
                          ? "#EA334E"
                          : darkMode
                          ? "white"
                          : "#5d6879"
                      }
                    />
                  </g>
                </g>
              </g>
            </svg>
            <span className={`${
                router.pathname === "/leaderboard"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}>Leaderboard</span>
          </span>

          <span
            onClick={() => {
              router.push("/earn");
            }}
            className="cursor-pointer w-fit flex flex-row items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24.818"
              height="24.842"
              viewBox="0 0 19.818 22.944"
            >
              <g id="layer1" transform="translate(-1.059 -280.596)">
                <path
                  id="path4503"
                  d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                  transform="translate(0 0)"
                  fill={
                    router.pathname == "/earn"
                      ? "#EA334E"
                      : darkMode
                      ? "white"
                      : "#5d6879"
                  }
                />
              </g>
            </svg>
            <span
              className={`${
                router.pathname === "/earn"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}
            >
              Earn
            </span>
          </span>

          <span
            onClick={() => {fullPageReload('/privacy-policy')}}
            className="cursor-pointer w-fit flex flex-row items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21.109"
              height="21.109"
              viewBox="0 0 22.109 22.109"
            >
              <g id="file" transform="translate(-3 -3)">
                <path
                  id="Pfad_4708"
                  data-name="Pfad 4708"
                  d="M33.77,24.3A13.2,13.2,0,0,1,31.1,23.3q-.395-.2-.726-.379c-.437-.242-.784-.458-1.011-.605a.158.158,0,0,0-.042-.021,1.053,1.053,0,0,0-1.095.021,15.634,15.634,0,0,1-4.411,1.99A1.061,1.061,0,0,0,23,25.329v.9a7.889,7.889,0,0,0,3.516,6.57l.49.326,1.2.8a1.019,1.019,0,0,0,.311.137h.005a.775.775,0,0,0,.268.042,1.073,1.073,0,0,0,.584-.179l1.69-1.127a7.889,7.889,0,0,0,3.516-6.57v-.9A1.061,1.061,0,0,0,33.77,24.3Zm-3.027,2.879-2.106,2.106a.534.534,0,0,1-.748,0l-1.053-1.053a.529.529,0,1,1,.748-.748l.679.684L30,26.434a.529.529,0,0,1,.748.748Z"
                  transform="translate(-9.472 -9.068)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
                <path
                  id="Pfad_4709"
                  data-name="Pfad 4709"
                  d="M20.151,8.39l-4.5-4.6a2.629,2.629,0,0,0-.542-.421V7.211A1.584,1.584,0,0,0,16.687,8.79h3.785A2.89,2.89,0,0,0,20.151,8.39Zm.716,1.453h-4.18a2.632,2.632,0,0,1-2.632-2.632V3.021A1.722,1.722,0,0,0,13.77,3H5.632A2.632,2.632,0,0,0,3,5.632V22.477a2.632,2.632,0,0,0,2.632,2.632H17.218L16.46,24.6a8.932,8.932,0,0,1-3.985-7.443v-.9a2.106,2.106,0,0,1,.837-1.679H6.685a.526.526,0,1,1,0-1.053h9.339a16.646,16.646,0,0,0,2.153-1.169,2.127,2.127,0,0,1,2.085-.111l.037.016.158.095c.111.074.258.163.442.274v-2.4a2.382,2.382,0,0,0-.032-.39ZM12.475,20.372a.526.526,0,0,1-.526.526H6.685a.526.526,0,0,1,0-1.053h5.264A.526.526,0,0,1,12.475,20.372ZM6.685,16.687H10.9a.526.526,0,1,1,0,1.053H6.685a.526.526,0,0,1,0-1.053Zm0-9.475H10.9a.526.526,0,0,1,0,1.053H6.685a.526.526,0,0,1,0-1.053Zm7.37,4.211H6.685a.526.526,0,1,1,0-1.053h7.37a.526.526,0,0,1,0,1.053Z"
                  fill={darkMode ? "white" : "#5d6879"}
                />
              </g>
            </svg>
            <span className={`${
                router.pathname === "/privacy-policy"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}>Privacy Policy</span>
          </span>
          <span
            onClick={() => {fullPageReload('/terms-of-service')}}
            className="cursor-pointer w-fit flex flex-row items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20.109"
              height="20.313"
              viewBox="0 0 22.109 24.313"
            >
              <g id="Layer_2" data-name="Layer 2" transform="translate(-3 -2)">
                <path
                  id="Pfad_4710"
                  data-name="Pfad 4710"
                  d="M21.424,2H6.685A3.666,3.666,0,0,0,3,5.647V22.666a3.666,3.666,0,0,0,3.685,3.647h14.74a3.666,3.666,0,0,0,3.685-3.647V5.647A3.666,3.666,0,0,0,21.424,2ZM9.141,6.255h4.913a1.216,1.216,0,1,1,0,2.431H9.141a1.216,1.216,0,1,1,0-2.431Zm9.826,15.8H9.141a1.216,1.216,0,1,1,0-2.431h9.826a1.216,1.216,0,1,1,0,2.431Zm0-4.461H9.141a1.216,1.216,0,1,1,0-2.431h9.826a1.216,1.216,0,1,1,0,2.431Zm0-4.449H9.141a1.216,1.216,0,1,1,0-2.431h9.826a1.216,1.216,0,1,1,0,2.431Z"
                  transform="translate(0)"
                  fill={darkMode ? "white" : "#5d6879"}
                />
              </g>
            </svg>
            <span className={`${
                router.pathname === "/terms-of-service"
                  ? "text-[#EA334E]"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}>Terms of service</span>
          </span>
        </span>
        {youMayKnow !== null &&
          youMayKnow !== undefined &&
          youMayKnow.length > 0 && (
            <span className="pt-2 px-2">
              

              <span className="">
                {youMayKnow
                  .slice(sliceIndex, 4 + sliceIndex)
                  .map((thisUser) => {
                    return (
                      <span
                        key={thisUser.id}
                        className={`py-1.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-row justify-between items-center`}
                      >
                        <span
                          onClick={() => {
                            fullPageReload(`/profile/${thisUser.username}`, "window");
                          }}
                          className="cursor-pointer flex justify-start items-center space-x-2"
                        >
                          <span className="relative h-8 w-8 flex">
                            <Image
                              alt="user profile"
                              src={thisUser.avatar}
                              height={35}
                              width={35}
                              className="rounded-full"
                            />
                          </span>
                          <span className="text-sm font-semibold">
                            {thisUser.username}
                          </span>
                        </span>

                        <PlusIcon
                        ymk={true}
                          sideBar={true}
                          alreadyFollowed={alreadyFollowed}
                          setAlreadyFollowed={setAlreadyFollowed}
                          followerUserId={userNumId}
                          followingUserId={thisUser.id}
                          size={"19"}
                          color={"default"}
                        />
                      </span>
                    );
                  })}
                {/* <span className="text-xs underline text-textGreen">{"Show more..."}</span> */}
              </span>
            </span>
          )}

        {router.pathname !== "/inbox" && <span className="p-2 pt-4 text-sm flex flex-col items-start space-y-3">
          <p
            id="anime-book-font"
            className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-600'} text-start font-semibol`}
          >
            CONTENT PREFERENCES
          </p>

          <span className="flex flex-row items-center justify-start space-x-2">
            <input
              type="checkbox"
              value=""
              onChange={(e) => {
                const newState = {
                  ...displayContent,
                  images: e.target.checked,
                };

                setDisplayContent(newState);

                toggleContentFilter(newState);
              }}
              className="w-4 h-4 text-[#EA334E] bg-transparent border-[#EA334E] rounded focus:text-[#EA334E] focus:ring-0"
            />
            <span>Images</span>
          </span>
          <span className="flex flex-row items-center justify-start space-x-2">
            <input
              type="checkbox"
              value=""
              onChange={(e) => {
                const newState = {
                  ...displayContent,
                  videos: e.target.checked,
                };

                setDisplayContent(newState);

                toggleContentFilter(newState);
              }}
              className="w-4 h-4 text-[#EA334E] bg-transparent border-[#EA334E] rounded focus:text-[#EA334E] focus:ring-0"
            />
            <span>Videos</span>
          </span>
          {router.pathname === "/home" && (
            <span className="flex flex-row items-center justify-start space-x-2">
              <input
                type="checkbox"
                value=""
                onChange={(e) => {
                  const newState = {
                    ...displayContent,
                    stories: e.target.checked,
                  };

                  setDisplayContent(newState);

                  toggleContentFilter(newState);
                }}
                className="w-4 h-4 text-[#EA334E] bg-transparent border-[#EA334E] rounded focus:text-[#EA334E] focus:ring-0"
              />
              <span>Stories</span>
            </span>
          )}
          {router.pathname === "/home" && (
            <span className="flex flex-row items-center justify-start space-x-2">
              <input
                type="checkbox"
                value=""
                onChange={(e) => {
                  const newState = {
                    ...displayContent,
                    people: e.target.checked,
                  };

                  setDisplayContent(newState);

                  toggleContentFilter(newState);
                }}
                className="w-4 h-4 text-[#EA334E] bg-transparent border-[#EA334E] rounded focus:text-[#EA334E] focus:ring-0"
              />
              <span>People</span>
            </span>
          )}
        </span>}
        <span className="absolute bottom-2 right-2">
        <DarkModeToggle/>
        </span>
      </div>
      
    </div>
  );
};
export default SideBar;
