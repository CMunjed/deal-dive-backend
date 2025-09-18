// Start the server and listen on the specified port for requests
// Application entry point

// require('dotenv').config();

import app from './app.js';

const PORT = 5001; //process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`View in the browser at: http://localhost:${PORT}/`);
    console.log(`Visit http://localhost:${PORT}/login to log in and http://localhost:${PORT}/logout to log out`);
})
