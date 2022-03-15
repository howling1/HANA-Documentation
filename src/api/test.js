/** Section 1: test the whole system */
import { encapsulatePostedObject } from "./encapsulatePostedObject.js";
import { postAllToHANA } from "./postAllToHANA.js";
import { deleteAllFromHANA } from "./deleteAllFromHANA.js";
import { extractAllDataFromDatabaseFolder } from "../crawler/crawler-main.js";

let intSecTimeStart = Math.round(new Date().getTime() / 1000);
const arrCrawledData = await extractAllDataFromDatabaseFolder();

const toPostData = encapsulatePostedObject(arrCrawledData);

// delete all
const deleteResult = await deleteAllFromHANA();
console.log(deleteResult);

// post all
const postResult = await postAllToHANA(toPostData);
console.log(postResult);

console.log(
  "Runtime in seconds: " +
    (Math.round(new Date().getTime() / 1000) - intSecTimeStart)
);
console.log("Finished");
