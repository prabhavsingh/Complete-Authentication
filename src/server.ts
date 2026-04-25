import dotenv from "dotenv";
dotenv.config();
import { connectToDB } from "./config/db.js";
import http from "node:http";
import app from "./app.js";

async function startServer() {
  await connectToDB();
  const PORT = process.env.PORT! || 3000;

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.log("Error while starting the server", err);
  process.exit(1);
});
