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
import { UserContext } from "../../../lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import AttachmentsContainer from "@/components/attachmentsContainer";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { MessageContext } from "@/lib/messageContext";
import LargeTopBar from "@/components/largeTopBar";
import PopupModal from "@/components/popupModal";

export const TextConfiguration = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return (
      <span
        className="text-sm break-all whitespace-preline"
        style={{ wordBreak: "break-word" }}
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

const Messages = ({ message }) => {
  const [openPostOptions, setOpenPostOptions] = useState(false);
  const [open, setOpen] = useState(false);
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
    <>
      <div
        id="scrollbar-remove"
        className={`${
          router.pathname === "/inbox/[message]" ? "h-[100vh] lg:h-[90vh]" : "h-[80vh]"
        } pb-28 lg:pb-0 overflow-y-scroll flex flex-row w-full`}
      >
        {userDetail ? (
          <div
            className={`${
              darkMode ? "text-white" : "text-black"
            } h-full w-full flex flex-col`}
          >
            <span className="h-full w-full flex flex-col">
              <span
                className={`${
                  darkMode ? "bg-black" : "bg-white"
                } bg-opacity-10 backdrop-blur-md sticky top-0 left-0 p-1.5 px-3 w-full flex flex-row justify-between items-center`}
              >
                <span className="space-x-1.5 flex flex-row flex-shrink-0 items-center justify-center">
                  {router.pathname === "/inbox/[message]" && (
                    <svg
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
                    </svg>
                  )}
                  <span
                    onClick={() => {
                      fullPageReload(`/profile/${userDetail.username}`, 'window');
                    }}
                  >
                    <Image
                      src={userDetail.avatar}
                      alt="post"
                      height={45}
                      width={45}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </span>
                  <span className="font-semibold text-sm">
                    {userDetail.username}
                  </span>
                </span>

                <svg
                  className="rotate cursor-pointer"
                  onClick={() => setOpen(!open)}
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="4"
                  viewBox="0 0 14 4"
                >
                  <g transform="translate(-0.645 3.864) rotate(-90)">
                    <circle cx="2" cy="2" r="2" fill="#adb6c3" />
                    <circle
                      cx="2"
                      cy="2"
                      r="2"
                      transform="translate(0 5)"
                      fill="#adb6c3"
                    />
                    <circle
                      cx="2"
                      cy="2"
                      r="2"
                      transform="translate(0 10)"
                      fill="#adb6c3"
                    />
                  </g>
                </svg>
              </span>

              {open && (
                <div
                  id="zMax"
                  className={`right-0 border absolute mt-10 w-44 bg-black rounded-lg shadow-lg ${
                    darkMode
                      ? "border-gray-700 bg-[#1E1F24] text-white"
                      : "border-gray-300 bg-white text-black"
                  }`}
                >
                  <ul className={`space-y-1`}>
                    <li
                      onClick={() => {
                        setOpenPostOptions(false)
                        setDeleteConvo(true);
                      }}
                      className={`border-b ${
                        darkMode ? "border-gray-900" : "border-gray-100"
                      } pl-3 pr-1 py-2 flex items-center space-x-2 cursor-pointer`}
                    >
                      <svg
                        width="18px"
                        height="18px"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                      >
                        <rect x={0} fill="none" width={20} height={20} />
                        <g>
                          <path
                            fill="gray"
                            d="M12 4h3c.6 0 1 .4 1 1v1H3V5c0-.6.5-1 1-1h3c.2-1.1 1.3-2 2.5-2s2.3.9 2.5 2zM8 4h3c-.2-.6-.9-1-1.5-1S8.2 3.4 8 4zM4 7h11l-.9 10.1c0 .5-.5.9-1 .9H5.9c-.5 0-.9-.4-1-.9L4 7z"
                          />
                        </g>
                      </svg>
                      <span>Delete</span>
                    </li>

                    {userData && userDetail.id !== userNumId && (
                      <li
                        onClick={() => {
                          setDeleteConvo(false)
                          setOpenPostOptions(true);
                        }}
                        className={`px-4 py-2 flex items-center space-x-2 ${
                          !darkMode && "hover:bg-gray-100"
                        } cursor-pointer`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="16"
                          viewBox="0 0 14 16"
                        >
                          <path
                            d="M16.451,7.12a1.317,1.317,0,0,0-.663.18,1.342,1.342,0,0,0-.664,1.16V22.2a.83.83,0,0,0,.859.915h.935a.83.83,0,0,0,.858-.915V16.883c3.494-.236,5.131,2.288,9.143,1.093.513-.153.726-.362.726-.86V10.683c0-.367-.341-.8-.726-.661C23.09,11.343,21,9.042,17.776,9.015V8.461a1.34,1.34,0,0,0-.663-1.16,1.313,1.313,0,0,0-.662-.18Z"
                            transform="translate(-15.124 -7.12)"
                            fill="#5f6877"
                          />
                        </svg>
                        <span>Report</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <span
                id="scrollbar-remove"
                className={`relative h-full overflow-scroll flex flex-col justify-between`}
              >
                <span className="flex flex-col pt-5 px-2 space-y-2.5">
                  {chatsObject !== null &&
                  chatsObject !== undefined &&
                  chatsObject.length > 0 ? (
                    chatsObject.map((chat, chatIndex) => {
                      return (
                        <span
                          key={chat.id}
                          className={`flex ${
                            chat.senderid === userNumId
                              ? "flex-row-reverse"
                              : "flex-row"
                          } justify-start items-center`}
                        >
                          {/* <span className="mx-1 flex flex-row flex-shrink-0 items-center justify-center">
                            <Image
                              src={
                                chat.senderid === userNumId
                                  ? imgSrc
                                  : secondImgSrc
                              }
                              alt="post"
                              height={30}
                              width={30}
                              className="rounded-full object-cover"
                              onError={() => {
                                if (chat.senderId === userNumId) {
                                  setImgSrc(
                                    "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png"
                                  );
                                } else {
                                  setSecondImgSrc("");
                                }
                              }}
                            />
                          </span> */}
                          <span
                            className={`rounded-lg ${
                              chat.senderid === userNumId
                                ? darkMode
                                  ? "bg-[#E4E7E9] bg-opacity-10"
                                  : "bg-white bg-opacity-20"
                                : darkMode
                                ? "bg-white bg-opacity-20"
                                : "bg-black text-white bg-opacity-60"
                            } backdrop-blur-md flex ${
                              chat.attachments && "flex-col"
                            } ${
                              chat.attachments && chat.attachments.length && chat.attachments[0]?.startsWith('/stickers')  && "bg-transparent w-40"
                            }`}
                          >
                            {chat.attachments &&
                              chat.attachments.length > 0 && (
                                <span className="flex flex-col p-1">
                                  {chat.attachments.map((att, index) => {
                                    return (
                                      <span key={index}>
                                        {!att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("mp4") ||
                                        !att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("3gp") ||
                                        !att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("mov") ? (
                                          <Image
                                            src={att.toString()}
                                            alt="chat attachment"
                                            height={250}
                                            width={250}
                                            className="rounded-lg pt-1.5 px-1.5"
                                          />
                                        ) : (
                                          att
                                            .toString()
                                            .toLowerCase()
                                            .endsWith("mp4") ||
                                          att
                                            .toString()
                                            .toLowerCase()
                                            .endsWith("3gp") ||
                                          (att
                                            .toString()
                                            .toLowerCase()
                                            .endsWith("mov") && (
                                            <video
                                              src={att.toString()}
                                              width={250}
                                              height={250}
                                              controls
                                            ></video>
                                          ))
                                        )}
                                      </span>
                                    );
                                  })}
                                </span>
                              )}
                            {chat.message && (
                              <span
                                ref={getMessageRef(chatIndex)}
                                className={`flex ${
                                  chat.message.length < 20
                                    ? "flex-row"
                                    : "flex-col"
                                } leading-tight break-all overflow-wrap-word whitespace-preline text-start justify-between items-end p-1.5`}
                              >
                                <TextConfiguration
                                  text={chat.message}
                                  highlight={messageItem}
                                />

                                <span className="pl-2 text-xs font-medium">
                                  {formatTimeFromTimestamp(chat.created_at)}
                                </span>
                              </span>
                            )}
                          </span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="flex w-fit mx-auto flex-row justify-center text-sm text-white px-1.5 rounded-md bg-gray-400 font-semibold">
                      Start conversation
                    </span>
                  )}
                </span>
                <span className="sticky bottom-2 w-full">
                  <MessageContext.Provider
                    value={{
                      chatsObject,
                      messageRefs,
                      foundMessageIndices,
                      setFoundMessageIndices,
                      currentFoundIndex,
                      setCurrentFoundIndex,
                      setMessageItem,
                      fetchChat,
                      setChatsObject,
                    }}
                  >
                    <AttachmentsContainer receiverid={userDetail.id} />
                  </MessageContext.Provider>
                </span>
              </span>
            </span>
          </div>
        ) : (
          <span
            className={`${
              darkMode ? "text-white" : "text-gray-800"
            } w-full italic text-sm pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col`}
          >{`得る Loading...`}</span>
        )}
      </div>
      {openPostOptions && (
        <div className="">
          <PopupModal
            success={"10"}
            useruuid={userDetail.useruuid}
            username={userDetail.username}
            avatar={userDetail.avatar}
            postid={46}
            setOpenPostOptions={setOpenPostOptions}
            reportType={"user"}
          />
          <div
            onClick={() => {
              setOpenPostOptions(false);
            }}
            id="tip-overlay"
          ></div>
        </div>
      )}

      {deleteConvo && (
        <>
          <span
            id="modal-visible"
            className="max-w-[400px] bg-gray-800 p-6 rounded space-y-2 text-white flex flex-col justify-center"
          >
            <span className="text-lg text-center font-semibold">
              Delete chat with {message}
            </span>
            <span className="text-xs text-center font-bold">
              Chat will be deleted on your end only. {message} will still have
              the chat history
            </span>
            <span className="text-white text-center flex flex-row justify-between font-medium">
              <span
                onClick={() => {
                  clearConversation();
                }}
                className="bg-red-400 py-1 w-[70px] rounded cursor-pointer"
              >
                Delete
              </span>
              <span
                onClick={() => {
                  setDeleteConvo(false);
                  setOpenPostOptions(false);
                  setOpen(false);
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
              setOpenPostOptions(false);
              setOpen(false);
            }}
            id="tip-overlay"
          ></span>
        </>
      )}
    </>
  );
};
export default Messages;
