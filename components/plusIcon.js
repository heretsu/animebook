import supabase from "@/hooks/authenticateUser";
import DappLibrary from "@/lib/dappLibrary";
import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import { useRouter } from "next/router";
import Relationships from "@/hooks/relationships";
const PlusIcon = ({
  alreadyFollowed,
  setAlreadyFollowed,
  followerUserId,
  followingUserId,
  color,
  size,
}) => {
  const {
    followerObject,
    setFollowerObject,
    followingObject,
    setFollowingObject,
  } = useContext(UserContext);
  const router = useRouter()
  const {fetchFollows} = Relationships()

  const { sendNotification } = DappLibrary();

  const followUser = () => {
    if (alreadyFollowed) {
      console.log("already followed");
    } else {
      setAlreadyFollowed(true);
      supabase
        .from("relationships")
        .insert({
          follower_userid: followerUserId,
          following_userid: followingUserId,
        })
        .then((res) => {
          if (router.pathname === "/profile/[user]"){
            fetchFollows(followingUserId).then((followers)=>{
              if (followers.data !== null && followers.data !== undefined){
                setFollowingObject(followers.data)
              }
            })
          }
          sendNotification("newfollow", followingUserId, null, null, "");
          
        })
        .catch((e) => console.log(e));
    }
  };
  return (
    <span
      onClick={followUser}
      className="cursor-pointer relative border border-red-400 bg-white h-fit w-fit rounded-full"
    >
      <svg
        onClick={() => {}}
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        height={`${size}px`}
        width={`${size}px`}
        stroke="transparent"
        fill="#f87171"
        x="0px"
        y="0px"
        viewBox="0 0 52 52"
        style={{
          enableBackground: "new 0 0 52 52",
        }}
        xmlSpace="preserve"
      >
        <path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M38.5,28H28v11c0,1.104-0.896,2-2,2 s-2-0.896-2-2V28H13.5c-1.104,0-2-0.896-2-2s0.896-2,2-2H24V14c0-1.104,0.896-2,2-2s2,0.896,2,2v10h10.5c1.104,0,2,0.896,2,2 S39.604,28,38.5,28z" />
      </svg>
    </span>
  );
};
export default PlusIcon;
