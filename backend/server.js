// require("dotenv").config();
// const app        = require("./src/app");
// const connectDB  = require("./src/config/db");
// const logger     = require("./src/config/logger");

// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
//   });
// });

require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/config/logger");
const { initSocket } = require("./src/socket/socket");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB().then(() => {  
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});
