import * as pinService from "../config/pinService.js";

export async function publishMetadata(req, res) {
  try {
    console.log("reqest body -> ", req.body);

    const metadata = req.body;
    const metaCid = await pinService.pinJson(metadata);
    res.json({ metaCid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
