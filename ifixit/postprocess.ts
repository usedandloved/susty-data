import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  DOMParser,
  type HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
// Helper library written for useful postprocessing tasks with Flat Data
import {
  readTXT,
  removeFile,
  writeTXT,
} from "https://deno.land/x/flat@0.0.14/mod.ts";
import { ensureAbsoluteUrl } from "./lib/utils.ts";

const rootUrl = "https://www.ifixit.com";

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0]; // Same name as downloaded_filename `const filename = 'btc-price.json';`
const text = await readTXT(filename);
assert(text);

// Step 2: Parse the html source into a document, so we can query it for the data we want
const document = new DOMParser().parseFromString(text, "text/html");
assert(document);
const devices = document.querySelectorAll("#content .table.parent");
assert(devices?.length);

// Step 3: Loop over the devices and get the data we want
const dataArray = Array.from(devices).map((device) => {
  const el = device as HTMLDocument;

  const href = el.querySelector(".image-container a")?.attributes.getNamedItem(
    "href",
  )?.value;

  return {
    link: href ? ensureAbsoluteUrl(href, rootUrl) : undefined,
    // Device name, with multiple spaces removed
    name: el.querySelector(".device-name")?.textContent.trim().replace(
      /\s\s+/g,
      " ",
    ),
    relaeseDateTime: el.querySelector("[datetime]")?.attributes.getNamedItem(
      "datetime",
    )
      ?.value,
    score: el.querySelector(".device-score")?.textContent.trim(),
  };
});

// Step 4. Write a new JSON file with our data
const newFilename = filename.replace(".html", ".jsonl");
await writeTXT(newFilename, dataArray.map((l) => JSON.stringify(l)).join("\n")); // create a new JSON file with just the Bitcoin price

// Step 5: Optionally delete the original file, use a !== here because the default should be to delete the file
if (Deno.args[1] !== "skipRemove") {
  await removeFile(filename);
}
