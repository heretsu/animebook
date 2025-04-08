import DbUsers from "@/hooks/dbUsers";
import { useEffect, useState } from "react";
import supabase from "@/hooks/authenticateUser";

export default function useMvps(){
    const [likesMvp, setLikesMvp] = useState(null);
    const [postsMvp, setPostsMvp] = useState(null);
    const [viewsMvp, setViewsMvp] = useState(null);
    const [refMvp, setRefMvp] = useState(null);
    const [followMvp, setFollowMvp] = useState(null);
    const [repostMvp, setRepostMvp] = useState(null);
    const [loaded, setLoaded] = useState(false)
    const { fetchAllPosts } = DbUsers();

    const getMostReposts = async () => {
        const repostCount = new Map();
        const repostUserObjects = new Map();
    
        const { data, error } = await supabase.from("reposts").select(`
            id, 
            created_at, 
            quote,
            posts (
              id, 
              created_at, 
              users (
                id, 
                avatar, 
                username
              )
            ),
            users (
              id, 
              avatar, 
              username, 
              useruuid, 
              created_at, 
              cover, 
              bio, 
              ki
            )
          `).order("created_at", {ascending: false})
    
        if (error) {
          console.error("Error fetching reposts:", error);
          return null;
        }
    
        data.forEach((repost) => {
          const originalUser = repost.posts?.users;
          const reposter = repost.users;
    
          const createdTime = new Date(repost.created_at).getTime();
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
          if (createdTime >= oneWeekAgo) {
            if (originalUser && reposter && originalUser.id !== reposter.id) {
              const originalUsername = originalUser.username;
    
              repostCount.set(
                originalUsername,
                (repostCount.get(originalUsername) || 0) + 1
              );
              repostUserObjects.set(originalUsername, originalUser);
            }
          }
        });
    
        const maxReposts = Math.max(...repostCount.values(), 0);
        const mostReposts = [...repostUserObjects.values()].filter(
          (user) => repostCount.get(user.username) === maxReposts
        );
    
        if (mostReposts.length > 0) {
          setRepostMvp({ maxReposts, mostReposts });
        }
    
        return { maxReposts, mostReposts };
      };
    
      const getMostPosts = async () => {
        const userPostCount = new Map();
        const userObjects = new Map();
    
        const posts = await fetchAllPosts();
        if (!posts && !posts.data) {
          return null;
        }
    
        posts.data.forEach((post) => {
          const user = post.users;
    
          if (user && user.username) {
            const createdTime = new Date(post.created_at).getTime();
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
            if (createdTime >= oneWeekAgo) {
              const username = user.username;
    
              // Count the post for this user
              userPostCount.set(username, (userPostCount.get(username) || 0) + 1);
              userObjects.set(username, user);
            }
          }
        });
    
        const maxPosts = Math.max(...userPostCount.values(), 0);
        const mostPosts = [...userObjects.values()].filter(
          (user) => userPostCount.get(user.username) === maxPosts
        );
    
        if (mostPosts.length > 0) {
          setPostsMvp({ maxPosts, mostPosts }); // Ensure state updates properly
        }
    
        return { maxPosts, mostPosts };
      };
    
      const getMostLikes = async () => {
        const { data, error } = await supabase
          .from("likes")
          .select("postid, posts(created_at, userid, content, users(*))")
          .order("id", { ascending: false });
    
        if (error) {
          console.error("Error fetching likes:", error);
          return null;
        }
    
        if (!data || data.length === 0) {
          console.log("No likes found");
          return null;
        }
    
        const userLikeCount = new Map();
        const userObjects = new Map();
        data.forEach(({ posts }) => {
          if (posts && posts.users) {
            const createdTime = new Date(posts.created_at).getTime();
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
            if (createdTime >= oneWeekAgo) {
              const user = posts.users;
              const userId = user.id;
              userLikeCount.set(userId, (userLikeCount.get(userId) || 0) + 1);
              userObjects.set(userId, user);
            }
          }
        });
    
        const maxLikes = Math.max(...userLikeCount.values());
    
        const mostLikes = [...userObjects.values()]
          .filter((user) => userLikeCount.get(user.id) === maxLikes)
          .map((user) => ({
            ...user,
            likeCount: maxLikes,
          }));
        console.log(mostLikes);
        if (!mostLikes.length > 0) {
          return null;
        }
    
        setLikesMvp({ maxLikes, mostLikes });
        return { maxLikes, mostLikes };
      };
    
      const getMostViews = async () => {
        const { data, error } = await supabase
          .from("views")
          .select("postid, posts(created_at, userid, users(*))")
          .order("id", { ascending: false });
    
        if (error) {
          console.error("Error fetching views:", error);
          return null;
        }
    
        if (!data || data.length === 0) {
          console.log("No views found");
          return null;
        }
    
        const userViewCount = new Map();
        const userObjects = new Map();
    
        data.forEach(({ posts }) => {
          if (posts && posts.users) {
            const createdTime = new Date(posts.created_at).getTime();
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (createdTime >= oneWeekAgo) {
              const user = posts.users;
              const userId = user.id;
              userViewCount.set(userId, (userViewCount.get(userId) || 0) + 1);
              userObjects.set(userId, user);
            }
          }
        });
    
        if (userViewCount.size === 0) {
          console.log("No views recorded.");
          return null;
        }
    
        const maxViews = Math.max(...userViewCount.values(), 0);
    
        // Filter to get all users with the highest views
        const mostViews = [...userObjects.values()]
          .filter((user) => userViewCount.get(user.id) === maxViews)
          .map((user) => ({
            ...user,
            viewCount: maxViews, // Attach number of views
          }));
    
        if (mostViews.length === 0) {
          return null;
        }
        setViewsMvp({ maxViews, mostViews });
        return { maxViews, mostViews };
      };
    
      function uniqueFollowers(data) {
        const seenByUser = new Map();
    
        return data.filter(({ follower_userid, following_userid }) => {
          if (!seenByUser.has(following_userid)) {
            seenByUser.set(following_userid, new Set());
          }
    
          const seenFollowers = seenByUser.get(following_userid);
    
          if (seenFollowers.has(follower_userid)) {
            return false; // Duplicate, ignore it
          }
    
          seenFollowers.add(follower_userid);
          return true; // Count this follow
        });
      }
    
      const getMostFollows = async () => {
        const { data, error } = await supabase
          .from("relationships")
          .select(
            "follower_userid, following_userid, users!relationships_following_userid_fkey(*)"
          ).order("id", {ascending: false}).limit(10)
    
        if (error) {
          console.error("Error fetching followers:", error);
          return null;
        }
    
        if (!data || data.length === 0) {
          console.log("No follow records found");
          return null;
        }
    
        // Ensure each follower is only counted once per `following_userid`
        const uniqueData = uniqueFollowers(data);
    
        const followCount = new Map();
        const userObjects = new Map();
    
        uniqueData.forEach(({ following_userid, users }) => {
          if (following_userid && users) {
            followCount.set(
              following_userid,
              (followCount.get(following_userid) || 0) + 1
            );
            userObjects.set(following_userid, users);
          }
        });
    
        if (followCount.size === 0) {
          console.log("No follow data recorded.");
          return null;
        }
    
        const maxFollows = Math.max(...followCount.values(), 0);
    
        const mostFollows = [...userObjects.values()]
          .filter((user) => followCount.get(user.id) === maxFollows)
          .map((user) => ({
            ...user,
            followerCount: maxFollows,
          }));
    
        if (mostFollows.length === 0) {
          return null;
        }
    
        const res = await supabase
          .from("relationships")
          .select()
          .eq("following_userid", mostFollows[0].id);
        if (!res) {
          return null;
        }
    
        setFollowMvp({ maxFollows: uniqueFollowers(res.data).length, mostFollows });
        return { maxFollows: uniqueFollowers(res.data).length, mostFollows };
      };
    
      const getMostReferrals = async () => {
        const { data, error } = await supabase
          .from("referrals")
          .select("referrer, created_at, users!referrals_referrer_fkey(*)")
          .order("created_at", { ascending: false });
    
        if (error) {
          console.error("Error fetching referrals:", error);
          return null;
        }
    
        if (!data || data.length === 0) {
          console.log("No referrals found");
          return null;
        }
    
        const referralCount = new Map();
        const userObjects = new Map();
    
        data.forEach(({ created_at, referrer, users }) => {
          const createdTime = new Date(created_at).getTime();
          const oneWeekAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          if (createdTime >= oneWeekAgo) {
            if (referrer && users) {
              referralCount.set(referrer, (referralCount.get(referrer) || 0) + 1);
              userObjects.set(referrer, users); // Store full user object
            }
          }
        });
    
        if (referralCount.size === 0) {
          console.log("No referrals recorded.");
          return null;
        }
    
        const maxReferrals = Math.max(...referralCount.values(), 0);
    
        // Filter to get all users with the highest referral count
        const mostReferrals = [...userObjects.values()]
          .filter((user) => referralCount.get(user.username) === maxReferrals)
          .map((user) => ({
            ...user,
            referralCount: maxReferrals, // Attach number of referrals
          }));
    
        if (mostReferrals.length === 0) {
          return null;
        }
        setRefMvp({ maxReferrals, mostReferrals });
    
        return { maxReferrals, mostReferrals };
      };

      useEffect(()=>{
        if (!loaded){
            getMostReposts()
            getMostPosts()
            getMostLikes()
            getMostViews()
            getMostFollows()
            getMostReferrals()
            setLoaded(true)
        } 
      }, [loaded])
      return {likesMvp, postsMvp, viewsMvp, refMvp, followMvp, repostMvp}
}