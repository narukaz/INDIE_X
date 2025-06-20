import * as pinService from "../services/pinService.js";

export async function publishMetadata(req, res) {
  try {
    const { name, description, attributes, imageCid } = req.body;
    const metadata = {
      name,
      description,
      image: `ipfs://${imageCid}`,
      attributes,
    };
    const metaCid = await pinService.pinJson(metadata);
    res.json({ metaCid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
