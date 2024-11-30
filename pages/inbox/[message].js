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

export const getServerSideProps = async (context) => {
  const { message } = context.query;

  return {
    props: {
      message,
    },
  };
};

const TextConfiguration = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span className="text-sm break-all">{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className="text-sm break-all">
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className="bg-yellow-300">
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
  const { userNumId, userData, allUserObject, setAllUserObject } =
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

  useEffect(() => {
    if (currenctChat === null || (userNumId && !allUserObject)) {
      setCurrentChat(message);

      fetchFollowing(userNumId)
        .then(({ data }) => {
          if (!data) {
            console.log("something wrong with data");
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

    if (messageRefs && messageRefs.current && messageRefs.current.length > 0) {
      messageRefs.current[messageRefs.current.length - 1
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
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />

        {userDetail ? (
          <div className="w-full py-2 space-y-8 pl-2 lg:pl-60 pr-4 lg:pr-12 flex flex-col">
            <span className="h-screen pb-10 lg:pb-2 w-full flex flex-col">
              <span className="sticky top-0 left-0 p-1.5 w-full flex flex-row justify-between items-center bg-dmGreen">
                {/* back button */}

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

                <span
                  onClick={() => {
                    fullPageReload(`/profile/${userDetail.username}`);
                  }}
                  className="space-x-1 flex flex-row flex-shrink-0 items-center justify-center"
                >
                  <Image
                    src={userDetail.avatar}
                    alt="post"
                    height={35}
                    width={35}
                    className="rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm">
                    {userDetail.username}
                  </span>
                </span>

                <svg
                  onClick={() => {
                    setDeleteConvo(true);
                  }}
                  width="20px"
                  height="20px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                >
                  <rect x={0} fill="none" width={20} height={20} />
                  <g>
                    <path
                      fill="red"
                      d="M12 4h3c.6 0 1 .4 1 1v1H3V5c0-.6.5-1 1-1h3c.2-1.1 1.3-2 2.5-2s2.3.9 2.5 2zM8 4h3c-.2-.6-.9-1-1.5-1S8.2 3.4 8 4zM4 7h11l-.9 10.1c0 .5-.5.9-1 .9H5.9c-.5 0-.9-.4-1-.9L4 7z"
                    />
                  </g>
                </svg>
              </span>
              <span className="relative bg-white h-full overflow-scroll flex flex-col justify-between">
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
                          <span className="mx-1 flex flex-row flex-shrink-0 items-center justify-center">
                            <Image
                              src={
                                chat.senderid === userNumId
                                  ? userData.avatar
                                  : userDetail.avatar
                              }
                              alt="post"
                              height={30}
                              width={30}
                              className="rounded-full object-cover"
                            />
                          </span>
                          <span
                            className={`flex ${chat.attachments && "flex-col"}`}
                          >
                            {chat.attachments &&
                              chat.attachments.length > 0 && (
                                <span className="bg-dmGreen flex flex-col p-1">
                                  {chat.attachments.map((att, index) => {
                                    return (
                                      <span key={index}>
                                        {att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("gif") ||
                                        att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("png") ||
                                        att
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("jpg") ||
                                        chat.attachments
                                          .toString()
                                          .toLowerCase()
                                          .endsWith("jpeg") ? (
                                          <Image
                                            src={att.toString()}
                                            alt="chat attachment"
                                            height={250}
                                            width={250}
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
                                className={`bg-dmGreen flex ${
                                  chat.message.length < 20
                                    ? "flex-row"
                                    : "flex-col"
                                } justify-between items-end p-1.5`}
                              >
                                <TextConfiguration text={chat.message} highlight={messageItem} />
                                
                                <span className="pl-2 text-xs font-medium text-gray-500">
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
                <span className="sticky bottom-5 md:bottom-0 left-0 right-0 w-full">
                  <MessageContext.Provider
                    value={{
                      chatsObject,
                      messageRefs,
                      foundMessageIndices,
                      setFoundMessageIndices,
                      currentFoundIndex,
                      setCurrentFoundIndex,
                      setMessageItem
                    }}
                  >
                    <AttachmentsContainer receiverid={userDetail.id} />
                  </MessageContext.Provider>
                </span>
              </span>
            </span>
          </div>
        ) : (
          <span className="w-full italic text-sm text-gray-800 pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">{`得る Loading chat with ${message}`}</span>
        )}

        <div className="bg-white px-2 hidden lg:block sticky right-2 top-20 heighto">
          <span className="flex flex-col w-full min-h-screen h-full overflow-scroll">
            <span className="sticky top-0 bg-white pt-2">
              <span className="bg-gray-100 mt-2 py-1 pl-4 w-full flex flex-row items-center bg-gray-100">
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
                  className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
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
                          className={`cursor-default font-bold flex flex-row text-gray-500 text-[0.77rem]`}
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
                      className="relative flex flex-row w-full border-b border-gray-300 items-end py-2"
                      onClick={() => {
                        setMessageItem("");
                        setSearchResult(null)
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
                            className={`cursor-default font-bold text-gray-500 text-[0.77rem] truncate ${
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
      <MobileNavBar />
    </main>
  );
};
export default Message;
