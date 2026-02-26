import LargeTopBar from "@/components/largeTopBar";
import NavBar, { MobileNavBar } from "@/components/navBar";
import PostContainer from "@/components/postContainer";
import SmallPostContainer from "@/components/smallPostContainer";
import { UserContext } from "../lib/userContext";
import { useContext } from "react";

const CreatePostPage = () => {
  const {darkMode} = useContext(UserContext)

  return (
    <main id="scrollbar-remove" className={`h-screen overflow-y-scroll ${darkMode ? 'bg-[#17181C]' : 'bg-[#F9F9F9]'}`}>
    <div className="hidden lg:block block z-40 sticky top-0">
      <LargeTopBar relationship={false} />
    </div>
    <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <span className={`italic font-bold text-center w-full ${darkMode ? 'text-white' : 'text-black'}`}>Share your thoughts..</span>
        <SmallPostContainer />
      </div>
    </section>
    <MobileNavBar />
    </main>
  );
};
export default CreatePostPage;
