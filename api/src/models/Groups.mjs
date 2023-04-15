import { Schema, model } from "mongoose";

const schema = new Schema({
  signers: [{ type: Schema.Types.String }],
  name: { type: Schema.Types.String, required: true },
  docHash: { type: Schema.Types.String, required: true },
  signatures: [
    {
      signer: { type: Schema.Types.String },
      signature: { type: Schema.Types.String },
    },
  ],
  signedAt: { type: Schema.Types.Date, default: Date.now },
});

export default model("Groups", schema);
