"use client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
  Chat,
  useDisconnectButton,
} from "@livekit/components-react";
import { useChat, useLocalParticipant } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Track, VideoQuality } from "livekit-client";
import { useRouter } from "next/router";
import { AvatarWithBorder } from "@/components/AvatarProps";
import supabase from "@/hooks/authenticateUser";
import FollowSelector from "@/components/FollowSelector";
import free from "@/assets/chibis/free.jpg";
import yellowchibi from "@/assets/chibis/yellowchibi.png";
import Image from "next/image";
import { Colors } from "./colors";
import SendTips from "@/components/SendTips";

function QualityDropdown({ videoQuality, handleQualityChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const qualities = [
    { value: VideoQuality.LOW, label: "SD" },
    { value: VideoQuality.HIGH, label: "HD" },
    { value: VideoQuality.HIGH, label: "4K" },
  ];

  const currentQuality =
    qualities.find((q) => q.value === videoQuality)?.label || "HD";

  const handleSelect = (value) => {
    handleQualityChange(value);
    setIsOpen(false);
  };

  return (
    <div className="text-sm relative flex items-center w-fit">
      {isOpen && (
        <div className="absolute bottom-full mb-2 bg-black bg-opacity-50 backdrop-blur-sm rounded shadow-lg overflow-hidden z-20">
          {qualities.map((quality) => (
            <button
              key={quality.value}
              onClick={() => handleSelect(quality.value)}
              className={`w-full text-left px-4 py-2 text-sm font-semibold transition ${
                videoQuality === quality.value
                  ? "bg-blue-600 text-white"
                  : "text-white hover:bg-gray-700"
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="bg-black bg-opacity-50 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded z-10"
      >
        {currentQuality}
      </button>
    </div>
  );
}

function TheaterMode({
  streamEnded,
  toggleAudio,
  userData,
  audioEnabled,
  showChat,
  onToggleChat,
  onSendGift,
  onLeave,
  stream,
  darkMode,
  viewerCount,
  followingObject,
  setFollowingObject,
  expandStream,
  setExpandStream,
  openTipJar,
  setOpenTipJar,
}) {
  const { chatMessages, send, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [message, setMessage] = useState("");
  const [userColors, setUserColors] = useState({});
  const [videoQuality, setVideoQuality] = useState(VideoQuality.HIGH);
  const [streamerChibis, setStreamerChibis] = useState(null);
  const [streamerAnimes, setStreamerAnimes] = useState(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const getUserColor = (username) => {
    if (!username) return "#999999";

    if (userColors[username]) {
      return userColors[username];
    }
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Colors[Math.abs(hash) % Colors.length];

    setUserColors((prev) => ({ ...prev, [username]: color }));

    return color;
  };

  const fetchChibis = (userid) => {
    supabase
      .from("chibis")
      .select("id, created_at, collectionid, users(id, avatar, username)")
      .eq("userid", userid)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setStreamerChibis(res.data);
        }
      });
  };

  const fetchAnimes = (userid) => {
    supabase
      .from("animes")
      .select(
        "id, created_at, title, trailer, image, users(id, avatar, username), rating"
      )
      .eq("userid", userid)
      .order("created_at", { ascending: false })
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          setStreamerAnimes(res.data);
        }
      });
  };

  // Separate camera and screen share tracks
  const cameraTrack = tracks.find(
    (track) => track.source === Track.Source.Camera
  );

  const screenShareTrack = tracks.find(
    (track) => track.source === Track.Source.ScreenShare
  );

  const isScreenSharing = !!screenShareTrack;

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    await send(message.trim());
    setMessage("");
  };

  const handleSendCustomMessage = async (msg) => {
    if (!msg.trim() || isSending) return;
    await send(msg.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQualityChange = (quality) => {
    setVideoQuality(quality);
  };

  useEffect(() => {
    if (cameraTrack?.publication) {
      cameraTrack.publication.setVideoQuality(videoQuality);
    }
    if (screenShareTrack?.publication) {
      screenShareTrack.publication.setVideoQuality(videoQuality);
    }
    fetchChibis(stream.users.id);
    fetchAnimes(stream.users.id);
  }, [videoQuality, cameraTrack, screenShareTrack]);

  return (
    <div
      className={`pb-28 sm:pb-0 ${
        !expandStream && "pb-20"
      } flex w-full overflow-y-scroll`}
    >
      {!streamEnded && <RoomAudioRenderer volume={audioEnabled ? 1 : 0} />}

      <div className="flex flex-col h-full w-full">
        {streamEnded ? (
          <div className="h-[40vh] w-full bg-black flex items-center justify-center">
            <div className="text-white text-xl">Stream Ended</div>
          </div>
        ) : (
          <div className="flex flex-col relative h-full">
            <div className="relative w-full h-full">
              {isScreenSharing ? (
                <div
                  className="w-full h-full bg-black"
                  style={expandStream ? { height: "95vh" } : { height: "80vh" }}
                >
                  <VideoTrack
                    trackRef={screenShareTrack}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                cameraTrack && (
                  <div
                    className="w-full h-full bg-black"
                    style={
                      expandStream ? { height: "95vh" } : { height: "80vh" }
                    }
                  >
                    <VideoTrack
                      trackRef={cameraTrack}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )
              )}

              <div
                className="pr-2 flex flex-col items-end justify-end overflow-y-scroll absolute top-0 right-0 z-50"
                style={{ height: "65%" }}
              >
                {chatMessages &&
                  chatMessages.length > 0 &&
                  chatMessages.map((msg, index) => {
                    const username = msg.from?.identity || "Anonymous";
                    const userColor = getUserColor(username);
                    const isOwnMessage = username === localParticipant.identity;

                    return (
                      <span
                        key={index}
                        className={`text-md flex flex-row justify-end items-start text-end bg-black bg-opacity-20 backdrop-blur-sm py-0.5 px-1 w-fit rounded`}
                        style={{ color: userColor, maxWidth: "330px" }}
                      >
                        <span className="font-semibold flex-shrink-0">
                          {username}
                        </span>
                        <span className="text-white">{":"}</span>
                        <span className="pl-1 text-white break-normal font-semibold">
                          {msg.message}
                        </span>
                      </span>
                    );
                  })}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              {!isScreenSharing && (
                <div className="mb-1 text-white flex flex-col">
                  <span className="w-fit text-sm font-bold bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded max-w-[90%] sm:max-w-md break-words line-clamp-2">
                    {stream.title || "We are live"}
                  </span>
                </div>
              )}
              <div className="flex flex-col justify-start items-start w-full">
                {isScreenSharing && cameraTrack && (
                  <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl">
                    <VideoTrack
                      trackRef={cameraTrack}
                      className={`w-full h-full object-cover]`}
                      style={{ transform: "scaleX(-1)" }}
                    />
                  </div>
                )}
                <span className="w-full flex flex-row justify-between items-center space-x-0.5">
                  <span className="w-fit flex flex-row items-center">
                    {!isScreenSharing && (
                      <AvatarWithBorder userInfo={stream.users} size={35} />
                    )}
                    <span className="text-white text-sm font-bold bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded">
                      {stream.users.username}
                    </span>
                    <FollowSelector
                      targetUserid={stream.users.id}
                      userData={userData}
                      followingObject={followingObject}
                      setFollowingObject={setFollowingObject}
                    />
                  </span>
                  <span className="flex flex-row items-center space-x-1">
                    <QualityDropdown
                      videoQuality={videoQuality}
                      handleQualityChange={handleQualityChange}
                    />
                    <span
                      onClick={toggleAudio}
                      className="cursor-pointer bg-black bg-opacity-50 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded z-10"
                    >
                      {audioEnabled ? (
                        <svg
                          fill="white"
                          width="22px"
                          height="22px"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M13,4V20a1,1,0,0,1-2,0V4a1,1,0,0,1,2,0ZM8,5A1,1,0,0,0,7,6V18a1,1,0,0,0,2,0V6A1,1,0,0,0,8,5ZM4,7A1,1,0,0,0,3,8v8a1,1,0,0,0,2,0V8A1,1,0,0,0,4,7ZM16,5a1,1,0,0,0-1,1V18a1,1,0,0,0,2,0V6A1,1,0,0,0,16,5Zm4,2a1,1,0,0,0-1,1v8a1,1,0,0,0,2,0V8A1,1,0,0,0,20,7Z" />
                        </svg>
                      ) : (
                        <svg
                          id="Uploaded to svgrepo.com"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          width="22px"
                          height="22px"
                          viewBox="0 0 32 32"
                          xmlSpace="preserve"
                        >
                          <style type="text/css">
                            {`\n\t.puchipuchi_een{fill:white;}\n`}
                          </style>
                          <path
                            className="puchipuchi_een"
                            d="M16,6v20c0,1.1-0.772,1.537-1.715,0.971l-6.57-3.942C6.772,22.463,5.1,22,4,22H3c-1.1,0-2-0.9-2-2 v-8c0-1.1,0.9-2,2-2h1c1.1,0,2.772-0.463,3.715-1.029l6.57-3.942C15.228,4.463,16,4.9,16,6z M26.828,16l2.586-2.586 c0.781-0.781,0.781-2.047,0-2.828s-2.047-0.781-2.828,0L24,13.172l-2.586-2.586c-0.781-0.781-2.047-0.781-2.828,0 s-0.781,2.047,0,2.828L21.172,16l-2.586,2.586c-0.781,0.781-0.781,2.047,0,2.828C18.977,21.805,19.488,22,20,22 s1.023-0.195,1.414-0.586L24,18.828l2.586,2.586C26.977,21.805,27.488,22,28,22s1.023-0.195,1.414-0.586 c0.781-0.781,0.781-2.047,0-2.828L26.828,16z"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      onClick={() => {
                        setExpandStream(!expandStream);
                      }}
                      className="cursor-pointer bg-black bg-opacity-50 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded z-10"
                    >
                      {expandStream ? (
                        <svg
                          fill="white"
                          width="22px"
                          height="22px"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6,2.5 C6,2.22385763 6.22385763,2 6.5,2 C6.77614237,2 7,2.22385763 7,2.5 L7,4.5 C7,5.88071187 5.88071187,7 4.5,7 L2.5,7 C2.22385763,7 2,6.77614237 2,6.5 C2,6.22385763 2.22385763,6 2.5,6 L4.5,6 C5.32842712,6 6,5.32842712 6,4.5 L6,2.5 Z M2.5,18 C2.22385763,18 2,17.7761424 2,17.5 C2,17.2238576 2.22385763,17 2.5,17 L4.5,17 C5.88071187,17 7,18.1192881 7,19.5 L7,21.5 C7,21.7761424 6.77614237,22 6.5,22 C6.22385763,22 6,21.7761424 6,21.5 L6,19.5 C6,18.6715729 5.32842712,18 4.5,18 L2.5,18 Z M21.5,6 C21.7761424,6 22,6.22385763 22,6.5 C22,6.77614237 21.7761424,7 21.5,7 L19.5,7 C18.1192881,7 17,5.88071187 17,4.5 L17,2.5 C17,2.22385763 17.2238576,2 17.5,2 C17.7761424,2 18,2.22385763 18,2.5 L18,4.5 C18,5.32842712 18.6715729,6 19.5,6 L21.5,6 Z M18,21.5 C18,21.7761424 17.7761424,22 17.5,22 C17.2238576,22 17,21.7761424 17,21.5 L17,19.5 C17,18.1192881 18.1192881,17 19.5,17 L21.5,17 C21.7761424,17 22,17.2238576 22,17.5 C22,17.7761424 21.7761424,18 21.5,18 L19.5,18 C18.6715729,18 18,18.6715729 18,19.5 L18,21.5 Z" />
                        </svg>
                      ) : (
                        <svg
                          fill="white"
                          width="21px"
                          height="21px"
                          viewBox="0 0 32 32"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>{"expand"}</title>
                          <path d="M12 28.75h-8.75v-8.75c0-0.69-0.56-1.25-1.25-1.25s-1.25 0.56-1.25 1.25v0 10c0 0.69 0.56 1.25 1.25 1.25h10c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM30 18.75c-0.69 0.001-1.249 0.56-1.25 1.25v8.75h-8.75c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h10c0.69-0.001 1.249-0.56 1.25-1.25v-10c-0.001-0.69-0.56-1.249-1.25-1.25h-0zM12 0.75h-10c-0.69 0-1.25 0.56-1.25 1.25v0 10c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-8.75h8.75c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM30 0.75h-10c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h8.75v8.75c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-10c-0-0.69-0.56-1.25-1.25-1.25h-0z" />
                        </svg>
                      )}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col w-full mt-2">
          <div className="w-full flex flex-col space-y-2 sm:space-y-0 sm:flex-row justify-between items-center space-x-8">
            <span className="w-full lg:w-1/2 flex flex-row justify-start items-center space-x-2">
              {!streamEnded && (
                <span
                  className={`border w-full p-2 ${
                    darkMode
                      ? "bg-[#27292F] border-[#32353C] text-white"
                      : "bg-[#F9F9F9] border-gray-300"
                  } shadow-xl relative flex flex-row justify-between items-center"
                  } space-x-0.5 rounded-xl`}
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    maxLength={500}
                    className={`${
                      darkMode ? "text-white" : "text-gray-800"
                    } text-xs w-full bg-transparent border-none focus:ring-0`}
                    placeholder="Send a message"
                  />
                  <span
                    onClick={() => {
                      handleSend();
                    }}
                    className={`cursor-pointer rounded-full h-8 w-8 flex justify-center items-center bg-[#EB4463]`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 21.5 21.5"
                    >
                      <g id="Icon" transform="translate(-1.25 -1.25)">
                        <path
                          id="Pfad_4721"
                          data-name="Pfad 4721"
                          d="M1.3,3.542a1.845,1.845,0,0,1,2.615-2.1l17.81,8.9a1.845,1.845,0,0,1,0,3.3l-17.81,8.9a1.845,1.845,0,0,1-2.615-2.1L3.17,13,14,12,3.17,11,1.305,3.542Z"
                          fill="white"
                          fillRule="evenodd"
                        />
                      </g>
                    </svg>
                  </span>
                </span>
              )}
              <span
                onClick={onSendGift}
                className="cursor-pointer px-2 py-1 rounded-lg text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #ec4899 100%)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                }}
              >
                Gift
              </span>
            </span>
            {!expandStream && (
              <span
                onClick={() => {
                  onLeave();
                }}
                className="cursor-pointer px-3 py-1.5 font-semibold rounded-lg border border-[#EA334E] bg-transparent text-[#EA334E]"
              >
                Leave
              </span>
            )}
          </div>

          <div
            className={`${
              darkMode ? "text-white" : "text-gray-800"
            } my-1 text-md font-semibold`}
          >{`About Streamer`}</div>
          <div
            className={`mb-3 ${
              darkMode ? "text-white" : "text-gray-800"
            } text-sm flex flex-col`}
          >
            <span>{stream.users.bio}</span>
            <span>
              {stream.users.username} has acquired {parseInt(stream.users.ki)}{" "}
              KI
            </span>
            {streamerChibis && streamerChibis.length > 0 && (
              <span className="flex flex-col">
                <span className="my-1 text-md font-semibold">Chibis</span>
                <span
                  id="scrollbar-remove"
                  className="relative flex flex-row space-x-1 overflow-x-scroll"
                >
                  {streamerChibis.map((cb) => (
                    <span
                      key={cb.id}
                      className="relative flex flex-col items-center w-16 rounded-lg"
                    >
                      <Image
                        src={cb.collectionid === 2 ? yellowchibi : free}
                        alt="chibi"
                        className="rounded-lg w-16 h-16 object-cover"
                      />
                    </span>
                  ))}
                </span>
              </span>
            )}
            {streamerAnimes && streamerAnimes.length > 0 && (
              <span className="flex flex-col">
                <span className="my-1 text-md font-semibold">
                  Anime watchlist
                </span>
                <span
                  id="scrollbar-remove"
                  className="w-fit relative gap-1 gridpoints"
                >
                  {streamerAnimes.map((awl) => (
                    <span
                      key={awl.id}
                      className={`border ${
                        darkMode
                          ? "bg-[#1E1F24] border-[#292C33]"
                          : "bg-white border-gray-300"
                      } relative flex flex-col items-center rounded-xl py-2 px-4 w-fit shadow-md`}
                    >
                      <span
                        className={`border ${
                          darkMode
                            ? "bg-[#292C33] border-[#292C33]"
                            : "bg-[#0000001A] border-[#292C33]"
                        } flex px-2 py-0.5 rounded-xl justify-center space-x-0.5`}
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < awl.rating
                                ? "text-[#EB4463]"
                                : "text-gray-400"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </span>

                      <span
                        id="scrollbar-remove"
                        className="pb-1 font-semibold text-center w-full max-h-10 overflow-scroll whitespace-nowrap scrollbar-hide"
                      >
                        {awl.title}
                      </span>

                      <img
                        src={awl.image}
                        alt={awl.title}
                        className="border border-black rounded-lg w-60 h-60 object-cover"
                      />
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {openTipJar && (
        <>
          <SendTips
            setOpenTipJar={setOpenTipJar}
            recipient={stream.users}
            handleSendStreamChat={handleSendCustomMessage}
          />
          <div
            onClick={() => {
              setOpenTipJar(false);
            }}
            id="tip-overlay"
          ></div>
        </>
      )}
    </div>
  );
}

export default function StreamViewer({
  roomName,
  userName,
  userData,
  stream,
  darkMode,
  followingObject,
  setFollowingObject,
  expandStream,
  setExpandStream,
}) {
  const router = useRouter();
  const [openTipJar, setOpenTipJar] = useState(false);
  const [token, setToken] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewerCount, setViewerCount] = useState(stream.viewer_count || null);
  const [streamEnded, setStreamEnded] = useState(false);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const leaveStreamAPI = async () => {
    await fetch("/api/streams/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, userId: userData.useruuid }),
    }).catch((err) => console.error("Leave error:", err));
  };

  const handleLeave = async () => {
    await leaveStreamAPI();
    router.push("/live");
  };

  useEffect(() => {
    fetch("/api/livetoken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName,
        participantName: userName,
        isHost: false,
      }),
    })
      .then((r) => r.json())
      .then((data) => setToken(data.token));
  }, [roomName, userName]);

  useEffect(() => {
    if (!userData.useruuid) return;

    const joinStream = async () => {
      const res = await fetch("/api/streams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userId: userData.useruuid,
        }),
      });
      const data = await res.json();
      setViewerCount(data.viewer_count || 0);
    };

    joinStream();

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(async () => {
      await fetch("/api/streams/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userId: userData.useruuid }),
      }).catch((err) => console.error("Heartbeat error:", err));
    }, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      leaveStreamAPI();
    };
  }, [userData.useruuid, roomName]);

  useEffect(() => {
    const channel = supabase
      .channel(`stream:${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_streams",
          filter: `room_name=eq.${roomName}`,
        },
        (payload) => {
          setViewerCount(payload.new.viewer_count || 0);
          if (payload.new.status === "ended") {
            setStreamEnded(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName]);

  const enableAudio = () => {
    setAudioEnabled(true);
  };

  const handleSendGift = () => {
    setOpenTipJar(true);
  };

  if (!token)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading stream...</div>
      </div>
    );

  return (
    <div
      className={`${
        expandStream && "w-full"
      } relative h-screen overflow-y-scroll`}
    >
      <div className="p-2 flex flex-row space-x-1 justify-center items-center absolute top-4 left-1 z-50">
        {!audioEnabled && (
          <div
            onClick={enableAudio}
            className="cursor-pointer bg-black bg-opacity-50 backdrop-blur-sm py-0.5 px-1 w-fit rounded"
          >
            <svg
              id="Uploaded to svgrepo.com"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="30px"
              height="30px"
              viewBox="0 0 32 32"
              xmlSpace="preserve"
            >
              <style type="text/css">
                {"\n\t.puchipuchi_een{fill:white;}\n"}
              </style>
              <path
                className="puchipuchi_een"
                d="M16,6v20c0,1.1-0.772,1.537-1.715,0.971l-6.57-3.942C6.772,22.463,5.1,22,4,22H3c-1.1,0-2-0.9-2-2 v-8c0-1.1,0.9-2,2-2h1c1.1,0,2.772-0.463,3.715-1.029l6.57-3.942C15.228,4.463,16,4.9,16,6z M26.828,16l2.586-2.586 c0.781-0.781,0.781-2.047,0-2.828s-2.047-0.781-2.828,0L24,13.172l-2.586-2.586c-0.781-0.781-2.047-0.781-2.828,0 s-0.781,2.047,0,2.828L21.172,16l-2.586,2.586c-0.781,0.781-0.781,2.047,0,2.828C18.977,21.805,19.488,22,20,22 s1.023-0.195,1.414-0.586L24,18.828l2.586,2.586C26.977,21.805,27.488,22,28,22s1.023-0.195,1.414-0.586 c0.781-0.781,0.781-2.047,0-2.828L26.828,16z"
              />
            </svg>
          </div>
        )}
        <span className="bg-black bg-opacity-50 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded z-10">
          {viewerCount} {parseInt(viewerCount) == 1 ? "viewer" : "viewers"}
        </span>
      </div>

      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        audio={audioEnabled}
        video={false}
        connect={true}
      >
        <TheaterMode
          streamEnded={streamEnded}
          userData={userData}
          toggleAudio={toggleAudio}
          audioEnabled={audioEnabled}
          showChat={showChat}
          onToggleChat={() => setShowChat(!showChat)}
          onSendGift={handleSendGift}
          onLeave={handleLeave}
          stream={stream}
          darkMode={darkMode}
          viewerCount={viewerCount}
          followingObject={followingObject}
          setFollowingObject={setFollowingObject}
          expandStream={expandStream}
          setExpandStream={setExpandStream}
          openTipJar={openTipJar}
          setOpenTipJar={setOpenTipJar}
        />
      </LiveKitRoom>
    </div>
  );
}
