"use client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
  ParticipantName,
  Chat,
  useLocalParticipant,
  useChat,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import StarsBright from "./starsBright";
import StreamCards from "./streamCards";
import { AvatarWithBorder } from "@/components/AvatarProps";
import { Colors } from "./colors";
import supabase from "@/hooks/authenticateUser";

function CustomControls({ onEndStream }) {
  const { localParticipant } = useLocalParticipant();

  const toggleMic = async () => {
    const currentState = localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(!currentState);
  };

  const toggleCamera = async () => {
    const currentState = localParticipant.isCameraEnabled;
    await localParticipant.setCameraEnabled(!currentState);
  };

  const toggleScreenShare = async () => {
    try {
      const currentState = localParticipant.isScreenShareEnabled;
      await localParticipant.setScreenShareEnabled(!currentState);
    } catch (error) {
      console.error("Screen share error:", error);
    }
  };

  return (
    <div className="w-full flex justify-between items-center space-x-1">
      <span></span>
      <span className="flex flex-row items-center space-x-3">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full transition ${
            localParticipant.isMicrophoneEnabled ? "bg-gray-800" : "bg-red-600"
          }`}
          title={localParticipant.isMicrophoneEnabled ? "Mute" : "Unmute"}
        >
          <svg
            fill="white"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            baseProfile="tiny"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 16c2.206 0 4-1.795 4-4v-6c0-2.206-1.794-4-4-4s-4 1.794-4 4v6c0 2.205 1.794 4 4 4zM19 12v-2c0-.552-.447-1-1-1s-1 .448-1 1v2c0 2.757-2.243 5-5 5s-5-2.243-5-5v-2c0-.552-.447-1-1-1s-1 .448-1 1v2c0 3.52 2.613 6.432 6 6.92v1.08h-3c-.553 0-1 .447-1 1s.447 1 1 1h8c.553 0 1-.447 1-1s-.447-1-1-1h-3v-1.08c3.387-.488 6-3.4 6-6.92z" />
          </svg>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`text-sm font-medium text-white flex flex-row items-center px-4 py-3 rounded transition`}
          style={{
            background: localParticipant.isScreenShareEnabled
              ? "#155dfc"
              : "oklch(27.8% 0.033 256.848)",
          }}
          title={
            localParticipant.isScreenShareEnabled
              ? "Stop sharing"
              : "Share screen"
          }
        >
          <span className="pr-1">
            <svg
              width="28px"
              height="28px"
              viewBox="0 0 28 28"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <title>{"ic_fluent_share_screen_28_filled"}</title>
              <desc>{"Created with Sketch."}</desc>
              <g
                id="\uD83D\uDD0D-System-Icons"
                stroke="none"
                strokeWidth={1}
                fill="black"
                fillRule="evenodd"
              >
                <g
                  id="ic_fluent_share_screen_28_filled"
                  fill="white"
                  fillRule="nonzero"
                >
                  <path
                    d="M23.75,4.99939 C24.9926,4.99939 26,6.00675 26,7.24939 L26,7.24939 L26,20.75 C26,21.9926 24.9926,23 23.75,23 L23.75,23 L4.25,23 C3.00736,23 2,21.9926 2,20.75 L2,20.75 L2,7.24939 C2,6.00675 3.00736,4.99939 4.25,4.99939 L4.25,4.99939 Z M13.9975,8.62108995 C13.7985,8.62108995 13.6077,8.70032 13.467,8.84113 L10.217,12.0956 C9.92435,12.3887 9.92468,12.8636 10.2178,13.1563 C10.5109,13.449 10.9858,13.4487 11.2784,13.1556 L13.2477,11.1835 L13.2477,18.6285 C13.2477,19.0427 13.5835,19.3785 13.9977,19.3785 C14.4119,19.3785 14.7477,19.0427 14.7477,18.6285 L14.7477,11.1818 L16.7219,13.1559 C17.0148,13.4488 17.4897,13.4488 17.7826,13.1559 C18.0755,12.863 18.0755,12.3882 17.7826,12.0953 L14.5281,8.84076 C14.3873,8.70005 14.1965,8.62108995 13.9975,8.62108995 Z"
                    id="\uD83C\uDFA8-Color"
                  />
                </g>
              </g>
            </svg>
          </span>
          {localParticipant.isScreenShareEnabled
            ? "Stop Sharing"
            : "Share Screen"}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full transition ${
            localParticipant.isCameraEnabled
              ? "bg-gray-800 text-white"
              : "bg-red-600 text-white"
          }`}
          title={
            localParticipant.isCameraEnabled
              ? "Turn off camera"
              : "Turn on camera"
          }
        >
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 16 16"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M3 3H0V14H16V3H13L11 1H5L3 3ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
              fill="white"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </span>

      <button
        onClick={onEndStream}
        className="cursor-pointer px-3 py-1.5 font-semibold rounded-lg border border-[#EA334E] bg-transparent text-[#EA334E]"
      >
        Leave
      </button>
    </div>
  );
}

