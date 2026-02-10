import supabase from '@/hooks/authenticateUser';

export default async function handler(req, res) {
  const { roomName, userId } = req.body;

  try {
       await supabase
      .from('live_streams')
      .upsert({ 
        last_heartbeat: new Date().toISOString() 
      })
      .eq('room_name', roomName)
      .eq('useruuid', userId)
      .is('status', 'live');

    res.json({ success: true });
  } catch (error) {
    console.error('Host heartbeat error:', error);
    res.status(500).json({ error: error.message });
  }
}