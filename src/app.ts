import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const { default: pkg } = await import("../package.json", {
  with: {
    type: "json",
  },
});

const app = express();

// Configure CORS
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// Debug route
app.get("/", (_req, res) => {
  res.json({
    message: "API is running",
    version: pkg.version,
    status: "OK",
  });
});

// Main API routes
app.use("/api/v1", routes);

export default app;
