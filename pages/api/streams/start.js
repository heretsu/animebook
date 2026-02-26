import supabase from "@/hooks/authenticateUser";

export default async function handler(req, res) {
  const { roomName, userId, title, category, tags, thumbnail_url } = req.body;

  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      room_name: roomName,
      useruuid: userId,
      title: title,
      status: "live",
      category: category ? category : null,
      tags: tags && tags.length > 0 ? tags : null,
      thumbnail_url: thumbnail_url ? thumbnail_url : 'https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/blackBackground.png'
    })
    .select()
    .single();
    
  if (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ stream: data });
}
