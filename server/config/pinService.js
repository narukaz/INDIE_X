import { pinata } from "../config/pinataClient.js";

export async function pinFileBuffer(buffer, filename) {
  const { Blob } = await import("buffer");
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const result = await pinata.upload.public.file(blob, {
    pinataMetadata: { name: filename },
  });
  return result.cid;
}

export async function pinJson(metadata) {
  const result = await pinata.upload.public.json(metadata, {
    pinataMetadata: { name: `${metadata.name}-metadata` },
  });
  return result.cid;
}
