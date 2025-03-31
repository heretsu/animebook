import "@/styles/globals.css";
import { UserContext } from "@/lib/userContext";
import { useState, useEffect, useRef } from "react";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import PopupModal from "@/components/popupModal";
import DappLogo from "@/components/dappLogo";
import ConnectionData from "@/lib/connectionData";
import DbUsers from "@/hooks/dbUsers";
import Onboard from "@/components/onboard";
import Relationships from "@/hooks/relationships";
import TOS, { Policy } from "@/components/agreements";
import TutorialBox from "@/components/tutorialBox";
import PreventZoom from "@/lib/preventZoom";

export default function App({ Component, pageProps }) {
  const [videoPlayingId, setVideoPlayingId] = useState(null);
  const [clickFollower, setClickFollower] = useState(false);
  const [clickFollowing, setClickFollowing] = useState(false);

  const videoRef = useRef([]);
  const [openPremium, setOpenPremium] = useState(false);

  const [agreementMade, setAgreementMade] = useState(false);
  const [graduate, setGraduate] = useState(false);
  const [darkMode, setDarkMode] = useState(undefined);
  const { fetchAllPosts, fetchAllReposts, fetchAllPolls } = DbUsers();
  const router = useRouter();
  const [youMayKnow, setYouMayKnow] = useState(null);
  const [newPeople, setNewPeople] = useState(null);

  const [address, setAddress] = useState(null);
  const [userData, setUserData] = useState(undefined);
  const [allSubscriptions, setAllSubscriptions] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openStories, setOpenStories] = useState(false);
  const [userNumId, setUserNumId] = useState("");
  const [postJustMade, setPostJustMade] = useState(false);
  const [NotSignedIn, setNotSignedIn] = useState(false);

  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isImage, setIsImage] = useState(true);
  const [originalPostValues, setOriginalPostValues] = useState(null);
  const [postValues, setPostValues] = useState([]);
  const [userPostValues, setUserPostValues] = useState([]);
  const [storyValues, setStoryValues] = useState([]);
  const [openComments, setOpenComments] = useState(false);
  const [postOwnerDetails, setPostOwnerDetails] = useState(null);
  const [commentValues, setCommentValues] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [storiesFilter, setStoriesFilter] = useState(false);
  const [imagesFilter, setImagesFilter] = useState(false);
  const [videosFilter, setVideosFilter] = useState(false);
  const [tagsFilter, setTagsFilter] = useState(false);
  const [searchFilter, setSearchFilter] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [parentId, setParentId] = useState(null);
  const [hashtagList, setHashtagList] = useState(null);
  const [originalExplorePosts, setOriginalExplorePosts] = useState(null);
  const [explorePosts, setExplorePosts] = useState(null);
  const [chosenTag, setChosenTag] = useState("all");
  const [followingPosts, setFollowingPosts] = useState(false);
  const [storyViews, setStoryViews] = useState(null);

  const [followerObject, setFollowerObject] = useState(null);
  const [followingObject, setFollowingObject] = useState(null);
  const [myProfileRoute, setMyProfileRoute] = useState(false);

  const [deletePost, setDeletePost] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [unreadMessagesLength, setUnreadMessagesLength] = useState(null);
  const [allPolls, setAllPolls] = useState(null);
  const [allCommunityPolls, setAllCommunityPolls] = useState(null);
  const [newListOfComments, setNewListOfComments] = useState(null);
  const inputRef = useRef(null);
  const communityInputRef = useRef(null);

  const [openManga, setOpenManga] = useState(false);
  const [mgComic, setMgComic] = useState(null);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [allUserObject, setAllUserObject] = useState(null);
  const [routedUser, setRoutedUser] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [allUsers, setAllUsers] = useState(null);
  const [oauthDetails, setOauthDetails] = useState(null);
  const [myRelationships, setMyRelationships] = useState(null);
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [notifyUserObject, setNotifyUserObject] = useState(null);
  const [mediasClicked, setMediasClicked] = useState("posts");

  const [userWatchList, setUserWatchList] = useState(null);
  const [currentUserWatchlist, setCurrentUserWatchlist] = useState(null);

  const [communities, setCommunities] = useState(null);
  const { fetchFollowing, fetchFollows } = Relationships();

  const [currentCommunity, setCurrentCommunity] = useState("");
  const [unreadCount, setUnreadCount] = useState(null);
  const commentRef = useRef(null);

  const fetchFollowingAndFollowers = async (userid) => {
    const followings = await fetchFollowing(userid);

    const followers = await fetchFollows(userid);
    setMyRelationships({
      followings: followings.data,
      followers: followers.data,
    });
    return { followings: followings.data, followers: followers.data };
  };

  const fetchCommunities = async (personId) => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    const members = await supabase.from("community_relationships").select("*");

    if (
      data &&
      members !== undefined &&
      members !== null &&
      members.data !== null &&
      members.data !== undefined
    ) {
      const communityMembersCountMap = new Map();
      const userMemberships = new Set();

      members.data.forEach((member) => {
        const communityId = member.communityid;
        communityMembersCountMap.set(
          communityId,
          (communityMembersCountMap.get(communityId) || 0) + 1
        );

        if (personId && member.userid === personId) {
          userMemberships.add(communityId);
        }
      });
      const communitiesWithMembers = data.map((community) => ({
        ...community,
        membersLength: communityMembersCountMap.get(community.id) || 0,
        isAMember: userMemberships.has(community.id),
      }));
      return { data: communitiesWithMembers };
    }
  };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const fetchUnreadChat = async (userNumId) => {
    const response = await supabase
      .from("conversations")
      .select()
      .eq("receiverid", userNumId)
      .order("created_at", { ascending: false });

    const messages = response.data;
    // setEntireMessages(messages);
    const latestMessages = new Map();

    const createConversationKey = (senderId, receiverId) => {
      return [senderId, receiverId].sort().join("-");
    };

    if (messages) {
      messages.forEach((message) => {
        const conversationKey = createConversationKey(
          message.senderid,
          message.receiverid
        );
        if (!latestMessages.has(conversationKey)) {
          latestMessages.set(conversationKey, message);
        }
      });

      const lastChats = Array.from(latestMessages.values());

      return lastChats.filter(
        (lc) => lc.receiverid === userNumId && !lc.rdelete && !lc.isread
      );
    }
  };

  const checkIfUserExistsAndUpdateData = async (user) => {
    try {
      const dbresponse = await supabase.from("users").select("*");

      if (dbresponse.error) {
        console.error("ERROR FROM OUTER USER ID CHECK: ", dbresponse.error);
      } else {
        setAllUsers(dbresponse.data);
        const data = dbresponse.data.find((u) => u.useruuid === user.id);
        /*
        checking if user exists in db after authentication
        if user does not exist i.e(!data) then add user to db   
      */

        if (!data) {
          if (user.user_metadata.preferred_username) {
            const newUser = {
              useruuid: user.id,
              username: user.user_metadata.preferred_username,
              avatar: user.user_metadata.picture
                ? user.user_metadata.picture
                : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
              ki: 0,
            };
            const response = await supabase.from("users").insert([newUser]);

            if (response.error) {
              console.log("ERROR FROM NEW USER INSERTION: ", response.error);
              if (response.error.code === "23503") {
                router.push("/signin");
              }
              return;
            }

            const res = await supabase
              .from("users")
              .select("*")
              .eq("useruuid", user.id);
            if (res.data.length !== 0) {
              if (
                res.data[0].solAddress === null ||
                res.data[0].solAddress === undefined ||
                res.data[0].solAddress === ""
              ) {
                const uid = res.data[0].useruuid;
                const result = await fetch("/api/jim", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ uid }),
                });
                if (result.ok) {
                  const walletData = await result.json();

                  const { error } = await supabase
                    .from("users")
                    .update({
                      solAddress: walletData.address,
                    })
                    .eq("useruuid", walletData.useruuid);
                  if (error) {
                    console.log("error while adding address1: ", error);
                  }
                } else {
                  console.log("Error fetching livestream data");
                }
              }

              setUserNumId(res.data[0].id);
              setDarkMode(res.data[0].theme);
              // if (res.data[0].theme) {
              //   localStorage.getItem("darkMode");
              // }
              setUserData({
                preferred_username: res.data[0].username,
                picture: user.user_metadata.picture
                  ? user.user_metadata.picture
                  : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
                ...res.data[0],
              });

              if (router.pathname === "/profile/[user]") {
                fetchCommunities(res.data[0].id).then((secondResult) => {
                  if (secondResult !== undefined && secondResult !== null) {
                    setCommunities(
                      [...secondResult.data].sort(
                        (a, b) => b.membersLength - a.membersLength
                      )
                    );
                  }
                });
              }

              if (router.pathname !== "/profile/[user]") {
                fetchAllReposts().then((reposts) => {
                  fetchAllPosts().then((result1) => {
                    fetchAllPolls().then((pls) => setAllPolls(pls));
                    fetchCommunities(data.id).then(async (secondResult) => {
                      if (secondResult !== undefined && secondResult !== null) {
                        if (
                          !unreadMessagesLength &&
                          unreadMessagesLength !== 0
                        ) {
                          const unreadMsg = await fetchUnreadChat(data.id);
                          if (unreadMsg) {
                            setUnreadMessagesLength(unreadMsg.length);
                          }
                        }

                        setCommunities(
                          [...secondResult.data].sort(
                            (a, b) => b.membersLength - a.membersLength
                          )
                        );

                        // Make sure we have the fresh posts data:
                        const allPosts = result1.data; // e.g., up-to-date DB fetch

                        // 1) Merge data for each original post
                        const mergedPosts = allPosts.map((post) => {
                          // Try to find if there's a repost record for this post
                          const matchingRepost = reposts.find(
                            (repost) => repost.postid === post.id
                          );

                          if (matchingRepost) {
                            return {
                              ...post,
                              repostAuthor: matchingRepost.users,
                              repostQuote: matchingRepost.quote,
                              repostCreatedAt: matchingRepost.created_at,
                            };
                          } else {
                            return post;
                          }
                        });

                        mergedPosts.sort(
                          (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        );

                        setOriginalPostValues(mergedPosts);
                        setPostValues(mergedPosts);
                      }
                    });
                  });
                });
              }
            } else {
              console.log("ERROR FROM INNER USER ID CHECK: ", res.error);
            }
          } else {
            console.log(user);
            setOnboarding(true);
          }
        } else {
          setAgreementMade(data.agreedpolicies);
          setGraduate(data.readtutorial);
          fetchFollowingAndFollowers(data.id);
          setUserNumId(data.id);
          setAddress(data.address);
          setDarkMode(data.theme);
          setUserData({
            preferred_username: data.username,
            picture: user.user_metadata.picture
              ? user.user_metadata.picture
              : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
            ...data,
          });

          if (router.pathname === "/profile/[user]") {
            fetchCommunities(data.id).then(async (secondResult) => {
              if (secondResult !== undefined && secondResult !== null) {
                setCommunities(
                  [...secondResult.data].sort(
                    (a, b) => b.membersLength - a.membersLength
                  )
                );
              }
            });
          }

          if (router.pathname !== "/profile/[user]") {
            fetchAllReposts().then((reposts) => {
              fetchAllPosts().then((result1) => {
                fetchAllPolls().then((pls) => setAllPolls(pls));
                fetchCommunities(data.id).then(async (secondResult) => {
                  if (secondResult !== undefined && secondResult !== null) {
                    if (!unreadMessagesLength && unreadMessagesLength !== 0) {
                      const unreadMsg = await fetchUnreadChat(data.id);
                      if (unreadMsg) {
                        setUnreadMessagesLength(unreadMsg.length);
                      }
                    }

                    setCommunities(
                      [...secondResult.data].sort(
                        (a, b) => b.membersLength - a.membersLength
                      )
                    );

                    // Make sure we have the fresh posts data:
                    const allPosts = result1.data; // e.g., up-to-date DB fetch

                    // 1) Merge data for each original post
                    const mergedPosts = allPosts.map((post) => {
                      // Try to find if there's a repost record for this post
                      const matchingRepost = reposts.find(
                        (repost) => repost.postid === post.id
                      );

                      if (matchingRepost) {
                        return {
                          ...post,
                          repostAuthor: matchingRepost.users,
                          repostQuote: matchingRepost.quote,
                          repostCreatedAt: matchingRepost.created_at,
                        };
                      } else {
                        return post;
                      }
                    });

                    mergedPosts.sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    );

                    setOriginalPostValues(mergedPosts);
                    setPostValues(mergedPosts);
                  }
                });
              });
            });
          }
          if (
            data.solAddress === null ||
            data.solAddress === undefined ||
            data.solAddress === ""
          ) {
            const uid = data.useruuid;
            const result = await fetch("/api/jim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid }),
            });

            if (result.ok) {
              const walletData = await result.json();

              const { error } = await supabase
                .from("users")
                .update({
                  solAddress: walletData.address,
                })
                .eq("useruuid", walletData.useruuid);
              if (error) {
                console.log("error while adding address2: ", error);
              }
            } else {
              console.log("Error fetching livestream data");
            }
          }
        }
        setSubscribed(true);
      }
      setAuthLoading(false);
    } catch (err) {
      console.log("ERROR FROM USER DATA CATCH BLOCK: ", err);
    }
  };

  const agreeToTerms = async () => {
    const agreeStatus = await supabase
      .from("users")
      .update({ agreedpolicies: true })
      .eq("useruuid", userData.useruuid);
    if (!agreeStatus.error) {
      setAgreementMade(true);
    }
  };

  const graduateTutorial = async () => {
    const scholar = await supabase
      .from("users")
      .update({ readtutorial: true })
      .eq("useruuid", userData.useruuid);
    if (!scholar.error) {
    }
  };

  const [activeVideo, setActiveVideo] = useState(null);

  const handlePlay = (index) => {
    // Pause the currently playing video if there is one
    if (activeVideo !== null && activeVideo === index) {
      videoRef.current[activeVideo]?.play();
      return;
    }

    if (activeVideo !== null && activeVideo !== index) {
      videoRef.current[activeVideo]?.pause();
    }
    // Update active video state
    setActiveVideo(index);

    // Play the new video
    videoRef.current[index]?.play();
  };

  const [allowUnloggedView, setAllowUnloggedView] = useState(false);
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = "#17181C";
      document.documentElement.classList.add("dark");
      document.documentElement.style.backgroundColor = "#17181C";
      localStorage.setItem("darkmode", true);
    } else if (darkMode === null) {
      document.body.style.backgroundColor = "#F9F9F9";
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "#F9F9F9";
      localStorage.setItem("darkmode", false);
    }
    if (
      [
        "/home",
        "/explore",
        "/explore/[hashtag]",
        "/search",
        "/communities",
        "/communities/[community]",
        "/notifications",
        "/profile/[user]",
        "/comments/[comments]",
        "/[username]/post/[postid]",
        "/inbox",
        "/inbox/[message]",
        "/settings",
        "/earn",
        "/reports",
        "/leaderboard",
        "/create",
        "/publishmanga",
        "/subscriptionplan",
      ].includes(router.pathname)
    ) {
      if (!subscribed) {
        setSubscribed(true);
        setAuthLoading(true);
        supabase.auth.onAuthStateChange((event, session) => {
          if (session !== undefined && session !== null) {
            if (session.user === undefined || session.user === null) {
              router.push("/signin");
            } else {
              setOauthDetails(session.user);
              checkIfUserExistsAndUpdateData(session.user);
            }
          } else {
            setAllowUnloggedView(true);
            if (router.pathname !== "/profile/[user]") {
              fetchAllReposts().then((reposts) => {
                fetchAllPosts().then((result1) => {
                  fetchAllPolls().then((pls) => setAllPolls(pls));
                  fetchCommunities(data.id).then(async (secondResult) => {
                    if (secondResult !== undefined && secondResult !== null) {
                      if (!unreadMessagesLength && unreadMessagesLength !== 0) {
                        const unreadMsg = await fetchUnreadChat(data.id);
                        if (unreadMsg) {
                          setUnreadMessagesLength(unreadMsg.length);
                        }
                      }

                      setCommunities(
                        [...secondResult.data].sort(
                          (a, b) => b.membersLength - a.membersLength
                        )
                      );

                      // Make sure we have the fresh posts data:
                      const allPosts = result1.data; // e.g., up-to-date DB fetch

                      // 1) Merge data for each original post
                      const mergedPosts = allPosts.map((post) => {
                        // Try to find if there's a repost record for this post
                        const matchingRepost = reposts.find(
                          (repost) => repost.postid === post.id
                        );

                        if (matchingRepost) {
                          return {
                            ...post,
                            repostAuthor: matchingRepost.users,
                            repostQuote: matchingRepost.quote,
                            repostCreatedAt: matchingRepost.created_at,
                          };
                        } else {
                          return post;
                        }
                      });

                      mergedPosts.sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at)
                      );

                      setOriginalPostValues(mergedPosts);
                      setPostValues(mergedPosts);
                    }
                  });
                });
              });
            }

            console.log("session expired or account not yet created");
            setAuthLoading(false);
            setNotSignedIn(true);
            // router.push("/signin")
          }
        });
      }
    }
  }, [darkMode, address, router.pathname, router, subscribed]);

  return (
    (darkMode !== undefined ||
      router.pathname === "/signin" ||
      allowUnloggedView ||
      onboarding) && (
      <UserContext.Provider
        value={{
          allPolls,
          setAllPolls,
          allCommunityPolls,
          setAllCommunityPolls,
          userWatchList,
          setUserWatchList,
          currentUserWatchlist,
          setCurrentUserWatchlist,
          mediasClicked,
          setMediasClicked,
          clickFollower,
          setClickFollower,
          clickFollowing,
          setClickFollowing,
          allSubscriptions,
          setAllSubscriptions,
          fetchCommunities,
          newListOfComments,
          setNewListOfComments,
          videoRef,
          activeVideo,
          videoPlayingId,
          handlePlay,
          setVideoPlayingId,
          unreadMessagesLength,
          setUnreadMessagesLength,
          darkMode,
          setDarkMode,
          allUsers,
          youMayKnow,
          setYouMayKnow,
          newPeople,
          setNewPeople,
          address,
          userData,
          setUserData,
          subscribed,
          profileOpen,
          setProfileOpen,
          openStories,
          setOpenStories,
          selectedMediaFile,
          setSelectedMediaFile,
          selectedMedia,
          setSelectedMedia,
          userNumId,
          postJustMade,
          setPostJustMade,
          isImage,
          setIsImage,
          originalPostValues,
          setOriginalPostValues,
          postValues,
          setPostValues,
          storyValues,
          setStoryValues,
          commentValues,
          setCommentValues,
          openComments,
          setOpenComments,
          postOwnerDetails,
          setPostOwnerDetails,
          currentStory,
          setCurrentStory,
          storiesFilter,
          setStoriesFilter,
          imagesFilter,
          setImagesFilter,
          videosFilter,
          setVideosFilter,
          tagsFilter,
          setTagsFilter,
          searchFilter,
          setSearchFilter,
          commentMsg,
          setCommentMsg,
          parentId,
          setParentId,
          hashtagList,
          setHashtagList,
          originalExplorePosts,
          setOriginalExplorePosts,
          explorePosts,
          setExplorePosts,
          chosenTag,
          setChosenTag,
          followingPosts,
          setFollowingPosts,
          storyViews,
          setStoryViews,
          followerObject,
          setFollowerObject,
          followingObject,
          setFollowingObject,
          myProfileRoute,
          setMyProfileRoute,
          inputRef,
          communityInputRef,
          address,
          setAddress,
          userPostValues,
          setUserPostValues,
          deletePost,
          setDeletePost,
          playVideo,
          setPlayVideo,
          openManga,
          setOpenManga,
          mgComic,
          setMgComic,
          openPurchaseModal,
          setOpenPurchaseModal,
          allUserObject,
          setAllUserObject,
          NotSignedIn,
          setNotSignedIn,
          routedUser,
          setRoutedUser,
          communities,
          setCommunities,
          myRelationships,
          setMyRelationships,
          sideBarOpened,
          setSideBarOpened,
          notifyUserObject,
          setNotifyUserObject,
          openPremium,
          setOpenPremium,
          currentCommunity,
          setCurrentCommunity,
          unreadCount,
          setUnreadCount,
          commentRef,
        }}
      >
        <PreventZoom />
        <span
          id="baiFont"
          className={`relative w-full max-w-[20px] mx-auto bg-black text-sm sm:text-base`}
        >
          {[
            "/notifications",
            "/create",
            "/publishmanga",
            "/settings",
            "/earn",
            "/reports",
            "/leaderboard",
            "/subscriptionplan",
            "/inbox",
            "/[message]",
            "/privacy-policy",
          ].includes(router.pathname) ? (
            authLoading ? (
              <div className="pt-8">
                <PopupModal success={"4"} messageTopic={""} moreInfo={""} />
                <div id="overlay"></div>
              </div>
            ) : subscribed ? (
              userData ? (
                agreementMade ? (
                  graduate ? (
                    <Component {...pageProps} />
                  ) : (
                    <>
                      <div id="tutorial" className="bg-transparent">
                        <TutorialBox
                          graduateTutorial={graduateTutorial}
                          setGraduate={setGraduate}
                        />
                      </div>

                      <Component {...pageProps} />

                      <div
                        id="tutorial-overlay"
                        className="bg-black backdrop-blur-md"
                      ></div>
                    </>
                  )
                ) : (
                  userData &&
                  !userData.agreedpolicies && (
                    <span
                      className={`${
                        darkMode && "text-white"
                      } flex flex-col space-y-2 py-2`}
                    >
                      <span className="font-medium flex flex-col text-center justify-center items-center">
                        <p>{"By signing in to Animebook,"}</p>
                        <p>
                          {
                            "You acknowledge that you have read and agree to our Terms of Service and Privacy Policy below:"
                          }
                        </p>
                      </span>
                      <span
                        onClick={() => {
                          agreeToTerms();
                        }}
                        className="cursor-pointer mx-auto font-medium bg-pastelGreen text-white py-1 px-3 rounded-lg"
                      >
                        I Agree
                      </span>
                      <span class="h-[80vh] overflow-y-auto block py-2 px-4 border-2 border-slate-300 rounded-lg">
                        <TOS darkMode={darkMode} />
                        <Policy darkMode={darkMode} />
                      </span>
                    </span>
                  )
                )
              ) : (
                <div className="pt-8">
                  <DappLogo size={"default"} />
                  <PopupModal success={"3"} messageTopic={""} moreInfo={""} />
                  <div id="overlay"></div>
                </div>
              )
            ) : (
              <div className="pt-8">
                <DappLogo size={"default"} />
                <PopupModal success={"3"} messageTopic={""} moreInfo={""} />
                <div id="overlay"></div>
              </div>
            )
          ) : onboarding ? (
            <Onboard allUsers={allUsers} me={oauthDetails} />
          ) : userData && agreementMade ? (
            graduate ? (
              <Component {...pageProps} />
            ) : (
              <>
                <div id="tutorial" className="bg-transparent">
                  <TutorialBox
                    graduateTutorial={graduateTutorial}
                    setGraduate={setGraduate}
                  />
                </div>

                <Component {...pageProps} />

                <div
                  id="tutorial-overlay"
                  className="bg-black backdrop-blur-md"
                ></div>
              </>
            )
          ) : userData && !userData.agreedpolicies ? (
            <span
              className={`${
                darkMode && "text-white"
              } flex flex-col space-y-2 py-2`}
            >
              <span className="font-medium flex flex-col text-center justify-center items-center">
                <p>{"By signing in to Animebook,"}</p>
                <p>
                  {
                    "You acknowledge that you have read and agree to our Terms of Service and Privacy Policy below:"
                  }
                </p>
              </span>
              <span
                onClick={() => {
                  agreeToTerms();
                }}
                className="cursor-pointer mx-auto font-medium bg-pastelGreen text-white py-1 px-3 rounded-lg"
              >
                I Agree
              </span>
              <span class="h-[80vh] overflow-y-auto block py-2 px-4 border-2 border-slate-300 rounded-lg">
                <TOS darkMode={darkMode} />
                <Policy darkMode={darkMode} />
              </span>
            </span>
          ) : (
            <Component {...pageProps} />
          )}
        </span>
      </UserContext.Provider>
    )
  );
}
