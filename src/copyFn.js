import fs from "fs";

export function parseJsonFromFile(file) {
  try {
    const rawData = fs.readFileSync(file, "utf8");
    const jsonObj = JSON.parse(rawData);

    return jsonObj;
  } catch (err) {
    console.error("Error reading or parsing the JSON file:", err);
  }
}

export function writeStrToFileSync(file, str) {
  try {
    fs.writeFileSync(file, str);
  } catch (err) {
    console.error("Error writing file:", err);
  }
}
