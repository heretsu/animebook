import supabase from '@/hooks/authenticateUser';

export default async function handler(req, res) {
  const { roomName, userId } = req.body;

  try {
    // Get stream by room_name
    const { data: stream, error: streamError } = await supabase
      .from('live_streams')
      .select('id, viewer_count, peak_viewers')
      .eq('room_name', roomName)
      .eq('status', 'live')
      .single();

    if (streamError || !stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Add viewer to stream_viewers table
    const { error: insertError } = await supabase
      .from('stream_viewers')
      .upsert({
        stream_id: stream.id,
        useruuid: userId,
        joined_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
        left_at: null, // Clear left_at if they rejoin
      }, {
        onConflict: 'stream_id,useruuid'
      });

    if (insertError) {
      console.error('Insert viewer error:', insertError);
    }

    // Count active viewers (where left_at is null)
    const { count } = await supabase
      .from('stream_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', stream.id)
      .is('left_at', null);

    // Update viewer_count and peak_viewers in live_streams
    const newPeak = Math.max(count || 0, stream.peak_viewers || 0);
    
    await supabase
      .from('live_streams')
      .update({
        viewer_count: count || 0,
        peak_viewers: newPeak,
      })
      .eq('id', stream.id);

    res.json({ 
      success: true, 
      viewer_count: count,
      peak_viewers: newPeak 
    });
  } catch (error) {
    console.error('Join stream error:', error);
    res.status(500).json({ error: error.message });
  }
}