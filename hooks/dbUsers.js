import supabase from "./authenticateUser";
export default function DbUsers() {
  const fetchAllPosts = async () => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki)"
      )
      .order("created_at", { ascending: false });
      
    return res;
  };

  const fetchAllReposts = async () => {
    const res = await supabase
      .from("reposts")
      .select(
        "id, created_at, postid, users(id, avatar, username, useruuid, created_at, cover, bio, ki), quote"
      )
      .order("created_at", { ascending: false });
      // console.log(res)
      if (res.status === 200 && res.data){
        return res.data
      } else {
        return []
      }
  }

  const fetchPost = async (postid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki)"
      ).eq("id", postid)
    return res;
  }

  const fetchAllSingleUserPosts = async (userid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, useruuid, created_at, cover, bio, ki)"
      ).eq("userid", userid).order("created_at", { ascending: false });
      
    return res;
  }

  const fetchUserMangas = async (userid) => {
    const res = await supabase
      .from("mangas")
      .select(
        "id, created_at, name, description, price, cover, pages, filepaths, users(id, avatar, username, useruuid, ki)"
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
  return { fetchAllPosts, fetchPost, fetchAllReposts, fetchAllUsers, fetchMyUserInfo, fetchUserMangas, fetchAllSingleUserPosts };
}
