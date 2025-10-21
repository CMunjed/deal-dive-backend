// Start the server and listen on the specified port for requests
// Application entry point

import "dotenv/config";

import app from "./app.js";

const PORT = 5001; //process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`View in the browser at http://localhost:${PORT}/`);
});
