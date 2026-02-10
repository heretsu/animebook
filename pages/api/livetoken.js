import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  const { roomName, participantName, isHost } = req.body;
  
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
    }
  );

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: isHost,
    canPublishData: true,
    canSubscribe: true,
    canSubscribeData: true, 
  });

  const token = await at.toJwt();
    
  res.json({ token });
}