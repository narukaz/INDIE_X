import { pinata } from "../config/pinataClient.js";

// Pin binary file buffer (e.g., image)
export async function uploadAsset(buffer, filename) {
  // Convert Node.js Buffer to Blob for Pinata SDK
  const { Blob } = await import("buffer");
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const result = await pinata.upload.public.file(blob, {
    pinataMetadata: { name: filename },
  });
  return result.cid;
}

// Pin ERC-721 metadata JSON
export async function uploadMetadata(metadata) {
  const result = await pinata.upload.public.json(metadata, {
    pinataMetadata: { name: `${metadata.name}-metadata` },
  });
  return result.cid;
}
