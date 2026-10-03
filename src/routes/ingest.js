import express from "express";
import { extractTriples } from "../extract.js";
import { persistTriples } from "../store.js";

const router = express.Router();

router.post("/ingest", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty 'text' field." });
  }

  try {
    const { triples, usage } = await extractTriples(text);
    const saved = await persistTriples(triples, text);

    res.json({
      triples_extracted: triples.length,
      relations_saved: saved.length,
      token_usage: usage,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    res.status(500).json({ error: "Extraction or storage failed.", details: err.message });
  }
});

export default router;