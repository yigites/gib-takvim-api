import fs from "fs";
const text = fs.readFileSync("vergi-page.js", "utf8");
const needles = ["selectedMonths", "requestBody", "filterRange", "rangeSelectActive"];
for (const needle of needles) {
  let idx = text.indexOf(needle);
  console.log(`\n=== ${needle} ===`);
  while (idx !== -1 && idx < text.length) {
    const start = Math.max(0, idx - 200);
    const end = Math.min(text.length, idx + 200);
    console.log(text.slice(start, end));
    idx = text.indexOf(needle, idx + needle.length);
    if (idx !== -1) {
      console.log("---");
    }
  }
}
