import * as pinService from "../config/pinService.js";

export async function publishMetadata(req, res) {
  try {
    console.log("reqest body -> ", req.body);
    const { name, description, attributes, imageCid } = req.body;
    const metadata = {
      name,
      description,
      image: `cyan-realistic-swift-995.mypinata.cloud/ipfs/${imageCid}`,
      attributes,
    };
    const metaCid = await pinService.pinJson(metadata);
    res.json({ metaCid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
