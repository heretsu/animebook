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

const Inbox = () => {
  const router = useRouter();
  const { fullPageReload } = PageLoadOptions();
  const { userNumId, userData, allUserObject, setAllUserObject, sideBarOpened, setSideBarOpened, darkMode} =
    useContext(UserContext);
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
  const [searchResult, setSearchResult] = useState(null)

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
      setSearchResult(null)
    }
  };

  const getUserFromId = (id) => {
    return allUserObject.find((usr) => usr.id === id);
  };

  // Function to format time in hh:mm AM/PM format
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
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
      return `Yesterday` ;
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
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
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

    return lastChats.filter(
      (lc) =>
        (lc.senderid === userNumId && !lc.sdelete) ||
        (lc.receiverid === userNumId && !lc.rdelete)
    );
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
  }, [userNumId, allUserObject]);

  return (
    <main>
      <section className="relative mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full top-0 pb-2 space-y-8 pl-2 lg:pl-60 pr-4 flex flex-col">
          {newChat ? (
            <span className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-black'} flex flex-col w-full min-h-screen h-full mt-2 px-4`}>
              <span className="border-b border-gray-300 flex flex-row justify-between items-center">
                <svg
                  onClick={() => {
                    setNewChat(false);
                  }}
                  fill={darkMode ? "white" : "#000000"}
                  width="18px"
                  height="18px"
                  viewBox="-3.5 0 19 19"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cf-icon-svg cursor-pointer"
                >
                  <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z" />
                </svg>
                <span
                  id="anime-book-font"
                  className="text-xl py-2 w-full flex justify-center"
                >
                  New chat
                </span>
                <span></span>
              </span>
              <span className={`${darkMode ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-500 '} mt-2 py-1 pl-4 w-full flex flex-row items-center`}>
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
                  className="w-full text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
                  placeholder="Search users to chat with!"
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
                        className="p-2 space-x-1 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
                      >
                        <span className="flex flex-shrink-0">
                          <Image
                            src={found.avatar}
                            alt="user"
                            width={30}
                            height={30}
                            className="border border-white rounded-full"
                          />
                        </span>
                        <span>{found.username}</span>
                      </span>
                    );
                  })}
                <span
                  id="anime-book-font"
                  className="text-lg border-b border-gray-300 pt-1"
                >
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
                        className="p-2 space-x-1 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
                      >
                        <span className="flex flex-shrink-0">
                          <Image
                            src={fl.avatar}
                            alt="user"
                            width={30}
                            height={30}
                            className="border border-white rounded-full"
                          />
                        </span>
                        <span>{fl.username}</span>
                      </span>
                    );
                  })}
              </span>
            </span>
          ) : (
            userData && (
              <span className="flex flex-col w-full">
                <span
                  id="anime-book-font"
                  className={`${darkMode ? 'bg-[#1e1f24] text-white border-b border-gray-400' : 'bg-gray-100 border-b border-gray-200'} flex lg:hidden flex-row shadow-xl p-2 justify-between items-center`}
                >
                  <span
                    onClick={() => {
                      setSideBarOpened(true)
                    }}
                    className="cursor-pointer flex flex-shrink-0"
                  >
                    <Image
                      src={userData.avatar}
                      alt="user"
                      width={35}
                      height={35}
                      className="border border-white rounded-full"
                    />
                  </span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-600'} font-bold text-xl`}>
                    Messages
                  </span>
                  <span
                    onClick={() => {
                      setNewChat(true);
                    }}
                    className="bg-pastelGreen p-2 rounded-full flex flex-shrink-0 cursor-pointer"
                  >
                    <svg
                      fill="#000000"
                      width="20px"
                      height="20px"
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
                          stroke: "white",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 3,
                        }}
                      />
                    </svg>
                  </span>
                </span>

                <span
                  id="anime-book-font"
                  className="hidden lg:flex flex-row bg-dmGreen p-2 justify-between items-center"
                >
                  <span className="text-gray-600 font-bold text-xl">
                    All messages
                  </span>
                  <span
                    onClick={() => {
                      setNewChat(true);
                    }}
                    className="cursor-pointer bg-pastelGreen text-white font-bold text-lg py-1 px-4"
                  >
                    New message
                  </span>
                </span>

                <span className={`${darkMode ? 'bg-[#1e1f24]' : 'bg-white' }px-2 w-full min-h-screen h-full`}>
                  <span className={`${darkMode ? 'bg-gray-500 border-none' : 'bg-gray-100 border border-gray-200'} mt-2 py-1 pl-4 w-full flex flex-row items-center`}>
                    <svg
                      className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} w-4 h-4`}
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
                      className={`${darkMode ? 'text-whitea' : 'text-gray-500'} w-full text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400`}
                      placeholder="Search for messages and more..."
                    />
                  </span>

                  {
                    searchResult !== null && searchResult !== undefined && searchResult.length > 0 && searchResult.map((sr)=>{
                      return (
                        <span
                          key={sr.id}
                          className="flex flex-row w-full border-b border-gray-300 items-center py-2"
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
                              className="cursor-pointer rounded-full object-cover"
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
                            className="w-full pl-1.5 flex flex-col justify-center space-y-0.5 py-2 text-xs"
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
                                className={`cursor-default font-bold flex flex-row text-gray-500 text-[0.77rem]`}
                                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap"}}
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
                      )
                    })
                  }

                  {allChats !== null &&
                  allChats !== undefined &&
                  allChats.length !== 0 &&
                  allUserObject ? (
                    allChats.map((singleChat) => {
                      return (
                        <span
                          key={singleChat.id}
                          className={`${darkMode ? 'text-white border-b border-gray-800' : 'text-black border-b border-gray-300'} flex flex-row w-full items-center py-2`}
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
                            className="flex flex-shrink-0"
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
                              className="cursor-pointer rounded-full object-cover"
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
                            className="w-full pl-1.5 flex flex-col justify-center space-y-0.5 py-2 text-xs"
                          >
                            <span className="cursor-default font-bold flex flex-row space-x-2 justify-between items-center">
                              <span>
                                {
                                  getUserFromId(
                                    singleChat.senderid === userNumId
                                      ? singleChat.receiverid
                                      : singleChat.senderid
                                  ).username
                                }
                              </span>
                              <span className="text-gray-500">
                                {formatTimestamp(singleChat.created_at)}
                              </span>
                            </span>
                            <span className="flex flex-row justify-start items-center">
                              {singleChat.receiverid === userNumId &&
                                !singleChat.isread && (
                                  <span className="h-1.5 w-1.5 flex flex-shrink-0 mr-1 bg-pastelGreen rounded-full"></span>
                                )}
                              <span
                                className={`${darkMode ? 'text-white' : 'text-gray-500'} cursor-default font-bold flex flex-row text-[0.77rem] ${
                                  singleChat.receiverid === userNumId &&
                                  !singleChat.isread &&
                                  "font-black"
                                }`}
                              >
                                {singleChat.message.length > 110
                                  ? singleChat.message
                                      .slice(0, 110)
                                      .trim()
                                      .concat("...")
                                  : singleChat.message}
                              </span>
                            </span>
                          </span>
                        </span>
                      );
                    })
                  ) : (
                    !searchResult || searchResult && searchResult.length === 0 && <span className={`${darkMode ? 'text-white' : 'text-gray-500'} p-2 text-sm w-full flex flex-row justify-center`}>
                      {"Start a conversation"}
                    </span>
                  )}
                </span>
              </span>
            )
          )}
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      {sideBarOpened && <div onClick={()=>{setSideBarOpened(false)}} id="sidebar-overlay"></div>}
      <MobileNavBar />
    </main>
  );
};
export default Inbox;
