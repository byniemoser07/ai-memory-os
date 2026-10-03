import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import ingestRouter from "./routes/ingest.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(ingestRouter);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));