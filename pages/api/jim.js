import connectMongo from "@/lib/mid";
import Uw from "@/lib/models/uw";
import { Keypair } from "@solana/web3.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectMongo();

    const { uid } = req.body;
    const useruuid = uid;
    if (!useruuid) {
      return res.status(400).json({ error: "Not allowed" });
    }
    let userWallet = await Uw.findOne({ useruuid });
    if (userWallet) {
      return res.status(200).json(userWallet);
    }
    const solKeypair = Keypair.generate();
    try {
      userWallet = await Uw.findOneAndUpdate(
        { useruuid },
        {
          useruuid,
          address: solKeypair.publicKey.toString(),
          key: solKeypair.secretKey,
        },
        { upsert: true, new: true }
      );
      return res.status(200).json(userWallet);
    } catch (error) {
      if (error.code === 11000) {
        userWallet = await Uw.findOne({ useruuid });
        return res.status(200).json(userWallet);
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
