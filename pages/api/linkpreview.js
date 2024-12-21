import { getLinkPreview } from "link-preview-js";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const data = await getLinkPreview(url);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching link preview:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
}


// import axios from "axios";

// const cache = new Map();

// export default async function handler(req, res) {
//   const { url } = req.query;

//   if (!url) {
//     return res.status(400).json({ error: "URL is required" });
//   }

//   const tweetId = url.split("/").pop().split("?")[0];
//   const cachedTweet = cache.get(tweetId);

//   if (cachedTweet) {
//     console.log("Serving from cache");
//     return res.status(200).json(cachedTweet);
//   }

//   const twitterBearerToken = process.env.BEARER_TOKEN;

//   try {
//     const response = await axios.get(
//       `https://api.twitter.com/2/tweets/${tweetId}?expansions=attachments.media_keys&media.fields=url`,
//       {
//         headers: { Authorization: `Bearer ${twitterBearerToken}` },
//       }
//     );

//     const tweetData = response.data;
//     const media = tweetData.includes?.media?.[0]?.url || null;
//     console.log(tweetData)

//     const result = {
//       title: `Tweet by ${tweetData.data.author_id}`,
//       description: tweetData.data.text,
//       media: media,
//       url,
//     };

//     cache.set(tweetId, result);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error.response?.status === 429) {
//       const resetTime = error.response.headers["x-rate-limit-reset"];
//       console.log(`Rate limit hit. Retry after: ${new Date(resetTime * 1000).toISOString()}`);
//       return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
//     }
//     console.error("Error fetching tweet:", error.response?.data || error);
//     res.status(500).json({ error: "Failed to fetch tweet data" });
//   }
// }
