import * as pinService from "../services/pinService.js";

export async function pin(req, res) {
  try {
    const cid = await pinService.pinJSON(req.body);
    res.json({ cid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function fetchByCid(req, res) {
  const cid = req.params.cid;
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  const data = await fetch(url).then((r) => r.json());
  res.json(data);
}
