import { useState, useEffect } from "react";
import Relationships from "@/hooks/relationships";
import Image from "next/image";
import PlusIcon from "./plusIcon";
import PageLoadOptions from "@/hooks/pageLoadOptions";
export default function NotifCard({ note, myProfileId, typeOfNotif }) {
  const {fullPageReload} = PageLoadOptions()
  const { fetchFollows } = Relationships();
  const [alreadyFollowed, setAlreadyFollowed] = useState(null);

  const performAction = () => {
    if (note.postid){
      fullPageReload(`comments/${note.postid}`)
    }
  };

  useEffect(() => {
    if (typeOfNotif === "newfollower") {
      fetchFollows(note.userid).then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setAlreadyFollowed(
            !!res.data.find((rel) => rel.follower_userid === myProfileId)
          );
        }
      });
    }
  }, []);
  return (
    <span
      
      className="p-2 bg-white border border-gray-300 rounded flex flex-row justify-between items-center"
    >
      <span className="cursor-pointer flex justify-start items-center space-x-2">
        {note.avatar !== null && note.avatar !== undefined && (
          <span
            onClick={() => {
              fullPageReload(`/profile/${note.username}`);
            }}
            className="relative h-8 w-8 flex"
          >
            <Image
              src={note.avatar}
              alt="user profile"
              height={30}
              width={30}
              className="rounded-full"
            />
          </span>
        )}
        <span className="" onClick={()=>{performAction()}}>
          {note.username} {note.content}
        </span>
      </span>

      {typeOfNotif !== "newfollower" ? (
        ""
      ) : typeOfNotif === "newfollower" && alreadyFollowed === null ? (
        ""
      ) : alreadyFollowed ? (
        <span className="text-slate-600 text-sm">Following</span>
      ) : (
        <PlusIcon
          alreadyFollowed={alreadyFollowed}
          setAlreadyFollowed={setAlreadyFollowed}
          followerUserId={myProfileId}
          followingUserId={note.userid}
          size={"19"}
          color={"default"}
        />
      )}
    </span>
  );
}
