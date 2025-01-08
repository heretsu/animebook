import NavBar, { MobileNavBar } from "@/components/navBar";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import Relationships from "@/hooks/relationships";
import NotifCard from "@/components/notifCard";

const Notifications = () => {
  const { fetchFollows } = Relationships();
  const { userNumId, notifyUserObject, setNotifyUserObject, darkMode } =
    useContext(UserContext);
  // const [notifyUserObject, setNotifyUserObject] = useState(null);

  // const fetchNotifications = () => {
  //   supabase
  //     .from("notifications")
  //     .select(
  //       "*, users!public_notifications_actorid_fkey(id, username, avatar)"
  //     )
  //     .eq("userid", userNumId)
  //     .order("created_at", { ascending: false })
  //     .then((result) => {
  //       if (result.data !== null && result.data !== undefined) {
  //         let noteObject = {};
  //         result.data.forEach((note) => {
  //           const period = getNotificationPeriod(note.created_at);
  //           if (!noteObject[period]) {
  //               noteObject[period] = [];
  //           }
  //           // Create a unique identifier for each note
  //           const noteIdentifier = `${note.type}-${note.content}-${note.users.id}-${note.postid}`;
  //           // Check if this note already exists in the array
  //           const isNoteAlreadyAdded = noteObject[period].some(
  //               existingNote => `${existingNote.type}-${existingNote.content}-${existingNote.userid}-${existingNote.postid}` === noteIdentifier
  //           );
  //           if (!isNoteAlreadyAdded) {
  //               noteObject[period].push({
  //                   type: note.type,
  //                   content: note.content,
  //                   avatar: note.users.avatar,
  //                   username: note.users.username,
  //                   userid: note.users.id,
  //                   postid: note.postid
  //               });
  //           }
  //       });
  //         setNotifyUserObject(noteObject);
  //       }
  //     });
  // };

  // const getNotificationPeriod = (dateStr) => {
  //   const now = new Date();
  //   const todayStart = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate()
  //   );
  //   const notificationDate = new Date(dateStr);

  //   // Adjust for time zone differences if necessary
  //   const notificationDateStart = new Date(
  //     notificationDate.getFullYear(),
  //     notificationDate.getMonth(),
  //     notificationDate.getDate()
  //   );

  //   // Calculate the difference in days
  //   const diffTime = todayStart - notificationDateStart;
  //   const diffDays = diffTime / (1000 * 60 * 60 * 24);

  //   if (diffDays < 1) {
  //     return "Today";
  //   } else if (diffDays < 2) {
  //     return "Yesterday";
  //   } else if (diffDays <= 7) {
  //     return "Past 7 days";
  //   } else if (diffDays <= 30) {
  //     return "Past 30 days";
  //   } else {
  //     return "Older";
  //   }
  // };

  const updateReadNotification = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        lastreadnotification: new Date().toISOString(),
      })
      .eq("id", userNumId);
    console.log(error);
  };

  useEffect(() => {
    updateReadNotification();
    setNotifyUserObject(null);
  }, []);

  return (
    <main>
      <section className={`${darkMode ? 'text-white' : 'text-black'} mb-5 flex flex-col lg:flex-row lg:space-x-2 w-full`}>
        <NavBar />
        <div className="w-full pb-2 space-y-8 lg:pl-lPostCustom px-2 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          {notifyUserObject !== null &&
            notifyUserObject !== undefined &&
            (Object.keys(notifyUserObject).length > 0 ? (
              Object.keys(notifyUserObject).map((key) => {
                return (
                  <span key={key}>
                    <h2 className="font-medium text-xl">{key}</h2>
                    <div className="pt-5 space-y-2">
                      {notifyUserObject[key].length > 0 &&
                        notifyUserObject[key].map((note, index) => {
                          return (
                            <NotifCard
                              key={index}
                              note={note}
                              myProfileId={userNumId}
                              typeOfNotif={note.type}
                              darkMode={darkMode}
                            />
                          );
                        })}
                    </div>
                  </span>
                );
              })
            ) : (
              <span className={`${darkMode ? ' text-slate-200' : ' text-slate-600'} w-full pt-20 text-center`}>
                You have no notifications yet
              </span>
            ))}
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Notifications;
