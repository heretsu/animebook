import NavBar, { MobileNavBar } from "@/components/navBar";
import animeBookLogo from "@/assets/animeBookLogo.png";
import Image from "next/image";

const Earn = () => {
  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <div className="flex flex-col pt-24 w-full justify-center items-center text-center text-[2rem]">
            <span>
              <Image
                src={animeBookLogo}
                alt="anime book logo"
                width={200}
                height={200}
                className="rounded-t-xl object-cover"
              />
            </span>
            <span className="flex flex-row">
              <span id="anime-book-font" className="pr-4 text-black">
                Coming
              </span>
              <span id="anime-book-font" className="text-green-500">
                so
              </span>
              <span className="text-invisible text-white">o</span>
              <span id="anime-book-font" className="text-green-500">
                on
              </span>
            </span>
            <span className="pt-2 pr-0.5 font-bold text-sm text-slate-500">
              近日公開
            </span>
          </div>
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Earn;
