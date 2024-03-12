import NavBar, {MobileNavBar} from "@/components/navBar";

const Earn = () => {
  return (
    <main>
    <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
        <div className="flex flex-row pt-24 w-full justify-center items-center text-center text-[2rem]">
          <span id="anime-book-font" className="pr-4 text-black">
            Coming
          </span>
          <span id="anime-book-font" className="text-green-500">so</span>
          <span className="text-invisible text-white">o</span>
          <span id="anime-book-font" className="text-green-500">on</span>
        </div>
        </div>
    </section>
    <MobileNavBar />
    </main>
  );
};
export default Earn;
