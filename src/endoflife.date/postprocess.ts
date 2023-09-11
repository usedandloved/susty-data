import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  readJSON,
  removeFile,
  writeTXT,
} from "https://deno.land/x/flat@0.0.14/mod.ts";

interface Cycle {
  cycle: number | string;
  releaseDate: boolean | string;
  eol: boolean | string;
  latest: string;
  link: string;
  lts: boolean | string;
  support: boolean | string;
  discontinued: boolean | string;
}

const filename = Deno.args[0];
const json = await readJSON(filename) as Cycle[];
assert(json?.length);

// Step 4. Write a new JSON file with our data
const newFilename = filename.replace(".min.json", ".json");
await writeTXT(
  newFilename,
  `[\n${json.map((l) => JSON.stringify(l)).join(",\n")}\n]`,
); // create a new JSON file in a format that's easy to diff

if (Deno.args[1] !== "skipRemove") {
  await removeFile(filename);
}
