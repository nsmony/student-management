const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Same pod as gateway -> localhost. Other pod -> Kubernetes Service DNS name.
const REGISTRATION_URL = process.env.REGISTRATION_URL || "http://localhost:3001";
const SEARCH_URL = process.env.SEARCH_URL || "http://localhost:3002";

const forward = async (res, config) => {
  try {
    const r = await axios({ ...config, validateStatus: () => true });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(502).json({ message: "Bad gateway: " + err.message });
  }
};

app.get("/", (req, res) => res.json({ service: "api-gateway", status: "UP" }));

// ---- Registration microservice (same pod) ----
app.post("/api/register", (req, res) =>
  forward(res, { method: "post", url: `${REGISTRATION_URL}/register`, data: req.body })
);
app.put("/api/register/:id", (req, res) =>
  forward(res, { method: "put", url: `${REGISTRATION_URL}/register/${req.params.id}`, data: req.body })
);

// ---- Search microservice (second pod) ----
app.get("/api/students/search", (req, res) =>
  forward(res, { method: "get", url: `${SEARCH_URL}/search`, params: req.query })
);

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
