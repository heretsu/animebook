import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import StreamViewer from "@/livestuff/viewer";
import { createClient } from "@supabase/supabase-js";
import { UserContext } from "../../lib/userContext";
import SideBar from "@/components/sideBar";
import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import supabase from "@/hooks/authenticateUser";

export default function WatchPage() {
  const {fullPageReload} = PageLoadOptions()
  const router = useRouter();
  const { roomName } = router.query;
  const {
    darkMode,
    userData,
    sideBarOpened,
    followingObject,
    setFollowingObject, expandStream, setExpandStream
  } = useContext(UserContext);

  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!roomName) return;
    fetchStreamInfo();
  }, [roomName]);

  const fetchStreamInfo = async () => {
    const { data } = await supabase
      .from("live_streams")
      .select("*, users(id, avatar, username, bio, ki, borderid)")
      .eq("room_name", roomName)
      .eq("status", "live")
      .single();

    if (data){
      
      if (data.users.id === userData.id){
        fullPageReload('/stream')
      } else{
        setStream(data);
      }
    } 
    else {
      setStream("nostream")
    }
  };

  if (!userData || !userData.username || !stream) return <div>Loading...</div>;

  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      {!expandStream && <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>}
      {/* {!expandStream && <div className="lg:hidden block z-40 sticky top-0">
        <SmallTopBar relationship={false} />
      </div>} */}
      <section className={!expandStream && "mb-5 flex flex-row lg:space-x-2 w-full"}>
        <div className={!expandStream && "w-full flex flex-row justify-between space-x-0"}>
          {!expandStream && <div className="hidden w-[250px] lg:flex">
            <NavBar />
          </div>}
          <div className={!expandStream && "flex-1 h-screen p-4 overflow-scroll"}>
            <div
              id="scrollbar-remove"
              className={!expandStream && "h-fit flex flex-row"}
            >
              <div className={!expandStream && "flex-1"}>
                {stream === "nostream" ? (
                  <div className="h-[40vh] w-full bg-black flex items-center justify-center">
                  <div className="text-white text-xl">Stream Ended</div>
                </div>
                ) : (
                  <StreamViewer
                    roomName={roomName}
                    userName={userData.username}
                    stream={stream}
                    darkMode={darkMode}
                    userData={userData}
                    followingObject={followingObject}
                    setFollowingObject={setFollowingObject}
                    expandStream={expandStream}
                    setExpandStream={setExpandStream}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      {!expandStream &&<MobileNavBar />}
    </main>
  );
}
