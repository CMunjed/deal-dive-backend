// Start the server and listen on the specified port for requests
// Application entry point

// require('dotenv').config();

import app from "./app.js";

const PORT = 5000; //process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`View in the browser at http://localhost:${PORT}/`);
});
