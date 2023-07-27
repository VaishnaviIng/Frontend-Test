require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const moment = require("moment");

const app = express();

app.use(function (req, res, next) {
  const allowedOrigins = ["http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.enable("trust proxy");

app.post("/api/fetchStockData", async (req, res) => {
  try {
    const { symbol, date } = req.body;
    if (!symbol || !date) {
      return res
        .status(400)
        .json({ error: "Invalid input. Symbol and date are required." });
    }
    const formattedSymbol = symbol.toUpperCase();

    // Date format validation
    const dateFormat = "YYYY-MM-DD";
    if (!moment(date, dateFormat, true).isValid()) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
    }

    const API_KEY = process.env.API_KEY || "XZzyRR1NaEeBLz85Fyw79kNCpgm0RcHE";
    const url = `https://api.polygon.io/v2/aggs/ticker/${formattedSymbol}/range/1/day/${date}/${date}?apiKey=${API_KEY}`;

    const response = await axios.get(url);
    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const stockData = response.data.results;
      console.log(stockData,"responsesuccess");
      return res.status(200).json({ Data: stockData });
      
    } else {
      return res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    return res.status(500).json({ error: "Failed to fetch stock data. Please try again later." });
  }
});


const port = process.env.PORT || 5000;

app.listen(port, (response) => {
  console.log(`Listening on port ${port}`);
});