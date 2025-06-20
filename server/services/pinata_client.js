import pinataSDK from "pinata";

const client = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);
export default pinata;
