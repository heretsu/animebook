import supabase from '@/hooks/authenticateUser';

export default async function handler(req, res) {
  const { roomName, userId } = req.body;

  try {
    const { data: stream } = await supabase
      .from('live_streams')
      .select('id')
      .eq('room_name', roomName)
      .single();

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Update last_heartbeat
    await supabase
      .from('stream_viewers')
      .update({ 
        last_heartbeat: new Date().toISOString() 
      })
      .eq('stream_id', stream.id)
      .eq('useruuid', userId)
      .is('left_at', null);

    res.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: error.message });
  }
}