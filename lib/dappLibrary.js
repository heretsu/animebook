import { useContext, useState } from "react";
import { UserContext } from "./userContext";
import supabase from "@/hooks/authenticateUser";

export default function DappLibrary() {
  const { setStoryValues, userNumId, setStoryViews } = useContext(UserContext);
  const fetchStories = () => {
    supabase
      .from("stories")
      .select(
        "id, created_at, content, media, users(id, avatar, useruuid, username)"
      )
      .order("created_at", { ascending: false })
      .then((result) => {
        let i = 0;
        const storiesByUser = result.data.reduce((acc, story) => {
          if (rawTimeAgo(story.created_at) < 86400) {
            const user = story.users.useruuid;

            // Find the index of the user in the accumulator array
            const userIndex = acc.findIndex((item) => item.useruuid === user);
            if (userIndex === -1) {
              // If the user doesn't exist in the accumulator, add them
              acc.push({
                useruuid: user,
                username: story.users.username,
                avatar: story.users.avatar,
                id: story.users.id,
                newIndex: i,
                
                stories: [
                  {
                    dbIndex: story.id,
                    created_at: story.created_at,
                    content: story.content,
                    media: story.media,
                  },
                ],
              });
              i++;
            } else {
              
              // If the user already exists in the accumulator, add the story to their stories array
              acc[userIndex].stories.push({
                dbIndex: story.id,
                created_at: story.created_at,
                content: story.content,
                media: story.media,
              });
            }
          }

          return acc;
        }, []);
        setStoryValues(storiesByUser);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const sendNotification = (notifType, targetUser, likes, postid, message) => {
    if (notifType === "likepost") {
      supabase
        .from("notifications")
        .insert({
          userid: targetUser,
          type: "likepost",
          content:
            likes !== null && likes !== undefined && likes.length === 1
              ? `and 1 other liked your post`
              : likes.length > 1
              ? `and ${likes.length} others liked your post`
              : "liked your post",
          actorid: userNumId,
          postid: postid,
        })
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    } else if (notifType === "newfollow") {
      supabase
        .from("notifications")
        .insert({
          userid: targetUser,
          type: "newfollower",
          content: "is following you",
          actorid: userNumId,
        })
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    }
    else if (notifType === "tip"){
      supabase
        .from("notifications")
        .insert({
          userid: targetUser,
          type: "tip",
          content: message,
          actorid: userNumId,
        })
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const addStoryView = (storyid) => {
    supabase
      .from("story_views")
      .insert({ storyid: storyid, userid: userNumId })
      .then(() => {})
      .catch((e) => console.log(e));
  };
  
  const fetchViews = (storyid) => {
    supabase
      .from("story_views")
      .select()
      .eq("storyid", storyid)
      .then((res) => {
        if (res.data !== undefined && res.data !== null) {
          if (!!res.data.find((sv) => sv.userid === userNumId) === false) {
            addStoryView(storyid);
            setStoryViews(res.data);
          }       
          else{
            setStoryViews(res.data.filter(st => st.userid !== userNumId));
          }   
        }
      })
      .catch((e) => console.log(e));
  };

  const rawTimeAgo = (timestamp) => {
    const currentTime = new Date();
    const pastTime = new Date(timestamp);

    const timeDifference = currentTime - pastTime;
    const secondsAgo = Math.round(timeDifference / 1000);

    return secondsAgo;
  };

  const timeAgo = (timestamp) => {
    const currentTime = new Date();
    const pastTime = new Date(timestamp);

    const timeDifference = currentTime - pastTime;
    const secondsAgo = Math.round(timeDifference / 1000);
    const minutesAgo = Math.round(secondsAgo / 60);
    const hoursAgo = Math.round(minutesAgo / 60);

    if (secondsAgo < 60) {
      return `${secondsAgo} ${secondsAgo === 1 ? "second" : "seconds"} ago`;
    } else if (minutesAgo < 60) {
      return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
    } else {
      return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
    }
  };
  return { fetchStories, sendNotification, timeAgo, fetchViews };
}
