import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  useEffect,
  useContext,
  useState,
  useRef,
  createRef,
  useLayoutEffect,
} from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import AttachmentsContainer from "@/components/attachmentsContainer";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { MessageContext } from "@/lib/messageContext";
import LargeTopBar from "@/components/largeTopBar";
import Messages from "./inboxutils/messages";

export const getServerSideProps = async (context) => {
  const { message } = context.query;

  return {
    props: {
      message,
    },
  };
};

export const TextConfiguration = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return (
      <span
        className="text-sm break-all"
        style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      >
        {text}
      </span>
    );
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span
      className="text-sm break-all"
      style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
    >
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={index}
            className="bg-yellow-300"
            style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const Message = ({ message }) => {
  const [currenctChat, setCurrentChat] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(null);
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { userNumId, userData, allUserObject, setAllUserObject, darkMode } =
    useContext(UserContext);
  const [following, setFollowing] = useState(null);
  const [userToSearch, setUserToSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState(null);
  const { fetchAllUsers } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [userDetail, setUserDetail] = useState(null);
  const [chatsObject, setChatsObject] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [originalChats, setOriginalChats] = useState(null);
  const [deleteConvo, setDeleteConvo] = useState(false);

  const [messageItem, setMessageItem] = useState("");
  const [entireMessages, setEntireMessages] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  const [foundMessageIndices, setFoundMessageIndices] = useState([]);
  const [currentFoundIndex, setCurrentFoundIndex] = useState(0);

  const [initialQuery, setInitialQuery] = useState(false);

  const messageRefs = useRef([]);

  function formatTimeFromTimestamp(timestamp) {
    const date = new Date(timestamp);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;

    const timeStr = `${hours}:${minutesStr} ${ampm}`;
    return timeStr;
  }

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

  const fetchChat = async (otherId) => {
    const response = await supabase
      .from("conversations")
      .select()
      .or(
        `and(senderid.eq.${userNumId},receiverid.eq.${otherId}),and(senderid.eq.${otherId},receiverid.eq.${userNumId})`
      )
      .order("created_at", { ascending: true });

    const messages = response.data;

    // Find the last deleted message for the current user
    let lastDeletedIndex = -1;
    messages.forEach((message, index) => {
      const isDeletedForUser =
        (message.sdelete && message.senderid === userNumId) ||
        (message.rdelete && message.receiverid === userNumId);
      if (isDeletedForUser) {
        lastDeletedIndex = index;
      }
    });

    // Filter messages created after the last deleted message and are not marked as deleted for the user
    const filteredMessages = messages.filter((message, index) => {
      if (index <= lastDeletedIndex) {
        return false;
      }
      const isDeletedForUser =
        (message.sdelete && message.senderid === userNumId) ||
        (message.rdelete && message.receiverid === userNumId);
      return !isDeletedForUser;
    });

    return { data: filteredMessages.length > 0 ? filteredMessages : [] };
  };

  const fetchAllChats = async () => {
    const response = await supabase
      .from("conversations")
      .select()
      .or(`senderid.eq.${userNumId},receiverid.eq.${userNumId}`)
      .order("created_at", { ascending: false });

    const messages = response.data;
    setEntireMessages(messages);
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

  const getUserFromId = (id) => {
    return allUserObject.find((usr) => usr.id === id);
  };

  const readMessage = async (msgId) => {
    const result = await supabase
      .from("conversations")
      .update({
        isread: true,
      })
      .eq("id", msgId);
    return result;
  };
  const handleInserts = (payload) => {
    if (
      payload.new.receiverid === userNumId ||
      payload.new.senderid === userNumId
    ) {
      const foundUser = allUserObject.find(
        (a) => a.id === payload.new.receiverid || a.id === payload.new.senderid
      );

      if (
        foundUser &&
        message.toLowerCase() === foundUser.username.toLowerCase()
      ) {
        setChatsObject((prevChats) => [...prevChats, payload.new]);
      }

      const newLastChats = [
        payload.new,
        ...allChats.filter(
          (ac) =>
            (ac.senderid === userNumId &&
              ac.receiverid !== payload.new.receiverid &&
              ac.receiverid !== payload.new.senderid) ||
            (ac.senderid !== userNumId &&
              ac.senderid !== payload.new.senderid &&
              ac.senderid !== payload.new.receiverid)
        ),
      ];
      setAllChats(newLastChats);
    }
  };
  const clearConversation = async () => {
    if (chatsObject && chatsObject.length > 0) {
      if (chatsObject[chatsObject.length - 1].senderid === userNumId) {
        await supabase
          .from("conversations")
          .update({
            sdelete: true,
          })
          .eq("id", chatsObject[chatsObject.length - 1].id);
        router.push("/inbox");
      } else {
        await supabase
          .from("conversations")
          .update({
            rdelete: true,
          })
          .eq("id", chatsObject[chatsObject.length - 1].id);
        router.push("/inbox");
      }
    } else {
      router.push("/inbox");
    }
  };

  const getMessageRef = (index) => {
    if (!messageRefs.current[index]) {
      messageRefs.current[index] = createRef();
    }
    return messageRefs.current[index];
  };

  const searchForMessage = (e) => {
    setMessageItem(e.target.value);
    const text = e.target.value.toLowerCase();

    if (text !== "" && entireMessages) {
      // Filter messages based on the search text
      const foundMsg = entireMessages.filter((msg) =>
        msg.message.toLowerCase().includes(text)
      );

      setSearchResult(
        foundMsg.filter(
          (msg) =>
            msg.senderid === userDetail.id || msg.receiverid === userDetail.id
        )
      );

      // Save original chats if not already saved
      if (originalChats === null) {
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

  const handleQuery = (text) => {
    if (text.q || (text !== "" && chatsObject && chatsObject.length > 0)) {
      const indices = chatsObject.reduce((acc, chat, index) => {
        if (
          chat.message.toLowerCase().includes((text.q || text).toLowerCase())
        ) {
          acc.push(index);
        }
        return acc;
      }, []);
      setFoundMessageIndices(indices); // Set all found indices
      setCurrentFoundIndex(0); // Reset to the first found index
      if (indices.length > 0 && messageRefs.current[indices[0]]?.current) {
        setTimeout(() => {
          messageRefs.current[
            [...indices].reverse()[text.srid || 0]
          ].current.scrollIntoView({
            block: "center",
          });
        }, 100);
      }
    } else {
      setFoundMessageIndices([]); // Clear found indices
      setCurrentFoundIndex(0); // Reset current index
    }

    // setOpenSearchNav(true)
  };
  const [imgSrc, setImgSrc] = useState("");
  const [secondImgSrc, setSecondImgSrc] = useState("");

  useEffect(() => {
    if (userData && userData.avatar) {
      setImgSrc(userData.avatar);
    }
    if (userDetail) {
      setSecondImgSrc(userDetail.avatar);
    }
    if (currenctChat === null || (userNumId && !allUserObject)) {
      setCurrentChat(message);

      if (userNumId) {
        fetchFollowing(userNumId)
          .then(({ data, error }) => {
            if (!data) {
              return;
            }
            if (!allUserObject) {
              fetchAllUsers()
                .then((response) => {
                  setAllUserObject(response.data);
                  const uDetail = response.data.find(
                    (user) =>
                      user.username.toLowerCase() === message.toLowerCase()
                  );

                  fetchAllChats().then((info) => {
                    if (info && info.length > 0) {
                      setAllChats(info);
                    } else {
                      setFollowing(
                        response.data.filter((user) =>
                          data.some(
                            (dataItem) => dataItem.following_userid === user.id
                          )
                        )
                      );
                    }
                  });

                  fetchChat(uDetail.id).then((res) => {
                    setUserDetail(uDetail);
                    setChatsObject(res.data);
                  });
                })
                .catch((e) => console.log(e, "inbox index.js users error"));
            } else {
              const uDetail = allUserObject.find(
                (user) => user.username.toLowerCase() === message.toLowerCase()
              );

              fetchAllChats().then((info) => {
                if (info && info.length > 0) {
                  setAllChats(info);
                } else {
                  setFollowing(
                    allUserObject.filter((user) =>
                      data.some(
                        (dataItem) => dataItem.following_userid === user.id
                      )
                    )
                  );
                }
              });
              fetchChat(uDetail.id).then((res) => {
                setUserDetail(uDetail);
                setChatsObject(res.data);
              });
            }
          })
          .catch((e) => {
            console.log("error: ", e);
          });
      }
    } else if (currenctChat !== message && allUserObject) {
      const newChatUser = allUserObject.find(
        (user) => user.username === message
      );
      fetchChat(newChatUser.id).then((res) => {
        setUserDetail(newChatUser);
        setChatsObject(res.data);
        setCurrentChat(message);
      });
    }

    if (
      messageRefs &&
      messageRefs.current &&
      messageRefs.current.length > 0 &&
      messageRefs.current[messageRefs.current.length - 1].current
    ) {
      messageRefs.current[
        messageRefs.current.length - 1
      ].current.scrollIntoView();
    }

    if (
      router.query &&
      ((currentQuery && currentQuery.q) || router.query.search) &&
      chatsObject &&
      allChats &&
      messageRefs &&
      userDetail &&
      !initialQuery
    ) {
      setInitialQuery(true);
      searchForMessage({
        target: {
          value: (currentQuery && currentQuery.q) || router.query.search,
        },
      });

      handleQuery(currentQuery || router.query.search);
    }

    if (
      allChats &&
      chatsObject &&
      userNumId &&
      chatsObject.length > 0 &&
      chatsObject.filter((c) => c.receiverid === userNumId).length > 0 &&
      chatsObject.filter((c) => c.receiverid === userNumId)[
        chatsObject.filter((c) => c.receiverid === userNumId).length - 1
      ].isread === false
    ) {
      const lastReceivedMessage = chatsObject
        .filter((c) => c.receiverid === userNumId)
        .pop();

      if (!lastReceivedMessage) return;
      let updatedMessage = { ...lastReceivedMessage, isread: true };

      // Updated the chatsObject array
      const updatedChatsObject = chatsObject.map((chat) =>
        chat.id === lastReceivedMessage.id ? updatedMessage : chat
      );

      // Updated the allChats array
      const updatedAllChats = allChats.map((chat) =>
        chat.id === lastReceivedMessage.id ? updatedMessage : chat
      );

      setChatsObject(updatedChatsObject);
      setAllChats(updatedAllChats);

      //check if in right inbox user path first before read message
      if (
        message.toLowerCase() ===
        allUserObject
          .find(
            (a) =>
              a.id ===
              chatsObject.filter((c) => c.receiverid === userNumId)[
                chatsObject.filter((c) => c.receiverid === userNumId).length - 1
              ].senderid
          )
          .username.toLowerCase()
      ) {
        readMessage(
          chatsObject.filter((c) => c.receiverid === userNumId)[
            chatsObject.filter((c) => c.receiverid === userNumId).length - 1
          ].id
        );
      }
    }

    // Listen to inserts
    supabase
      .channel("todos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        handleInserts
      )
      .subscribe();
  }, [
    userNumId,
    userDetail,
    userData,
    allUserObject,
    allChats,
    chatsObject,
    message,
    originalChats,
    initialQuery,
    currentQuery,
    messageRefs,
  ]);

  return (
    <main className={`fixed w-full lg:w-[90vw] max-w-[1400px] mx-auto ${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <section className="flex flex-row lg:space-x-2 w-full">
        <NavBar />
        <div className="w-full top-0 lg:pt-4 space-y-2 lg:pl-72 pr-0 flex flex-col">
          {/* Back button */}
          {/* <svg
                  onClick={() => {
                    router.push("/inbox");
                  }}
                  width="30px"
                  height="30px"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                >
                  <rect
                    width={48}
                    height={48}
                    fill="white"
                    fillOpacity={0.01}
                  />
                  <path
                    d="M31 36L19 24L31 12"
                    stroke="gray"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>          */}
                 {userDetail ? (
            <span className={`flex h-[screen] lg:h-full rounded-r-lg relative w-full items-center justify-center ${darkMode ? "bg-[url('/assets/chat_bg_dark.png')]" : "bg-[url('/assets/chat_bg_light.png')]"} bg-no-repeat bg-cover bg-center`}>
              <Messages message={userDetail.username} />
            </span>
          ) : (
            <span
              className={`${
                darkMode ? "text-white" : "text-gray-800"
              } w-full italic text-sm pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col`}
            >{`得る Loading...`}</span>
          )}

          {/* <div
          className={`px-5 ${
            darkMode ? "bg-[#1e1f24] text-white" : "bg-white text-black"
          } invisible lg:visible fixed h-screen right-[5%] h-fit overflow-hidden block`}
        >
          <span className="flex flex-col w-full min-h-screen h-full overflow-scroll">
            <span className="sticky top-0 bg-transparent pt-0">
              <span
                className={`rounded-lg border ${
                  darkMode
                    ? "bg-zinc-800 border-[#32353C]"
                    : "bg-white border-[#D0D3DB]"
                } mt-2 py-1 pl-4 w-full flex flex-row items-center`}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
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
                    darkMode ? "text-white" : "text-gray-500"
                  } w-full text-xs bg-transparent border-none focus:ring-0 placeholder-gray-400`}
                  placeholder="Search chat"
                />
              </span>
            </span>
            <span className="flex flex-col w-52">
              {searchResult !== null &&
                searchResult !== undefined &&
                searchResult.length > 0 &&
                searchResult.map((sr, srid) => {
                  return (
                    <span
                      key={sr.id}
                      className={`${
                        darkMode ? "border-gray-700" : "border-gray-300"
                      } flex flex-row w-full border-b items-center py-2`}
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
                          setCurrentQuery({ q: messageItem, srid: srid });
                          setMessageItem(messageItem);
                          searchForMessage({ target: { value: messageItem } });
                          setInitialQuery(false);

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
                        </span>
                        <span
                          className={`${
                            darkMode ? "text-white" : "text-gray-500"
                          } cursor-default font-bold flex flex-row text-[0.77rem]`}
                        >
                          {sr.message.length > 110
                            ? sr.message.slice(0, 110).trim().concat("...")
                            : sr.message}
                        </span>
                      </span>
                    </span>
                  );
                })}

              {allChats !== null &&
              allChats !== undefined &&
              allChats.length !== 0 &&
              allUserObject ? (
                allChats.map((singleChat) => {
                  return (
                    <span
                      key={singleChat.id}
                      className={`${
                        darkMode ? "border-gray-700" : "border-gray-300"
                      } relative flex flex-row w-full border-b items-end py-2`}
                      onClick={() => {
                        setMessageItem("");
                        setSearchResult(null);
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
                    >
                      <span className="flex flex-shrink-0">
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

                      <span className="w-40 pl-1.5 flex flex-col justify-center space-y-0.5 py-2 text-xs">
                        <span className="cursor-default font-bold flex flex-row space-x-2 justify-between items-center">
                          <span className="truncate">
                            {
                              getUserFromId(
                                singleChat.senderid === userNumId
                                  ? singleChat.receiverid
                                  : singleChat.senderid
                              ).username
                            }
                          </span>
                        </span>
                        <span className="flex flex-row justify-start items-center">
                          {singleChat.receiverid === userNumId &&
                            !singleChat.isread && (
                              <span className="h-1.5 w-1.5 flex flex-shrink-0 mr-1 bg-pastelGreen rounded-full"></span>
                            )}
                          <span
                            className={`${
                              darkMode ? "text-white" : "text-gray-500"
                            } cursor-default font-bold text-[0.77rem] truncate ${
                              singleChat.receiverid === userNumId &&
                              !singleChat.isread &&
                              "font-black"
                            }`}
                          >
                            {singleChat.message}
                          </span>
                        </span>
                      </span>
                    </span>
                  );
                })
              ) : following !== null &&
                following !== undefined &&
                following.length !== 0 ? (
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
                })
              ) : (
                <span className="pt-2 italic text-gray-500 text-[13px] font-medium text-center w-full">
                  {messageItem === ""
                    ? "Search for messages and users"
                    : messageItem !== "" &&
                      searchResult &&
                      searchResult.length === 0
                    ? "Search not found"
                    : ""}
                </span>
              )}
            </span>
          </span>
        </div> */}
        </div>
      </section>
      {deleteConvo && (
        <>
          <span
            id="modal-visible"
            className="max-w-[400px] bg-gray-800 p-6 rounded space-y-2 text-white flex flex-col justify-center"
          >
            <span className="text-lg text-center font-semibold">
              Clear chat with {message}
            </span>
            <span className="text-xs text-center font-bold">
              Chat will be cleared on your end only. {message} will still have
              the chat history
            </span>
            <span className="text-white text-center flex flex-row justify-between font-medium">
              <span
                onClick={() => {
                  clearConversation();
                }}
                className="bg-red-400 py-1 w-[70px] rounded cursor-pointer"
              >
                Clear
              </span>
              <span
                onClick={() => {
                  setDeleteConvo(false);
                }}
                className="bg-gray-400 py-1 w-[70px] rounded cursor-pointer"
              >
                Cancel
              </span>
            </span>
          </span>
          <span
            onClick={() => {
              setDeleteConvo(false);
            }}
            id="overlay"
          ></span>
        </>
      )}
    </main>
  );
};
export default Message;
