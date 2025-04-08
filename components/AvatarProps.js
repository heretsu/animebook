import Image from "next/image";
import customBorder from "@/assets/customborder.png";
import customBorder2 from "@/assets/customborder2.png";

export function AvatarWithBorder({ userInfo, size }) {
  return userInfo.borderid ? (
    <div className={`relative w-[${size}px] h-[${size}px]`}>
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
      ) : (
        ""
      )}
      {/* The user avatar */}
      <Image
        src={userInfo.avatar}
        alt="user avatar"
        width={size}
        height={size}
        className="object-cover rounded-full p-2"
      />
    </div>
  ) : (
    <Image
      src={userInfo.avatar}
      alt="user profile"
      height={size}
      width={size}
      className="border border-white rounded-full"
    />
  );
}
