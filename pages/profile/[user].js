import { useState, useContext, useEffect } from "react";
import onePiece from "@/assets/onePiece.jpg";
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

export const getServerSideProps = async (context) => {
  const { user } = context.query;
  return {
    props: {
      user,
    },
  };
};

export default function User({ user }) {
  const router = useRouter();
  const { fetchAllUsers, fetchAllPosts, fetchUserMangas } = DbUsers();
  const { fetchFollowing, fetchFollows } = Relationships();
  const {
    userPostValues,
    setUserPostValues,
    setPostValues,
    userNumId,
    followerObject,
    setFollowerObject,
    followingObject,
    setFollowingObject,
    setMyProfileRoute,
  } = useContext(UserContext);

  const [openPremium, setOpenPremium] = useState(false);
  const [openManga, setOpenManga] = useState(false);
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [itsMe, setItsMe] = useState(false);
  const [userBasicInfo, setUserBasicInfo] = useState(null);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [mangaObjects, setMangaObjects] = useState(null);
  const [openTipModal, setOpenTipModal] = useState(false)

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
  function userSpecificPosts(result) {
    setPostValues(
      result.data.filter(
        (r) => r.users.username.toLowerCase() === user.toLowerCase()
      )
    );
    setUserPostValues(
      result.data.filter(
        (r) => r.users.username.toLowerCase() === user.toLowerCase()
      )
    );
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

  useEffect(() => {
    fetchAllUsers().then((r) => {
      if (r.data !== null && r.data !== undefined && r.data.length !== 0) {
        const currentUserExtraInfo = r.data.find(
          (c) => c.username.toLowerCase() === user.toLowerCase()
        );
        setItsMe(currentUserExtraInfo.id === userNumId);
        if (currentUserExtraInfo.id === userNumId) {
          setMyProfileRoute(true);
        }

        fetchFollowingAndFollowers(currentUserExtraInfo.id)
          .then((res) => {
            setFollowerObject(res.followings.data);
            setFollowingObject(res.followers.data);

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

    fetchAllPosts().then((result) => {
      if (result.data !== null && result.data !== undefined) {
        userSpecificPosts(result);
      }
    });
  }, [userNumId]);

  return (
    <>
      <main>
        <section className="mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full">
          <NavBar />
          <SmallTopBar middleTab={true} />
          {userBasicInfo !== null && userBasicInfo !== undefined ? (
            <div className="w-full py-2 space-y-5 px-2 lg:pl-lPostCustom lg:pr-rPostCustom mt-2 lg:mt-20 flex flex-col">
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
                    <span className="w-full flex flex-row justify-end pt-2 pr-4">
                      {itsMe ? (
                        <span
                          onClick={() => {
                            router.push("/settings");
                          }}
                          className="cursor-pointer bg-pastelGreen font-semibold py-1.5 px-2.5 rounded"
                        >
                          Edit profile
                        </span>
                      ) : (
                        <span></span>
                      )}
                    </span>
                    <span className="rounded-b-2xl space-y-1 w-full px-2 pt-2 bg-gray-800 bg-opacity-70">
                      <span className="font-semibold flex flex-row w-full justify-between items-center">
                        <span className="flex flex-row justify-start items-center space-x-0.5">
                          <Image
                            src={userBasicInfo.avatar}
                            alt="user"
                            height={35}
                            width={35}
                            className="border border-white rounded-full"
                          />
                          <span className="font-semibold text-[0.85rem] pr-2">
                            {userBasicInfo.username}
                          </span>
                          {itsMe ? (
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
                              alreadyFollowed={alreadyFollowed}
                              setAlreadyFollowed={setAlreadyFollowed}
                              followerUserId={userNumId}
                              followingUserId={userBasicInfo.id}
                              size={"15"}
                              color={"default"}
                            />
                          )}
                        </span>
                        <span className="space-x-1.5 lg:space-x-6">
                          {userPostValues !== null &&
                            userPostValues !== undefined && (
                              <span>{`${userPostValues.length} Posts`}</span>
                            )}
                          <span>{followerObject.length} Following</span>
                          <span>{followingObject.length} Followers</span>
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
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
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
                      <span onClick={()=>{setOpenTipModal(true)}} className="cursor-pointer text-xs sm:text-sm font-bold py-1 px-2 bg-pastelGreen text-white border-2 border-white shadow-xl rounded-2xl">
                        Send Tip
                      </span>
                    </span>
                  </span>
                )}
                {openPremium ? (
                  mangaLoading ? (
                    <span className="mx-auto text-slate-500">
                      fetching mangas...
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
                              {userBasicInfo.subprice && (
                                <span className="bg-white rounded-lg px-4 py-6 flex flex-row justify-between items-center">
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
                                  <span className="cursor-pointer font-semibold flex flex-row h-fit space-x-1 rounded-lg p-3.5 bg-pastelGreen text-white">
                                    <span>SUBSCRIBE</span>
                                    <span>NOW</span>
                                  </span>
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="w-full text-slate-500 text-center text-base md:text-base">{`You ${
                              userBasicInfo.subprice ? "" : "currently"
                            } charge your subscribers ${
                              userBasicInfo.subprice
                                ? "$" +
                                  parseFloat(userBasicInfo.subprice).toFixed(2)
                                : "nothing"
                            } per month`}</span>
                          )}
                          <div className="h-fit grid gap-2 grid-cols-3">
                            {mangaObjects.length > 0 &&
                              mangaObjects.map((mangaSeries) => {
                                return (
                                  <span
                                    key={mangaSeries.id}
                                    onClick={() => {
                                      // setOpenManga(true);
                                    }}
                                    className="cursor-pointer h-fit relative rounded-lg overflow-hidden"
                                  >
                                    <Image
                                      src={mangaSeries.cover}
                                      alt="Post"
                                      height={500}
                                      width={500}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-70 text-white flex flex-col justify-between items-start">
                                      <span className="p-1 w-full flex flex-row justify-between items-center">
                                        <span className="w-fit py-1 px-1.5 bg-pastelGreen rounded">
                                          {`$${parseFloat(
                                            mangaSeries.price
                                          ).toFixed(2)}`}
                                        </span>
                                        <span className="text-gray-200 pr-1.5">
                                          {`${mangaSeries.pages} Pages`}
                                        </span>
                                      </span>
                                      <span className="p-2">
                                        <p className="font-semibold">
                                          {`${mangaSeries.name}`}
                                        </p>
                                        {mangaSeries.description && (
                                          <p className="text-xs md:text-sm">
                                            {`${mangaSeries.description}...`}
                                          </p>
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

                      {itsMe && (
                        <span className="space-x-2 border border-black bg-white border-dashed rounded-lg p-4 flex justify-center items-center">
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
                      )}
                    </span>
                  )
                ) : (
                  <Posts />
                )}
              </div>
            </div>
          ) : (
            <div className="text-start text-slate-500 w-full py-2 space-y-5 px-2 lg:pl-lPostCustom lg:pr-rPostCustom mt-2 lg:mt-20 flex flex-col">
              fetching info...
            </div>
          )}
          <div>
            <div className="hidden lg:block ml-80 py-2 pr-rSearchPadding w-screen fixed left-0">
              <LargeTopBar relationship={false} />
            </div>
          </div>

          <div className="hidden lg:block fixed right-2 top-20">
            <LargeRightBar />
          </div>
        </section>
        <MobileNavBar />
        <div
          id={openManga ? "manga-modal" : "invisible"}
          className="w-11/12 sm:w-10/12 flex justify-center"
        >
          <span className="w-fit space-y-[0.13rem] flex flex-col justify-start items-center">
            <span className="text-black w-fit bg-white rounded-lg w-full mb-2 p-4 text-sm font-semibold">
              {"One Thief: Chapter 1"}
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
                src={onePiece}
                alt="post"
                height={500}
                width={500}
                className="rounded-xl object-contain border-[0.25rem] border-white"
              />
              <span className="font-semibold text-white px-2.5 absolute w-full flex justify-between">
                <span className="cursor-pointer bg-pastelGreen py-0.5 px-2 rounded text-center">
                  {"<"}
                </span>
                <span className="cursor-pointer bg-pastelGreen py-0.5 px-2 rounded text-center">
                  {">"}
                </span>
              </span>
            </span>
          </span>
        </div>
        {openManga && (
          <div id="manga-overlay" className="bg-black bg-opacity-80"></div>
        )}
        {openTipModal && (<>
          <PopupModal
            success={"6"}
            username={userBasicInfo.username}
            avatar={userBasicInfo.avatar}
            sourceAddress={userNumId}
            destinationAddress={userBasicInfo.address}
            userDestinationId={userBasicInfo.id}
          />
          <div onClick={()=>{setOpenTipModal(false)}} id="tip-overlay"></div>
          </>
        )}
      </main>
    </>
  );
}
