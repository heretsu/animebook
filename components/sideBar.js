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
      const media = post[0].media?.toLowerCase();
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
                  fullPageReload(`/profile/${userData.username}`);
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
                fullPageReload(`/profile/${userData.username}`);
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
                        ? "#04dbc4"
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
                        ? "#04dbc4"
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
                        ? "#04dbc4"
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
                        ? "#04dbc4"
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
                        ? "#04dbc4"
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
                  ? "text-pastelGreen"
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
                  fill={router.pathname === "/settings" ? "#04dbc4" : (darkMode ? "white" : "#5d6879")}
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  fill={router.pathname === "/settings" ? "#04dbc4" : (darkMode ? "white" : "#5d6879")}
                />
              </g>
            </svg>
            <span
              className={`${
                router.pathname === "/settings"
                  ? "text-pastelGreen"
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
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="22.318px"
              height="25.966px"
              viewBox="0 0 180.763 180.763"
              fill={darkMode ? "white" : "#5d6879"}
              style={{
                enableBackground: "new 0 0 180.763 180.763",
              }}
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path d="M30.862,53.125c7.155,0,12.976-8.312,12.976-15.469c0-7.17-5.821-12.982-12.976-12.982 c-7.173,0-12.982,5.812-12.982,12.982C17.88,44.812,23.689,53.125,30.862,53.125z" />
                  <path d="M56.267,62.167c-0.091-0.375-0.171-0.749-0.347-1.093c-0.134-0.256-0.329-0.454-0.505-0.686 c-0.231-0.304-0.444-0.605-0.737-0.861c-0.231-0.192-0.505-0.311-0.767-0.466c-0.262-0.149-0.481-0.368-0.78-0.475 c-0.462-0.167-10.79-3.873-20.289-4.357l-1.303,2.606h-0.031l3.453,26.923l-4.098,7.17l-4.11-7.17l3.453-26.923h-0.037 l-1.303-2.606c-9.493,0.493-19.814,4.189-20.283,4.357c-0.298,0.107-0.518,0.326-0.785,0.481 c-0.262,0.149-0.524,0.262-0.755,0.454c-0.305,0.255-0.518,0.569-0.755,0.88c-0.165,0.225-0.347,0.411-0.487,0.66 c-0.183,0.351-0.262,0.725-0.359,1.111c-0.061,0.237-0.189,0.43-0.219,0.667l-4.11,36.949c-0.311,2.819,1.717,5.358,4.542,5.675 c0.189,0.019,0.377,0.03,0.572,0.03c2.582,0,4.798-1.942,5.091-4.561l3.745-33.661c0.433-0.131,0.914-0.268,1.425-0.411v35.028 l-4.08,50.796c-0.274,3.386,2.247,6.356,5.639,6.631c0.17,0.013,0.335,0.013,0.505,0.013c3.172,0,5.87-2.442,6.132-5.664 l3.69-45.905c0.767,0.335,1.602,0.529,2.49,0.529c0.883,0,1.717-0.194,2.479-0.529l3.69,45.905 c0.262,3.222,2.959,5.664,6.132,5.664c0.17,0,0.329,0,0.505-0.013c3.392-0.274,5.919-3.245,5.645-6.631l-4.086-50.796V66.861 c0.512,0.144,0.987,0.28,1.419,0.411l3.745,33.661c0.292,2.618,2.509,4.561,5.09,4.561c0.195,0,0.384-0.012,0.579-0.03 c2.813-0.311,4.841-2.855,4.53-5.675L56.486,62.84C56.461,62.596,56.333,62.396,56.267,62.167z" />
                  <path d="M116.793,38.885c-0.024-0.255-0.11-0.462-0.171-0.618l-0.109-0.332c-0.085-0.353-0.177-0.721-0.378-1.114 c-0.128-0.225-0.273-0.42-0.432-0.618l-0.201-0.262c-0.22-0.301-0.451-0.612-0.792-0.904c-0.194-0.167-0.42-0.292-0.651-0.417 l-0.219-0.125c-0.079-0.046-0.152-0.095-0.22-0.144c-0.177-0.125-0.39-0.283-0.682-0.387c-1.09-0.387-10.613-3.717-19.771-4.335 c6.363-1.757,10.984-9.277,10.984-15.869C104.151,6.174,97.978,0,90.396,0c-7.587,0-13.762,6.174-13.762,13.761 c0,6.591,4.622,14.112,10.985,15.869c-9.152,0.624-18.682,3.948-19.766,4.335c-0.292,0.104-0.518,0.268-0.7,0.393 c-0.073,0.049-0.14,0.107-0.219,0.144l-0.201,0.112c-0.207,0.113-0.438,0.234-0.652,0.411c-0.341,0.286-0.584,0.615-0.883,1.017 l-0.134,0.167c-0.146,0.186-0.298,0.374-0.408,0.6c-0.201,0.378-0.292,0.752-0.39,1.114l0.712,0.356l-0.816-0.019 c-0.061,0.155-0.146,0.356-0.17,0.603L59.89,75.815c-0.171,1.571,0.268,3.118,1.26,4.345c0.986,1.236,2.393,2.01,3.964,2.183 c3.227,0.326,6.168-2,6.527-5.218l3.604-32.498v33.302l-4.08,50.796c-0.152,1.839,0.426,3.642,1.632,5.054 c1.2,1.413,2.875,2.271,4.731,2.424c3.854,0.268,7.161-2.606,7.465-6.363l3.617-44.901c1.169,0.316,2.405,0.316,3.58,0 l3.617,44.901c0.286,3.574,3.312,6.388,6.898,6.388c0.189,0,0.372-0.013,0.566-0.024c1.846-0.152,3.526-1.011,4.731-2.424 c1.2-1.412,1.778-3.203,1.632-5.054l-4.086-50.732V44.621l3.611,32.498c0.354,3.218,3.282,5.55,6.521,5.218 c3.245-0.362,5.59-3.285,5.225-6.527L116.793,38.885z M78.193,13.773c0-6.729,5.475-12.203,12.203-12.203 s12.196,5.474,12.196,12.203c0,6.655-5.443,14.69-12.196,14.69C83.637,28.463,78.193,20.429,78.193,13.773z M90.597,32.187h-0.407 l-1.176-2.35c0.463,0.061,0.914,0.191,1.389,0.191s0.913-0.131,1.376-0.191L90.597,32.187z M93.69,59.722l-3.294,5.766 l-3.301-5.766l3.301-25.69L93.69,59.722z M115.508,80.815c-2.351,0.286-4.536-1.47-4.805-3.845l-3.738-33.658l-0.061-0.518 l-2.923-0.843v36.121l4.086,50.792c0.115,1.432-0.342,2.819-1.267,3.916c-0.932,1.096-2.235,1.76-3.66,1.875 c-2.947,0.207-5.565-2.01-5.803-4.932L93.562,82.73l-1.005,0.441c-1.406,0.618-2.94,0.618-4.348,0l-1.004-0.441l-3.775,46.994 c-0.225,2.776-2.582,4.956-5.358,4.956c-0.146,0-0.292-0.013-0.432-0.024c-1.438-0.115-2.74-0.779-3.666-1.875 c-0.932-1.097-1.382-2.484-1.267-3.916l4.086-50.859v-36.06l-2.923,0.843l-3.787,34.176c-0.262,2.368-2.442,4.125-4.811,3.845 c-1.157-0.131-2.192-0.697-2.917-1.607c-0.73-0.91-1.053-2.046-0.932-3.206l4.104-36.949c0.006-0.04,0.036-0.125,0.067-0.195 c0.042-0.119,0.097-0.234,0.17-0.536c0.073-0.298,0.134-0.56,0.256-0.779c0.067-0.131,0.158-0.231,0.243-0.344l0.256-0.329 c0.189-0.25,0.347-0.469,0.554-0.643c0.091-0.082,0.225-0.149,0.384-0.237l0.255-0.137c0.122-0.067,0.226-0.144,0.341-0.226 c0.122-0.085,0.231-0.161,0.323-0.198c0.426-0.155,10.382-3.706,19.552-4.284l1.004,2l-3.452,26.887l4.914,8.598l4.914-8.58 l-3.459-26.893l0.999-1.988c9.176,0.578,19.132,4.128,19.552,4.284c0.092,0.031,0.195,0.113,0.323,0.192 c0.109,0.082,0.225,0.158,0.334,0.225l0.263,0.143c0.14,0.076,0.279,0.144,0.383,0.237c0.201,0.168,0.366,0.387,0.628,0.743 l0.17,0.21c0.092,0.122,0.189,0.231,0.262,0.356c0.11,0.225,0.171,0.481,0.293,0.929c0.03,0.134,0.079,0.256,0.128,0.38 c0.03,0.076,0.061,0.158,0.066,0.201l4.11,36.949C119.618,78.397,117.895,80.547,115.508,80.815z" />
                  <path d="M149.93,53.125c7.155,0,12.977-8.312,12.977-15.469c0-7.17-5.821-12.982-12.977-12.982 c-7.167,0-12.981,5.812-12.981,12.982C136.948,44.812,142.757,53.125,149.93,53.125z" />
                  <path d="M175.56,62.846c-0.031-0.25-0.159-0.45-0.22-0.679c-0.104-0.375-0.177-0.749-0.359-1.093 c-0.134-0.256-0.329-0.454-0.505-0.686c-0.226-0.304-0.438-0.605-0.731-0.861c-0.231-0.192-0.505-0.311-0.767-0.466 c-0.262-0.149-0.481-0.368-0.779-0.475c-0.463-0.167-10.797-3.873-20.283-4.357l-1.315,2.606h-0.03l3.459,26.923l-4.11,7.17 l-4.104-7.17l3.453-26.923h-0.037l-1.303-2.606c-9.487,0.493-19.82,4.189-20.283,4.357c-0.299,0.107-0.518,0.326-0.785,0.481 c-0.256,0.149-0.524,0.262-0.749,0.454c-0.305,0.255-0.518,0.569-0.762,0.88c-0.158,0.225-0.347,0.411-0.48,0.66 c-0.177,0.351-0.262,0.725-0.359,1.111c-0.055,0.237-0.188,0.43-0.22,0.667l-4.104,36.949c-0.311,2.819,1.717,5.358,4.536,5.675 c0.195,0.019,0.378,0.03,0.572,0.03c2.576,0,4.805-1.942,5.091-4.561l3.738-33.661c0.438-0.131,0.914-0.268,1.425-0.411v35.028 l-4.085,50.796c-0.269,3.386,2.246,6.356,5.65,6.631c0.164,0.013,0.329,0.013,0.493,0.013c3.179,0,5.87-2.442,6.132-5.664 l3.689-45.905c0.762,0.335,1.596,0.529,2.484,0.529c0.884,0,1.724-0.194,2.484-0.529l3.696,45.905 c0.262,3.222,2.953,5.664,6.126,5.664c0.171,0,0.341,0,0.506-0.013c3.392-0.274,5.918-3.245,5.645-6.631l-4.086-50.796V66.861 c0.512,0.144,0.986,0.28,1.431,0.411l3.739,33.661c0.292,2.618,2.515,4.561,5.09,4.561c0.189,0,0.378-0.012,0.572-0.03 c2.819-0.311,4.854-2.855,4.537-5.675L175.56,62.846z" />
                  <polygon points="67.562,146.31 67.562,163.237 83.941,180.763 115.203,147.979 115.203,131.209 84.027,163.913  " />
                </g>
              </g>
            </svg>
            <span className={`${
                router.pathname === "/leaderboard"
                  ? "text-pastelGreen"
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
              width="22.317"
              height="19.842"
              viewBox="0 0 22.317 19.842"
            >
              <path
                id="sushi-roll"
                d="M21.078,14.516V10.534c0-1.882-2.483-3.3-5.78-3.3s-5.78,1.422-5.78,3.3v3.981C6.427,14.624,4.14,16,4.14,17.808v5.96c0,1.882,2.483,3.3,5.78,3.3,2.511,0,4.554-.825,5.379-2.055.825,1.23,2.868,2.055,5.379,2.055,3.3,0,5.78-1.422,5.78-3.3v-5.96c0-1.806-2.287-3.184-5.379-3.292ZM13.757,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0ZM9.92,20.311c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5S12.671,20.311,9.92,20.311Zm5.379-7.27c-2.752,0-4.979-1.121-4.979-2.507s2.227-2.5,4.979-2.5,4.979,1.109,4.979,2.5S18.05,13.042,15.3,13.042Zm3.837.777v.8c-.268.036-.525.088-.773.144v-.945a.4.4,0,0,1,.773,0ZM24.511,24.2a.4.4,0,0,1-.773,0v-.445a.4.4,0,0,1,.773,0Zm0-1.838a.4.4,0,0,1-.773,0V21.092a.4.4,0,0,1,.773,0Zm-3.837-2.047c-2.752,0-4.979-1.121-4.979-2.5s2.227-2.5,4.979-2.5,4.979,1.121,4.979,2.5-2.223,2.5-4.975,2.5Zm0-4.129c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.228-.725,3.228-1.6-1.434-1.622-3.216-1.622ZM18.247,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.1-.144-1.71-.6-1.71-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.862,6.862,0,0,0-.653.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.577.629-1.71.773ZM9.9,16.182c-1.782,0-3.228.725-3.228,1.622s1.446,1.6,3.228,1.6,3.224-.725,3.224-1.6-1.43-1.622-3.2-1.622ZM7.472,17.8c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.085-.144-1.694-.6-1.694-.773Zm2.4.381a7.266,7.266,0,0,0-.673-.993c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148a6.861,6.861,0,0,0-.637.993Zm.7.4a6.048,6.048,0,0,1,.977-1.314c.493.192.761.425.761.537s-.573.629-1.694.773ZM15.3,8.912c-1.782,0-3.228.725-3.228,1.622s1.446,1.622,3.228,1.622,3.228-.725,3.228-1.622S17.089,8.912,15.3,8.912Zm-2.4,1.622c0-.112.264-.344.749-.533a6.224,6.224,0,0,1,.973,1.306c-1.129-.144-1.722-.6-1.722-.773Zm2.4.381a7.265,7.265,0,0,0-.673-.973c-.036-.048-.084-.1-.124-.144a5.423,5.423,0,0,1,.8-.064,5.207,5.207,0,0,1,.8.06c-.04.052-.084.1-.124.148A6.861,6.861,0,0,0,15.3,10.915Zm.7.4A6.048,6.048,0,0,1,16.973,10c.493.192.761.425.761.537A2.466,2.466,0,0,1,16,11.311Z"
                transform="translate(-4.14 -7.23)"
                fill={router.pathname === "/earn" ? "#04dbc4" : (darkMode ? "white" : "#5d6879")}
              />
            </svg>
            <span
              className={`${
                router.pathname === "/earn"
                  ? "text-pastelGreen"
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
                  ? "text-pastelGreen"
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
                  ? "text-pastelGreen"
                  : (darkMode ? "text-white" : "text-[#5d6879]")
              }`}>Terms of service</span>
          </span>
        </span>
        {youMayKnow !== null &&
          youMayKnow !== undefined &&
          youMayKnow.length > 0 && (
            <span className="pt-2 px-2">
              <p
                id="anime-book-font"
                className={`border-t-[1.5px] pt-3 text-xl ${darkMode ? 'text-gray-200 border-gray-700' : 'text-gray-600'} text-start font-semibold`}
              >
                YOU MAY KNOW
              </p>

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
                            fullPageReload(`/profile/${thisUser.username}`);
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
            className={`text-xl ${darkMode ? 'text-gray-200' : 'text-gray-600'} text-start font-semibol`}
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
              className="w-4 h-4 text-pastelGreen bg-transparent border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
              className="w-4 h-4 text-pastelGreen bg-transparent border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
                className="w-4 h-4 text-pastelGreen bg-transparent border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
                className="w-4 h-4 text-pastelGreen bg-transparent border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
