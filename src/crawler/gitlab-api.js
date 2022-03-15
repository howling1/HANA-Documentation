/** Section 1: Gathering the data from GitLab */
import fetch from "node-fetch";
import { getAPIFilepathFromStringFilepath } from "./crawler-helpfunctions.js";

/** Basic link to the GitLab LRZ Rest API */
const strGitLabLRZLink = "https://gitlab.lrz.de/api/v4/projects";
/** The GitLab repository project ID */
const strGitLabLRZProjectID = "15760";
/** The bearer access token to authorize at the GitLab Rest API */
const strBearerAccessToken = "glpat-sxzEj3Ft78yo2BqzHUoS";

/**
 * Function 1.1: This function sends multiple requests to the GitLab Reest API
 * and retrived an Array of JSOn objects that contain all filepaths of the repository folder structure
 *
 * @export
 * @return {Array}
 */
export async function getAllFilePathsFromProjectRepository() {
  const strRESTAPILink =
    strGitLabLRZLink +
    "/" +
    strGitLabLRZProjectID +
    "/repository/tree?private_token=" +
    strBearerAccessToken +
    "&recursive=true&per_page=100";
  let jsonResponse = await fetch(strRESTAPILink);
  let jsonAll = await jsonResponse.json();
  /**
   * Retrieving the response headers of the first request to gather data about the number of results.
   * The GitLab Rest API of this repository is limited to 100 results per page.
   * We have to iterate over every page with a for loop and concatinat the results to one result.
   */
  const intMaxPages = jsonResponse.headers.get("x-total-pages");
  let arrPaths = [];
  for (let i = 2; i <= intMaxPages; i++) {
    const element = strRESTAPILink + "&page=" + i;
    let jsonResponseTemp = await fetch(element);
    let jsonTemp = await jsonResponseTemp.json();
    jsonAll = jsonAll.concat(jsonTemp);
  }
  return jsonAll;
}

/**
 * Function 1.2: Takes a String file path to a file located in a GitLab repository
 * and returns the raw String content of the file.
 *
 * @export
 * @param {String} strFilepath
 * @return {String}
 */
export async function getRawStringFileFromPath(strFilepath) {
  const strRESTAPILink =
    strGitLabLRZLink +
    "/" +
    strGitLabLRZProjectID +
    "/repository/files/" +
    getAPIFilepathFromStringFilepath(strFilepath) +
    "/raw?private_token=" +
    strBearerAccessToken;
  let jsonResponse = await fetch(strRESTAPILink);
  let strFile = await jsonResponse.text();
  return strFile;
}
