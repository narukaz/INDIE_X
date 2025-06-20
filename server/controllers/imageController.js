import * as pinService from "../config/pinService.js";

export async function uploadImage(req, res) {
  try {
    const { buffer, originalname } = req.file;
    const assetCid = await pinService.pinFileBuffer(buffer, originalname);
    res.json({ assetCid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
