import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  DOMParser,
  type HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import {
  readTXT,
  removeFile,
  writeTXT,
} from "https://deno.land/x/flat@0.0.14/mod.ts";

const rootUrl = "https://www.ifixit.com";

const ensureAbsoluteUrl = (url: string, root: string) => {
  return url.startsWith("http") ? url : `${root}${url}`;
};

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0]; // Same name as downloaded_filename `const filename = 'btc-price.json';`
const text = await readTXT(filename);

// Step 2: Parse the html source into a document, so we can query it for the data we want
const document = new DOMParser().parseFromString(text, "text/html");

assert(document);
const devices = document.querySelectorAll("#content .table.parent");
assert(devices?.length);

// Loop over the devices and get the data you want

const dataArray = Array.from(devices).map((device) => {
  const el = device as HTMLDocument;

  const href = el.querySelector(".image-container a")?.attributes.getNamedItem(
    "href",
  )?.value;

  return {
    // Rempove multiple spaces
    name: el?.querySelector(".device-name")?.textContent.trim().replace(
      /\s\s+/g,
      " ",
    ),
    score: el?.querySelector(".device-score")?.textContent.trim(),
    link: href ? ensureAbsoluteUrl(href, rootUrl) : undefined,
    relaeseDateTime: el.querySelector("[datetime]")?.attributes.getNamedItem(
      "datetime",
    )
      ?.value,
  };
});

// Step 4. Write a new JSON file with our filtered data
const newFilename = filename.replace(".html", ".jsonl");

await writeTXT(newFilename, dataArray.map((l) => JSON.stringify(l)).join("\n")); // create a new JSON file with just the Bitcoin price
console.log("Wrote a post process file");

// Optionally delete the original file, use a !== here because the default should be to delete the file
if (Deno.args[1] !== "skipRemove") {
  await removeFile(filename);
}
