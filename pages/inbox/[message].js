import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import AttachmentsContainer from "@/components/attachmentsContainer";
import DbUsers from "@/hooks/dbUsers";
import Relationships from "@/hooks/relationships";
import { createClient } from "@supabase/supabase-js";

export const getServerSideProps = async (context) => {
  const { message } = context.query;

  return {
    props: {
      message,
    },
  };
};

const Message = ({ message }) => {
  
  const [currenctChat, setCurrentChat] = useState(null);
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
    const chat = await supabase
      .from("conversations")
      .select()
      .or(
        `and(senderid.eq.${userNumId},receiverid.eq.${otherId}),and(senderid.eq.${otherId},receiverid.eq.${userNumId})`
      )
      .order("created_at", { ascending: true });
    return chat;
  };

  const fetchAllChats = async () => {
    const response = await supabase
      .from("conversations")
      .select()
      .or(`senderid.eq.${userNumId},receiverid.eq.${userNumId}`)
      .order("created_at", { ascending: false });

    const messages = response.data;
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

    return lastChats;
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
    if(payload.new.receiverid === userNumId || payload.new.senderid === userNumId){
      setChatsObject([...chatsObject, payload.new]);
    }
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

      // Created a new object with the updated isread property
      const updatedMessage = { ...lastReceivedMessage, isread: true };

      // Updated the chatsObject array
      const updatedChatsObject = chatsObject.map((chat) =>
        chat.id === lastReceivedMessage.id ? updatedMessage : chat
      );

      // Updated the allChats array
      const updatedAllChats = allChats.map((chat) =>
        chat.id === lastReceivedMessage.id ? updatedMessage : chat
      );

      // Set the updated state
      setChatsObject(updatedChatsObject);
      setAllChats(updatedAllChats);

      readMessage(
        chatsObject.filter((c) => c.receiverid === userNumId)[
          chatsObject.filter((c) => c.receiverid === userNumId).length - 1
        ].id
      );
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

    // return () => {
    //   supabase.removeSubscription(subscription);
    // };
  }, [userNumId, allUserObject, allChats, chatsObject, message]);

  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />

        {userDetail ? (
          <div className="w-full py-2 space-y-8 pl-2 lg:pl-60 pr-4 lg:pr-12 flex flex-col">
            <span className="h-screen pb-10 lg:pb-2 w-full flex flex-col">
              <span className="p-1.5 w-full flex flex-row justify-between items-center bg-dmGreen">
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
                  width="20px"
                  height="20px"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
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
              <span className="bg-white h-full pb-8 overflow-scroll flex flex-col justify-between">
                <span className="flex flex-col pt-5 px-2 space-y-2.5">
                  {chatsObject !== null &&
                  chatsObject !== undefined &&
                  chatsObject.length > 0 ? (
                    chatsObject.map((chat) => {
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
                                className={`bg-dmGreen flex ${
                                  chat.message.length < 20
                                    ? "flex-row"
                                    : "flex-col"
                                } justify-between items-end p-1.5`}
                              >
                                <span className="text-sm break-all">
                                  {chat.message}
                                </span>
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
                <span>
                  <AttachmentsContainer receiverid={userDetail.id} />
                </span>
              </span>
            </span>
          </div>
        ) : (
          <span className="w-full italic text-sm text-gray-800 pb-2 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">{`得る Loading chat with ${message}`}</span>
        )}

        {((allChats !== null &&
          allChats !== undefined &&
          allChats.length > 0) ||
          (following !== null &&
            following !== undefined &&
            following.length > 0)) && (
          <div className="bg-white px-2 hidden lg:block sticky right-2 top-20 heighto">
            <span className="flex flex-col w-full min-h-screen h-full pt-2">
              <span className="mt-2 py-1 pl-4 w-full flex flex-row items-center bg-gray-100">
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
                  value={userToSearch}
                  onChange={searchForUser}
                  type="search"
                  className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
                  placeholder="Search chat"
                />
              </span>
              <span className="flex flex-col w-52">
                {foundUsers !== null &&
                  foundUsers !== undefined &&
                  foundUsers.length !== 0 &&
                  foundUsers.slice(0, 3).map((found) => {
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

                {allChats !== null &&
                allChats !== undefined &&
                allChats.length !== 0 &&
                allUserObject
                  ? allChats.map((singleChat) => {
                      return (
                        <span
                          key={singleChat.id}
                          className="relative flex flex-row w-full border-b border-gray-300 items-end py-2"
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
                  : following !== null &&
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
          </div>
        )}
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Message;
