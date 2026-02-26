"use client";
import { useState, useEffect, useContext } from "react";
import supabase from "@/hooks/authenticateUser";
import Link from "next/link";
import NavBar, { MobileNavBar } from "@/components/navBar";
import SideBar from "@/components/sideBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import { UserContext } from "../lib/userContext";
import Image from "next/image";
import dynamic from "next/dynamic";
import animationData from "@/assets/kianimation.json";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LiveStreamsPage() {
  const { fullPageReload } = PageLoadOptions();
  const { sideBarOpened, darkMode } = useContext(UserContext);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    fetchLiveStreams();

    const channel = supabase
      .channel("live_streams_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_streams",
        },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const { data: streamWithUser } = await supabase
              .from("live_streams")
              .select("*, users(id, avatar, username, bio, ki)")
              .eq("id", payload.new.id)
              .single();

            if (payload.eventType === "INSERT") {
              setStreams((prev) => [streamWithUser, ...prev]);
            } else {
              setStreams((prev) =>
                prev.map((s) =>
                  s.id === streamWithUser.id ? streamWithUser : s
                )
              );
            }
          } else if (payload.eventType === "DELETE") {
            setStreams((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchLiveStreams = async () => {
    const { data } = await supabase
      .from("live_streams")
      .select("*, users(id, avatar, username, bio, ki)")
      .eq("status", "live")
      .order("started_at", { ascending: false });

    setStreams(data || []);
  };

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
          <div className="flex-1 h-screen p-4 overflow-scroll pb-24">
            {/* {streams && streams.length === 0 && (
              <div className="flex lg:hidden pb-3 w-full items-center justify-end">
              <Link
                href={`/stream`}
                className="cursor-pointer px-2.5 py-1.5 rounded-md text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #ec4899 100%)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                }}
              >
                Go Live
              </Link>
            </div>
            )} */}

            <div
              id="scrollbar-remove"
              className="h-fit flex flex-row overflow-x-scroll gap-2"
            >
              {streams && streams.length > 0 ? (
                <Link
                  href={`/watch/${streams[0].room_name}`}
                  className="cursor-pointer flex-shrink-0 relative flex flex-row h-[40vh] w-full"
                >
                  <span className="relative w-full flex flex-row justify-between">
                    <span
                      className={`${
                        darkMode ? "bg-black text-white" : "bg-white text-black"
                      } w-full p-4 space-x-1 flex flex-col items-start z-10`}
                    >
                      <span className="h-full flex flex-col justify-between pb-2 md:pb-8 w-full">
                        <span>
                          <span className="flex flex-row items-center justify-start">
                            <span className="relative h-8 w-8 sm:h-10 sm:w-10 flex">
                              <Image
                                src={streams[0].users.avatar}
                                alt="user profile"
                                width={55}
                                height={55}
                                className=" rounded-full"
                              />
                            </span>

                            <span className="ml-1.5 rounded-b-md font-bold text-sm font-bold">
                              {streams[0].users.username}
                            </span>
                            <span className="-ml-1 h-6 w-8">
                              <Lottie animationData={animationData} />
                            </span>
                            <span className="flex items-center -ml-1.5 text-xs font-medium text-blue-400">
                              {parseFloat(
                                parseFloat(streams[0].users.ki).toFixed(2)
                              )}
                            </span>
                            <span className="ml-1.5 bg-red-600 text-white text-xs font-semibold px-1 py-0.5 rounded">
                              LIVE
                            </span>
                          </span>

                          <span className="flex flex-col space-y-0.5 mt-1">
                            <span className="text-sm">
                              {streams[0].viewer_count} watching
                            </span>
                            <span className="text-sm font-semibold">
                              {streams[0].title ||
                                streams[0].users.bio ||
                                "We are live"}
                            </span>

                            <span className="text-xs font-semibold">
                              {streams[0].category || "Just Chatting"}
                            </span>
                            <span className="flex flex-row space-x-1">
                              {streams[0].tags &&
                                streams[0].tags.length > 0 &&
                                streams[0].tags.map((tag, index) => (
                                  <div
                                    key={index}
                                    className={`tag-chip-regular ${
                                      darkMode ? "text-white" : "text-black"
                                    } rounded-md px-1`}
                                  >
                                    <span>{tag}</span>
                                  </div>
                                ))}
                            </span>
                          </span>
                        </span>

                        <span className="w-full h-20 flex justify-center">
                          <span className="w-56 h-24">
                            <Image
                              src={streams[0].thumbnail_url}
                              alt="user thumbnail"
                              width={150}
                              height={150}
                              className="object-contain"
                            />
                          </span>
                        </span>
                      </span>
                    </span>

                    <span className="w-1/2 h-full flex flex-shrink-0 relative">
                      <Image
                        src={streams[0].thumbnail_url}
                        alt="user profile"
                        fill={true}
                        className="object-cover"
                      />
                      {/* Gradient overlay that fades from black (left) to transparent (right) */}
                      <span
                        className={`absolute inset-0 bg-gradient-to-r ${
                          darkMode
                            ? "from-black via-black/50"
                            : "from-white via-white/50"
                        } to-transparent`}
                      ></span>
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="flex flex row h-[50vh] w-full justify-center items-center">
                  <span
                    onClick={() => {
                      fullPageReload("/stream", "window");
                    }}
                    className="cursor-pointer px-3 py-1.5 font-semibold rounded-lg border border-[#EA334E] bg-transparent text-[#EA334E]"
                  >
                    Go to Stream Manager
                  </span>
                </div>
              )}
            </div>

            {streams.length !== 0 && (
              <span
                className={`mt-3 mb-2 text-md ${
                  darkMode ? "text-white" : "text-black"
                } font-semibold w-full space-x-1 flex flex-row justify-between items-center`}
              >
                {"Live on Animebook"}
              </span>
            )}

            {streams.length !== 0 && (
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {streams.map((stream) => (
                    <Link key={stream.id} href={`/watch/${stream.room_name}`}>
                      <span className="cursor-pointer flex-shrink-0 relative flex h-[8rem] lg:h-[10rem] w-full">
                        <span>
                          <Image
                            src={stream.thumbnail_url}
                            alt="user profile"
                            fill={true}
                            className=" object-cover"
                          />
                        </span>

                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                          LIVE
                        </span>
                        <span className="absolute bottom-2 left-3 bg-black bg-opacity-50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded z-10">
                          {stream.viewer_count} watching
                        </span>
                      </span>
                      <span
                        className={`${
                          darkMode ? "text-white" : "text-black"
                        } w-full py-1 space-x-1 flex flex-row items-start`}
                      >
                        <span className="relative h-8 w-8 flex flex-shrink-0">
                          <Image
                            src={stream.users.avatar}
                            alt="user profile"
                            width={55}
                            height={55}
                            className=" rounded-full"
                          />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-bold text-sm">
                            {stream.title || "We are Live"}
                          </span>

                          <span className="rounded-b-md text-xs font-semibold">
                            {stream.users.username}
                          </span>
                          <span className="rounded-b-md text-xs font-semibold">
                            {stream.category || "Just Chatting"}
                          </span>
                          <span className="flex flex-row space-x-1">
                            {stream.tags &&
                              stream.tags.length > 0 &&
                              stream.tags.slice(0, 3).map((tag, index) => (
                                <div
                                  key={index}
                                  className={`tag-chip-regular ${
                                    darkMode ? "text-white" : "text-black"
                                  } rounded-md px-1`}
                                >
                                  <span>{tag}</span>
                                </div>
                              ))}
                          </span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
}
