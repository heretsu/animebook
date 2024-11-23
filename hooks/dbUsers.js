import supabase from "./authenticateUser";
export default function DbUsers() {
  const fetchAllPosts = async () => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, created_at, cover, bio)"
      )
      .order("created_at", { ascending: false });
    return res;
  };

  const fetchPost = async (postid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, created_at, cover, bio)"
      ).eq("id", postid)
    return res;
  }

  const fetchAllSingleUserPosts = async (userid) => {
    const res = await supabase
      .from("posts")
      .select(
        "id, media, content, created_at, users(id, avatar, username, created_at, cover, bio)"
      ).eq("userid", userid).order("created_at", { ascending: false });
      
    return res;
  }

  const fetchUserMangas = async (userid) => {
    const res = await supabase
      .from("mangas")
      .select(
        "id, created_at, name, description, price, cover, pages, filepaths, users(id, avatar, username)"
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
  return { fetchAllPosts, fetchPost, fetchAllUsers, fetchMyUserInfo, fetchUserMangas, fetchAllSingleUserPosts };
}
