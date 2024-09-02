const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

// Middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Welcome");
});

async function cryptopriceScraper() {
  const url =
    "https://www.wettstar-pferdewetten.de/race?id=2390162&country=FRA&track=Dieppe&date=2024-08-27";
  const result = [];

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" }); // Wait until network is idle

    // Optionally wait for specific element to ensure content is loaded
    await page.waitForSelector(".finishToggleWrapper"); // Adjust the selector based on your needs

    const data = await page.evaluate(() => {
      const items = [];
      document
        .querySelectorAll(".finishToggleWrapper .finishTable tbody > tr")
        .forEach((row) => {
          const place =
            row.querySelector("td:nth-child(1)")?.innerText.trim() ||
            "No Place"; // Adjust the selector based on your needs
          const number =
            row.querySelector("td:nth-child(2)")?.innerText.trim() ||
            "No Number"; // Adjust the selector based on your needs
          const horse =
            row.querySelector("td:nth-child(3)")?.innerText.trim() ||
            "No Horse"; // Adjust the selector based on your needs
          const evQuota =
            row.querySelector("td:nth-child(4)")?.innerText.trim() ||
            "No Ev. quota"; // Adjust the selector based on your needs
          const equestrian =
            row.querySelector("td:nth-child(5)")?.innerText.trim() ||
            "No Equestrian"; // Adjust the selector based on your needs
          const info =
            row.querySelector("td:nth-child(6)")?.innerText.trim() || "No Info"; // Adjust the selector based on your needs

          items.push({
            Place: place,
            No: number,
            Horse: horse,
            EvQuota: evQuota,
            Equestrian: equestrian,
            Info: info,
          });
        });

      // Log the items to debug
      console.log("Extracted Items:", items);
      return items;
    });

    await browser.close();
    return data;
  } catch (error) {
    console.error("Error scraping data:", error);
    return [];
  }
}

// Data scraper route
app.get("/data-scrapper", async (req, res) => {
  try {
    const data = await cryptopriceScraper();
    res.status(200).json({ result: data });
  } catch (err) {
    res.status(500).json({ err: err.toString() });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server Started at 5000");
});
