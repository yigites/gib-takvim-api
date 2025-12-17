import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const records = [];

  page.on("requestfinished", async (request) => {
    const url = request.url();
    if (url.includes("vergiTakvimi/specification")) {
      const postData = request.postData();
      const response = await request.response();
      const responseBody = response ? await response.text() : null;
      records.push({ url, method: request.method(), postData, responseBody });
    }
  });

  await page.goto("https://www.gib.gov.tr/vergi-takvimi", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  await browser.close();

  console.log(JSON.stringify(records, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
