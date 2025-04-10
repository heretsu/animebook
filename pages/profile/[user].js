import { useState, useContext, useEffect, useRef } from "react";
import Image from "next/image";
import PlusIcon from "@/components/plusIcon";
import Posts from "@/components/posts";
import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import LargeRightBar from "@/components/largeRightBar";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import Spinner from "@/components/spinner";
import PopupModal from "@/components/popupModal";
import PriceFeedStation from "@/lib/priceFeedStation";
import { ethers } from "ethers";
import ConnectionData from "@/lib/connectionData";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import SideBar from "@/components/sideBar";
import animationData from "@/assets/kianimation.json";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json";
import DappLibrary from "@/lib/dappLibrary";
import { BinSvg } from "@/components/communityPostCard";
import dynamic from "next/dynamic";
import UserContainer from "@/components/userContainer";
import SubYuki from "@/components/subYuki";
import ExploreBox from "@/utils/explorebox";
import free from "@/assets/chibis/free.jpg";
import { BiggerUserWithBadge } from "@/components/userWithBadge";
import customBorder from "@/assets/customborder.png";
import customBorder2 from "@/assets/customborder2.png";


const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const getServerSideProps = async (context) => {
  const { user } = context.query;
  return {
    props: {
      user: user.toLowerCase().trim(),
    },
  };
};

