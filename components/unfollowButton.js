import supabase from "@/hooks/authenticateUser";
import DappLibrary from "@/lib/dappLibrary";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import { useRouter } from "next/router";
import Relationships from "@/hooks/relationships";

const UnfollowButton = ({
    alreadyFollowed,
                setAlreadyFollowed,
  followerUserId,
  followingUserId,
  
}) => {
  const {
    
    setFollowingObject,
  } = useContext(UserContext);
  const router = useRouter();
  const { fetchFollows } = Relationships();

  const unfollowUser = () => {
      supabase
        .from("relationships")
        .delete()
        .match({
          follower_userid: followerUserId,
          following_userid: followingUserId,
        })
        .then((res) => {
            setAlreadyFollowed(false)
          if (router.pathname === "/profile/[user]") {
            fetchFollows(followingUserId).then((followers) => {
              if (followers.data !== null && followers.data !== undefined) {
                setFollowingObject(followers.data);
              }
            });
          }
        })
        .catch((e) => console.log(e));
  };
  return (
    <span
      onClick={unfollowUser}
      className={`cursor-pointer relative h-fit w-fit border border-gray-200 rounded-md text-xs font-medium text-white bg-gray-700 p-1`}
    >
        Unfollow
      </span>
  );
};
export default UnfollowButton;
