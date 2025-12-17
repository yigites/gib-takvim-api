import axios from "axios";
import fs from "fs";
import path from "path";
import { formatDayMonthYear } from "./lib/date-utils.js";

const API_URL = "https://gib.gov.tr/api/gibportal/vergiTakvimi/specification/listAll";
const PAGE_SIZE = 1000;
const PAYLOAD_PATH = path.resolve("payload-all.json");
const DATA_DIR = path.resolve("data");
const OUTPUT_PATH = path.join(DATA_DIR, "takvim.json");

async function fetchPage(page, payload) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
    sortFieldName: "stopdate",
    sortType: "ASC"
  });

  const response = await axios.post(`${API_URL}?${params}`, payload, {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "GIB Vergi Takvimi API"
    }
  });

  return response.data;
}

async function run() {
  const payload = JSON.parse(fs.readFileSync(PAYLOAD_PATH, "utf8"));
  const items = [];
  let totalPages = 1;
  let page = 0;

  while (page < totalPages) {
    const data = await fetchPage(page, payload);
    const container = data?.resultContainer;
    const pageItems = container?.content ?? [];
    items.push(...pageItems);

    totalPages = container?.totalPages ?? totalPages;
    if (!totalPages || totalPages <= 0) {
      break;
    }

    page += 1;
  }

  const metadata = {
    fetchedAt: formatDayMonthYear(new Date()),
    pageSize: PAGE_SIZE,
    totalItems: items.length,
    pagesFetched: page
  };

  const normalizedItems = items.map((entry) => ({
    ...entry,
    startdate: formatDayMonthYear(entry.startdate),
    stopdate: formatDayMonthYear(entry.stopdate)
  }));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ metadata, items: normalizedItems }, null, 2));

  console.log(`✅ Vergi takvimi hazırlandı (${items.length} madde)`);
}

run().catch((error) => {
  console.error("❌ Takvim alınamadı", error);
  process.exit(1);
});
