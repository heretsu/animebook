import Image from "next/image";
import PlusIcon from "./plusIcon";
import { useContext, useState } from "react";
import { UserContext } from "../lib/userContext";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export default function UserContainer({ user }) {
  const { userNumId } = useContext(UserContext);
  const [userFollowed, setUserFollowed] = useState(false);
  const {fullPageReload} = PageLoadOptions()

  const followUser = () => {
   
  };

  return (
    <span className="flex flex-row justify-between w-full">
      <span onClick={()=>{fullPageReload(`/profile/${user.username.toLowerCase()}`, 'window')}} className="cursor-pointer space-x-1 flex flex-row justify-center items-center">
        <span className="relative h-8 w-8 flex flex-shrink-0 space-x-1.5">
          <Image
            src={user.avatar}
            alt="user"
            width={35}
            height={35}
            className="border border-black rounded-full"
            // onError={() => handleImageError(os.id)}
          />
        </span>
        <span>{user.username}</span>
      </span>

      {/* {userFollowed ? (
        ""
      ) : (
        <span
          onClick={followUser}
          className={`cursor-pointer relative h-fit w-fit rounded-md text-xs font-medium text-white bg-[#EB4463] py-1 px-3`}
        >
          Add
        </span>
      )} */}
    </span>
  );
}
