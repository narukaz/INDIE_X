import { client } from "../services/pinata_client.js";

export function pinJSON(data) {
  return client.pinJSONToIPFS(data).then((r) => r.IpfsHash);
}

export function pinFile(buffer, name) {
  return client
    .pinFileToIPFS(buffer, { pinataMetadata: { name } })
    .then((r) => r.IpfsHash);
}
