import Image from "next/image";
import saitamajpg from "@/assets/saitama.jpg";
export default function SAITAMALOGO({w, h}) {
  return (<>
    <Image
      src={saitamajpg}
      alt="SAI"
      width={w}
      height={h}
      className="rounded-full"
    /></>
  );
}