export function AvatarWB({ border, userInfo, size }) {
  return (
    <div className={`relative w-[${size}px] h-[${size}px]`}>
      {/* The border ring */}
      {border === 1 ? <Image src={customBorder} alt="custom border" fill className="object-contain" /> : border === 2 ? <Image src={customBorder2} alt="custom border" fill className="object-contain" /> : '' }
      {/* The user avatar */}
      <Image
        src={userInfo.avatar}
        alt="user avatar"
        width={size}
        height={size}
        className="object-cover rounded-full p-2"
      />
    </div>
  );
}
export default function User({ user }) {
  const { getUserFromId } = DappLibrary();
  const { connectToWallet, disconnectWallet } = ConnectionData();
  const { getUsdPrice } = PriceFeedStation();
  const router = useRouter();
  const {
    fetchAllUsers,
    fetchAllPolls,
    fetchAllPosts,
    fetchAllReposts,
    fetchUserMangas,
  } = DbUsers();
  const { fetchFollowing, fetchFollows } = Relationships();
  const {
    userWatchList,
    setUserWatchList,
    currentUserWatchlist,
    setCurrentUserWatchlist,
    userChibis,
    setUserChibis,
    currentUserChibis,

    setCurrentUserChibis,

    clickFollower,
    setClickFollower,
    clickFollowing,
    setClickFollowing,
    setAllSubscriptions,
    userPostValues,
    setUserPostValues,
    setPostValues,
    setOriginalPostValues,
    userNumId,
    followerObject,
    setFollowerObject,
    followingObject,
    setFollowingObject,
    setMyProfileRoute,
    deletePost,
    setDeletePost,
    openPurchaseModal,
    mgComic,
    openManga,
    setOpenPurchaseModal,
    setMgComic,
    setOpenManga,
    setAllUserObject,
    userData,
    setRoutedUser,
    sideBarOpened,
    darkMode,
    postValues,
    openPremium,
    setOpenPremium,
    handlePlay,
    videoRef,
    mediasClicked,
    setMediasClicked,
    allSubscriptions,
    setAllPolls,
    likesMvp,
    postsMvp,
    viewsMvp,
    refMvp,
    followMvp,
    repostMvp,
  } = useContext(UserContext);

  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [itsMe, setItsMe] = useState(false);
  const [userBasicInfo, setUserBasicInfo] = useState(null);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [mangaObjects, setMangaObjects] = useState(null);
  const [openTipModal, setOpenTipModal] = useState(false);
  const [subscribedUser, setSubscribedUser] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [contentToDisplay, setContentToDisplay] = useState(null);
  const [ePosts, setEPosts] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);

  const [mangaIndex, setMangaIndex] = useState(0);
  const fetchFollowingAndFollowers = async (userid) => {
    const followings = await fetchFollowing(userid);

    const followers = await fetchFollows(userid);
    return { followings, followers };
  };

  const unfollowThisUser = (followerUserId, followingUserId) => {
    supabase
      .from("relationships")
      .delete()
      .match({
        follower_userid: followerUserId,
        following_userid: followingUserId,
      })
      .then((res) => {
        setAlreadyFollowed(false);
        setFollowingObject(
          followingObject.filter((f) => f.follower_userid !== followerUserId)
        );
        console.log("done");
        console.log("success output: ", res);
      })
      .catch((e) => console.log(e));
  };

  function userSpecificPosts(data) {
    // console.log(data.find((r)=>{return r.id == 2542}))
    const filteredUserPosts = data.filter((r) => {
      // console.log(r.id === 2542)
      return (
        r.users.username.trim().toLowerCase() === user.trim().toLowerCase() ||
        (r.repostAuthor &&
          r.repostAuthor.username &&
          r.repostAuthor.username.trim().toLowerCase() ===
            user.trim().toLowerCase())
      );
    });
    setPostValues(filteredUserPosts);
    setUserPostValues(filteredUserPosts);
  }

  function getMangas(userInfo) {
    setMangaLoading(true);
    fetchUserMangas(userInfo.id).then((result) => {
      if (result.data) {
        setMangaObjects(result.data);
      }
      setMangaLoading(false);
    });
  }

  const getDateJoined = (memberDate) => {
    const joinedDate = memberDate.split("T")[0];
    const [year, month, day] = joinedDate.split("-");
    const reversedDate = `${day}-${month}-${year}`;
    return reversedDate;
  };

  const mangaToggle = (status) => {
    if (status) {
      if (mangaIndex + 1 < mgComic.filepaths.length) {
        setMangaIndex(mangaIndex + 1);
      }
    } else {
      if (mangaIndex - 1 >= 0) {
        setMangaIndex(mangaIndex - 1);
      }
    }
  };

  const checkPurchaseOrSubscribe = async (mg) => {
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    let allowRead = false;
    const { data } = await supabase.from("subscriptions").select().match({
      subscriber: userNumId,
      creator: userBasicInfo.id,
    });

    if (data && data.length > 0) {
      allowRead = true;
    } else {
      const response = await supabase.from("purchases").select().match({
        mangaid: mg.id,
        userid: userNumId,
      });
      if (response.data && response.data.length > 0) {
        allowRead = true;
      }
    }
    return allowRead;
  };

  const [openSub, setOpenSub] = useState(false);
  const [folValue, setFolValue] = useState("");
  const [wingValue, setWingValue] = useState("");
  const [tempFol, setTempFol] = useState(null);
  const [wingFol, setWingFol] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  const folSearch = (e, data, fSwitch) => {
    setSearchActive(true);

    if (fSwitch) {
      setFolValue(e.target.value);
      setTempFol(
        data.filter((an) => {
          return getUserFromId(an.follower_userid)
            .username.toLowerCase()
            .includes(e.target.value.toLowerCase());
        })
      );
    } else {
      setWingValue(e.target.value);
      setWingFol(
        data.filter((an) => {
          return getUserFromId(an.following_userid)
            .username.toLowerCase()
            .includes(e.target.value.toLowerCase());
        })
      );
    }
  };

  const fetchAllAnimes = (userid) => {
    supabase
      .from("animes")
      .select(
        "id, created_at, title, trailer, image, users(id, avatar, username), rating"
      )
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUserWatchList(res.data);
          if (userid) {
            setCurrentUserWatchlist(
              res.data.filter((c) => {
                return c.users.id === userid;
              })
            );
          }
        }
      });
  };

  const fetchAllChibis = (userid) => {
    supabase
      .from("chibis")
      .select("id, created_at, collectionid, users(id, avatar, username)")
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setUserChibis(res.data);
          if (userid) {
            setCurrentUserChibis(
              res.data.filter((c) => {
                return c.users.id === userid;
              })
            );
          }
        }
      });
  };

  const subscribeToPublisher = async () => {
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    try {
      if (userBasicInfo.subprice === 0) {
        setSubscribedUser(true);
        const { error } = await supabase.from("subscriptions").insert({
          subscriber: userNumId,
          creator: userBasicInfo.id,
        });
      } else {
        setOpenSub(true);
        // const prs = await getUsdPrice();
        // const sendAmount = parseFloat(userBasicInfo.subprice) / prs.ethPrice;
        // const wei = ethers.utils.parseUnits(
        //   sendAmount.toFixed(18).toString(),
        //   18
        // );

        // const { provider } = await connectToWallet();
        // let transactionResponse = null;

        // transactionResponse = await provider.getSigner().sendTransaction({
        //   to: userBasicInfo.address,
        //   value: wei,
        // });

        // const receipt = await transactionResponse.wait();

        // if (receipt) {
        //   const { error } = await supabase.from("subscriptions").insert({
        //     subscriber: userNumId,
        //     creator: userBasicInfo.id,
        //   });
        //   if (!error) {
        //     setSubscribedUser(true);
        //   }
        // }
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const readManga = async (mg) => {
    if (userData === undefined || userData === null) {
      PageLoadOptions().fullPageReload("/signin");
      return;
    }
    if (itsMe) {
      setMgComic(mg);
      setOpenManga(true);
    } else {
      const res = await checkPurchaseOrSubscribe(mg);
      if (res) {
        setMgComic(mg);
        setOpenManga(true);
      } else {
        setMgComic(mg);
        setOpenPurchaseModal(true);
      }
    }
  };

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

  function uniqueFollowers(data, followingMe) {
    const seen = new Set();
    return data.filter((item) => {
      const identifier = followingMe
        ? item.following_userid
        : item.follower_userid;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }
  const getNextMedia = (posts, startIndex) => {
    for (let i = startIndex; i < posts.length; i++) {
      if (posts[i]?.media) return posts[i]?.media;
    }
    return null; // No media found
  };

  const [deskMode, setDeskMode] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);

  const [userNotFound, setUserNotFound] = useState(false);

  const [valuesLoaded, setValuesLoaded] = useState(false);

  const [deletionModal, setDeletionModal] = useState(null);

  const deleteManga = (series) => {
    setOpenManga(false);
    setDeletionModal(series);
  };

  const deleteMangaFromDB = (id) => {
    supabase
      .from("mangas")
      .delete()
      .eq("id", id)
      .then((res) => {
        setMangaObjects(
          mangaObjects.filter((m) => {
            return m.id !== id;
          })
        );
        setDeletionModal(null);
        setOpenManga(false);
      });
  };
  const [loadedState, setLoadedState] = useState(false);
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Calculate how many 80px width images fit (including spacing)
    const containerWidth = containerRef.current.offsetWidth;
    const itemWidth = 84; // 80px image + 4px spacing
    const maxVisible = Math.ceil(containerWidth / itemWidth);

    setVisibleCount(maxVisible);
  }, [postValues]);

  const [postsLoaded, setPostsLoaded] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setRoutedUser(user);
    if (!loadedState) {
      fetchAllUsers().then((r) => {
        setAllUserObject(r.data);
        if (r.data !== null && r.data !== undefined && r.data.length !== 0) {
          const currentUserExtraInfo = r.data.find((c) => {
            return (
              c.username.toLowerCase().trim() === user.toLowerCase().trim()
            );
          });

          if (!currentUserExtraInfo) {
            setUserNotFound(true);
            return;
          }
          fetchAllChibis(currentUserExtraInfo.id);
          fetchAllAnimes(currentUserExtraInfo.id);
          setItsMe(currentUserExtraInfo.id === userNumId);
          if (currentUserExtraInfo.id === userNumId) {
            setMyProfileRoute(true);
          }

          fetchFollowingAndFollowers(currentUserExtraInfo.id)
            .then((res) => {
              supabase
                .from("subscriptions")
                .select()
                .match({
                  creator: currentUserExtraInfo.id, // Fetch all subscribers for this creator
                })
                .then(({ data, error }) => {
                  if (error) {
                    console.error("Error fetching subscriptions:", error);
                    return;
                  }

                  if (data?.length > 0) {
                    setAllSubscriptions(data);

                    const isSubscribed = data.some(
                      (sub) => sub.subscriber === userNumId
                    );

                    if (isSubscribed) {
                      setSubscribedUser(true);
                    }
                  }
                })
                .catch((e) => {
                  console.log("error", e);
                });
              setFollowerObject(uniqueFollowers(res.followings.data, true));
              setFollowingObject(uniqueFollowers(res.followers.data, false));

              setAlreadyFollowed(
                !!res.followers.data.find(
                  (rel) => rel.follower_userid === userNumId
                )
              );
              setUserBasicInfo(currentUserExtraInfo);
              setLoadedState(true);
            })
            .catch((e) => {
              console.log(e);
              setLoadedState(true);
            });
        }
      });
    }

    if (!postsLoaded) {
      setPostsLoaded(true);
      fetchAllPosts().then((result1) => {
        fetchAllReposts().then((reposts) => {
          fetchAllPolls().then((pls) => setAllPolls(pls));
          const userPostsAndReposts = result1.data.map((post) => {
            const matchingRepost = reposts.find(
              (repost) => repost.postid === post.id
            );

            if (
              matchingRepost &&
              matchingRepost.users &&
              matchingRepost.users.username.trim().toLowerCase() ===
                user.trim().toLowerCase()
            ) {
              return {
                ...post,
                repostAuthor: matchingRepost.users,
                repostQuote: matchingRepost.quote,
                repostCreatedAt: matchingRepost.created_at,
              };
            }

            return post;
          });

          const sortedPosts = userPostsAndReposts.sort((a, b) => {
            const dateA = new Date(
              a.repostQuote ? a.repostCreatedAt : a.created_at
            );
            const dateB = new Date(
              b.repostQuote ? b.repostCreatedAt : b.created_at
            );
            return dateB - dateA;
          });
          requestAnimationFrame(() => {
            userSpecificPosts(sortedPosts);
            setOriginalPostValues(sortedPosts);
            setDone(true);
          });
          //   userSpecificPosts(userPostsAndReposts);
          // setOriginalPostValues(userPostsAndReposts);
        });
      });
    }

    // fetchAllPosts().then((result) => {
    //   if (result.data !== null && result.data !== undefined) {
    //     userSpecificPosts(result);
    //     setOriginalPostValues(result.data);
    //   }
    // });
    if (userBasicInfo && userBasicInfo.avatar && !valuesLoaded) {
      getMangas(userBasicInfo);
      setImgSrc(userBasicInfo.avatar);
      setValuesLoaded(true);
    }
    const handleRouteChange = () => {
      setValuesLoaded(false); // Reset state on route change
      if (userBasicInfo && userBasicInfo.avatar) {
        setImgSrc(userBasicInfo.avatar);
        setValuesLoaded(true);
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    // Cleanup listener on component unmount
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [done, postsLoaded, loadedState, userNumId, userBasicInfo, valuesLoaded]);

  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={true} />
      </div>
      <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
        <NavBar />
        <SmallTopBar middleTab={true} relationship={true} />
        {userBasicInfo !== null && userBasicInfo !== undefined ? (
          <div className="w-full py-2 space-y-5 px-2 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] mt-2 lg:mt-20 flex flex-col">
            <div className="flex flex-col space-y-3">
              {openPremium ? (
                !itsMe ? (
                  <span className="flex flex-col space-y">
                    <span
                      className={`border rounded ${
                        darkMode
                          ? "bg-[#1E1F24] border-[#292C33] text-white"
                          : "bg-white border-[#EEEDEF] text-black"
                      } items-center px-3 py-2 flex flex-row space-x-2 text-sm`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20.637"
                        height="20.615"
                        viewBox="0 0 23.637 23.615"
                        fill={darkMode ? "white" : "black"}
                      >
                        <path
                          id="about"
                          d="M12.808,1A11.791,11.791,0,0,0,2.416,18.393l-1.36,4.533a1.312,1.312,0,0,0,1.257,1.69,1.337,1.337,0,0,0,.378-.055L7.223,23.2A11.808,11.808,0,1,0,12.808,1Zm0,5.248A1.312,1.312,0,1,1,11.5,7.56,1.312,1.312,0,0,1,12.808,6.248Zm1.312,13.12H12.808A1.312,1.312,0,0,1,11.5,18.055V12.808a1.312,1.312,0,1,1,0-2.624h1.312A1.312,1.312,0,0,1,14.12,11.5v5.248a1.312,1.312,0,1,1,0,2.624Z"
                          transform="translate(-1 -1)"
                        />
                      </svg>
                      <span>
                        {
                          "Premium content can be unlocked by subscribing (payed) to the creator or purchasing them."
                        }
                      </span>
                    </span>
                    <span className="relative px-8 text-white max-h-[200px] mt-7 rounded-xl border border-black flex flex-row items-center justify-between w-full bg-gradient-to-b from-[#7B1FA2] via-[#D63384] to-[#E57373] relative w-fit">
                      <span className="flex flex-col space-y-1">
                        <span className="font-bold text-xl">
                          {"Subscribe and Save!"}
                        </span>
                        <span className="text-xs font-semibold lg:font-medium pb-4 flex flex-col justify-start w-fit left-0">
                          <span>{`Subscribe to ${userBasicInfo.username} now and unlock all published`}</span>
                          <span>{" and upcoming premium content."}</span>
                        </span>
                        {userBasicInfo && userBasicInfo.subprice && (
                          <span
                            onClick={() => {
                              if (!subscribedUser) {
                                subscribeToPublisher();
                              }
                            }}
                            className={`w-fit cursor-pointer text-[0.85rem] font-medium text-black bg-white rounded py-2 px-7`}
                          >
                            {subscribedUser
                              ? "Subscribed"
                              : `$${parseFloat(userBasicInfo.subprice).toFixed(
                                  2
                                )}/month`}
                          </span>
                        )}
                      </span>

                      <span className="relative -mt-1 flex flex-end w-fit max-h-[220px] overflow-y-hidden flex flex-shrink-1 items-center justify-start">
                        <SubYuki
                          width={""}
                          height={""}
                          className={"-mt-3 bottom-0 h-[555px] w-[400px]"}
                        />
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="w-full text-slate-500 text-center text-base md:text-base">{`You ${
                    userBasicInfo.subprice ? "" : "currently"
                  } charge your subscribers ${
                    userBasicInfo.subprice
                      ? "$" + parseFloat(userBasicInfo.subprice).toFixed(2)
                      : "nothing"
                  } per month`}</span>
                )
              ) : (
                <span className="relative flex h-[200px] w-full">
                  {userBasicInfo.cover ? (
                    <span>
                      <Image
                        src={userBasicInfo.cover}
                        alt="user profile"
                        fill={true}
                        className="rounded-2xl object-cover"
                      />
                    </span>
                  ) : (
                    <div className="h-full w-full bg-slate-900 rounded-2xl"></div>
                  )}

                  <span className="hidden lg:flex text-xs md:text-sm rounded-b-2xl absolute inset-0 flex-col justify-between text-white">
                    <span className="absolute ml-2 mt-2 flex flex-row items-center justify-center rounded-2xl w-fit px-2 py-1 bg-gray-300 bg-opacity-30 backdrop-blur-md">
                      <span className="-ml-2 h-6 w-8">
                        <Lottie animationData={animationData} />
                      </span>
                      <span className="-ml-2 text-sm font-bold text-white">
                        {parseFloat(parseFloat(userBasicInfo.ki).toFixed(2))}
                      </span>
                    </span>
                    <span
                      className="text-transparent h-full w-full"
                      onClick={() => {
                        setPreviewType("cover");
                        setOpenPreview(true);
                      }}
                    >
                      {"-"}
                    </span>
                    {/* <span className="w-full flex flex-row justify-end pr-4">
                    {itsMe && (
                      <span className="flex flex-col">
                        <span
                          onClick={() => {
                            router.push("/settings");
                          }}
                          className="cursor-pointer bg-[#EB4463] font-semibold py-1.5 px-2.5 rounded"
                        >
                          Edit profile
                        </span>
                        <span
                          onClick={() => {
                            logOut();
                          }}
                          className="underline cursor-pointer pt-2 w-full flex items-center justify-end space-x-1"
                        >
                          <span className="font-semibold">Log out</span>
                          <svg
                            width="15px"
                            height="15px"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.5 7.5L10.5 10.75M13.5 7.5L10.5 4.5M13.5 7.5L4 7.5M8 13.5H1.5L1.5 1.5L8 1.5"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </span>
                      </span>
                    )}
                  </span> */}
                    <span className="rounded-b-2xl space-y-1 w-full px-2 pt-1 border-t border-black bg-gray-500 bg-opacity-30 backdrop-blur-md">
                      <span className="font-semibold flex flex-row w-full justify-between items-center">
                        <span className="flex flex-row justify-start items-center space-x-0.5">
                          <span
                            onClick={() => {
                              setPreviewType("dpimage");
                              setOpenPreview(true);
                            }}
                            className="-mt-10 pb-2 relative h-18 w-18 flex-shink-0 flex"
                          >
                            {likesMvp &&
                            likesMvp.mostLikes[0].id === userBasicInfo.id ? (
                              <BiggerUserWithBadge
                                avatar={likesMvp.mostLikes[0].avatar}
                                size={80}
                                mvpType={"likes"}
                              />
                            ) : userBasicInfo.borderid ? (
                              <AvatarWB
                                border={userBasicInfo.borderid}
                                userInfo={userBasicInfo}
                                size={80}
                              />
                            ) : (
                              <Image
                                src={imgSrc}
                                alt="user"
                                width={80}
                                height={80}
                                className="border-2 border-black flex flex-shrink-0 h-[90px] w-[90px] rounded-full"
                                onError={() =>
                                  setImgSrc(
                                    "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                                  )
                                }
                              />
                            )}
                          </span>
                          <span className="font-semibold text-[0.92rem] pr-2">
                            {userBasicInfo.username}
                          </span>
                          {/* {userData &&
                          (itsMe ? (
                            <span>You</span>
                          ) : alreadyFollowed ? (
                            <div
                              onClick={() => {
                                unfollowThisUser(userNumId, userBasicInfo.id);
                              }}
                              className="cursor-pointer bg-gray-800 px-2 py-1 border border-gray-400 rounded-md"
                            >
                              Unfollow
                            </div>
                          ) : (
                            <PlusIcon
                              ymk={false}
                              alreadyFollowed={alreadyFollowed}
                              setAlreadyFollowed={setAlreadyFollowed}
                              followerUserId={userNumId}
                              followingUserId={userBasicInfo.id}
                              size={"15"}
                              color={"default"}
                            />
                          ))} */}
                        </span>
                        <span className="flex flex-row py-2 space-x-1.5 lg:space-x-2">
                          {userData &&
                            (itsMe ? (
                              <span className="bg-gray-800 px-4 py-1.5 rounded text-white">
                                You
                              </span>
                            ) : alreadyFollowed ? (
                              <div
                                onClick={() => {
                                  unfollowThisUser(userNumId, userBasicInfo.id);
                                }}
                                className="cursor-pointer bg-gray-800 px-4 py-1.5 rounded"
                              >
                                Unfollow
                              </div>
                            ) : (
                              <span className="bg-[#EB4463] rounded py-1.5 px-5">
                                <PlusIcon
                                  ymk={false}
                                  alreadyFollowed={alreadyFollowed}
                                  setAlreadyFollowed={setAlreadyFollowed}
                                  followerUserId={userNumId}
                                  followingUserId={userBasicInfo.id}
                                  size={"15"}
                                  color={"default"}
                                />
                              </span>
                            ))}
                          <span
                            onClick={() => {
                              if (userData === undefined || userData === null) {
                                PageLoadOptions().fullPageReload("/signin");
                                return;
                              }
                              setOpenTipModal(true);
                            }}
                            className="cursor-default bg-white px-4 py-1.5 rounded text-black"
                          >
                            Tip
                          </span>
                        </span>
                        {/* <span className="space-x-1.5 lg:space-x-6">
                        {userPostValues !== null &&
                          userPostValues !== undefined && (
                            <span>{`${userPostValues.length} Posts`}</span>
                          )}
                        <span
                          onClick={() => {
                            setClickFollower(false);
                            setClickFollowing(true);
                          }}
                        >
                          {followerObject.length} Following
                        </span>
                        <span
                          onClick={() => {
                            setClickFollowing(false);
                            setClickFollower(true);
                          }}
                        >
                          {followingObject.length} Followers
                        </span>
                      </span> */}
                      </span>
                      {/* <p className="pb-2 max-h-10 break-words overflow-auto">
                      {userBasicInfo.bio !== null
                        ? userBasicInfo.bio
                        : "\u00A0"}
                    </p> */}
                    </span>
                  </span>

                  <span className="flex lg:hidden border border-black p-2 text-xs md:text-sm absolute inset-0 flex-col justify-between text-white bg-gray-500 bg-opacity-30 backdrop-blur-md">
                    <span className="flex flex-row space-x-8">
                      <span
                        onClick={() => {
                          setPreviewType("dpimage");
                          setOpenPreview(true);
                        }}
                        className="relative h-18 w-18 flex flex-shrink-0"
                      >
                        <Image
                          src={imgSrc}
                          alt="user"
                          width={80}
                          height={80}
                          className="border-2 border-black h-[90px] w-[90px] flex flex-shrink-0 rounded-full"
                          onError={() =>
                            setImgSrc(
                              "https://auth.animebook.io/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                            )
                          }
                        />
                      </span>
                      <span className="w-full text-white text-[0.85rem] flex flex-row justify-end space-x-8 items-center">
                        <span className="font-medium flex flex-col justify-center items-center">
                          <span className="font-bold">{postValues.length}</span>
                          <span>{"Posts"}</span>
                        </span>
                        <span
                          onClick={() => {
                            setTempFol(followingObject);
                            setSearchActive(false);
                            setClickFollowing(false);
                            setClickFollower(true);
                          }}
                          className="flex flex-col justify-center items-center"
                        >
                          <span className="font-bold">
                            {followingObject.length}
                          </span>
                          <span>{"Followers"}</span>
                        </span>
                        <span
                          onClick={() => {
                            setWingFol(followerObject);
                            setSearchActive(false);
                            setClickFollower(false);
                            setClickFollowing(true);
                          }}
                          className="flex flex-col justify-center items-center"
                        >
                          <span className="font-bold">
                            {followerObject.length}
                          </span>
                          <span>{"Following"}</span>
                        </span>
                        <span className="flex flex-col justify-center items-center">
                          <span className="font-bold">
                            {allSubscriptions && allSubscriptions.length
                              ? allSubscriptions.length
                              : 0}
                          </span>
                          <span>{"Subscribers"}</span>
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-row items-center">
                      <span className="font-semibold text-[20px]">
                        {userBasicInfo.username}
                      </span>

                      <span className="flex flex-row items-center justify-center">
                        <span className="-ml-1 h-6 w-8">
                          <Lottie animationData={animationData} />
                        </span>
                        <span className="-ml-2 text-xs font-base text-white">
                          {parseFloat(parseFloat(userBasicInfo.ki).toFixed(2))}
                        </span>
                      </span>
                    </span>

                    <span className="font-medium text-[0.9rem]">
                      {userBasicInfo.bio}
                    </span>

                    <span className="flex flex-row pt-2 space-x-1.5 lg:space-x-2">
                      {userData &&
                        (itsMe ? (
                          <span className="bg-gray-800 px-4 py-1.5 rounded text-white">
                            You
                          </span>
                        ) : alreadyFollowed ? (
                          <div
                            onClick={() => {
                              unfollowThisUser(userNumId, userBasicInfo.id);
                            }}
                            className="cursor-pointer bg-gray-800 px-4 py-1.5 rounded"
                          >
                            Unfollow
                          </div>
                        ) : (
                          <span className="bg-[#EB4463] rounded py-1.5 px-5">
                            <PlusIcon
                              ymk={false}
                              alreadyFollowed={alreadyFollowed}
                              setAlreadyFollowed={setAlreadyFollowed}
                              followerUserId={userNumId}
                              followingUserId={userBasicInfo.id}
                              size={"15"}
                              color={"default"}
                            />
                          </span>
                        ))}
                      <span
                        onClick={() => {
                          if (userData === undefined || userData === null) {
                            PageLoadOptions().fullPageReload("/signin");
                            return;
                          }
                          setOpenTipModal(true);
                        }}
                        className="cursor-default bg-white px-4 py-1.5 rounded text-black"
                      >
                        Tip
                      </span>
                    </span>

                    <span
                      className="text-transparent h-full w-full"
                      onClick={() => {
                        setPreviewType("cover");
                        setOpenPreview(true);
                      }}
                    >
                      {"-"}
                    </span>
                  </span>
                </span>
              )}

              {clickFollower || clickFollowing ? (
                <>
                  <span
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } lg:hidden flex flex-col`}
                  >
                    <span
                      className={`${
                        darkMode
                          ? "bg-[#1E1F24] border border-[#292C33]"
                          : "bg-white"
                      } p-2 w-full flex flex-row justify-between items-center space-x-2`}
                    >
                      <svg
                        onClick={() => {
                          setClickFollower(false);
                          setClickFollowing(false);
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="25"
                        viewBox="0 0 20 20"
                      >
                        <g id="previous" transform="translate(-62 -41)">
                          <g
                            id="Gruppe_3288"
                            data-name="Gruppe 3288"
                            transform="translate(62 41)"
                          >
                            <path
                              id="Pfad_4744"
                              data-name="Pfad 4744"
                              d="M10,0A10,10,0,1,0,20,10,10.011,10.011,0,0,0,10,0Zm2.256,13.578a.833.833,0,1,1-1.178,1.178L6.911,10.589a.832.832,0,0,1,0-1.178l4.167-4.167a.833.833,0,0,1,1.178,1.178L8.678,10Z"
                              fill={darkMode ? "white" : "#292c33"}
                            />
                          </g>
                        </g>
                      </svg>
                      <span className="flex flex-row space-x-2">
                        <span
                          onClick={() => {
                            setTempFol(followingObject);
                            setSearchActive(false);
                            setClickFollowing(false);
                            setClickFollower(true);
                          }}
                          className={`${
                            clickFollower &&
                            "font-medium border-b-2 border-[#EB4463]"
                          } cursor-pointer`}
                        >
                          Followers
                        </span>
                        <span
                          onClick={() => {
                            setWingFol(null);
                            setSearchActive(false);
                            setClickFollower(false);
                            setClickFollowing(true);
                          }}
                          className={`${
                            clickFollowing &&
                            "font-medium border-b-2 border-[#EB4463]"
                          } cursor-pointer`}
                        >
                          Following
                        </span>
                      </span>
                      <span></span>
                    </span>

                    <span
                      className={`border rounded ${
                        darkMode
                          ? "bg-zinc-800 border-[#32353C]"
                          : "bg-[#F9F9F9] border-[#EEEDEF]"
                      } my-2 px-2 py-0.5 w-full flex flex-row items-center`}
                    >
                      <svg
                        className="w-4 h-4 text-slate-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                      <input
                        value={clickFollowing ? wingValue : folValue}
                        onChange={(e) => {
                          folSearch(
                            e,
                            clickFollowing ? followerObject : followingObject,
                            clickFollowing ? false : true
                          );
                        }}
                        type="search"
                        className={`w-full text-xs ${
                          darkMode ? "text-white" : "text-gray-500"
                        } bg-transparent border-none focus:ring-0 placeholder-[#292C33]`}
                        placeholder={`Search ${
                          clickFollowing ? "Following" : "Followers"
                        }`}
                      />
                    </span>

                    {clickFollowing &&
                      (searchActive
                        ? wingFol &&
                          wingFol.map((fobj) => {
                            return (
                              <span key={fobj.id} className="p-2">
                                <span
                                  className={`pb-2 border-b ${
                                    darkMode
                                      ? "border-[#32353C]"
                                      : "border-[#EEEDEF]"
                                  } w-full flex flex-row justify-between items-center`}
                                >
                                  <UserContainer
                                    user={getUserFromId(fobj.following_userid)}
                                  />

                                  {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                </span>
                              </span>
                            );
                          })
                        : followerObject.length > 0 &&
                          followerObject.map((fobj) => {
                            return (
                              <span key={fobj.id} className="p-2">
                                <span
                                  className={`pb-2 border-b ${
                                    darkMode
                                      ? "border-[#32353C]"
                                      : "border-[#EEEDEF]"
                                  } flex flex-row justify-between items-center`}
                                >
                                  <UserContainer
                                    user={getUserFromId(fobj.following_userid)}
                                  />
                                  {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                </span>
                              </span>
                            );
                          }))}
                    {clickFollower &&
                      (searchActive
                        ? tempFol &&
                          tempFol.map((fobj) => {
                            return (
                              <span key={fobj.id} className="p-2">
                                <span
                                  className={`pb-2 border-b ${
                                    darkMode
                                      ? "border-[#32353C]"
                                      : "border-[#EEEDEF]"
                                  } w-full flex flex-row justify-between items-center`}
                                >
                                  <UserContainer
                                    user={getUserFromId(fobj.follower_userid)}
                                  />

                                  {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                </span>
                              </span>
                            );
                          })
                        : followingObject.length > 0 &&
                          followingObject.map((fobj) => {
                            return (
                              <span key={fobj.id} className="p-2">
                                <span
                                  className={`pb-2 border-b ${
                                    darkMode
                                      ? "border-[#32353C]"
                                      : "border-[#EEEDEF]"
                                  } flex flex-row justify-between items-center`}
                                >
                                  <UserContainer
                                    user={getUserFromId(fobj.follower_userid)}
                                  />

                                  {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                </span>
                              </span>
                            );
                          }))}
                  </span>
                  <span
                    className={`hidden lg:flex ${
                      darkMode ? "text-white" : "text-black"
                    } flex-col`}
                  >
                    <span
                      onClick={() => {
                        setClickFollower(false);
                        setClickFollowing(false);
                      }}
                      className={`border rounded ${
                        darkMode
                          ? "bg-[#1E1F24] border-[#292C33] text-white"
                          : "bg-white border-[#EEEDEF] text-black"
                      } w-fit h-full py-1 px-3 text-[0.7rem] cursor-pointer flex flex-row justify-center items-center space-x-1`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                      >
                        <g id="previous" transform="translate(-62 -41)">
                          <g
                            id="Gruppe_3288"
                            data-name="Gruppe 3288"
                            transform="translate(62 41)"
                          >
                            <path
                              id="Pfad_4744"
                              data-name="Pfad 4744"
                              d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm2.707,16.293a1,1,0,1,1-1.414,1.414l-5-5a1,1,0,0,1,0-1.414l5-5a1,1,0,0,1,1.414,1.414L10.414,12Z"
                              fill={darkMode ? "white" : "#292c33"}
                            />
                          </g>
                        </g>
                      </svg>
                      <span>Go Back</span>
                    </span>
                    <span className="flex flex-row space-x-2 pt-2">
                      <span
                        className={`border ${
                          darkMode
                            ? "bg-[#1E1F24] border-[#292C33]"
                            : "bg-[#FFFFFF] border-[#EEEDEF]"
                        } rounded-t-lg flex flex-col w-1/2 p-2 px-3`}
                      >
                        {followingObject && (
                          <span className="px-1 font-medium flex flex-row justify-start items-center space-x-1">
                            <span>{followingObject.length}</span>
                            <span>Followers</span>
                          </span>
                        )}

                        <span
                          className={`border rounded ${
                            darkMode
                              ? "bg-zinc-800 border-[#32353C]"
                              : "bg-[#F9F9F9] border-[#EEEDEF]"
                          } my-2 px-2 py-0.5 w-full flex flex-row items-center`}
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                          </svg>
                          <input
                            value={folValue}
                            onChange={(e) => {
                              folSearch(e, followingObject, true);
                            }}
                            type="search"
                            className={`w-full text-xs ${
                              darkMode ? "text-white" : "text-gray-500"
                            } bg-transparent border-none focus:ring-0 placeholder-[#292C33]`}
                            placeholder="Search followers"
                          />
                        </span>
                        {searchActive
                          ? tempFol &&
                            tempFol.map((fobj) => {
                              return (
                                <span key={fobj.id} className="p-2">
                                  <span
                                    className={`pb-2 border-b ${
                                      darkMode
                                        ? "border-[#32353C]"
                                        : "border-[#EEEDEF]"
                                    } w-full flex flex-row justify-between items-center`}
                                  >
                                    <UserContainer
                                      user={getUserFromId(fobj.follower_userid)}
                                    />

                                    {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                  </span>
                                </span>
                              );
                            })
                          : followingObject.length > 0 &&
                            followingObject.map((fobj) => {
                              return (
                                <span key={fobj.id} className="p-2">
                                  <span
                                    className={`pb-2 border-b ${
                                      darkMode
                                        ? "border-[#32353C]"
                                        : "border-[#EEEDEF]"
                                    } w-full flex flex-row justify-between items-center`}
                                  >
                                    <UserContainer
                                      user={getUserFromId(fobj.follower_userid)}
                                    />

                                    {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                  </span>
                                </span>
                              );
                            })}
                      </span>
                      <span
                        className={`border ${
                          darkMode
                            ? "bg-[#1E1F24] border-[#292C33]"
                            : "bg-[#FFFFFF] border-[#EEEDEF]"
                        } rounded-t-lg flex flex-col w-1/2 p-2`}
                      >
                        {followerObject && (
                          <span className="px-1 font-medium flex flex-row justify-start items-center space-x-1">
                            <span>{followerObject.length}</span>
                            <span>Following</span>
                          </span>
                        )}
                        <span
                          className={`border rounded ${
                            darkMode
                              ? "bg-zinc-800 border-[#32353C]"
                              : "bg-[#F9F9F9] border-[#EEEDEF]"
                          } my-2 px-2 py-0.5 w-full flex flex-row items-center`}
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                          </svg>
                          <input
                            value={wingValue}
                            onChange={(e) => {
                              folSearch(e, followerObject, false);
                            }}
                            type="search"
                            className={`w-full text-xs ${
                              darkMode ? "text-white" : "text-gray-500"
                            } bg-transparent border-none focus:ring-0 placeholder-[#292C33]`}
                            placeholder="Search following"
                          />
                        </span>
                        {searchActive
                          ? wingFol &&
                            wingFol.map((fobj) => {
                              return (
                                <span key={fobj.id} className="p-2">
                                  <span
                                    className={`pb-2 border-b ${
                                      darkMode
                                        ? "border-[#32353C]"
                                        : "border-[#EEEDEF]"
                                    } w-full flex flex-row justify-between items-center`}
                                  >
                                    <UserContainer
                                      user={getUserFromId(
                                        fobj.following_userid
                                      )}
                                    />

                                    {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                  </span>
                                </span>
                              );
                            })
                          : followerObject.length > 0 &&
                            followerObject.map((fobj) => {
                              return (
                                <span key={fobj.id} className="p-2">
                                  <span
                                    className={`pb-2 border-b ${
                                      darkMode
                                        ? "border-[#32353C]"
                                        : "border-[#EEEDEF]"
                                    } w-full flex flex-row justify-between items-center`}
                                  >
                                    <UserContainer
                                      user={getUserFromId(
                                        fobj.following_userid
                                      )}
                                    />
                                    {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                                  </span>
                                </span>
                              );
                            })}
                      </span>
                    </span>
                  </span>
                </>
              ) : (
                <>
                  {!openPremium && (
                    <>
                      <span
                        className={`${
                          darkMode ? "text-white" : "text-black"
                        } flex lg:hidden flex-col w-full`}
                      >
                        <span className="w-full px-8 flex flex-row justify-between">
                          <span
                            onClick={() => {
                              setMediasClicked("posts");
                            }}
                            className={`${
                              mediasClicked === "posts" &&
                              "font-medium border-b-2 border-[#EB4463]"
                            } cursor-pointer`}
                          >
                            Posts
                          </span>
                          <span
                            onClick={() => {
                              setMediasClicked("media");
                            }}
                            className={`${
                              mediasClicked === "media" &&
                              "font-medium border-b-2 border-[#EB4463]"
                            } cursor-pointer`}
                          >
                            Media
                          </span>
                          <span
                            onClick={() => {
                              setMediasClicked("chibis");
                            }}
                            className={`${
                              mediasClicked === "chibis" &&
                              "font-medium border-b-2 border-[#EB4463]"
                            } cursor-pointer`}
                          >
                            Chibis
                          </span>
                          <span
                            onClick={() => {
                              setMediasClicked("animes");
                            }}
                            className={`${
                              mediasClicked === "animes" &&
                              "font-medium border-b-2 border-[#EB4463]"
                            } cursor-pointer`}
                          >
                            Animes
                          </span>
                        </span>

                        {mediasClicked === "posts" ? (
                          <span className="pt-2 ">
                            <Posts />
                          </span>
                        ) : mediasClicked === "media" ? (
                          <span className="w-full grid grid-cols-3 lg:grid-cols-4 gap-2 p-2">
                            {postValues?.length > 0 &&
                              postValues.map((pst) => {
                                if (!pst?.media) return null;

                                const isVideo = /\.(mp4|mov|3gp)$/i.test(
                                  pst.media.toLowerCase()
                                );

                                return (
                                  <span
                                    onClick={() => {
                                      setContentToDisplay(pst.media);
                                      setOpenPreview(true);
                                    }}
                                    key={pst.id}
                                    className="relative overflow-hidden rounded-lg"
                                  >
                                    {isVideo ? (
                                      <video
                                        className="w-[150px] h-[150px] object-cover rounded-lg shadow-md"
                                        src={pst.media}
                                        crossOrigin="anonymous"
                                        ref={(el) =>
                                          (videoRef.current[pst.id] = el)
                                        }
                                      />
                                    ) : (
                                      <Image
                                        src={pst.media}
                                        alt="post"
                                        width={100}
                                        height={100}
                                        className="w-[150px] h-[150px] object-cover rounded-lg shadow-md"
                                      />
                                    )}
                                  </span>
                                );
                              })}
                          </span>
                        ) : mediasClicked === "animes" ? (
                          <span className="w-full flex justify-center pt-2">
                            <span className="w-full grid grid-cols-2 gap-2 py-2 px-1">
                              {currentUserWatchlist.map((awl) => (
                                <span
                                  key={awl.id}
                                  className={`border ${
                                    darkMode
                                      ? "bg-[#1E1F24] border-[#292C33]"
                                      : "bg-white border-gray-300"
                                  } w-[100%] relative flex flex-col items-center rounded-xl p-2 w-60 shadow-md`}
                                >
                                  <span
                                    className={`border ${
                                      darkMode
                                        ? "bg-[#292C33] border-[#292C33]"
                                        : "bg-[#0000001A] border-[#292C33]"
                                    } flex px-2 py-0.5 rounded-xl justify-center space-x-0.5`}
                                  >
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs ${
                                          i < awl.rating
                                            ? "text-[#EB4463]"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </span>

                                  <span
                                    id="scrollbar-remove"
                                    className="pb-1 font-semibold text-center w-full max-h-10 overflow-scroll whitespace-nowrap scrollbar-hide"
                                  >
                                    {awl.title}
                                  </span>

                                  <img
                                    src={awl.image}
                                    alt={awl.title}
                                    className="border border-black rounded-lg w-60 h-60 object-cover"
                                  />
                                </span>
                              ))}
                            </span>
                          </span>
                        ) : mediasClicked === "chibis" ? (
                          <span className="w-full flex justify-center pt-2">
                            <span className="w-full grid grid-cols-2 gap-2 py-2 px-1">
                              {currentUserChibis.slice(0, 1).map((cb) => (
                                <span
                                  key={cb.id}
                                  className="relative flex flex-col items-center w-28 rounded-lg"
                                  onClick={() => {
                                    setMediasClicked("animes");
                                  }}
                                >
                                  <Image
                                    src={free}
                                    alt="chibi"
                                    className="rounded-lg w-28 h-28 object-cover"
                                  />
                                </span>
                              ))}
                            </span>
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                      <div
                        ref={containerRef}
                        className="hidden lg:flex w-full flex-row items-center space-x-0.5 overflow-hidden"
                      >
                        {postValues.filter((p)=>!p.repostAuthor)
                          ?.slice(0, visibleCount - 1)
                          .map((pst, index) => {
                            if (!pst?.media) return null;
                            const isVideo = /\.(mp4|mov|3gp)$/i.test(pst.media);

                            return (
                              <span
                                onClick={() => {
                                  if (pst.media) {
                                    setCurrentPost(pst);
                                    setDeskMode(true);
                                  }
                                }}
                                key={pst.id}
                                className="flex h-20 w-[20%] flex-grow"
                              >
                                {isVideo ? (
                                  <video
                                    className="w-[80px] h-[80px] object-cover rounded"
                                    src={pst.media}
                                    crossOrigin="anonymous"
                                  />
                                ) : (
                                  <Image
                                    src={pst.media}
                                    alt={"post"}
                                    width={80}
                                    height={80}
                                    className="rounded"
                                  />
                                )}
                              </span>
                            );
                          })}

                        {postValues?.length > visibleCount && (
                          <span
                            onClick={() => setMediasClicked("posts")}
                            className="cursor-pointer relative flex h-20 w-[20%] flex-grow rounded items-center justify-center text-white font-bold text-lg overflow-hidden"
                          >
                            {/* Blurred Background Handling Image, Video, or Fallback */}
                            {(() => {
                              const nextMedia = getNextMedia(
                                postValues,
                                visibleCount - 1
                              );
                              const isVideo =
                                nextMedia &&
                                /\.(mp4|mov|3gp)$/i.test(nextMedia);

                              return nextMedia ? (
                                isVideo ? (
                                  <div className="absolute inset-0 bg-gray-500 blur-md"></div>
                                ) : (
                                  <Image
                                    src={nextMedia}
                                    alt="blurred background"
                                    width={80}
                                    height={80}
                                    className="absolute inset-0 w-full h-full object-cover blur-md brightness-75"
                                  />
                                )
                              ) : (
                                <div className="absolute inset-0 bg-gray-500"></div>
                              );
                            })()}

                            {/* Number Overlay */}
                            <span className="relative z-10">
                              +{postValues.length - (visibleCount - 1)}
                            </span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  {/* <span className="text-white w-full h-fit flex flex-row items-center space-x-1 font-semibold">
                    <span
                      onClick={() => {
                        setOpenPremium(false);
                      }}
                      className={`flex space-x-1 flex-row h-fit w-1/2 cursor-pointer flex flex-row py-2.5 sm:py-4 justify-center items-center rounded-lg ${
                        !openPremium
                          ? "bg-[#EB4463]"
                          : "bg-white border border-gray-200 text-gray-400"
                      }`}
                    >
                      <span>Public</span>
                      <span>Content</span>
                    </span>
                    <span
                      onClick={() => {
                        setOpenPremium(true);
                        getMangas();
                      }}
                      className={`w-1/2 cursor-pointer py-2.5 sm:py-4 rounded-lg flex justify-center items-center ${
                        openPremium
                          ? "bg-[#EB4463]"
                          : "bg-white border border-gray-200 text-gray-400"
                      }`}
                    >
                      <svg
                        width="20px"
                        height="20px"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke={openPremium ? "white" : "#94a3b8"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        className="pr-1"
                      >
                        <rect
                          height="7.5"
                          width="10.5"
                          y="6.75"
                          x="2.75"
                          fill={openPremium ? "white" : "#94a3b8"}
                        />
                        <path d="m4.75 6.25s-1-4.5 3.25-4.5 3.25 4.5 3.25 4.5" />
                      </svg>

                      <span className="space-x-1 flex flex-row h-fit">
                        <span>Premium</span>
                        <span>Content</span>
                      </span>
                    </span>
                  </span> */}
                  {!itsMe && !openPremium && (
                    <span className="px-1 flex flex-col space-y-1 text-slate-500">
                      {/* <span>
                        Joined on {getDateJoined(userBasicInfo.created_at)}
                      </span> */}
                      {/* <span className="flex flex-row w-full justify-between items-center">
                        <span className="space-x-0.5 flex flex-row items-center">
                          <svg
                            fill="#94a3b8"
                            height="18px"
                            width="18px"
                            id="Icons"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 32 32"
                            xmlSpace="preserve"
                          >
                            <path d="M29,14h-2.2c-0.2-1.3-0.6-2.5-1.3-3.7c-0.7-1.3-0.5-3,0.6-4.1c0.4-0.4,0.4-1,0-1.4c-2-2-5.2-2-7.3-0.1C17.7,4.2,16.3,4,15,4 c-3.9,0-7.5,1.9-9.8,5c-1.5,2-2.2,4.5-2.2,7c0,2.2,0.6,4.3,1.7,6.1l0.1,0.2c-0.1,0.1-0.2,0.1-0.3,0.1C4.2,22.5,4,22.3,4,22 c0-0.6-0.4-1-1-1s-1,0.4-1,1c0,1.4,1.1,2.5,2.5,2.5c0.5,0,1-0.2,1.4-0.4l3.3,5.4C9.3,29.8,9.6,30,10,30h4c0.3,0,0.6-0.1,0.8-0.4 c0.2-0.2,0.3-0.5,0.2-0.8L14.8,28c0.4,0,0.9,0,1.3,0L16,28.8c0,0.3,0,0.6,0.2,0.8S16.7,30,17,30h4c0.3,0,0.7-0.2,0.8-0.5l2-3.1 c2.4-0.9,4.5-2.2,5.9-3.7c0.2-0.2,0.3-0.4,0.3-0.7V15C30,14.4,29.6,14,29,14z M14.9,14.5h1.3c1.6,0,2.9,1.3,2.9,3 c0,1.5-1.1,2.7-2.5,2.9V21c0,0.6-0.4,1-1,1s-1-0.4-1-1v-0.6c-1.4-0.2-2.5-1.4-2.5-2.9c0-0.6,0.4-1,1-1s1,0.4,1,1 c0,0.5,0.4,0.9,0.9,0.9h1.3c0.5,0,0.9-0.4,0.9-0.9c0-0.5-0.4-1-0.9-1h-1.3c-1.6,0-2.9-1.3-2.9-3c0-1.5,1.1-2.7,2.5-2.9V10 c0-0.6,0.4-1,1-1s1,0.4,1,1v0.6c1.4,0.2,2.5,1.4,2.5,2.9c0,0.6-0.4,1-1,1s-1-0.4-1-1c0-0.5-0.4-0.9-0.9-0.9h-1.3 c-0.5,0-0.9,0.4-0.9,0.9C14,14.1,14.4,14.5,14.9,14.5z" />
                          </svg>
                          <span>{`send ${userBasicInfo.username} san a tip`}</span>
                        </span>
                        <span
                          onClick={() => {
                            if (userData === undefined || userData === null) {
                              PageLoadOptions().fullPageReload("/signin");
                              return;
                            }
                            setOpenTipModal(true);
                          }}
                          className="flex flex-row cursor-pointer text-xs sm:text-sm font-medium py-1 px-3 bg-[#EB4463] text-white border border-white rounded-md"
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
                        </span>
                      </span> */}
                    </span>
                  )}
                  {openPremium ? (
                    mangaLoading ? (
                      <span className="h-screen">
                        <Lottie
                          animationData={darkMode ? darkloadscreen : loadscreen}
                        />
                      </span>
                    ) : (
                      <span
                        className={`${
                          darkMode ? "text-white" : "text-black"
                        } text-xs md:text-sm flex flex-col w-full justify-center space-y-4`}
                      >
                        <span className="font-semibold">
                          All premium content{" "}
                        </span>
                        {mangaObjects && mangaObjects.length > 0 ? (
                          <>
                            <div className="h-fit grid gap-2 grid-cols-2 lg:grid-cols-3">
                              {mangaObjects.length > 0 &&
                                mangaObjects.map((mangaSeries) => (
                                  <div
                                    onClick={() => {
                                      readManga(mangaSeries);
                                    }}
                                    key={mangaSeries.id}
                                    className={`border ${
                                      darkMode
                                        ? "bg-[#1E1F24] border-[#292C33]"
                                        : "border-gray-300"
                                    } flex flex-col cursor-pointer rounded-lg overflow-hidden shadow-sm`}
                                  >
                                    <div className="relative">
                                      <Image
                                        src={mangaSeries.cover}
                                        alt={mangaSeries.name}
                                        height={250}
                                        width={200}
                                        className="w-full h-52 object-cover"
                                      />
                                      <span
                                        className={`${
                                          darkMode ? "bg-[#292C33]" : "bg-black"
                                        } absolute top-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded`}
                                      >
                                        {`Pages: ${mangaSeries.pages}`}
                                      </span>
                                    </div>

                                    <div
                                      className={`p-3 ${
                                        darkMode ? "text-white" : "text-black"
                                      }`}
                                    >
                                      <h3 className="font-bold text-sm">
                                        {mangaSeries.name}
                                      </h3>
                                      {mangaSeries.description && (
                                        <p className="text-xs">
                                          {mangaSeries.description}
                                        </p>
                                      )}
                                    </div>

                                    <div className="px-3 pb-3">
                                      <button className="w-full text-white font-semibold bg-[#EB4463] py-2 rounded">
                                        {itsMe ? (
                                          <span
                                            onClick={() => {
                                              deleteManga(mangaSeries);
                                            }}
                                          >
                                            <BinSvg pixels={"20px"} />
                                          </span>
                                        ) : (
                                          <span>
                                            {subscribedUser
                                              ? "Open"
                                              : `Unlock for $
                                            ${parseFloat(
                                              mangaSeries.price
                                            ).toFixed(2)}`}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </>
                        ) : (
                          <span className="w-full flex flex-col justify-center text-center text-slate-500">
                            <span>{`${itsMe ? "You" : "This user"} currently ${
                              itsMe ? "have" : "has"
                            } no premium mangas`}</span>
                            {itsMe && (
                              <span className="font-semibold">
                                {
                                  "Are you a creator? Unlock passive earnings with Animebook by publishing your mangas. From the hottest shonen adventures to the most captivating shojo narratives, your subscribers are eager to immerse themselves in your creations"
                                }
                              </span>
                            )}
                          </span>
                        )}

                        {itsMe &&
                          (userData.address ? (
                            <span
                              className={`space-x-2 border border-black ${
                                darkMode ? "bg-[#1e1f24]" : "bg-white"
                              } border-dashed rounded-lg p-4 flex justify-center items-center`}
                            >
                              <span
                                onClick={() => {
                                  router.push("/publishmanga");
                                }}
                                className="text-white font-semibold bg-[#EB4463] py-3 px-5 cursor-pointer rounded-xl"
                              >
                                Publish
                              </span>
                              <span
                                onClick={() => {
                                  router.push("/subscriptionplan");
                                }}
                                className="text-[#EB4463] font-semibold bg-transparent border-2 border-[#EB4463] py-2.5 px-4 cursor-pointer rounded-xl"
                              >
                                Edit subscription plan
                              </span>
                            </span>
                          ) : (
                            <span className="text-center w-full text-[0.8rem] font-semibold text-gray-700">
                              Go to settings and add a payout wallet address
                              first
                            </span>
                          ))}
                      </span>
                    )
                  ) : userPostValues && userPostValues.length > 0 ? (
                    <Posts />
                  ) : (
                    <span className="w-full text-gray-600 text-center">
                      {!done ? "Loading posts..." : "Nanimonai! No posts found"}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-start text-slate-500 w-full py-2 space-y-5 px-2 lg:pl-lPostCustom lg:pr-rPostCustom mt-2 lg:mt-20 flex flex-col">
            {userNotFound ? (
              <span>No such user</span>
            ) : (
              <span className="-ml-2 h-6 w-8">
                <Lottie animationData={animationData} />
              </span>
            )}
          </div>
        )}

        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />

      {deskMode && (
        <ExploreBox
          darkMode={darkMode}
          userData={userData}
          currentPost={currentPost}
          setCurrentPost={setCurrentPost}
          allUserPosts={postValues.filter(
            (e) => e.media !== null && e.media !== undefined && e.media !== ""
          )}
          deskMode={deskMode}
          setDeskMode={setDeskMode}
          userNumId={userNumId}
        />
      )}

      {deskMode && (
        <div id="tip-overlay" className="bg-black bg-opacity-80"></div>
      )}

      {mgComic && !deletionModal && (
        <div
          id={openManga ? "manga-modal" : "invisible"}
          className="w-11/12 sm:w-10/12 flex justify-center"
        >
          <span className="w-fit space-y-[0.13rem] flex flex-col justify-start items-center">
            <span className="text-black w-fit bg-white rounded-lg w-full mb-2 p-4 text-sm font-semibold">
              {mgComic.name}
            </span>
            <span className="relative w-fit flex flex-col justify-center">
              <span className="text-white font-semibold pt-3 pr-2.5 absolute inset-0 h-fit w-full flex justify-end">
                <span
                  onClick={() => {
                    setOpenManga(false);
                  }}
                  className="cursor-pointer bg-[#EB4463] py-0.5 px-2 rounded text-center"
                >
                  {"x"}
                </span>
              </span>
              <Image
                src={mgComic.filepaths[mangaIndex]}
                alt="post"
                height={700}
                width={700}
                className="rounded-xl object-contain border-[0.25rem] border-white"
              />
              <span className="font-semibold text-white px-2.5 absolute w-full flex justify-between">
                <span
                  onClick={() => {
                    mangaToggle(false);
                  }}
                  className="cursor-pointer bg-[#EB4463] py-0.5 px-2 rounded text-center"
                >
                  {"<"}
                </span>
                <span
                  onClick={() => {
                    mangaToggle(true);
                  }}
                  className="cursor-pointer bg-[#EB4463] py-0.5 px-2 rounded text-center"
                >
                  {">"}
                </span>
              </span>
            </span>
          </span>
        </div>
      )}

      {openManga && <div id="manga-overlay" className="bg-black"></div>}

      {openTipModal && (
        <>
          <PopupModal
            success={"6"}
            username={userBasicInfo.username}
            useruuid={userData.useruuid}
            destSolAddress={
              userBasicInfo.solAddress ? userBasicInfo.solAddress : null
            }
            avatar={userBasicInfo.avatar}
            destinationAddress={userBasicInfo.address}
            userDestinationId={userBasicInfo.id}
          />
          <div
            onClick={() => {
              setOpenTipModal(false);
            }}
            id="tip-overlay"
          ></div>
        </>
      )}

      {deletionModal && (
        <>
          <span className="absolute m-auto w-fit inset-0 h-fit top-0 flex flex-col items-center justify-center bg-white p-4 rounded">
            <span>{`Are you sure you want to delete your ${deletionModal.name} series?`}</span>
            <span className="z-50 w-full mt-4 flex flex-row justify-between items-center px-4">
              <span
                onClick={() => {
                  setDeletionModal(null);
                  setOpenManga(false);
                }}
                className="bg-gray-400 w-[80px] px-2 py-1.5 rounded-lg text-white text-center font-medium"
              >
                Cancel
              </span>
              <span
                onClick={() => {
                  deleteMangaFromDB(deletionModal.id);
                }}
                className="bg-red-400 w-[80px] px-2 py-1.5 rounded-lg text-white text-center font-medium"
              >
                Yes
              </span>
            </span>
          </span>

          <div
            onClick={() => {
              setDeletionModal(null);
              setOpenManga(false);
            }}
            // id="tip-overlay"
            className="fixed inset-0 bg-transparent"
          ></div>
        </>
      )}

      {openPurchaseModal && (
        <>
          <PopupModal
            success={"8"}
            username={userBasicInfo.username}
            mangaImage={mgComic.cover}
            sourceAddress={userNumId}
            useruuid={userData.useruuid}
            destinationAddress={userBasicInfo.address}
            userDestinationId={userBasicInfo.id}
            mangaPrice={mgComic.price}
            mangaName={mgComic.name}
            mangaId={mgComic.id}
          />
          <div
            onClick={() => {
              setOpenPurchaseModal(false);
            }}
            id="tip-overlay"
          ></div>
        </>
      )}

      {deletePost !== null && (
        <>
          <PopupModal
            success={"7"}
            username={userBasicInfo.username}
            avatar={userBasicInfo.avatar}
            sourceAddress={userNumId}
            destinationAddress={userBasicInfo.address}
            userDestinationId={userBasicInfo.id}
          />
          <div
            onClick={() => {
              setDeletePost(null);
            }}
            id="overlay"
            className="bg-black bg-opacity-80"
          ></div>
        </>
      )}

      {openSub && (
        <>
          <PopupModal
            success={"9"}
            username={userBasicInfo.username}
            avatar={userBasicInfo.avatar}
            subprice={userBasicInfo.subprice}
            useruuid={userData.useruuid}
            destinationAddress={userBasicInfo.address}
            userDestinationId={userBasicInfo.id}
            setSubscribedUser={setSubscribedUser}
            setOpenSub={setOpenSub}
          />
          <div
            onClick={() => {
              setOpenSub(false);
            }}
            id="overlay"
            className="bg-black bg-opacity-80"
          ></div>
        </>
      )}

      {openPreview && contentToDisplay ? (
        <span onClick={()=>{
          setOpenPreview(false);
              setContentToDisplay(null);
        }}>
          <PopupModal
            success={"11"}
            avatar={userBasicInfo.avatar}
            cover={contentToDisplay}
            previewType={"cover"}
          />

          <div
            onClick={() => {
              setOpenPreview(false);
              setContentToDisplay(null);
            }}
            id="dark-overlay"
            className="bg-black"
          ></div>
        </span>
      ) : openPreview ? (
        <span onClick={()=>{
          setOpenPreview(false);
        }}>
        
          <PopupModal
            success={"11"}
            avatar={userBasicInfo.avatar}
            cover={userBasicInfo.cover}
            previewType={previewType}
          />

          <div
            onClick={() => {
              setOpenPreview(false);
            }}
            id="dark-overlay"
            className="bg-black"
          ></div>
        </span>
      ) : (
        ""
      )}
    </main>
  );
}
