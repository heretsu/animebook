import Image from "next/image";
import customBorder from "@/assets/customborder.png";
import customBorder2 from "@/assets/customborder2.png";
import fireborder from "@/assets/fireborder.png"


export function AvatarWithBorder({ userInfo, size }) {
  return userInfo.borderid ? (
    <span className={`relative w-[${size + (size * 0.5)}px] h-[${size + (size * 0.5)}px]`}>
    {/* The border ring */}
    {userInfo.borderid === 1 ? (
      <Image
        src={customBorder}
        alt="custom border"
        fill
        className="object-contain"
      />

      
    ) : userInfo.borderid === 2 ? (
      <Image
        src={customBorder2}
        alt="custom border"
        fill
        className="object-contain"
      />
    ) : userInfo.borderid === 3 ? (
      <Image
        src={fireborder}
        alt="custom border"
        fill
        className="object-contain"
      />
    ) : null}
  
    {/* The user avatar */}
    <Image
      src={userInfo.avatar}
      alt="user avatar"
      width={size + (size * 0.5)}
      height={size + (size * 0.5)}
      className="object-cover rounded-full p-1.5"
    />
  </span>
  
  ) : (
    <span className="relative h-9 w-9 flex">

    <Image
      src={userInfo.avatar}
      alt="user profile"
      height={size}
      width={size}
      className="border border-white rounded-full"
    />
        </span>

  );
}
