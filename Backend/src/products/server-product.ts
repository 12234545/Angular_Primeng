import express from "express";
import dotenv from "dotenv";
import productsRouter from "./products.routes";
import { connectToDatabase } from "./database-product";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PRODUCT_PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

// CORS Middleware
app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Request body parsing middleware
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.send("Welcome to the Product API");
});

app.use("/product", productsRouter);

// 404 error handling middleware
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Connect to database and start server
connectToDatabase(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server started on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });