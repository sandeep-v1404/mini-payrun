import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => res.send("OK"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.warn(`API running at http://localhost:${PORT}`);
});
