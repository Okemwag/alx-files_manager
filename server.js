const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// import routes from routes/index.js
const routes = require('./routes');

// add routes to the Express app
app.use('/', routes);

// start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
