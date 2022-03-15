/** Section 1: test crawler */
import { extractAllDataFromDatabaseFolder } from "./crawler-main.js";
let intSecTimeStart = Math.round(new Date().getTime() / 1000);
const dictdCrawlerResult = await extractAllDataFromDatabaseFolder();
console.log(
  "Runtime in seconds: " +
    (Math.round(new Date().getTime() / 1000) - intSecTimeStart)
);
console.log("Finished");
