import supabase from "@/hooks/authenticateUser";
import DappLibrary from "@/lib/dappLibrary";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import { useRouter } from "next/router";
import Relationships from "@/hooks/relationships";
const PlusIcon = ({
  ymk,
  sideBar,
  alreadyFollowed,
  setAlreadyFollowed,
  followerUserId,
  followingUserId,
  color,
  size,
}) => {
  const {
    youMayKnow,
    setYouMayKnow,
    newPeople,
    setNewPeople,
    followerObject,
    setFollowerObject,
    followingObject,
    setFollowingObject,
    darkMode
  } = useContext(UserContext);
  const router = useRouter();
  const { fetchFollows } = Relationships();

  const { sendNotification } = DappLibrary();

  const followUser = () => {
    if (alreadyFollowed) {
      console.log("already followed");
    } else {
      if (!ymk) {setAlreadyFollowed(true)}
      if (newPeople && newPeople.length > 0) {
        setNewPeople(
          newPeople.filter((np) => {
            return np.id !== followingUserId;
          })
        );
      }
      if (youMayKnow && youMayKnow.length > 0) {
        setYouMayKnow(
          youMayKnow.filter((yk) => {
            return yk.id !== followingUserId;
          })
        );
      }
      console.log('clicked')
      // return
      
      supabase
        .from("relationships")
        .insert({
          follower_userid: followerUserId,
          following_userid: followingUserId,
        })
        .then((res) => {
          if (router.pathname === "/profile/[user]") {
            fetchFollows(followingUserId).then((followers) => {
              // if (followers.data !== null && followers.data !== undefined) {
              //   setFollowingObject(followers.data);
              // }
            });
          }
          sendNotification("newfollow", followingUserId, null, null, "");
        })
        .catch((e) => console.log(e));
    }
  };
  return (
    <span
      onClick={followUser}
      className={`cursor-pointer relative h-fit w-fit rounded-md text-xs font-medium text-white bg-[#EB4463] py-1 px-3`}
    >Follow
    </span>
  );
};
export default PlusIcon;