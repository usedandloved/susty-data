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

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0]; // Same name as downloaded_filename `const filename = 'btc-price.json';`
const text = await readTXT(filename);

// Step 2: Parse the html source into a document, so we can query it for the data we want
const document = new DOMParser().parseFromString(text, "text/html");

assert(document);
const devices = document.querySelectorAll("#content .table.parent");
assert(devices?.length);

// console.log(devices);

// Loop over the devices and get the data you want

const dataArray = Array.from(devices).map((device, i) => {
  // if(i) return;

  const el = device as HTMLDocument;

  return {
    // Rempove multiple spaces
    name: el?.querySelector(".device-name")?.textContent.trim().replace(
      /\s\s+/g,
      " ",
    ),
    score: el?.querySelector(".device-score")?.textContent.trim(),
    link: el.querySelector(".image-container a")?.attributes.getNamedItem(
      "href",
    )?.value,
  };
});

console.log(dataArray);

// Step 4. Write a new JSON file with our filtered data
const newFilename = filename.replace(".html", ".jsonl");

// Save in jsonl format for easier diffing
// Need to order for easy diffing too

await writeTXT(newFilename, dataArray.map((l) => JSON.stringify(l)).join("\n")); // create a new JSON file with just the Bitcoin price
console.log("Wrote a post process file");

// Optionally delete the original file
// await removeFile('./btc-price.json') // equivalent to removeFile('btc-price.json')
