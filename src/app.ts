import express from 'express';
const { default: pkg } = await import('../package.json', {
    with: {
      type: "json",
    },
  });

const app = express();

// Default route + debug message
app.get('/', (_req, res) => {
    res.json({
        message: 'API is running',
        version: pkg.version,
        status: 'OK'
    });
});

export default app;
