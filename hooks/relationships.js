import supabase from "./authenticateUser";

export default function Relationships() {

  const fetchFollows = async (userId) => {
    const res = await supabase
      .from("relationships")
      .select()
      .eq("following_userid", userId);
    return res;
  };

  const fetchFollowing = async (userId) => {
    const res = await supabase
      .from("relationships")
      .select()
      .eq("follower_userid", userId);
    return res;
  }
  return { fetchFollows, fetchFollowing };
}
