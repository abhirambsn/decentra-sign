import express from "express";
const app = express();
import crypto from "crypto";
import cors from "cors";
import fs from "fs";
import { create } from "ipfs-http-client";
import multer from "multer";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Buffer } from "buffer";

import { config } from "dotenv";
import Sharing from "./models/Sharing.mjs";
import Payments from "./models/Payments.mjs";
import Groups from "./models/Groups.mjs";
config();

const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("port", process.env.PORT || 5000);

const projectId_INFURA = "2M3Jq6HgsuG7X2dUxHhd0vdqLGS";
const projectSecret_INFURA = "922ffedf734f9427d041b2ca8d5f3658";

const authHeader = `Basic ${Buffer.from(
  projectId_INFURA + ":" + projectSecret_INFURA
).toString("base64")}`;

console.log(`Sending AuthHeader: ${authHeader}`);

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: { authorization: authHeader },
});

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", code: 200 });
});

const uploadCriteria = upload.single("doc");
app.post("/hash", uploadCriteria, async (req, res, next) => {
  const doc = req.file;
  const data = req.body;
  const bufferData = fs.readFileSync(doc.path);
  const fileHash = crypto.createHash("sha256").update(bufferData).digest("hex");

  const header = req.headers["x-request-type"];
  if (header && header === "verify") {
    fs.rmSync(doc.path);
  }

  return res
    .status(200)
    .json({ data: doc.buffer, hash: fileHash, path: doc.path });
});

app.post("/sign", async (req, res) => {
  const name = req.body.name;
  const address = req.body.address;
  const timestamp = Date.now();
  const docPath = req.body.path;
  const buffer = fs.readFileSync(docPath);
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    page.drawText(`Signed By ${name}-${address} @ ${timestamp}`, {
      x: 5,
      y: height / 2 + 300,
      size: 40,
      color: rgb(1, 1, 1),
      rotate: degrees(-45),
      opacity: 0,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const result = await ipfs.add(Buffer.from(pdfBytes));
  console.log(result);
  const ipfsUrl = `ipfs://${result.path}`;
  const updatedHash = crypto
    .createHash("sha256")
    .update(pdfBytes)
    .digest("hex");
  fs.rmSync(docPath);
  return res.status(200).json({ ipfsUrl, hash: updatedHash });
});

app.post("/share", async (req, res) => {
  const { docHash, to, by } = req.body;
  const newShare = new Sharing({
    hash: docHash,
    to,
    by,
  });
  await newShare.save();
  return res.status(200).json(newShare);
});

app.post("/shared", async (req, res) => {
  const { email } = req.body;
  const data = await Sharing.find({ to: email }).exec();
  return res.status(200).json(data);
});

app.post("/record-payment", async (req, res) => {
  const { user, paidAt, amount, txnHash } = req.body;
  const newPayment = new Payments({
    user,
    paidAt,
    amount,
    txnHash,
  });
  await newPayment.save();
  return res.status(201).json({ message: "Recorded", payment: newPayment });
});

app.get("/payment-data/:userAddress", async (req, res) => {
  const { userAddress } = req.params;
  if (!userAddress) {
    return res.status(400).json({ message: "No userAddress provided" });
  }

  const paymentData = await Payments.find({ user: userAddress }).exec();
  return res.status(200).json(paymentData);
});

app.post("/group-sign", async (req, res) => {
  const { docHash, members, name } = req.body;
  const doc = new Groups({
    signers: members,
    docHash,
    name,
  });
  await doc.save();
  return res.status(200).json({ message: "Group Created", id: doc._id });
});

app.post("/groups", async (req, res) => {
  const { email } = req.body;
  const data = await Groups.find({ signers: email }).exec();
  return res.status(200).json(data);
});

app.post("/groups/:id/sign", async (req, res) => {
  const { email, signature } = req.body;
  const { id } = req.params;
  const doc = await Groups.findById(id).exec();
  doc.signatures.push({ signer: email, signature });
  return res.status(200).json({ message: "Signed" });
});

export default app;
