import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import NavBar, { MobileNavBar } from "@/components/navBar";
import SideBar from "@/components/sideBar";
import { UserContext } from "../lib/userContext";
import { useContext } from "react";

export default function StreamAnalytics() {
  const {darkMode, sideBarOpened} = useContext(UserContext)
  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <div className="lg:hidden block z-40 sticky top-0">
        <SmallTopBar relationship={false} />
      </div>
      <section className="mb-5 flex flex-row lg:space-x-2 w-full">
        <div className="w-full flex flex-row justify-between space-x-0">
          <div className="hidden w-[250px] lg:flex">
            <NavBar />
          </div>
          <div className={`flex-1 flex ${darkMode ? "text-white" : "text-black"} items-center justify-center h-screen`}>
            You have no analytics at the moment
          </div>
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
}
