import express from 'express';
import routes from './routes/index.js';

const { default: pkg } = await import('../package.json', {
    with: {
        type: "json",
    },
});

const app = express();

app.use(express.json());

// Debug route
app.get('/', (_req, res) => {
  res.json({
      message: 'API is running',
      version: pkg.version,
      status: 'OK'
  });
});

// Main API routes
app.use("/api/v1", routes);

export default app;
