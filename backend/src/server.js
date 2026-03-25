import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { initSocket } from './config/socket.js';

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    initSocket(server);

    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
