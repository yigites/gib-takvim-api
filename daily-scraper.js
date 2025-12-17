import axios from "axios";
import fs from "fs";
import path from "path";
import { formatDayMonthYear, formatDateTimeWithoutOffset } from "./lib/date-utils.js";

const API_URL = "https://gib.gov.tr/api/gibportal/vergiTakvimi/specification/listAll";
const PAGE_SIZE = 1000;
const DATA_DIR = path.resolve("data");

function buildDailyPayload(targetDate) {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return {
    globalOperator: "AND",
    searchRequestListDTOS: [
      {
        column: "startdate",
        value: formatDateTimeWithoutOffset(end),
        joinTable: "subject",
        operation: "LESS_THAN",
        formatDate: true,
        formatBoolean: false
      },
      {
        column: "stopdate",
        value: formatDateTimeWithoutOffset(start),
        joinTable: "subject",
        operation: "GREATER_THAN",
        formatDate: true,
        formatBoolean: false
      }
    ]
  };
}

function parseDateFlag() {
  const arg = process.argv.slice(2).find((raw) => raw.startsWith("--date="));
  if (!arg) {
    return new Date();
  }
  const value = arg.split("=")[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Geçersiz tarih: ${value}`);
  }
  return parsed;
}

function parseOutputFlag() {
  const arg = process.argv.slice(2).find((raw) => raw.startsWith("--output="));
  if (!arg) {
    return null;
  }
  const value = arg.split("=")[1];
  if (!value) {
    throw new Error("--output parametresi boş olamaz");
  }
  return value;
}

function resolveOutputPath(value) {
  if (path.isAbsolute(value)) {
    return value;
  }
  return path.join(DATA_DIR, value);
}

async function run() {
  const targetDate = parseDateFlag();
  const payload = buildDailyPayload(targetDate);
  const params = new URLSearchParams({
    page: "0",
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

  const items = Array.isArray(response.data?.resultContainer)
    ? response.data.resultContainer
    : response.data?.resultContainer?.content ?? [];

  const normalizedItems = items.map((entry) => ({
    ...entry,
    startdate: formatDayMonthYear(entry.startdate),
    stopdate: formatDayMonthYear(entry.stopdate)
  }));

  const metadata = {
    fetchedAt: formatDayMonthYear(new Date()),
    requestedDay: formatDayMonthYear(targetDate),
    totalItems: normalizedItems.length,
    pageSize: PAGE_SIZE
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const outputName = parseOutputFlag() ?? "takvim.json";
  const outputPath = resolveOutputPath(outputName);
  fs.writeFileSync(outputPath, JSON.stringify({ metadata, items: normalizedItems }, null, 2));

  console.log(`✅ Günlük takvim hazırlandı (${normalizedItems.length} madde) -> ${outputPath}`);
}

run().catch((error) => {
  console.error("❌ Günlük takvim alınamadı", error);
  process.exit(1);
});