function HostLayout({ onEndStream, stream, userData, darkMode, viewerCount }) {
  const { localParticipant } = useLocalParticipant();
  const { chatMessages, send, isSending } = useChat();
  const [message, setMessage] = useState("");
  const [userColors, setUserColors] = useState({});
  const [thumbnailCaptured, setThumbnailCaptured] = useState(false);

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

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    await send(message.trim());
    setMessage("");
  };

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Separate camera and screen share tracks
  const cameraTrack = tracks.find(
    (track) => track.source === Track.Source.Camera && track.publication
  );

  const screenShareTrack = tracks.find(
    (track) => track.source === Track.Source.ScreenShare && track.publication
  );

  const isScreenSharing = !!screenShareTrack;

  const captureInitiated = useRef(false);
  const timeoutRef = useRef(null);
  useEffect(() => {
    if (captureInitiated.current || !cameraTrack || thumbnailCaptured) {
      return;
    }

    captureInitiated.current = true;

    timeoutRef.current = setTimeout(async () => {

      const videoElement = document.querySelector("video");

      if (!videoElement || videoElement.readyState < 2) {
        console.warn("Video not ready");
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            const fileName = `${userData.useruuid}-${Date.now()}.jpg`;
            const filePath = `live/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
              .from("mediastore")
              .upload(filePath, blob, {
                contentType: "image/jpeg",
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              console.error("Upload error:", uploadError);
              return;
            }

            const capturedThumbnail = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mediastore/${filePath}`;

            const { error: updateError } = await supabase
              .from("live_streams")
              .update({ thumbnail_url: capturedThumbnail })
              .eq("room_name", `stream-${userData.useruuid}`);

            if (updateError) {
              console.error("Update error:", updateError);
            } else {
              setThumbnailCaptured(true);
            }
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        console.error("Capture error:", error);
      }
    }, 10000);

    // Cleanup not needed in this useEffect
  }, [cameraTrack, thumbnailCaptured]);

  // Separate cleanup useEffect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={
        "relative pb-20 sm:pb-0 h-full w-full flex flex-col overflow-y-scroll"
      }
    >
      <RoomAudioRenderer />

      <div className="flex flex-col w-full" style={{ height: "85%" }}>
        {!cameraTrack && !screenShareTrack ? (
          <div className="h-full flex items-center justify-center text-white text-xl">
            Stream buffering...
          </div>
        ) : (
          <div className="flex flex-col relative h-full">
            <div className="relative w-full h-full">
              {isScreenSharing ? (
                <VideoTrack
                  trackRef={screenShareTrack}
                  className="w-full h-full object-contain"
                />
              ) : (
                cameraTrack && (
                  <VideoTrack
                    trackRef={cameraTrack}
                    className="w-full h-full object-contain"
                    style={{ transform: "scaleX(-1)" }}
                  />
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

            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              {!isScreenSharing && (
                <div className="mb-1 text-white flex flex-col">
                  <span className="w-fit text-sm font-bold bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded max-w-[90%] sm:max-w-md break-words line-clamp-2">
                    {stream.title || "We are live"}
                  </span>
                </div>
              )}

              <div className="flex flex-col justify-start items-start space-y-1 w-fit">
                {isScreenSharing && cameraTrack && (
                  <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl">
                    <VideoTrack
                      trackRef={cameraTrack}
                      className={`w-full h-full object-cover]`}
                      style={{ transform: "scaleX(-1)" }}
                    />
                  </div>
                )}

                <span className="w-full flex flex-row justify-start items-center space-x-0.5">
                  <span className="w-fit flex flex-row items-center">
                    {!isScreenSharing && (
                      <AvatarWithBorder userInfo={userData} size={35} />
                    )}

                    <span className="text-white text-xs font-bold bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded">
                      {localParticipant.identity}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`py-2 flex flex-col ${
          darkMode ? "bg-[#17181C]" : "bg-white"
        }`}
      >
        <CustomControls onEndStream={onEndStream} />

        <div
          className={`${
            darkMode ? "text-white" : "text-gray-800"
          } px-4 my-1 text-md font-semibold`}
        >{`Total Gifts Received`}</div>

        <div className="flex flex-col px-4">
          <span
            className={`${
              darkMode ? "text-white" : "text-gray-800"
            } text-sm flex flex-col`}
          >
            {"0 Luffy Received"}
          </span>

          <span
            className={`mb-3 ${
              darkMode ? "text-white" : "text-gray-800"
            } text-sm flex flex-col`}
          >
            {"0 KI Bonuses"}
          </span>
        </div>
        <span
          className={`w-full my-1 mx-auto border p-2 ${
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
            placeholder="You can text or pin a message to your chat"
          />
          <span
            onClick={() => {
              handleSend();
            }}
            className={`flex-shrink-0 cursor-pointer rounded-full h-8 w-8 flex justify-center items-center bg-[#EB4463]`}
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
      </div>
    </div>
  );
}

export default function LiveStream({
  roomName,
  userData,
  stream,
  setStream,
  setOnOpenCustomizeStream,
  setOnOpenScheduler,
  darkMode,
  formData,
  setFormData,
  isConnected,
  setIsConnected,
  token,
  startStream,
}) {
  const [viewerCount, setViewerCount] = useState(0);

  const handleEndStream = async () => {
    await fetch("/api/streams/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
    });
    setIsConnected(false);
  };

  useEffect(() => {
    // Send heartbeat every 5 minutes
    const heartbeatInterval = setInterval(async () => {
      await fetch("/api/streams/hostislive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userId: userData.useruuid }),
      }).catch((err) => console.error("Heartbeat error: ", err));
    }, 500000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName]);

  return (
    <div className={`relative flex w-full h-full p-4 overflow-y-scroll`}>
      {isConnected && (
        <div className="ml-5 mt-2 absolute top-4 left-1 z-50 bg-black bg-opacity-50 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded">
          {viewerCount} {parseInt(viewerCount) == 1 ? "viewer" : "viewers"}
        </div>
      )}

      {!isConnected ? (
        <div className="eighty-vh w-full bg-black flex flex-col">
          <div className="responsive-height">
            <StarsBright startStream={startStream} />
          </div>
          <div
            style={{
              height: "40%",
            }}
            className="hidden lg:flex flex-col text-white"
          >
            <div className="text-lg py-3 px-5 font-semibold text-lg">
              Customizations
            </div>
            <div className="px-5">
              <StreamCards
                setOnOpenCustomizeStream={setOnOpenCustomizeStream}
                setOnOpenScheduler={setOnOpenScheduler}
                darkMode={darkMode}
                startStream={startStream}
              />
            </div>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        >
          <HostLayout
            onEndStream={handleEndStream}
            darkMode={darkMode}
            stream={stream}
            userData={userData}
            viewerCount={viewerCount}
            setViewerCount={setViewerCount}
          />
        </LiveKitRoom>
      )}
    </div>
  );
}
