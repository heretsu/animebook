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

export default function App({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(null)
  const { fetchAllPosts, fetchAllReposts } = DbUsers();
  const router = useRouter();
  const [youMayKnow, setYouMayKnow] = useState(null);
  const [newPeople, setNewPeople] = useState(null);

  const [address, setAddress] = useState(null);
  const [userData, setUserData] = useState(undefined);
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
  const [postIdForComment, setPostIdForComment] = useState(null);
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
  const [chosenTag, setChosenTag] = useState("");
  const [followingPosts, setFollowingPosts] = useState(false);
  const [storyViews, setStoryViews] = useState(null);

  const [followerObject, setFollowerObject] = useState(null);
  const [followingObject, setFollowingObject] = useState(null);
  const [myProfileRoute, setMyProfileRoute] = useState(false);

  const [deletePost, setDeletePost] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);

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

  const [communities, setCommunities] = useState(null);
  const { fetchFollowing, fetchFollows } = Relationships();

  const fetchFollowingAndFollowers = async (userid) => {
    const followings = await fetchFollowing(userid);

    const followers = await fetchFollows(userid);
    setMyRelationships({
      followings: followings.data,
      followers: followers.data,
    });
    return { followings: followings.data, followers: followers.data };
  };

  const fetchCommunities = async () => {
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
      members.data.forEach((member) => {
        const communityId = member.communityid;
        communityMembersCountMap.set(
          communityId,
          (communityMembersCountMap.get(communityId) || 0) + 1
        );
      });
      const communitiesWithMembers = data.map((community) => ({
        ...community,
        membersLength: communityMembersCountMap.get(community.id) || 0,
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
              setDarkMode(res.data[0].theme)
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

              if (router.pathname !== "/profile/[user]") {
                fetchAllReposts().then((reposts) => {
                  fetchAllPosts().then((result1) => {
                    fetchCommunities().then((secondResult) => {
                      if (secondResult !== undefined && secondResult !== null) {
                        // const sortedCommunities = [...communitiesWithMembers].sort((a, b) => b.membersLength - a.membersLength);

                        setCommunities(
                          [...secondResult.data].sort(
                            (a, b) => b.membersLength - a.membersLength
                          )
                        );
                        setOriginalPostValues(
                          reposts
                            .map((repost) => {
                              const originalPost = result1.data.find(
                                (post) => post.id === repost.postid
                              );

                              if (originalPost) {
                                return {
                                  ...originalPost,
                                  repostAuthor: repost.users,
                                  repostQuote: repost.quote,
                                  repostCreatedAt: repost.created_at,
                                };
                              }
                              return null;
                            })
                            .filter(Boolean)
                            .concat(
                              result1.data.filter(
                                (post) =>
                                  !reposts.some(
                                    (repost) => repost.postid === post.id
                                  )
                              )
                            )
                            .sort((a, b) => {
                              const dateA = new Date(
                                a.repostQuote ? a.repostCreatedAt : a.created_at
                              );
                              const dateB = new Date(
                                b.repostQuote ? b.repostCreatedAt : b.created_at
                              );
                              return dateB - dateA;
                            })
                        );
                        setPostValues(
                          reposts
                            .map((repost) => {
                              const originalPost = result1.data.find(
                                (post) => post.id === repost.postid
                              );

                              if (originalPost) {
                                return {
                                  ...originalPost,
                                  repostAuthor: repost.users,
                                  repostQuote: repost.quote,
                                  repostCreatedAt: repost.created_at,
                                };
                              }
                              return null;
                            })
                            .filter(Boolean)
                            .concat(
                              result1.data.filter(
                                (post) =>
                                  !reposts.some(
                                    (repost) => repost.postid === post.id
                                  )
                              )
                            )
                            .sort((a, b) => {
                              const dateA = new Date(
                                a.repostQuote ? a.repostCreatedAt : a.created_at
                              );
                              const dateB = new Date(
                                b.repostQuote ? b.repostCreatedAt : b.created_at
                              );
                              return dateB - dateA;
                            })
                        );
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
          fetchFollowingAndFollowers(data.id);
          setUserNumId(data.id);
          setAddress(data.address);
          setDarkMode(data.theme)
          setUserData({
            preferred_username: data.username,
            picture: user.user_metadata.picture
              ? user.user_metadata.picture
              : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
            ...data,
          });

          if (router.pathname !== "/profile/[user]") {
            fetchAllReposts().then((reposts) => {
              fetchAllPosts().then((result1) => {
                fetchCommunities().then((secondResult) => {
                  if (secondResult !== undefined && secondResult !== null) {
                    setCommunities(
                      [...secondResult.data].sort(
                        (a, b) => b.membersLength - a.membersLength
                      )
                    );
                    setOriginalPostValues(
                      reposts
                        .map((repost) => {
                          const originalPost = result1.data.find(
                            (post) => post.id === repost.postid
                          );

                          if (originalPost) {
                            return {
                              ...originalPost,
                              repostAuthor: repost.users,
                              repostQuote: repost.quote,
                              repostCreatedAt: repost.created_at,
                            };
                          }
                          return null;
                        })
                        .filter(Boolean)
                        .concat(
                          result1.data.filter(
                            (post) =>
                              !reposts.some(
                                (repost) => repost.postid === post.id
                              )
                          )
                        )
                        .sort((a, b) => {
                          const dateA = new Date(
                            a.repostQuote ? a.repostCreatedAt : a.created_at
                          );
                          const dateB = new Date(
                            b.repostQuote ? b.repostCreatedAt : b.created_at
                          );
                          return dateB - dateA;
                        })
                    );
                    setPostValues(
                      reposts
                        .map((repost) => {
                          const originalPost = result1.data.find(
                            (post) => post.id === repost.postid
                          );

                          if (originalPost) {
                            return {
                              ...originalPost,
                              repostAuthor: repost.users,
                              repostQuote: repost.quote,
                              repostCreatedAt: repost.created_at,
                            };
                          }
                          return null;
                        })
                        .filter(Boolean)
                        .concat(
                          result1.data.filter(
                            (post) =>
                              !reposts.some(
                                (repost) => repost.postid === post.id
                              )
                          )
                        )
                        .sort((a, b) => {
                          const dateA = new Date(
                            a.repostQuote ? a.repostCreatedAt : a.created_at
                          );
                          const dateB = new Date(
                            b.repostQuote ? b.repostCreatedAt : b.created_at
                          );
                          return dateB - dateA;
                        })
                    );
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

  useEffect(() => {
    if (darkMode){
        document.body.style.backgroundColor = "black"
    } else {
      document.body.style.backgroundColor = "#e8edf1"
    }
    if (
      [
        "/home",
        "/explore",
        "/search",
        "/communities",
        "/communities/[community]",
        "/notifications",
        "/profile/[user]",
        "/comments/[comments]",
        "/inbox",
        "/inbox/[message]",
        "/settings",
        "/earn",
        "/leaderboard",
        "/create",
        "/publishmanga",
        "/subscriptionplan",
      ].includes(router.pathname)
    ) {
      if (!subscribed) {
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
            if (router.pathname !== "/profile/[user]") {
              fetchAllReposts().then((reposts) => {
                fetchAllPosts().then((result1) => {
                  fetchCommunities().then((secondResult) => {
                    if (secondResult !== undefined && secondResult !== null) {
                      setCommunities(
                        [...secondResult.data].sort(
                          (a, b) => b.membersLength - a.membersLength
                        )
                      );
                      setOriginalPostValues(
                        reposts
                          .map((repost) => {
                            const originalPost = result1.data.find(
                              (post) => post.id === repost.postid
                            );

                            if (originalPost) {
                              return {
                                ...originalPost,
                                repostAuthor: repost.users,
                                repostQuote: repost.quote,
                                repostCreatedAt: repost.created_at,
                              };
                            }
                            return null;
                          })
                          .filter(Boolean)
                          .concat(
                            result1.data.filter(
                              (post) =>
                                !reposts.some(
                                  (repost) => repost.postid === post.id
                                )
                            )
                          )
                          .sort((a, b) => {
                            const dateA = new Date(
                              a.repostQuote ? a.repostCreatedAt : a.created_at
                            );
                            const dateB = new Date(
                              b.repostQuote ? b.repostCreatedAt : b.created_at
                            );
                            return dateB - dateA;
                          })
                      );
                      setPostValues(
                        reposts
                          .map((repost) => {
                            const originalPost = result1.data.find(
                              (post) => post.id === repost.postid
                            );

                            if (originalPost) {
                              return {
                                ...originalPost,
                                repostAuthor: repost.users,
                                repostQuote: repost.quote,
                                repostCreatedAt: repost.created_at,
                              };
                            }
                            return null;
                          })
                          .filter(Boolean)
                          .concat(
                            result1.data.filter(
                              (post) =>
                                !reposts.some(
                                  (repost) => repost.postid === post.id
                                )
                            )
                          )
                          .sort((a, b) => {
                            const dateA = new Date(
                              a.repostQuote ? a.repostCreatedAt : a.created_at
                            );
                            const dateB = new Date(
                              b.repostQuote ? b.repostCreatedAt : b.created_at
                            );
                            return dateB - dateA;
                          })
                      );
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
    <UserContext.Provider
      value={{
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
        postIdForComment,
        setPostIdForComment,
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
      }}
    >
      <span className="text-sm sm:text-base">
        {[
          "/notifications",
          "/create",
          "/publishmanga",
          "/settings",
          "/earn",
          "/leaderboard",
          "/subscriptionplan",
          "/inbox",
          "/[message]",
        ].includes(router.pathname) ? (
          authLoading ? (
            <div className="pt-8">
              <PopupModal success={"4"} messageTopic={""} moreInfo={""} />
              <div id="overlay"></div>
            </div>
          ) : subscribed ? (
            userData ? (
              <Component {...pageProps} />
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
        ) : (
          <Component {...pageProps} />
        )}
      </span>
    </UserContext.Provider>
  );
}
