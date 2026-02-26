import Image from "next/image";
import saitamajpg from "@/assets/saitama.jpg";
export default function SAITAMALOGO({w, h}) {
  return (<>
    <Image
      src={'/assets/publicsaitama.jpg'}
      alt="SAI"
      width={w}
      height={h}
      className="rounded-full"
    /></>
  );
}
