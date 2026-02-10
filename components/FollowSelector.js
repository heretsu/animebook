import supabase from "@/hooks/authenticateUser";

import Relationships from "@/hooks/relationships";
import PlusIcon from "@/components/plusIcon";
import { useEffect, useState } from "react";

export default function FollowSelector({targetUserid, userData, followingObject, setFollowingObject}) {
  const [alreadyFollowed, setAlreadyFollowed] = useState(false);
  const [loaded, setLoaded] = useState(false)
  const {fetchFollows} = Relationships()

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
      })
      .catch((e) => console.log('unfollowthisuser2 error: ', e));
  };

  useEffect(() => {
    fetchFollows(targetUserid).then((res) => {
      if (res.data !== undefined && res.data !== null) {
        setAlreadyFollowed(
          !!res.data.find((rel) => rel.follower_userid === userData.id)
        );
        setLoaded(true)
      }
    });
  }, []);

  return (
    <span>
      {userData && loaded && userData.id !== targetUserid && !alreadyFollowed && (
          <span className="bg-[#EB4463] rounded py-0.5 px-3">
            <PlusIcon
              ymk={false}
              alreadyFollowed={alreadyFollowed}
              setAlreadyFollowed={setAlreadyFollowed}
              followerUserId={userData.id}
              followingUserId={targetUserid}
              size={"15"}
              color={"transparent"}
            />
          </span>
        )}
    </span>
  );
}