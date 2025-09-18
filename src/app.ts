import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";

dotenv.config();

const { default: pkg } = await import("../package.json", {
  with: { type: "json" },
});

const app = express();

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
};

// Attach Auth0 middleware
app.use(auth(config));

// Default route + debug message
app.get("/", (_req, res) => {
  res.json({
    message: "API is running",
    version: pkg.version,
    status: "OK",
    loggedIn: _req.oidc?.isAuthenticated() ? true : false,
  });
});

// Protected profile route
app.get("/profile", (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    res.json({
      message: "User profile data",
      user: req.oidc.user,
    });
  } else {
    res.status(401).send("Not logged in ❌");
  }
});

export default app;
