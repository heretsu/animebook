import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import LiveStream from "../livestuff/LiveStream";
import NavBar, { MobileNavBar } from "@/components/navBar";
import LargeRightBar from "@/components/largeRightBar";
import SideBar from "@/components/sideBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import CustomizeStreamModal from "@/livestuff/pickables/CustomizeStreamModal";
import supabase from "@/hooks/authenticateUser";
import Head from "next/head";

export default function StreamPage() {
  const { userData, darkMode, sideBarOpened } = useContext(UserContext);
  const [showVideo, setShowVideo] = useState(true);
  const [onOpenCustomizeStream, setOnOpenCustomizeStream] = useState(false);
  const [onOpenScheduler, setOnOpenScheduler] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: [],
    scheduledDate: "",
    thumbnail_url: ""
  });

  const [stream, setStream] = useState(null);
  const [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const endStream = async () => {
    await fetch("/api/streams/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: `stream-${userData.useruuid}` }),
    });
    setIsConnected(false);
  };

  const startStream = async () => {
    // Generate token
    const res = await fetch("/api/livetoken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: `stream-${userData.useruuid}`,
        participantName: userData.username,
        isHost: true,
      }),
    });
    const data = await res.json();

    // Save to database - makes stream discoverable
    await fetch("/api/streams/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: `stream-${userData.useruuid}`,
        userId: userData.useruuid,
        title: formData.title,
        category: formData.category,
        tags: formData.tags,
        thumbnail_url: formData.thumbnail_url ? formData.thumbnail_url : 'https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/blackBackground.png'
      }),
    });

    setStream({
      room_name: `stream-${userData.useruuid}`,
      useruuid: userData.useruuid,
      title: formData.title,
      status: "live",
      category: formData.category ? formData.category : null,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
      thumbnail_url: formData.thumbnail_url ? formData.thumbnail_url : 'https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/blackBackground.png',
      users: userData,
    });

    setFormData({
      title: "",
      category: "",
      tags: [],
      scheduledDate: "",
      thumbnail_url: ""
    });
    setToken(data.token);
    setIsConnected(true);
  };

  const scheduleStream = async () => {
    const { data, error } = await supabase
      .from("live_streams")
      .insert({
        room_name: `stream-${userData.useruuid}`,
        useruuid: userData.useruuid,
        title: formData.title,
        status: "upcoming",
        category: formData.category,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
        started_at: new Date(formData.scheduledDate).toISOString(),
        thumbnail_url: formData.thumbnail_url ? formData.thumbnail_url : "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/blackBackground.png",
      })
      .select()
      .single();

    if (error) {
      console.log(error);
    }
  };

  const handleVideoEnd = () => {
    setShowVideo(false);
  };
  const [isCheckingStream, setIsCheckingStream] = useState(true);

  useEffect(() => {
    if (!userData) return;

    const checkExistingStream = async () => {
      try {
        const { data: existingStream, error } = await supabase
          .from("live_streams")
          .select("*")
          .eq("useruuid", userData.useruuid)
          .eq("status", "live")
          .single();

        if (existingStream && !error) {
          // Stream exists! Regenerate token and reconnect
          const res = await fetch("/api/livetoken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName: `stream-${userData.useruuid}`,
              participantName: userData.username,
              isHost: true,
            }),
          });
          const data = await res.json();

          setStream(existingStream);
          setToken(data.token);
          setIsConnected(true);
          console.log("Reconnected to existing stream");
        }
      } catch (error) {
        console.error("Error checking stream:", error);
      } finally {
        setIsCheckingStream(false);
      }
    };

    checkExistingStream();
  }, [userData]);

  if (!userData || isCheckingStream) return null;

  if (showVideo) {
    return (
      <div
        onClick={handleVideoEnd}
        className={`fixed inset-0 z-[100] bg-white flex items-center justify-center`}
      >
        <video
          onEnded={handleVideoEnd}
          className="w-80 h-80 object-cover"
          playsInline
          autoPlay
          muted={true}
        >
          <source src="/assets/openstream.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }
  return null
  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <Head>
        <title>AnimeBook | Live Stream</title>
        <meta property="og:title" content="Watch Live on AnimeBook" />
        <meta property="og:description" content="Join the stream and chat with the community!" />
        <meta property="og:url" content="https://animebook-theta.vercel.app/stream" />
        
        {/* This is the image Telegram will show */}
        <meta property="og:image" content="https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/surpisedLogo.png" />
        
        {/* Large Image Card for Telegram/Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/surpisedLogo.png" />
      </Head>
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
          <div className="flex-1 h-screen">
            {onOpenCustomizeStream && (
              <CustomizeStreamModal
                isOpen={true}
                onClose={() => {
                  setOnOpenCustomizeStream(false);
                }}
                darkMode={darkMode}
                schedule={false}
                formData={formData}
                setFormData={setFormData}
                onStartStream={startStream}
              />
            )}

            {onOpenScheduler && (
              <CustomizeStreamModal
                isOpen={true}
                onClose={() => {
                  setOnOpenScheduler(false);
                  setFormData({
                    title: "",
                    category: "",
                    tags: [],
                    scheduledDate: "",
                    thumbnail_url: ""
                  });
                }}
                darkMode={darkMode}
                schedule={true}
                formData={formData}
                setFormData={setFormData}
                onStartStream={scheduleStream}
              />
            )}

            <LiveStream
              roomName={`stream-${userData.useruuid}`}
              stream={stream}
              setStream={setStream}
              userData={userData}
              setOnOpenCustomizeStream={setOnOpenCustomizeStream}
              setOnOpenScheduler={setOnOpenScheduler}
              darkMode={darkMode}
              formData={formData}
              setFormData={setFormData}
              startStream={startStream}
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              token={token}
            />
          </div>
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
}
