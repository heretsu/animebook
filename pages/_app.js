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

export default function App({ Component, pageProps }) {
  const { fetchAllPosts } = DbUsers();
  const router = useRouter();
  const [address, setAddress] = useState(null);
  const { connectToWallet } = ConnectionData();
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
  const [onboarding, setOnboarding] = useState(false)
  const [allUsers, setAllUsers] = useState(null)
  const [oauthDetails, setOauthDetails] = useState(null)

  const checkIfUserExistsAndUpdateData = async (user) => {
    try {
      const dbresponse = await supabase
        .from("users")
        .select("*")
        
      if (dbresponse.error) {
        console.error("ERROR FROM OUTER USER ID CHECK: ", dbresponse.error);
      } else {
        setAllUsers(dbresponse.data)
        const data = dbresponse.data.find((u) => u.useruuid === user.id)
        /*
        checking if user exists in db after authentication
        if user does not exist i.e(!data) then add user to db   
      */

        if (!data) {
          const { addr } = await connectToWallet();
          setAddress(addr);
          if (user.user_metadata.preferred_username) {
            const newUser = {
              useruuid: user.id,
              username: user.user_metadata.preferred_username,
              avatar: user.user_metadata.picture,
              address: addr,
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
              setUserNumId(res.data[0].id);
              setUserData({
                preferred_username: res.data[0].username,
                picture: user.user_metadata.picture,
                ...res.data[0],
              });
              if (router.pathname !== "/profile/[user]") {
                fetchAllPosts().then((result) => {
                  setOriginalPostValues(result.data);
                  setPostValues(result.data);
                });
              }
            } else {
              console.log("ERROR FROM INNER USER ID CHECK: ", res.error);
            }
          } else{
            setOnboarding(true)
          }
        } else {
          setUserNumId(data.id);
          setAddress(data.address);
          setUserData({
            preferred_username: data.username,
            picture: user.user_metadata.picture,
            ...data,
          });
          if (router.pathname !== "/profile/[user]") {
            fetchAllPosts().then((result) => {
              setOriginalPostValues(result.data);
              setPostValues(result.data);
            });
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
    if (
      [
        "/home",
        "/explore",
        "/communities",
        "/communities/[community]",
        "/notifications",
        "/profile/[user]",
        "/comments/[comments]",
        "/settings",
        "/earn",
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
              setOauthDetails(session.user)
              checkIfUserExistsAndUpdateData(session.user);
            }
          } else {
            if (router.pathname !== "/profile/[user]") {
              fetchAllPosts().then((result) => {
                setOriginalPostValues(result.data);
                setPostValues(result.data);
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
  }, [address, router.pathname, router, subscribed]);

  return (
    <UserContext.Provider
      value={{
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
      }}
    >
      <span className="text-sm sm:text-base">
        {[
          "/notifications",
          "/create",
          "/publishmanga",
          "/settings",
          "/earn",
          "/subscriptionplan",
        ].includes(router.pathname) ? (
          authLoading ? (
            <div className="pt-8">
              <PopupModal success={"4"} messageTopic={""} moreInfo={""} />
              <div id="overlay"></div>
            </div>
          ) : subscribed ? (
            userData ? (
              address ? (
                <Component {...pageProps} />
              ) : (
                <div className="pt-8">
                  <DappLogo size={"default"} />
                  <PopupModal
                    success={"5"}
                    messageTopic={""}
                    moreInfo={""}
                    username={userData.username}
                    avatar={userData.avatar}
                  />
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
          ) : (
            <div className="pt-8">
              <DappLogo size={"default"} />
              <PopupModal success={"3"} messageTopic={""} moreInfo={""} />
              <div id="overlay"></div>
            </div>
          )
        ) : (onboarding ? <Onboard allUsers={allUsers} me={oauthDetails} address={address} /> :
          <Component {...pageProps} />
        )}
      </span>
    </UserContext.Provider>
  );
}
