import supabase from '@/hooks/authenticateUser';

export default async function handler(req, res) {
  const { roomName, userId } = req.body;

  try {
    // Get stream by room_name
    const { data: stream } = await supabase
      .from('live_streams')
      .select('id')
      .eq('room_name', roomName)
      .single();

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Mark viewer as left
    await supabase
      .from('stream_viewers')
      .update({ 
        left_at: new Date().toISOString() 
      })
      .eq('stream_id', stream.id)
      .eq('useruuid', userId)
      .is('left_at', null);

    // Count remaining active viewers
    const { count } = await supabase
      .from('stream_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', stream.id)
      .is('left_at', null);

    // Update viewer_count
    await supabase
      .from('live_streams')
      .update({ viewer_count: count || 0 })
      .eq('id', stream.id);

    res.json({ success: true, viewer_count: count });
  } catch (error) {
    console.error('Leave stream error:', error);
    res.status(500).json({ error: error.message });
  }
}