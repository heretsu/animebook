import mongoose from "mongoose";

const Uw = new mongoose.Schema({
  useruuid: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  key: { type: Object, required: true }, // Securely store the key as a Buffer or Object
});

export default mongoose.models.Uw ||
  mongoose.model("Uw", Uw);
