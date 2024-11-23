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
      <div className="h-full flex flex-col w-full">
        <span className="flex flex-row justify-between items-center bg-gray-100 px-3 py-1.5">
          <span className="text-slate-500 flex flex-row justify-center items-center space-x-2">
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
                        : "#5d6879"
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
                        : "#5d6879"
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
                        : "#5d6879"
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
                        : "#5d6879"
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
                        : "#5d6879"
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
                  : "text-[#5d6879]"
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
                  fill={router.pathname === "/settings" ? "#04dbc4" : "#5d6879"}
                />
                <path
                  id="Pfad_4703"
                  data-name="Pfad 4703"
                  d="M28.838,28.846a1.088,1.088,0,1,0-1.538,0,1.092,1.092,0,0,0,1.538,0Z"
                  transform="translate(-14.048 -14.053)"
                  fill={router.pathname === "/settings" ? "#04dbc4" : "#5d6879"}
                />
              </g>
            </svg>
            <span
              className={`${
                router.pathname === "/settings"
                  ? "text-pastelGreen"
                  : "text-[#5d6879]"
              }`}
            >
              Settings
            </span>
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
                fill={router.pathname === "/earn" ? "#04dbc4" : "#5d6879"}
              />
            </svg>
            <span
              className={`${
                router.pathname === "/earn"
                  ? "text-pastelGreen"
                  : "text-[#5d6879]"
              }`}
            >
              Earn
            </span>
          </span>
          <span
            onClick={() => {}}
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
                  fill="#5d6879"
                />
                <path
                  id="Pfad_4709"
                  data-name="Pfad 4709"
                  d="M20.151,8.39l-4.5-4.6a2.629,2.629,0,0,0-.542-.421V7.211A1.584,1.584,0,0,0,16.687,8.79h3.785A2.89,2.89,0,0,0,20.151,8.39Zm.716,1.453h-4.18a2.632,2.632,0,0,1-2.632-2.632V3.021A1.722,1.722,0,0,0,13.77,3H5.632A2.632,2.632,0,0,0,3,5.632V22.477a2.632,2.632,0,0,0,2.632,2.632H17.218L16.46,24.6a8.932,8.932,0,0,1-3.985-7.443v-.9a2.106,2.106,0,0,1,.837-1.679H6.685a.526.526,0,1,1,0-1.053h9.339a16.646,16.646,0,0,0,2.153-1.169,2.127,2.127,0,0,1,2.085-.111l.037.016.158.095c.111.074.258.163.442.274v-2.4a2.382,2.382,0,0,0-.032-.39ZM12.475,20.372a.526.526,0,0,1-.526.526H6.685a.526.526,0,0,1,0-1.053h5.264A.526.526,0,0,1,12.475,20.372ZM6.685,16.687H10.9a.526.526,0,1,1,0,1.053H6.685a.526.526,0,0,1,0-1.053Zm0-9.475H10.9a.526.526,0,0,1,0,1.053H6.685a.526.526,0,0,1,0-1.053Zm7.37,4.211H6.685a.526.526,0,1,1,0-1.053h7.37a.526.526,0,0,1,0,1.053Z"
                  fill="#5d6879"
                />
              </g>
            </svg>
            <span>Privacy Policy</span>
          </span>
          <span
            onClick={() => {}}
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
                  fill="#5d6879"
                />
              </g>
            </svg>
            <span>Terms of service</span>
          </span>
        </span>
        {youMayKnow !== null &&
          youMayKnow !== undefined &&
          youMayKnow.length > 0 && (
            <span className="pt-2 px-2">
              <p
                id="anime-book-font"
                className="border-t-[1.5px] pt-3 text-xl text-gray-600 text-start font-semibold"
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
                        className="py-1.5 border-b border-gray-200 flex flex-row justify-between items-center"
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

        {router.pathname !== "/inbox" && <span className="bg-white p-2 pt-4 text-sm flex flex-col items-start space-y-3">
          <p
            id="anime-book-font"
            className="text-xl text-gray-600 text-start font-semibold"
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
              className="w-4 h-4 text-pastelGreen bg-white border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
              className="w-4 h-4 text-pastelGreen bg-white border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
                className="w-4 h-4 text-pastelGreen bg-white border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
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
                className="w-4 h-4 text-pastelGreen bg-white border-pastelGreen rounded focus:text-pastelGreen focus:ring-0"
              />
              <span>People</span>
            </span>
          )}
        </span>}
      </div>
    </div>
  );
};
export default SideBar;
