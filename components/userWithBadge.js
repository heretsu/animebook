import Image from "next/image"
import Badge from "./badge"
import { useContext } from "react"
import { UserContext } from "../lib/userContext"

export default function UserWithBadge({avatar, size, mvpType}){
    const {darkMode} = useContext(UserContext)
    return <span className="relative h-9 w-9 flex">
    <Image
      src={avatar}
      alt="user profile"
      height={size}
      width={size}
      className={`border ${
        darkMode ? "border-white" : "border-black"
      } rounded-full object-cover`}
    />
    <span className="absolute -mt-2 top-0 right-0 bg-[#292C33] p-1 rounded-full">
      <Badge
        color={"#EB4463"}
        className={"w-3 h-3"}
      />
    </span>
  </span>
}

export function BiggerUserWithBadge({avatar, size, mvpType}){
    const {darkMode} = useContext(UserContext)
    return <span className="relative h-[90px] w-[90px] flex">
    <Image
      src={avatar}
      alt="user profile"
      height={size}
      width={size}
      className={`border ${
        darkMode ? "border-white" : "border-black"
      } flex flex-shrink-0 h-[90px] w-[90px] rounded-full`}
    />
    <span className="absolute -mt-0.5 top-0 right-0 bg-[#292C33] p-1 rounded-full">
      <Badge
        color={"#EB4463"}
        className={"w-4 h-4"}
      />
    </span>
  </span>
}