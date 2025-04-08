import supabase from "./authenticateUser";
import { useRouter } from "next/router";
export default function DbUsers() {
  const router = useRouter();

  const fetchAllPosts = async () => {
    let allPosts = [];
    let from = 0;
    let to = 999; // Fetch in batches of 1000
  
    if (router.pathname === "/profile/[user]" || router.pathname === "/[username]/post/[postid]" || router.pathname === "/search") {
      while (true) {
        const { data, error } = await supabase
          .from("posts")
          .select(
            "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki, borderid), ispoll"
          )
          .order("created_at", { ascending: false })
          .range(from, to); // Paginate results
  
        if (error) {
          console.error("Error fetching posts:", error);
          return { data: [], error: "Fetching posts failed (dbUsers.js)" };
        }
  
        if (!data || data.length === 0) break; // Stop when no more records are found
  
        allPosts = [...allPosts, ...data]; // Append new data
        from += 1000;
        to += 1000;
      }
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki, borderid), ispoll"
        )
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching posts:", error);
        return { data: [], error: "Fetching posts failed (dbUsers.js)" };
      }
      allPosts = data || []; // Ensure allPosts is always an array
    }
    
    if (allPosts.length > 0) {
      // Shuffle the posts randomly
      // const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);
      return { data: allPosts, error: null };
    } else {
      return { data: [], error: "No posts found." };
    }
  };
  
  const fetchAllPolls = async () => {
      const res = await supabase
        .from("polls")
        .select(
          "*"
        )
      if (res.status === 200 && res.data) {
        return res.data;
      } else {
        return [];
      }
  }

  const fetchAllReposts = async () => {
    const res = await supabase
      .from("reposts")
      .select(
        "id, created_at, postid, users(id, avatar, username, useruuid, created_at, cover, bio, ki, borderid), quote"
      )
      .order("created_at", { ascending: false });
    // console.log(res)
    if (res.status === 200 && res.data) {
      return res.data;
    } else {
      return [];
    }
  };

  const fetchPost = async (postid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki, borderid), ispoll"
      )
      .eq("id", postid);
    return res;
  };

  const fetchAllSingleUserPosts = async (userid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki, borderid)"
      )
      .eq("userid", userid)
      .order("created_at", { ascending: false });

    return res;
  };

  const fetchUserMangas = async (userid) => {
    const res = await supabase
      .from("mangas")
      .select(
        "id, created_at, name, description, price, cover, pages, filepaths, users(id, avatar, username, useruuid, ki, borderid)"
      )
      .eq("userid", userid)
      .order("created_at", { ascending: false });
    return res;
  };

  const fetchAllUsers = async () => {
    const res = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    return res;
  };

  const fetchMyUserInfo = async (myId) => {
    const res = await supabase.from("users").select("*").eq("id", myId);

    return res;
  };
  return {
    fetchAllPolls,
    fetchAllPosts,
    fetchPost,
    fetchAllReposts,
    fetchAllUsers,
    fetchMyUserInfo,
    fetchUserMangas,
    fetchAllSingleUserPosts,
  };
}
