import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import Image from "next/image";
import onePiece from "@/assets/onePiece.jpg";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import { useRouter } from "next/router";
import SideBar from "@/components/sideBar";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import Messages from "./inboxutils/messages";

const Inbox = () => {
  const [currentParty, setCurrentParty] = useState("");
  const router = useRouter();
  const { fullPageReload } = PageLoadOptions();
  const {
    userNumId,
    userData,
    allUserObject,
    setAllUserObject,
    sideBarOpened,
    setSideBarOpened,
    darkMode,
  } = useContext(UserContext);
  const [newChat, setNewChat] = useState(false);
  const { fetchAllUsers } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [following, setFollowing] = useState(null);
  const [userToSearch, setUserToSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [originalChats, setOriginalChats] = useState(null);
  const [messageItem, setMessageItem] = useState("");
  const [entireMessages, setEntireMessages] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  const searchForUser = (e) => {
    setUserToSearch(e.target.value);
    if (e.target.value === "") {
      setFoundUsers(null);
    } else {
      setFoundUsers(
        allUserObject.filter((user) =>
          user.username.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    }
  };

  const searchForMessage = (e) => {
    setMessageItem(e.target.value);
    const text = e.target.value.toLowerCase();

    if (text !== "" && entireMessages) {
      // Filter messages based on the search text
      const foundMsg = entireMessages.filter((msg) =>
        msg.message.toLowerCase().includes(text)
      );

      setSearchResult(foundMsg);

      // Save original chats if not already saved
      if (originalChats === null) {
        console.log("cypher: originalChats");
        setOriginalChats(allChats);
      } else {
        // Collect chat participants whose usernames include the search text
        const allChatsInConvo = originalChats.reduce((acc, ac) => {
          const otherUserId =
            ac.senderid === userNumId ? ac.receiverid : ac.senderid;
          const username = getUserFromId(otherUserId).username.toLowerCase();

          if (
            !acc.some((user) => user.id === otherUserId) &&
            username.includes(text)
          ) {
            acc.push({ username: username, id: otherUserId });
          }
          return acc;
        }, []);

        // Filter chats based on the collected user IDs
        const allFilteredChats = allChatsInConvo.reduce((acc, user) => {
          const filteredChats = originalChats.filter(
            (u) =>
              (u.senderid === userNumId ? u.receiverid : u.senderid) === user.id
          );
          return acc.concat(filteredChats);
        }, []);

        setAllChats(allFilteredChats);
      }
    } else if (text === "" && originalChats !== null) {
      // Reset to original chats if the input is cleared
      setAllChats(originalChats);
      setSearchResult(null);
    }
  };

  const getUserFromId = (id) => {
    return allUserObject.find((usr) => usr.id === id);
  };

  // Function to format time in hh:mm AM/PM format
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 0 hour to 12
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const differenceInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0 && now.getDate() === date.getDate()) {
      return `${formatTime(date)}`;
    } else if (differenceInDays < 2 && now.getDate() !== date.getDate()) {
      return `Yesterday`;
    } else if (differenceInDays < 7) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return `${dayNames[date.getDay()]}`;
    } else {
      const monthNames = [
        "Jan",
        "Feb",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[date.getMonth()]} ${date.getDate()} ${formatTime(
        date
      )}`;
    }
  };

  const fetchChats = async () => {
    const response = await supabase
      .from("conversations")
      .select()
      .or(`senderid.eq.${userNumId},receiverid.eq.${userNumId}`)
      .order("created_at", { ascending: false });

    const messages = response.data;
    setEntireMessages(messages);
    // Create a map to store the latest message for each conversation
    const latestMessages = new Map();

    const createConversationKey = (senderId, receiverId) => {
      return [senderId, receiverId].sort().join("-");
    };

    messages.forEach((message) => {
      const conversationKey = createConversationKey(
        message.senderid,
        message.receiverid
      );
      if (!latestMessages.has(conversationKey)) {
        latestMessages.set(conversationKey, message);
      }
    });

    const lastChats = Array.from(latestMessages.values());

    const unreadCount = {};
    latestMessages.forEach((message, key) => {
      const chatMessages = messages.filter(
        (msg) => createConversationKey(msg.senderid, msg.receiverid) === key
      );
      let count = 0;
      for (const msg of chatMessages) {
        if (msg.isread) break;
        count++;
      }
      unreadCount[key] = count;
    });

    return lastChats
      .filter(
        (lc) =>
          (lc.senderid === userNumId && !lc.sdelete) ||
          (lc.receiverid === userNumId && !lc.rdelete)
      )
      .map((chat) => ({
        ...chat,
        unreadCount:
          unreadCount[createConversationKey(chat.senderid, chat.receiverid)] ||
          0,
      }));
  };

  useEffect(() => {
    if (userNumId) {
      fetchFollowing(userNumId)
        .then(({ data }) => {
          if (!allUserObject) {
            fetchAllUsers()
              .then((res) => {
                fetchChats().then((chats) => {
                  setAllChats(chats);
                  setOriginalChats(chats);
                });
                setFollowing(
                  res.data.filter((user) =>
                    data.some(
                      (dataItem) => dataItem.following_userid === user.id
                    )
                  )
                );
                setAllUserObject(res.data);
              })
              .catch((e) => console.log(e, "inbox index.js users error"));
          } else {
            fetchChats().then((chats) => {
              setAllChats(chats);
              setOriginalChats(chats);
            });
            setFollowing(
              allUserObject.filter((user) =>
                data.some((dataItem) => dataItem.following_userid === user.id)
              )
            );
          }
        })
        .catch((e) => {
          console.log("error: ", e);
        });
    }
  }, [allChats, userNumId, allUserObject]);

  return (
    <main
      className={`fixed w-full lg:w-[90vw] max-w-[1440px] mx-auto ${
        darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"
      }`}
    >
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <div className="block lg:hidden z-40 sticky top-0">
        <SmallTopBar relationship={false} />
      </div>
      <section className="relative flex flex-row space-x-2 w-full">
        <NavBar />

        <div className="lg:max-h-[90vh] w-full top-0 space-y-8 pl-2 lg:pl-72 pr-0 flex flex-col">
          {newChat ? (
            <span
              className={`${
                darkMode ? "bg-[#1e1f24]" : "bg-white"
              } mt-4 items-start overflow-hidden flex flex-row w-full rounded-lg`}
            >
              <span
                className={`${
                  darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
                } flex flex-col w-full lg:w-1/3 lg:min-h-[75vh] h-full mt-2 px-4`}
              >
                <span className="pb-1 pt-3 flex flex-row justify-between items-center">
                  <span className="text-normal font-semibold">
                    Start new chat
                  </span>

                  <span className="p-2 bg-[#EB4463] rounded-full">
                    <svg
                      onClick={() => {
                        setNewChat(false);
                      }}
                      fill="white"
                      stroke="white"
                      strokeWidth={1}
                      width="14px"
                      height="14px"
                      viewBox="-3.5 0 19 19"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cf-icon-svg cursor-pointer"
                    >
                      <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z" />
                    </svg>
                  </span>
                </span>
                <span
                  className={`rounded-xl ${
                    darkMode
                      ? "border bg-transparent border-white text-white"
                      : "bg-[#F9F9F9] text-gray-500 "
                  } mt-2 py-1 pl-4 w-full flex flex-row items-center`}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                  <input
                    value={userToSearch}
                    onChange={searchForUser}
                    type="search"
                    className="w-full text-xs bg-transparent border-none focus:ring-0 placeholder-gray-400"
                    placeholder="Search for users"
                  />
                </span>
                <span className="flex flex-col w-full">
                  {foundUsers !== null &&
                    foundUsers !== undefined &&
                    foundUsers.length !== 0 &&
                    foundUsers.slice(0, 8).map((found) => {
                      return (
                        <span
                          key={found.id}
                          onClick={() => {
                            router.push(`/inbox/${found.username}`);
                          }}
                          className="p-2 space-x-1 flex flex-row items-center cursor-pointer hover:bg-[#EB4463] hover:text-white font-medium"
                        >
                          <span className="flex flex-shrink-0">
                            <Image
                              src={found.avatar}
                              alt="user"
                              width={30}
                              height={30}
                              className="border border-black rounded-full"
                            />
                          </span>
                          <span>{found.username}</span>
                        </span>
                      );
                    })}
                  <span className="py-2 text-normal font-medium">
                    Following
                  </span>
                  {following !== null &&
                    following !== undefined &&
                    following.length !== 0 &&
                    following.slice(0, 8).map((fl) => {
                      return (
                        <span
                          key={fl.id}
                          onClick={() => {
                            router.push(`/inbox/${fl.username}`);
                          }}
                          className="p-2 space-x-1 flex flex-row items-center cursor-pointer hover:bg-[#EB4463] hover:text-white font-medium"
                        >
                          <span className="flex flex-shrink-0 h-8 w-8">
                            <Image
                              src={fl.avatar}
                              alt="user"
                              width={30}
                              height={30}
                              className="border border-black rounded-full"
                            />
                          </span>
                          <span>{fl.username}</span>
                        </span>
                      );
                    })}
                </span>
              </span>

              <span
                className={`hidden lg:flex h-full rounded-r-lg relative w-full items-start justify-center ${
                  darkMode
                    ? "bg-[url('/assets/chat_bg_dark.png')]"
                    : "bg-[url('/assets/chat_bg_light.png')]"
                } bg-no-repeat bg-cover bg-cente`}
              >
                {/* <span className="absolute inset-0 bg-[url('/path-to-pattern.png')] opacity-20"></span> */}
                {userData && currentParty !== "" ? (
                  <Messages message={currentParty} />
                ) : (
                  <span
                    className={`${
                      darkMode ? "text-white" : "text-black"
                    } m-auto relative z-10 bg-white/30 backdrop-blur-md h-fit py-3 px-8 rounded-lg text-center`}
                  >
                    <span className="font-medium cursor-pointer">
                      Select a conversation <br /> or start a new one
                    </span>
                  </span>
                )}
              </span>
            </span>
          ) : (
            userData && (
              <span
                className={`${
                  darkMode
                    ? "bg-transparent lg:bg-[#1e1f24]"
                    : "bg-transparent lg:bg-white"
                } -ml-2 lg:ml-0 mt-4 items-start overflow-hidden flex flex-row w-full rounded-lg`}
              >
                <span className="p-2 flex flex-col w-full lg:w-1/3">
                  <span className="relative flex flex-row bg-transparent justify-between space-x-2 items-center">
                    <span
                      className={`${
                        darkMode ? "text-white" : "text-black"
                      } font-semibold text-lg lg:text-normal`}
                    >
                      All messages
                    </span>

                    <span
                      onClick={() => {
                        setNewChat(true);
                      }}
                      className={`${
                        darkMode
                          ? "bg-[#1e1f24] lg:bg-[#292C33]"
                          : "bg-transparent lg:bg-[#F9F9F9]"
                      } p-2 rounded-full flex flex-shrink-0 cursor-pointer`}
                    >
                      <svg
                        fill={darkMode ? "white" : "black"}
                        width="15px"
                        height="15px"
                        viewBox="0 0 24 24"
                        id="plus"
                        data-name="Line Color"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon line-color"
                      >
                        <path
                          id="primary"
                          d="M5,12H19M12,5V19"
                          style={{
                            fill: "none",
                            stroke: darkMode ? "white" : "black",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 3.5,
                          }}
                        />
                      </svg>
                    </span>
                  </span>

                  <span
                    className={`bg-transparent w-full lg:min-h-[75vh] h-full`}
                  >
                    <span
                      className={`rounded-lg w-full ${
                        darkMode
                          ? "bg-[#27292F] lg:border lg:border-gray-500"
                          : "bg-gray-200 lg:bg-[#F9F9F9]"
                      } mt-2 py-1 pl-4 flex flex-row items-center`}
                    >
                      <svg
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        } w-4 h-4`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                      <input
                        value={messageItem}
                        onChange={searchForMessage}
                        type="search"
                        className={`${
                          darkMode ? "text-white" : "text-[#5D6879]"
                        } w-full text-sm font-light bg-transparent border-none focus:ring-0 placeholder-gray-400`}
                        placeholder="Search for messages"
                      />
                    </span>

                    {searchResult !== null &&
                      searchResult !== undefined &&
                      searchResult.length > 0 &&
                      searchResult.map((sr) => {
                        return (
                          <span
                            key={sr.id}
                            className="flex flex-row w-full border-b border-[#EEEDEF] items-center py-2"
                          >
                            <span
                              onClick={() => {
                                fullPageReload(
                                  `profile/${
                                    getUserFromId(
                                      sr.senderid === userNumId
                                        ? sr.receiverid
                                        : sr.senderid
                                    ).username
                                  }`
                                );
                              }}
                              className="flex flex-shrink-0"
                            >
                              <Image
                                src={
                                  getUserFromId(
                                    sr.senderid === userNumId
                                      ? sr.receiverid
                                      : sr.senderid
                                  ).avatar
                                }
                                alt="post"
                                height={45}
                                width={45}
                                className="cursor-pointer border border-black rounded-full object-cover"
                              />
                            </span>

                            <span
                              onClick={() => {
                                router.push(
                                  `/inbox/${
                                    getUserFromId(
                                      sr.senderid === userNumId
                                        ? sr.receiverid
                                        : sr.senderid
                                    ).username
                                  }?search=${messageItem}`
                                );
                              }}
                              className={`${
                                darkMode ? "text-white" : "text-black"
                              } w-full pl-1.5 flex flex-col justify-center space-y-0.5 py-2 text-xs`}
                            >
                              <span className="cursor-default font-bold flex flex-row space-x-2 justify-between items-center">
                                <span>
                                  {
                                    getUserFromId(
                                      sr.senderid === userNumId
                                        ? sr.receiverid
                                        : sr.senderid
                                    ).username
                                  }
                                </span>
                                <span className="text-gray-500">
                                  {formatTimestamp(sr.created_at)}
                                </span>
                              </span>
                              <span
                                className={`w-[85%] cursor-default font-bold flex flex-row ${
                                  darkMode ? "text-gray-200" : "text-gray-500"
                                } text-[0.77rem]`}
                                style={{
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {sr.message.length > 110
                                  ? sr.message
                                      .slice(0, 110)
                                      .trim()
                                      .concat("...")
                                  : sr.message}
                              </span>
                            </span>
                          </span>
                        );
                      })}

                    {allChats !== null &&
                    allChats !== undefined &&
                    allChats.length !== 0 &&
                    allUserObject
                      ? allChats.map((singleChat) => {
                          return (
                            <span
                              key={singleChat.id}
                              className={`${
                                darkMode
                                  ? "text-white border-b border-gray-800"
                                  : "text-black border-b border-[#EEEDEF]"
                              } ${
                                currentParty &&
                                currentParty.toLowerCase() ===
                                  getUserFromId(
                                    singleChat.senderid === userNumId
                                      ? singleChat.receiverid
                                      : singleChat.senderid
                                  ).username.toLowerCase() &&
                                `border-l-[0.25rem] border-l-[#EB4463] ${
                                  darkMode ? "bg-[#FFEFEF]/5" : "bg-[#FFEFEF]"
                                }`
                              } mt-1 px-1 flex flex-row w-full items-center py-2`}
                            >
                              <span
                                onClick={() => {
                                  fullPageReload(
                                    `profile/${
                                      getUserFromId(
                                        singleChat.senderid === userNumId
                                          ? singleChat.receiverid
                                          : singleChat.senderid
                                      ).username
                                    }`
                                  );
                                }}
                                className="flex lg:hidden flex-shrink-0"
                              >
                                <Image
                                  src={
                                    getUserFromId(
                                      singleChat.senderid === userNumId
                                        ? singleChat.receiverid
                                        : singleChat.senderid
                                    ).avatar
                                  }
                                  alt="post"
                                  height={45}
                                  width={45}
                                  className="cursor-pointer border border-black rounded-full object-cover"
                                />
                              </span>

                              <span
                                onClick={() => {
                                  router.push(
                                    `/inbox/${
                                      getUserFromId(
                                        singleChat.senderid === userNumId
                                          ? singleChat.receiverid
                                          : singleChat.senderid
                                      ).username
                                    }`
                                  );
                                }}
                                className="flex lg:hidden w-full pl-1.5 flex-col justify-center space-y-0.5 py-2 text-xs"
                              >
                                <span className="text-[0.85rem] cursor-default font-bold flex flex-row space-x-2 justify-between items-center">
                                  <span>
                                    {
                                      getUserFromId(
                                        singleChat.senderid === userNumId
                                          ? singleChat.receiverid
                                          : singleChat.senderid
                                      ).username
                                    }
                                  </span>
                                  <span className="flex justify-end w-full">
                                    {singleChat.unreadCount > 0 && (
                                      <span className="text-xs font-semibold flex justify-center items-center text-white bg-[#EB4463] h-5 w-5 rounded-full text-sm font-medium shadow-md">
                                        {singleChat.unreadCount}
                                      </span>
                                    )}
                                  </span>
                                  
                                </span>
                                <span className="flex flex-row justify-between items-center">
                                  
                                  <span
                                    className={`overflow-hidden cursor-default flex flex-row text-[0.77rem] ${
                                      singleChat.receiverid === userNumId &&
                                      !singleChat.isread
                                        ? "font-bold"
                                        : "font-medium"
                                    }`}
                                  >
                                    {singleChat.message.length > 110
                                      ? singleChat.message
                                          .slice(0, 110)
                                          .trim()
                                          .concat("...")
                                      : singleChat.message}
                                  </span>
                                  <span className="text-gray-500">
                                    {formatTimestamp(singleChat.created_at)}
                                  </span>
                                </span>
                                
                              </span>
                              {/* Screen sizes  */}

                              <span
                                onClick={() => {
                                  setCurrentParty(
                                    getUserFromId(
                                      singleChat.senderid === userNumId
                                        ? singleChat.receiverid
                                        : singleChat.senderid
                                    ).username
                                  );
                                }}
                                className="hidden lg:flex flex-shrink-0"
                              >
                                <Image
                                  src={
                                    getUserFromId(
                                      singleChat.senderid === userNumId
                                        ? singleChat.receiverid
                                        : singleChat.senderid
                                    ).avatar
                                  }
                                  alt="post"
                                  height={45}
                                  width={45}
                                  className="cursor-pointer border border-black rounded-full object-cover"
                                />
                              </span>
                              <span
                                onClick={() => {
                                  setCurrentParty(
                                    getUserFromId(
                                      singleChat.senderid === userNumId
                                        ? singleChat.receiverid
                                        : singleChat.senderid
                                    ).username
                                  );
                                }}
                                className="hidden lg:flex w-full pl-1.5 flex-col justify-center space-y-0.5 py-2 text-xs"
                              >
                                <span className="block w-full grid grid-cols-2 cursor-default font-bold">
                                  <span className="text-[0.85rem]">
                                    {
                                      getUserFromId(
                                        singleChat.senderid === userNumId
                                          ? singleChat.receiverid
                                          : singleChat.senderid
                                      ).username
                                    }
                                  </span>

                                  <span className="flex justify-end w-full">
                                    {singleChat.unreadCount > 0 && (
                                      <span className="text-xs font-semibold flex justify-center items-center text-white bg-[#EB4463] h-5 w-5 rounded-full text-sm font-medium shadow-md">
                                        {singleChat.unreadCount}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                <span className="flex flex-row justify-between items-center">
                                  <span
                                    onClick={() => {
                                      console.log(singleChat);
                                    }}
                                    className={`relative w-[85%] overflow-hidden cursor-default flex flex-row text-[0.77rem] ${
                                      singleChat.receiverid === userNumId &&
                                      !singleChat.isread
                                        ? "font-bold"
                                        : "font-medium"
                                    }`}
                                  >
                                    {singleChat.message.length > 110
                                      ? singleChat.message
                                          .slice(0, 110)
                                          .trim()
                                          .concat("...")
                                      : singleChat.message}
                                  </span>
                                  <span className="text-gray-500 whitespace-nowrap">
                                    {formatTimestamp(singleChat.created_at)}
                                  </span>
                                </span>
                                
                              </span>
                            </span>
                          );
                        })
                      : !searchResult ||
                        (searchResult && searchResult.length === 0 && (
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-gray-500"
                            } p-2 text-sm w-full flex flex-row justify-center`}
                          >
                            {"Start a conversation"}
                          </span>
                        ))}
                  </span>
                </span>

                <span
                  className={`hidden lg:flex h-full rounded-r-lg relative w-full items-start justify-center ${
                    darkMode
                      ? "bg-[url('/assets/chat_bg_dark.png')]"
                      : "bg-[url('/assets/chat_bg_light.png')]"
                  } bg-no-repeat bg-cover bg-center`}
                >
                  {/* <span className="absolute inset-0 bg-[url('/path-to-pattern.png')] opacity-20"></span> */}
                  {currentParty !== "" ? (
                    <Messages message={currentParty} />
                  ) : (
                    <span
                      className={`${
                        darkMode ? "text-white" : "text-black"
                      } m-auto relative z-10 bg-white/30 backdrop-blur-md h-fit py-3 px-8 rounded-lg text-center`}
                    >
                      <span className="font-medium cursor-pointer">
                        Select a conversation <br /> or start a new one
                      </span>
                    </span>
                  )}
                </span>
              </span>
            )
          )}
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      {sideBarOpened && (
        <div
          onClick={() => {
            setSideBarOpened(false);
          }}
          id="sidebar-overlay"
        ></div>
      )}
      <MobileNavBar />
    </main>
  );
};
export default Inbox;
