import { useState, useContext, useEffect } from "react";
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
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const getServerSideProps = async (context) => {
  const { user } = context.query;
  return {
    props: {
      user: user.toLowerCase(),
    },
  };
};

export default function User({ user }) {
  const { getUserFromId } = DappLibrary();
  const { connectToWallet, disconnectWallet } = ConnectionData();
  const { getUsdPrice } = PriceFeedStation();
  const router = useRouter();
  const { fetchAllUsers, fetchAllPosts, fetchAllReposts, fetchUserMangas } =
    DbUsers();
  const { fetchFollowing, fetchFollows } = Relationships();
  const {
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
  } = useContext(UserContext);

  const [openPremium, setOpenPremium] = useState(false);
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [itsMe, setItsMe] = useState(false);
  const [userBasicInfo, setUserBasicInfo] = useState(null);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [mangaObjects, setMangaObjects] = useState(null);
  const [openTipModal, setOpenTipModal] = useState(false);
  const [subscribedUser, setSubscribedUser] = useState(false);
  const [imgSrc, setImgSrc] = useState("");

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
    const filteredUserPosts = data.filter((r) => {
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

  function getMangas() {
    setMangaLoading(true);
    fetchUserMangas(userBasicInfo.id).then((result) => {
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
      const identifier = followingMe ? item.following_userid : item.follower_userid;
      if (seen.has(identifier)) {
        return false; 
      }
      seen.add(identifier);
      return true;
    });
  }
  const [clickFollower, setClickFollower] = useState(false)
  const [clickFollowing, setClickFollowing] = useState(false)

  const [userNotFound, setUserNotFound] = useState(false);

  const [valuesLoaded, setValuesLoaded] = useState(false);

  const [deletionModal, setDeletionModal] = useState(null)

    const deleteManga = (series) => {
      setOpenManga(false)
      setDeletionModal(series)
    }
    
    const deleteMangaFromDB = (id) => {
      supabase
        .from("mangas").delete().eq('id', id).then((res)=>{
          setMangaObjects(mangaObjects.filter((m)=>{
            return m.id !== id
          }));
          setDeletionModal(null); 
          setOpenManga(false);
        })
    }

  useEffect(() => {
    
    setRoutedUser(user);
    fetchAllUsers().then((r) => {
      setAllUserObject(r.data);
      if (r.data !== null && r.data !== undefined && r.data.length !== 0) {
        const currentUserExtraInfo = r.data.find((c) => {
          return c.username.toLowerCase().trim() === user.toLowerCase().trim();
        });

        if (!currentUserExtraInfo) {
          setUserNotFound(true);
          return;
        }
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
                subscriber: userNumId,
                creator: currentUserExtraInfo.id,
              })
              .then(({ data }) => {
                if (data && data.length > 0) {
                  setSubscribedUser(true);
                }
              });

            setFollowerObject(uniqueFollowers(res.followings.data, true));
            setFollowingObject(uniqueFollowers(res.followers.data, false));

            setAlreadyFollowed(
              !!res.followers.data.find(
                (rel) => rel.follower_userid === userNumId
              )
            );
            setUserBasicInfo(currentUserExtraInfo);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    });

    
    fetchAllReposts().then((reposts) => {
      fetchAllPosts().then((result1) => {
        const userPostsAndReposts = reposts
          .map((repost) => {
            const originalPost = result1.data.find((post) => {
              return post.id === repost.postid;
            });
            if (
              originalPost &&
              repost.users &&
              repost.users.username.trim().toLowerCase() ===
                user.trim().toLowerCase()
            ) {
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
              (post) => !reposts.some((repost) => repost.postid === post.id)
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
          });
        userSpecificPosts(userPostsAndReposts);
        setOriginalPostValues(userPostsAndReposts);
      });
    });

    // fetchAllPosts().then((result) => {
    //   if (result.data !== null && result.data !== undefined) {
    //     userSpecificPosts(result);
    //     setOriginalPostValues(result.data);
    //   }
    // });
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
  }, [userNumId, userBasicInfo, valuesLoaded]);

  return (
    <>
      <main>
        <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
          <NavBar />
          <SmallTopBar middleTab={true} />
          {userBasicInfo !== null && userBasicInfo !== undefined ? (
            <div className="w-full py-2 space-y-5 px-2 lg:pl-lPostCustom lg:pr-rPostCustom mt-2 lg:mt-20 flex flex-col">
              <div className="topcont">
                <LargeTopBar relationship={true} />
              </div>
              <div className="flex flex-col space-y-3">
                <span className="relative flex h-[150px] sm:h-[200px] w-full">
                  {userBasicInfo.cover ? (
                    <Image
                      src={userBasicInfo.cover}
                      alt="user profile"
                      fill={true}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-900 rounded-2xl"></div>
                  )}
                  <span className="text-xs md:text-sm rounded-b-2xl absolute inset-0 flex flex-col justify-between text-white">
                    <span className="absolute border border-gray-500 ml-2 mt-2 flex flex-row items-center justify-center rounded-2xl w-fit px-2 py-1 bg-gray-800 bg-opacity-70">
                      <span className="-ml-2 h-6 w-8">
                        <Lottie animationData={animationData} />
                      </span>
                      <span className="-ml-2 text-sm font-bold text-white">
                        {parseFloat(parseFloat(userBasicInfo.ki).toFixed(2))}
                      </span>
                    </span>
                    <span className="w-full flex flex-row justify-end pt-2 pr-4">
                      {itsMe && (
                        <span className="flex flex-col">
                          <span
                            onClick={() => {
                              router.push("/settings");
                            }}
                            className="cursor-pointer bg-pastelGreen font-semibold py-1.5 px-2.5 rounded"
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
                    </span>
                    <span className="rounded-b-2xl space-y-1 w-full px-2 pt-2 bg-gray-800 bg-opacity-70">
                      <span className="font-semibold flex flex-row w-full justify-between items-center">
                        <span className="flex flex-row justify-start items-center space-x-0.5">
                          <span className="relative h-8 w-8 flex">
                            <Image
                              src={imgSrc}
                              alt="user"
                              width={35}
                              height={35}
                              className="border border-white rounded-full"
                              onError={() =>
                                setImgSrc(
                                  "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                                )
                              }
                            />
                          </span>
                          <span className="font-semibold text-[0.85rem] pr-2">
                            {userBasicInfo.username}
                          </span>
                          {userData &&
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
                            ))}
                        </span>
                        <span className="space-x-1.5 lg:space-x-6">
                          {userPostValues !== null &&
                            userPostValues !== undefined && (
                              <span>{`${userPostValues.length} Posts`}</span>
                            )}
                          <span onClick={()=>{setClickFollower(false); setClickFollowing(true)}}>{followerObject.length} Following</span>
                          <span onClick={()=>{setClickFollowing(false); setClickFollower(true)}}>{followingObject.length} Followers</span>
                        </span>
                      </span>
                      <p className="pb-2 max-h-10 break-words overflow-auto">
                        {userBasicInfo.bio !== null
                          ? userBasicInfo.bio
                          : "\u00A0"}
                      </p>
                    </span>
                  </span>
                </span>
                {clickFollower || clickFollowing && <svg
                  onClick={() => {
                    setClickFollower(false)
                    setClickFollowing(false)
                  }}
                  width="35px"
                  height="35px"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="my-2 cursor-pointer"
                >
                  <rect
                    width={48}
                    height={48}
                    fill="white"
                    fillOpacity={0.01}
                  />
                  <path
                    d="M31 36L19 24L31 12"
                    stroke="gray"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>}

                {clickFollower || clickFollowing ? (
                  <span
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } flex flex-col`}
                  >
                    <span className="flex flex-row justify-center items-center space-x-2">
                      <span  onClick={()=>{setClickFollower(false); setClickFollowing(true)}} className={`${clickFollowing && 'border-b shadow-xl'} cursor-pointer`}>Following</span>
                      <span onClick={()=>{setClickFollowing(false); setClickFollower(true)}} className={`${clickFollower && 'border-b shadow-xl'} cursor-pointer`}>Followers</span>
                    </span>
                    

                    {clickFollowing && followerObject.length > 0 &&
                      followerObject.map((fobj) => {
                        return (
                          <span key={fobj.id} className="p-2">
                            <span onClick={()=>{setClickFollower(false); setClickFollowing(false); router.push(getUserFromId(fobj.following_userid).username)}} className="flex flex-row justify-between items-center">
                              <span className="cursor-pointer flex flex-row justify-center items-center">
                                <span className="relative h-8 w-8 flex space-x-1.5">
                                  <Image
                                    src={
                                      getUserFromId(fobj.following_userid)
                                        .avatar
                                    }
                                    alt="user"
                                    width={30}
                                    height={30}
                                    className="border border-white rounded-full"
                                    // onError={() => handleImageError(os.id)}
                                  />
                                </span>
                                <span>
                                  {
                                    getUserFromId(fobj.following_userid)
                                      .username
                                  }
                                </span>
                              </span>
                              {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                            </span>
                          </span>
                        );
                      })}
                      {clickFollower && followingObject.length > 0 &&
                      followingObject.map((fobj) => {
                        return (
                          <span key={fobj.id} className="p-2">
                            <span onClick={()=>{setClickFollower(false); setClickFollowing(false); router.push(getUserFromId(fobj.follower_userid).username)}} className="flex flex-row justify-between items-center">
                              <span className="cursor-pointer flex flex-row justify-center items-center">
                                <span className="relative h-8 w-8 flex space-x-1.5">
                                  <Image
                                    src={
                                      getUserFromId(fobj.follower_userid)
                                        .avatar
                                    }
                                    alt="user"
                                    width={30}
                                    height={30}
                                    className="border border-white rounded-full"
                                    // onError={() => handleImageError(os.id)}
                                  />
                                </span>
                                <span>
                                  {
                                    getUserFromId(fobj.follower_userid)
                                      .username
                                  }
                                </span>
                              </span>
                              {/* <span>{getUserFromId(fobj.following_userid).username}</span> */}
                            </span>
                          </span>
                        );
                      })}
                  </span>
                ) : (
                  <>
                    <span className="text-white w-full h-fit flex flex-row items-center space-x-1 font-semibold">
                      <span
                        onClick={() => {
                          setOpenPremium(false);
                        }}
                        className={`flex space-x-1 flex-row h-fit w-1/2 cursor-pointer flex flex-row py-2.5 sm:py-4 justify-center items-center rounded-lg ${
                          !openPremium
                            ? "bg-pastelGreen"
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
                            ? "bg-pastelGreen"
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
                    </span>
                    {!itsMe && (
                      <span className="px-1 flex flex-col space-y-1 text-slate-500">
                        <span>
                          Joined on {getDateJoined(userBasicInfo.created_at)}
                        </span>
                        <span className="flex flex-row w-full justify-between items-center">
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
                            className="cursor-pointer text-xs sm:text-sm font-bold py-1 px-2 bg-pastelGreen text-white border-2 border-white shadow-xl rounded-2xl"
                          >
                            Send Tip
                          </span>
                        </span>
                      </span>
                    )}
                    {openPremium ? (
                      mangaLoading ? (
                        <span className="h-screen">
                          <Lottie
                            animationData={
                              darkMode ? darkloadscreen : loadscreen
                            }
                          />
                        </span>
                      ) : (
                        <span className="text-xs md:text-sm flex flex-col w-full justify-center space-y-4">
                          {mangaObjects && mangaObjects.length > 0 ? (
                            <>
                              {!itsMe ? (
                                <>
                                  <span className="flex flex-row justify-start items-center text-start">
                                    <span></span>
                                    <p className="text-slate-500">
                                      {
                                        "Premium content can be unlocked by purchasing them. Supporting mangakas by purchasing their work ensures their livelihood and encourages them to continue creating amazing stories for us to enjoy."
                                      }
                                    </p>
                                  </span>
                                  {userBasicInfo.subprice ? (
                                    <span
                                      className={`${
                                        darkMode ? "bg-[#1e1f24]" : "bg-white"
                                      } rounded-lg px-4 py-6 flex flex-row justify-between items-center`}
                                    >
                                      <span className="font-semibold flex flex-col">
                                        <span className="text-slate-400">
                                          {`Subscribe to ${userBasicInfo.username} now and unlock all premium content`}
                                        </span>
                                        <span className="text-green-400">
                                          {`$${parseFloat(
                                            userBasicInfo.subprice
                                          ).toFixed(2)} per month`}
                                        </span>
                                      </span>
                                      {subscribedUser ? (
                                        <span className="cursor-pointer font-semibold flex h-fit rounded-lg p-3.5 bg-gray-500 bg-opacity-40 text-white">
                                          <span>SUBSCRIBED</span>
                                        </span>
                                      ) : (
                                        <span
                                          onClick={() => {
                                            subscribeToPublisher();
                                          }}
                                          className="cursor-pointer font-semibold flex flex-row h-fit space-x-1 rounded-lg p-3.5 bg-pastelGreen text-white"
                                        >
                                          <span>SUBSCRIBE</span>
                                          <span>NOW</span>
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    mangaObjects.length > 0 && (
                                      <span className="italic rounded-lg px-2 flex flex-row justify-between items-center">
                                        {userBasicInfo.username} has no active
                                        or free subscription plan but you can
                                        buy their mangas and comics
                                      </span>
                                    )
                                  )}
                                </>
                              ) : (
                                <span className="w-full text-slate-500 text-center text-base md:text-base">{`You ${
                                  userBasicInfo.subprice ? "" : "currently"
                                } charge your subscribers ${
                                  userBasicInfo.subprice
                                    ? "$" +
                                      parseFloat(
                                        userBasicInfo.subprice
                                      ).toFixed(2)
                                    : "nothing"
                                } per month`}</span>
                              )}
                              <div className="h-fit grid gap-2 grid-cols-2">
                                {mangaObjects.length > 0 &&
                                  mangaObjects.map((mangaSeries) => {
                                    return (
                                      <span
                                        key={mangaSeries.id}
                                        onClick={() => {
                                          readManga(mangaSeries);
                                        }}
                                        className="cursor-pointer h-[250px] w-[160px] relative rounded-lg overflow-hidden"
                                      >
                                        <Image
                                          src={mangaSeries.cover}
                                          alt="Post"
                                          height={500}
                                          width={500}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-70 text-white flex flex-col justify-between items-start">
                                          <span className="p-1 w-full flex flex-row justify-between items-center">
                                            <span className="w-fit text-xs font-semibold py-1 px-1.5 bg-pastelGreen rounded">
                                              {`$${parseFloat(
                                                mangaSeries.price
                                              ).toFixed(2)}`}
                                            </span>
                                            <span className="text-xs font-medium text-gray-200 pr-1.5">
                                              {`${mangaSeries.pages} Pages`}
                                            </span>
                                            { itsMe && <span onClick={()=>{deleteManga(mangaSeries)}}><BinSvg pixels={"20px"}/></span>}
                                          </span>
                                          <span className="p-2 flex flex-col">
                                            <span className="text-sm font-semibold">
                                              {`${mangaSeries.name}`}
                                            </span>
                                            {mangaSeries.description && (
                                              <span className="text-[11px] leading-tight">
                                                {`${mangaSeries.description}...`}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      </span>
                                    );
                                  })}
                              </div>
                            </>
                          ) : (
                            <span className="w-full flex flex-col justify-center text-center text-slate-500">
                              <span>{`${
                                itsMe ? "You" : "This user"
                              } currently ${
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
                                  className="text-white font-semibold bg-pastelGreen py-3 px-5 cursor-pointer rounded-xl"
                                >
                                  Publish
                                </span>
                                <span
                                  onClick={() => {
                                    router.push("/subscriptionplan");
                                  }}
                                  className="text-pastelGreen font-semibold bg-transparent border-2 border-pastelGreen py-2.5 px-4 cursor-pointer rounded-xl"
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
                        {"Nanimonai! No posts found"}
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
                    className="cursor-pointer bg-pastelGreen py-0.5 px-2 rounded text-center"
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
                    className="cursor-pointer bg-pastelGreen py-0.5 px-2 rounded text-center"
                  >
                    {"<"}
                  </span>
                  <span
                    onClick={() => {
                      mangaToggle(true);
                    }}
                    className="cursor-pointer bg-pastelGreen py-0.5 px-2 rounded text-center"
                  >
                    {">"}
                  </span>
                </span>
              </span>
            </span>
          </div>
        )}

        {openManga && (
          <div id="manga-overlay" className="bg-black bg-opacity-80"></div>
        )}

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

        {
          deletionModal && <>
        <span className="absolute m-auto w-fit inset-0 h-fit top-0 flex flex-col items-center justify-center bg-white p-4 rounded">
          <span>{`Are you sure you want to delete your ${deletionModal.name} series?`}</span>
          <span className="z-50 w-full mt-4 flex flex-row justify-between items-center px-4">
            <span onClick={()=>{setDeletionModal(null); setOpenManga(false)}} className="bg-gray-400 w-[80px] px-2 py-1.5 rounded-lg text-white text-center font-medium">Cancel</span>
            <span onClick={()=>{deleteMangaFromDB(deletionModal.id)}} className="bg-red-400 w-[80px] px-2 py-1.5 rounded-lg text-white text-center font-medium">Yes</span>
          </span>
        </span>
          
          <div
              onClick={() => {
                setDeletionModal(null);
                setOpenManga(false)
              }}
              // id="tip-overlay"
              className="fixed inset-0 bg-transparent"
            ></div>
            </>
        }

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
      </main>
    </>
  );
}
