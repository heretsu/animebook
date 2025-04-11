import NavBar, { MobileNavBar } from "@/components/navBar";
import animeBookLogo from "@/assets/animeBookLogo.png";
import animationData from "@/assets/kianimation.json";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import dynamic from "next/dynamic";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import SideBar from "@/components/sideBar";
import supabase from "@/hooks/authenticateUser";
import MVPs from "@/components/mvps";
import DbUsers from "@/hooks/dbUsers";
import Badge from "@/components/badge";
import LargeRightBar from "@/components/largeRightBar";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Leaderboard = () => {
  const { fetchAllPosts } = DbUsers();
  const [loadedData, setLoadedData] = useState(false);

  const { userData, allUsers, originalPostValues, darkMode, sideBarOpened } =
    useContext(UserContext);
  const [selected, setSelected] = useState("ki");
  const [sortedUsers, setSortedUsers] = useState(null);
  const { fullPageReload } = PageLoadOptions();
  const [creatorsArray, setCreatorsArray] = useState([]);
  const [likesMvp, setLikesMvp] = useState(null);
  const [postsMvp, setPostsMvp] = useState(null);
  const [viewsMvp, setViewsMvp] = useState(null);
  const [refMvp, setRefMvp] = useState(null);
  const [followMvp, setFollowMvp] = useState(null);
  const [repostMvp, setRepostMvp] = useState(null);

  const [imgSrcs, setImgSrcs] = useState({});

  const getAllSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        "subscriber(id, username, avatar, subprice), creator(id, username, avatar, subprice)"
      );
    const creatorsMap = {};

    data.forEach(({ creator, subscriber }) => {
      if (!creatorsMap[creator.id]) {
        creatorsMap[creator.id] = {
          ...creator,
          subscribers: [],
        };
      }
      creatorsMap[creator.id].subscribers.push(subscriber);
    });

    const processedCreatorsArray = Object.values(creatorsMap);
    setCreatorsArray(processedCreatorsArray);
  };

  const getMostReposts = async () => {
    const repostCount = new Map();
    const repostUserObjects = new Map();

    const { data, error } = await supabase.from("reposts").select(`
        id, 
        created_at, 
        quote,
        posts (
          id, 
          created_at, 
          users (
            id, 
            avatar, 
            username
          )
        ),
        users (
          id, 
          avatar, 
          username, 
          useruuid, 
          created_at, 
          cover, 
          bio, 
          ki
        )
      `).order("created_at", {ascending: false})

    if (error) {
      console.error("Error fetching reposts:", error);
      return null;
    }

    data.forEach((repost) => {
      const originalUser = repost.posts?.users;
      const reposter = repost.users;

      const createdTime = new Date(repost.created_at).getTime();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      if (createdTime >= oneWeekAgo) {
        if (originalUser && reposter && originalUser.id !== reposter.id) {
          const originalUsername = originalUser.username;

          repostCount.set(
            originalUsername,
            (repostCount.get(originalUsername) || 0) + 1
          );
          repostUserObjects.set(originalUsername, originalUser);
        }
      }
    });

    const maxReposts = Math.max(...repostCount.values(), 0);
    const mostReposts = [...repostUserObjects.values()].filter(
      (user) => repostCount.get(user.username) === maxReposts
    );

    if (mostReposts.length > 0) {
      setRepostMvp({ maxReposts, mostReposts });
    }

    return { maxReposts, mostReposts };
  };

  const getMostPosts = async () => {
    const userPostCount = new Map();
    const userObjects = new Map();

    const posts = await fetchAllPosts();
    if (!posts && !posts.data) {
      return null;
    }

    posts.data.forEach((post) => {
      const user = post.users;

      if (user && user.username) {
        const createdTime = new Date(post.created_at).getTime();
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        if (createdTime >= oneWeekAgo) {
          const username = user.username;

          // Count the post for this user
          userPostCount.set(username, (userPostCount.get(username) || 0) + 1);
          userObjects.set(username, user);
        }
      }
    });

    const maxPosts = Math.max(...userPostCount.values(), 0);
    const mostPosts = [...userObjects.values()].filter(
      (user) => userPostCount.get(user.username) === maxPosts
    );

    if (mostPosts.length > 0) {
      setPostsMvp({ maxPosts, mostPosts }); // Ensure state updates properly
    }

    return { maxPosts, mostPosts };
  };

  const getMostLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("postid, posts(created_at, userid, content, users(*))")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching likes:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No likes found");
      return null;
    }

    const userLikeCount = new Map();
    const userObjects = new Map();
    data.forEach(({ posts }) => {
      if (posts && posts.users) {
        const createdTime = new Date(posts.created_at).getTime();
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        if (createdTime >= oneWeekAgo) {
          const user = posts.users;
          const userId = user.id;
          userLikeCount.set(userId, (userLikeCount.get(userId) || 0) + 1);
          userObjects.set(userId, user);
        }
      }
    });

    const maxLikes = Math.max(...userLikeCount.values());

    const mostLikes = [...userObjects.values()]
      .filter((user) => userLikeCount.get(user.id) === maxLikes)
      .map((user) => ({
        ...user,
        likeCount: maxLikes,
      }));
    console.log(mostLikes);
    if (!mostLikes.length > 0) {
      return null;
    }

    setLikesMvp({ maxLikes, mostLikes });
    return { maxLikes, mostLikes };
  };

  const getMostViews = async () => {
    const { data, error } = await supabase
      .from("views")
      .select("postid, posts(created_at, userid, users(*))")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching views:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No views found");
      return null;
    }

    const userViewCount = new Map();
    const userObjects = new Map();

    data.forEach(({ posts }) => {
      if (posts && posts.users) {
        const createdTime = new Date(posts.created_at).getTime();
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (createdTime >= oneWeekAgo) {
          const user = posts.users;
          const userId = user.id;
          userViewCount.set(userId, (userViewCount.get(userId) || 0) + 1);
          userObjects.set(userId, user);
        }
      }
    });

    if (userViewCount.size === 0) {
      console.log("No views recorded.");
      return null;
    }

    const maxViews = Math.max(...userViewCount.values(), 0);

    // Filter to get all users with the highest views
    const mostViews = [...userObjects.values()]
      .filter((user) => userViewCount.get(user.id) === maxViews)
      .map((user) => ({
        ...user,
        viewCount: maxViews, // Attach number of views
      }));

    if (mostViews.length === 0) {
      return null;
    }
    setViewsMvp({ maxViews, mostViews });
    return { maxViews, mostViews };
  };

  function uniqueFollowers(data) {
    const seenByUser = new Map();

    return data.filter(({ follower_userid, following_userid }) => {
      if (!seenByUser.has(following_userid)) {
        seenByUser.set(following_userid, new Set());
      }

      const seenFollowers = seenByUser.get(following_userid);

      if (seenFollowers.has(follower_userid)) {
        return false; // Duplicate, ignore it
      }

      seenFollowers.add(follower_userid);
      return true; // Count this follow
    });
  }

  const getMostFollows = async () => {
    const { data, error } = await supabase
      .from("relationships")
      .select(
        "follower_userid, following_userid, users!relationships_following_userid_fkey(*)"
      ).order("id", {ascending: false}).limit(10)

    if (error) {
      console.error("Error fetching followers:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No follow records found");
      return null;
    }

    // Ensure each follower is only counted once per `following_userid`
    const uniqueData = uniqueFollowers(data);

    const followCount = new Map();
    const userObjects = new Map();

    uniqueData.forEach(({ following_userid, users }) => {
      if (following_userid && users) {
        followCount.set(
          following_userid,
          (followCount.get(following_userid) || 0) + 1
        );
        userObjects.set(following_userid, users);
      }
    });

    if (followCount.size === 0) {
      console.log("No follow data recorded.");
      return null;
    }

    const maxFollows = Math.max(...followCount.values(), 0);

    const mostFollows = [...userObjects.values()]
      .filter((user) => followCount.get(user.id) === maxFollows)
      .map((user) => ({
        ...user,
        followerCount: maxFollows,
      }));

    if (mostFollows.length === 0) {
      return null;
    }

    const res = await supabase
      .from("relationships")
      .select()
      .eq("following_userid", mostFollows[0].id);
    if (!res) {
      return null;
    }

    setFollowMvp({ maxFollows: uniqueFollowers(res.data).length, mostFollows });
    return { maxFollows: uniqueFollowers(res.data).length, mostFollows };
  };

  const getMostReferrals = async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("referrer, created_at, users!referrals_referrer_fkey(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching referrals:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No referrals found");
      return null;
    }

    const referralCount = new Map();
    const userObjects = new Map();

    data.forEach(({ created_at, referrer, users }) => {
      const createdTime = new Date(created_at).getTime();
      const oneWeekAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (createdTime >= oneWeekAgo) {
        if (referrer && users) {
          referralCount.set(referrer, (referralCount.get(referrer) || 0) + 1);
          userObjects.set(referrer, users); // Store full user object
        }
      }
    });

    if (referralCount.size === 0) {
      console.log("No referrals recorded.");
      return null;
    }

    const maxReferrals = Math.max(...referralCount.values(), 0);

    // Filter to get all users with the highest referral count
    const mostReferrals = [...userObjects.values()]
      .filter((user) => referralCount.get(user.username) === maxReferrals)
      .map((user) => ({
        ...user,
        referralCount: maxReferrals, // Attach number of referrals
      }));

    if (mostReferrals.length === 0) {
      return null;
    }
    setRefMvp({ maxReferrals, mostReferrals });

    return { maxReferrals, mostReferrals };
  };

  const handleImageError = (id) => {
    setImgSrcs((prev) => ({
      ...prev,
      [id]: "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
    }));
  };

  useEffect(() => {
    if (allUsers) {
      const initialSrcs = allUsers.reduce(
        (acc, user) => ({
          ...acc,
          [user.id]:
            user.avatar ||
            "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
        }),
        {}
      );
      setImgSrcs(initialSrcs);
      setSortedUsers(
        allUsers.filter((user) => user.ki > 10).sort((a, b) => b.ki - a.ki)
      );
    }
    if (!loadedData) {
      getAllSubscriptions();
      getMostPosts();
      getMostLikes();
      getMostViews();
      getMostFollows();
      getMostReferrals();
      getMostReposts();
      setLoadedData(true);
    }
  }, [allUsers, loadedData]);

  return (
    sortedUsers &&
    userData && (
      <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
        <div className="hidden lg:block block z-40 sticky top-0">
          <LargeTopBar relationship={false} />
        </div>
        <div className="lg:hidden block z-40 sticky top-0">
          <SmallTopBar relationship={false} />
        </div>
        <section className="relative mb-5 flex flex-row justify-between lg:flex-row lg:space-x-2 w-full">
          <NavBar />
          <div
            className={`${
              darkMode ? "text-white" : "text-black"
            } w-full pb-2 space-y-8 pl-2 lg:pt-0 lg:pb-2 space-y-2 px-2 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col`}
          >
            <div className="block">
              <span
                className={`border rounded ${
                  darkMode
                    ? "bg-[#1E1F24] border-[#292C33] text-gray-300"
                    : "bg-[#FDFDFD] border-[#EEEDEF] text-gray-500"
                } text-center my-4 mx-auto w-[20rem] p-1.5 flex items-center text-sm font-medium space-x-4`}
              >
                <span
                  onClick={() => {
                    setSelected("ki");
                  }}
                  className={`${
                    selected === "ki" &&
                    (darkMode
                      ? "px-3 py-1 bg-[#292C33] text-white border border-[#32353C] rounded-md"
                      : "px-3 py-1 text-black bg-white border border-[#EEEDEF] rounded-md")
                  } cursor-pointer w-[33%]`}
                >
                  KI
                </span>

                <span
                  onClick={() => {
                    setSelected("creators");
                  }}
                  className={`${
                    selected === "creators" &&
                    (darkMode
                      ? "px-3 py-1 bg-[#292C33] text-white border border-[#32353C] rounded-md"
                      : "px-3 py-1 text-black bg-white border border-[#EEEDEF] rounded-md")
                  } cursor-pointer w-[33%]`}
                >
                  Creators
                </span>
                <span
                  onClick={() => {
                    setSelected("mvps");
                  }}
                  className={`${
                    selected === "mvps" &&
                    (darkMode
                      ? "px-3 py-1 bg-[#292C33] text-white border border-[#32353C] rounded-md"
                      : "px-3 py-1 text-black bg-white border border-[#EEEDEF] rounded-md")
                  } cursor-pointer w-[33%] px-3 py-1`}
                >
                  MVPs
                </span>
              </span>
              {selected === "mvps" ? (
                <span
                  id="scrollbar-remove"
                  className="flex flex-col w-full gap-1 flex-row items-center items-center"
                >
                  <span className="text-sm space-x-1 flex items-center w-full max-w-4xl mx-auto p-1 rounded-xl border border-black shadow-md bg-gradient-to-r from-green-100 via-yellow-100 to-yellow-50">
                    <span>
                      <MVPs
                        className={
                          "h-fit flex justify-center items-center w-48"
                        }
                      />
                    </span>
                    <span className="text-black">
                      <p className="font-semibold">
                        {
                          "Compete for weekly MVP awards and highlight your profile with badges!"
                        }
                      </p>
                      <p className="text-xs font-normal">
                        {
                          "MVP awards refresh once a week. Only one badge can be activated at the same time."
                        }
                      </p>
                    </span>
                  </span>

                  <span className="py-2 w-full flex justify-center">
                    <span className="grid grid-cols-2 md:grid-cols-3 w-full gap-2">
                      {likesMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={likesMvp.mostLikes[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"#EB4463"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Most</span>
                                  <span>likes</span>
                                </span>
                                <span className="font-semibold">
                                  {likesMvp.mostLikes[0].username}
                                </span>
                              </span>
                            </span>
                            <span className="hidden lg:flex italic font-bold text-xl">
                              {likesMvp.maxLikes}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            {likesMvp.maxLikes} likes
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {"Given to the user whom received the most likes."}
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${likesMvp.mostLikes[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}

                      {postsMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={postsMvp.mostPosts[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"#63D7C6"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Content</span>
                                  <span>King</span>
                                </span>
                                <span className="font-semibold">
                                  {postsMvp.mostPosts[0].username}
                                </span>
                              </span>
                            </span>

                            <span className="hidden lg:flex italic font-bold text-xl">
                              {postsMvp.maxPosts}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            {postsMvp.maxPosts} posts
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {
                              "Given to the user with the highest number of posts."
                            }
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${postsMvp.mostPosts[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}

                      {viewsMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={viewsMvp.mostViews[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"#FFF500"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Eyes</span>
                                  <span>on</span>
                                  <span>Me</span>
                                </span>
                                <span className="font-semibold">
                                  {viewsMvp.mostViews[0].username}
                                </span>
                              </span>
                            </span>
                            <span className="hidden lg:flex italic font-bold text-xl">
                              {viewsMvp.maxViews}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            {viewsMvp.maxViews} views
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {"Given to the user whom received the most views."}
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${viewsMvp.mostViews[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}
                      {followMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={followMvp.mostFollows[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"#45A9FF"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Famous</span>
                                  <span>Hokage</span>
                                </span>
                                <span className="font-semibold">
                                  {followMvp.mostFollows[0].username}
                                </span>
                              </span>
                            </span>
                            <span className="hidden lg:flex italic font-bold text-xl">
                              {followMvp.maxFollows}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            + {followMvp.maxFollows} followers
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {"Given to the user whom had the most followers."}
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${followMvp.mostFollows[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}
                      {refMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={refMvp.mostReferrals[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"white"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Most</span>
                                  <span>Referrals</span>
                                </span>
                                <span className="font-semibold">
                                  {refMvp.mostReferrals[0].username}
                                </span>
                              </span>
                            </span>
                            <span className="hidden lg:flex italic font-bold text-xl">
                              {refMvp.maxReferrals}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            {refMvp.maxReferrals} referrals
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {"Given to the user whom had the most referrals."}
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${refMvp.mostReferrals[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}

                      {repostMvp && (
                        <span
                          className={`flex flex-col border ${
                            darkMode
                              ? "bg-[#1E1F24] border-[#292C33]"
                              : "bg-white border-[#EEEDEF]"
                          }  pb-4 px-3 rounded-lg w-full`}
                        >
                          <span
                            className={`py-2 ${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } flex flex-row justify-between`}
                          >
                            <span className="flex flex-row space-x-1.5">
                              <span className="relative h-12 w-12 flex">
                                <Image
                                  src={repostMvp.mostReposts[0].avatar}
                                  alt="user profile"
                                  height={50}
                                  width={50}
                                  className={`border-2 ${
                                    darkMode ? "border-white" : "border-black"
                                  } rounded-full object-cover`}
                                />
                                <span className="absolute -mt-1 top-0 right-0 bg-[#292C33] p-1 rounded-full">
                                  <Badge
                                    color={"#B45DFF"}
                                    className={"w-3.5 h-3.5"}
                                  />
                                </span>
                              </span>
                              <span className="text-sm flex flex-col">
                                <span
                                  className={`${
                                    darkMode
                                      ? "text-[#B2B2B2]"
                                      : "text-[#728198]"
                                  } font-medium items-center flex flex-row space-x-1`}
                                >
                                  <span>Most</span>
                                  <span>Reposts</span>
                                </span>
                                <span className="font-semibold">
                                  {repostMvp.mostReposts[0].username}
                                </span>
                              </span>
                            </span>
                            <span className="hidden lg:flex italic font-bold text-xl">
                              {repostMvp.maxReposts}
                            </span>
                          </span>
                          <span
                            className={`${
                              darkMode
                                ? "border-b border-[#292C33]"
                                : "border-b border-[#D0D3DB]"
                            } lg:hidden italic font-bold text-xl`}
                          >
                            {repostMvp.maxReposts} reposts
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-[#728198]"
                            } font-medium py-1 text-sm`}
                          >
                            {
                              "Given to the user whom received the most reposts."
                            }
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${repostMvp.mostReposts[0].username}`, 'window'
                              );
                            }}
                            className={`border ${
                              darkMode
                                ? "text-white border-white text-white"
                                : "text-black border-[#292C33]"
                            } text-sm text-center w-full p-1 rounded-lg cursor-pointer`}
                          >
                            View profile
                          </span>
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              ) : selected === "creators" ? (
                creatorsArray && creatorsArray.length > 0 ? (
                  <>
                    <span
                      id="scrollbar-remove"
                      className="overflow-x-scroll snap-x snap-mandatory scrollbar-hide flex w-full text-black gap-1 flex-row items-center items-center"
                    >
                      <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#D9EED9] via-[#E7EEA8] to-[#FEFDF3] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                        <span className="w-full flex flex-row justify-between items-center">
                          <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                            <span className="relative h-9 w-9 flex">
                              <Image
                                src={creatorsArray[0].avatar}
                                alt="user profile"
                                height={45}
                                width={45}
                                className="border-2 border-black rounded-full object-cover"
                              />
                            </span>
                            <span className="font-semibold">
                              {creatorsArray[0].username}
                            </span>
                          </span>
                          <span className="flex flex-row italic">
                            <span className="xl:text-4xl font-extrabold text-black">
                              1
                            </span>
                            <span className="xl:text-xl xl:pt-1 font-extrabold">
                              st
                            </span>
                          </span>
                        </span>

                        <span className="font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center">
                          <span className="flex flex-col justify-center items-center">
                            <span>
                              {"$"}
                              {parseInt(creatorsArray[0].subprice)}
                            </span>
                            <span className="text-slate-500 text-[0.8rem] font-semibold">
                              Total
                            </span>
                          </span>
                          <span className="flex flex-col justify-center items-center">
                            <span>
                              {"$"}
                              {parseInt(creatorsArray[0].subprice)}
                            </span>
                            <span className="text-slate-500 text-[0.8rem] font-semibold">
                              Subs
                            </span>
                          </span>
                          <span className="flex flex-col justify-center items-center">
                            <span>{"$"}0</span>
                            <span className="text-slate-500 text-[0.8rem] font-semibold">
                              Tips
                            </span>
                          </span>
                        </span>
                        <span
                          onClick={() => {
                            fullPageReload(
                              `/profile/${creatorsArray[0].username}`
                            );
                          }}
                          className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                        >
                          View profile
                        </span>
                      </span>
                      {creatorsArray.length > 1 && (
                        <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#C3C5E3] via-[#D0A8EE] to-[#F8F3FE] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                          <span className="w-full flex flex-row justify-between items-center">
                            <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                              <span className="relative h-9 w-9 flex">
                                <Image
                                  src={creatorsArray[1].avatar}
                                  alt="user profile"
                                  height={45}
                                  width={45}
                                  className="border-2 border-black rounded-full object-cover"
                                />
                              </span>
                              <span className="font-semibold">
                                {creatorsArray[1].username}
                              </span>
                            </span>
                            <span className="flex flex-row italic">
                              <span className="xl:text-4xl font-extrabold text-black">
                                2
                              </span>
                              <span className="xl:text-xl xl:pt-1 font-extrabold">
                                nd
                              </span>
                            </span>
                          </span>

                          <span className="font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center">
                            <span className="flex flex-col justify-center items-center">
                              <span>
                                {"$"}
                                {parseInt(creatorsArray[1].subprice)}
                              </span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Total
                              </span>
                            </span>
                            <span className="flex flex-col justify-center items-center">
                              <span>
                                {"$"}
                                {parseInt(creatorsArray[1].subprice)}
                              </span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Subs
                              </span>
                            </span>
                            <span className="flex flex-col justify-center items-center">
                              <span>{"$"}0</span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Tips
                              </span>
                            </span>
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${creatorsArray[1].username}`
                              );
                            }}
                            className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                          >
                            View profile
                          </span>
                        </span>
                      )}
                      {creatorsArray.length > 2 && (
                        <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#C3E3DC] via-[#A8EBEE] to-[#F3FEFD] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                          <span className="w-full flex flex-row justify-between items-center">
                            <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                              <span className="relative h-9 w-9 flex">
                                <Image
                                  src={creatorsArray[2].avatar}
                                  alt="user profile"
                                  height={45}
                                  width={45}
                                  className="border-2 border-black rounded-full object-cover"
                                />
                              </span>
                              <span className="font-semibold">
                                {creatorsArray[2].username}
                              </span>
                            </span>
                            <span className="flex flex-row italic">
                              <span className="xl:text-4xl font-extrabold text-black">
                                3
                              </span>
                              <span className="xl:text-xl xl:pt-1 font-extrabold">
                                rd
                              </span>
                            </span>
                          </span>

                          <span className="font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center">
                            <span className="flex flex-col justify-center items-center">
                              <span>
                                {"$"}
                                {parseInt(creatorsArray[2].subprice)}
                              </span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Total
                              </span>
                            </span>
                            <span className="flex flex-col justify-center items-center">
                              <span>
                                {"$"}
                                {parseInt(creatorsArray[2].subprice)}
                              </span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Subs
                              </span>
                            </span>
                            <span className="flex flex-col justify-center items-center">
                              <span>{"$"}0</span>
                              <span className="text-slate-500 text-[0.8rem] font-semibold">
                                Tips
                              </span>
                            </span>
                          </span>
                          <span
                            onClick={() => {
                              fullPageReload(
                                `/profile/${creatorsArray[2].username}`
                              );
                            }}
                            className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                          >
                            View profile
                          </span>
                        </span>
                      )}
                    </span>

                    <table className="min-w-full">
                      <thead>
                        <div className="pt-5 pb-0.5 px-6 flex items-center justify-between">
                          <th className="font-medium text-start w-[10%]">
                            Rank
                          </th>
                          <th className="font-medium text-center w-[30%] lg:w-[22.5%]">
                            Name
                          </th>
                          <th className="lg:hidden font-medium text-center w-[30%]">
                            Total
                          </th>
                          <th className="lg:hidden font-medium text-center w-[30%]">
                            Subs
                          </th>

                          <th className="hidden lg:block font-medium text-center w-[22.5%]">
                            Total
                          </th>
                          <th className="hidden lg:block font-medium text-center w-[22.5%]">
                            Subs
                          </th>
                          <th className="hidden lg:block font-medium text-center w-[22.5%]">
                            Tips
                          </th>
                        </div>
                      </thead>
                      <tbody>
                        {creatorsArray.map((user, index) => (
                          <tr key={user.id} className="bg-transparent">
                            <td colSpan="5" className="py-1">
                              <div
                                className={`border ${
                                  darkMode
                                    ? "bg-[#1E1F24] border-[#292C33]"
                                    : "bg-white border-[#EEEDEF]"
                                } text-[12px] lg:text-sm font-medium rounded-lg shadow-sm p-6 flex items-center justify-between`}
                              >
                                <span className="italic font-bold text-3xl w-[10%] text-left">
                                  {index + 1}
                                </span>

                                <span
                                  onClick={() =>
                                    fullPageReload(`/profile/${user.username}`)
                                  }
                                  className="w-[30%] lg:w-[22.5%] flex items-center space-x-1 lg:space-x-3 cursor-pointer flex-0 lg:flex-1"
                                >
                                  <Image
                                    src={imgSrcs[user.id]}
                                    alt="user profile"
                                    height={40}
                                    width={40}
                                    className="flex-shrink-0 h-8 w-8 lg:h-fit rounded-full object-cover border border-black"
                                    onError={() => handleImageError(user.id)}
                                  />
                                  <span className="text-[12px] lg:text-sm">
                                    {user.username || "Anonymous"}
                                  </span>
                                </span>

                                <span className="w-[30%] lg:w-[22.5%] text-center">
                                  {`$${
                                    parseFloat(user.subprice).toFixed(0) *
                                    user.subscribers.length
                                  }`}
                                </span>
                                <span
                                  className={`w-[30%] lg:w-[22.5%] text-center ${
                                    darkMode ? "" : "text-gray-600"
                                  }`}
                                >
                                  {`$${parseFloat(user.subprice).toFixed(0)}`}
                                </span>
                                <span
                                  className={`hidden lg:block w-[22.5%] text-center ${
                                    darkMode ? "" : "text-gray-600"
                                  }`}
                                >
                                  {"$"}0
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  "No creators yet"
                )
              ) : (
                <>
                  <span
                    id="scrollbar-remove"
                    className="overflow-x-scroll snap-x snap-mandatory scrollbar-hide flex w-full text-black gap-1 flex-row items-center items-center"
                  >
                    <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#D9EED9] via-[#E7EEA8] to-[#FEFDF3] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                      <span className="w-full flex flex-row justify-between items-center">
                        <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                          <span className="relative h-9 w-9 flex">
                            <Image
                              src={sortedUsers[0].avatar}
                              alt="user profile"
                              height={45}
                              width={45}
                              className="border-2 border-black rounded-full object-cover"
                            />
                          </span>
                          <span className="font-semibold">
                            {sortedUsers[0].username}
                          </span>
                        </span>
                        <span className="flex flex-row italic">
                          <span className="xl:text-4xl font-extrabold text-black">
                            1
                          </span>
                          <span className="xl:text-xl xl:pt-1 font-extrabold">
                            st
                          </span>
                        </span>
                      </span>

                      <span className="font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center">
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[0].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            KI
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[0].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Earned
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>0</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Spent
                          </span>
                        </span>
                      </span>
                      <span
                        onClick={() => {
                          fullPageReload(`/profile/${sortedUsers[0].username}`);
                        }}
                        className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                      >
                        View profile
                      </span>
                    </span>
                    <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#C3C5E3] via-[#D0A8EE] to-[#F8F3FE] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                      <span className="w-full flex flex-row justify-between items-center">
                        <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                          <span className="relative h-9 w-9 flex">
                            <Image
                              src={sortedUsers[1].avatar}
                              alt="user profile"
                              height={45}
                              width={45}
                              className="border-2 border-black rounded-full object-cover"
                            />
                          </span>
                          <span className="font-semibold">
                            {sortedUsers[1].username}
                          </span>
                        </span>
                        <span className="flex flex-row italic">
                          <span className="xl:text-4xl font-extrabold text-black">
                            2
                          </span>
                          <span className="xl:text-xl xl:pt-1 font-extrabold">
                            nd
                          </span>
                        </span>
                      </span>

                      <span className="font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center">
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[1].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            KI
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[1].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Earned
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>0</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Spent
                          </span>
                        </span>
                      </span>
                      <span
                        onClick={() => {
                          fullPageReload(`/profile/${sortedUsers[1].username}`);
                        }}
                        className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                      >
                        View profile
                      </span>
                    </span>
                    <span className="w-[90vw] flex-shrink-0 lg:flex-shrink lg:w-1/3 p-2 flex flex-col space-y-2 border border-black bg-gradient-to-r from-[#C3E3DC] via-[#A8EBEE] to-[#F3FEFD] via-50% opacity-95 backdrop-blur-md rounded-lg items-center justify-center">
                      <span className="w-full flex flex-row justify-between items-center">
                        <span className="text-xs xl:text-base gap-1.5 flex flex-row items-center">
                          <span className="relative h-9 w-9 flex">
                            <Image
                              src={sortedUsers[2].avatar}
                              alt="user profile"
                              height={45}
                              width={45}
                              className="border-2 border-black rounded-full object-cover"
                            />
                          </span>
                          <span className="font-semibold">
                            {sortedUsers[2].username}
                          </span>
                        </span>
                        <span className="flex flex-row italic">
                          <span className="xl:text-4xl font-extrabold text-black">
                            3
                          </span>
                          <span className="xl:text-xl xl:pt-1 font-extrabold">
                            rd
                          </span>
                        </span>
                      </span>

                      <span
                        className={`font-bold py-2.5 px-4 rounded-lg text-xs bg-white bg-opacity-30 backdrop-blur-md flex flex-row w-full justify-between items-center`}
                      >
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[2].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            KI
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>{parseInt(sortedUsers[2].ki)}</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Earned
                          </span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span>0</span>
                          <span className="text-slate-500 text-[0.8rem] font-semibold">
                            Spent
                          </span>
                        </span>
                      </span>
                      <span
                        onClick={() => {
                          fullPageReload(`/profile/${sortedUsers[2].username}`);
                        }}
                        className="cursor-default text-white text-sm font-medium text-center py-2 w-full bg-black rounded-lg"
                      >
                        View profile
                      </span>
                    </span>
                  </span>

                  <table className="min-w-full">
                    <thead>
                      <div className="pt-5 pb-0.5 px-6 flex items-center justify-between">
                        <th className="font-medium text-start w-[10%]">Rank</th>
                        <th className="font-medium text-center w-fit w-[30%] lg:w-[22.5%]">
                          Name
                        </th>
                        <th className="lg:hidden font-medium text-center w-[30%]">
                          Balance
                        </th>
                        <th className="lg:hidden font-medium text-center w-[30%]">
                          Earned
                        </th>

                        <th className="hidden lg:block font-medium text-center w-[22.5%]">
                          Ki Balance
                        </th>
                        <th className="hidden lg:block font-medium text-center w-[22.5%]">
                          Ki Earned
                        </th>
                        <th className="hidden lg:block font-medium text-center w-[22.5%]">
                          Ki Spent
                        </th>
                      </div>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user, index) => (
                        <tr key={user.id} className="bg-transparent">
                          <td colSpan="5" className="py-1">
                            <div
                              className={`border ${
                                darkMode
                                  ? "bg-[#1E1F24] border-[#292C33]"
                                  : "bg-white border-[#EEEDEF]"
                              } text-[12px] lg:text-sm font-medium rounded-lg shadow-sm p-6 flex items-center justify-between`}
                            >
                              <span className="italic font-bold text-3xl w-[10%] text-left">
                                {index + 1}
                              </span>

                              <span
                                onClick={() =>
                                  fullPageReload(`/profile/${user.username}`)
                                }
                                className="w-[30%] lg:w-[22.5%] flex items-center space-x-1 lg:space-x-3 cursor-pointer flex-0 lg:flex-1"
                              >
                                <Image
                                  src={imgSrcs[user.id]}
                                  alt="user profile"
                                  height={40}
                                  width={40}
                                  className="h-5 lg:h-fit rounded-full object-cover border border-black"
                                  onError={() => handleImageError(user.id)}
                                />
                                <span className="text-[12px] lg:text-sm">
                                  {user.username || "Anonymous"}
                                </span>
                              </span>

                              <span className="w-[30%] lg:w-[22.5%] text-center">
                                {parseFloat(user.ki).toFixed(3)}
                              </span>
                              <span
                                className={`w-[30%] lg:w-[22.5%] text-center ${
                                  darkMode ? "" : "text-gray-600"
                                }`}
                              >
                                {parseFloat(user.ki).toFixed(3)}
                              </span>
                              <span
                                className={`hidden lg:block w-[22.5%] text-center ${
                                  darkMode ? "" : "text-gray-600"
                                }`}
                              >
                                0
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
          <div className="hidden lg:block sticky right-2 top-20 heighto">
            <LargeRightBar />
          </div>
        </section>
        {sideBarOpened && <SideBar />}

        <MobileNavBar />
      </main>
    )
  );
};

export default Leaderboard;
