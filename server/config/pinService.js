import { pinata } from "./pinataClient.js";

// Pin binary file buffer (e.g., image)
export async function uploadAsset(buffer, filename) {
  const result = await pinata.upload.public.file(buffer, {
    pinataMetadata: { name: filename },
  });
  return result.cid;
}

// Pin ERC-721 metadata JSON
export async function uploadMetadata(metadata) {
  const result = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: { name: `${metadata.name}-metadata` },
  });
  return result.cid;
}
