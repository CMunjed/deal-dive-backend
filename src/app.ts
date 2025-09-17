//const express = require('express');
import express from 'express';
import { version } from '../package.json';

const app = express();

// Default route + debug message
app.get('/', (req, res) => {
    res.json({
        message: 'API is running',
        version: version,
        status: 'OK'
    });
});

export default app;
