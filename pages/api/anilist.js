export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(req.body),
      });
  
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `AniList API error: ${response.status}` 
        });
      }
  
      const data = await response.json();
      return res.status(200).json(data);
      
    } catch (error) {
      console.error("AniList API Error:", error);
      return res.status(500).json({ error: "Failed to fetch from AniList" });
    }
  }