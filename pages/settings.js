import NavBar, { MobileNavBar } from "@/components/navBar";
import EditProfileContainer from "@/components/editProfileContainer";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useRouter } from "next/router";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import { UserContext } from "@/lib/userContext";
import { useContext } from "react";
import SideBar from "@/components/sideBar";
import LargeRightBar from "@/components/largeRightBar";

const Settings = () => {
  const router = useRouter()
  const {disconnectWallet} = ConnectionData();
  const {darkMode, sideBarOpened} = useContext(UserContext);

  const logOut = async () => {
    try {
      try{disconnectWallet()}catch(e){}
      await supabase.auth.signOut()
      router.push("/signin")
    } catch (error) {
      throw "a problem occurred";
    }
  };

  return (
    <main className={`${darkMode ? 'bg-[#17181C]' : 'bg-[#F9F9F9]'}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <div className="lg:hidden block z-40 sticky top-0">
        <SmallTopBar relationship={false} />
      </div>
    <section className="mb-5 flex flex-row lg:space-x-2 w-full">
        <NavBar />
        <div className="w-full px-2 space-y-8 pl-2 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] mt-4 flex flex-col">
        <EditProfileContainer />
        <span
        onClick={() => {logOut()}}
        className="w-fit cursor-pointer px-4 py-1 bg-transparent border-2 border-red-400 text-red-400 text-center rounded-lg"
      >
        Log out
      </span>
      </div>
      <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
    </section>
    {sideBarOpened && <SideBar />}

    <MobileNavBar />
    </main>
  );
};
export default Settings;
