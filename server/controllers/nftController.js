import * as pinService from "../config/pinService.js";

// Handles POST /nft
export async function mint(req, res) {
  try {
    // 1. Pin asset
    console.log("mint kicked");
    const { buffer, originalname } = req.file;
    const assetCid = await pinService.uploadAsset(buffer, originalname);
    console.log("req.file =", req.file);
    console.log("req.body =", req.body);

    // 2. Build metadata
    const metadata = {
      name: req.body.name,
      description: req.body.description,
      image: `ipfs://${assetCid}`,
      attributes: JSON.parse(req.body.attributes || "[]"),
    };

    // 3. Pin metadata
    const metaCid = await pinService.uploadMetadata(metadata);

    // 4. Return CIDs
    res.json({ assetCid, metaCid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
