import NavBar, { MobileNavBar } from "@/components/navBar";
import EditProfileContainer from "@/components/editProfileContainer";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useRouter } from "next/router";
const Settings = () => {
  const router = useRouter()
  const {disconnectWallet} = ConnectionData() 

  const logOut = async () => {
    try {
      disconnectWallet()
      await supabase.auth.signOut()
      router.push("/signin")
    } catch (error) {
      throw "a problem occurred";
    }
  };

  return (
    <main>
    <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
        <EditProfileContainer />
        <span
        onClick={() => {logOut()}}
        className="w-fit cursor-pointer px-4 py-1 bg-transparent border-2 border-red-400 text-red-400 text-center rounded-lg"
      >
        Log out
      </span>
      </div>
    </section>
    <MobileNavBar />
    </main>
  );
};
export default Settings;
