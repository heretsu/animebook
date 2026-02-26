import supabase from "@/hooks/authenticateUser";

export default async function handler(req, res) {
    const { roomName } = req.body;
    
    const data = await supabase
      .from('live_streams')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('room_name', roomName);
      
    res.json({ success: true });
  }