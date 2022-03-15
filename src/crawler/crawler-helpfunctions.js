/** Section 1: crawling help functions  */
import { XMLParser } from "fast-xml-parser";
import { v4 as uuidv4 } from "uuid";

/**
 * Function 1.1: This function takes a String of a file from type XML
 * and converts it to a JS object for easy data extraction
 *
 * @export
 * @param {String} strXML
 * @return {Object}
 */
export function parseXMLStringToJSObject(strXML) {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  };
  const xmlParser = new XMLParser(options);
  return xmlParser.parse(strXML, "text/xml");
}

/**
 * Function 1.2: This summaray takes a RegEx pattern, the file content String,
 * and the capturing group number to return the array of capturing group matches
 * in the file content String
 *
 * @export
 * @param {String} strRegExPattern
 * @param {String} strString
 * @param {Number} numCapturingGroupNumber
 * @return {Array}
 */
export function getCapturingGroupFromGlobalRegEx(
  strRegExPattern,
  strString,
  numCapturingGroupNumber
) {
  return Array.from(
    strString.matchAll(strRegExPattern),
    (m) => m[numCapturingGroupNumber]
  );
}

/**
 * Function 1.3: This function takes a RegEx pattern, the file content String,
 * and the capturing group number to return a STring of the first capturing group match
 * in the file content String
 *
 * @export
 * @param {String} strRegExPattern
 * @param {String} strString
 * @param {Number} numCapturingGroupNumber
 * @return {String}
 */
export function getCapturingGroupFromRegEx(
  strRegExPattern,
  strString,
  numCapturingGroupNumber
) {
  if (strString.match(strRegExPattern) != null) {
    return strString.match(strRegExPattern)[numCapturingGroupNumber];
  }
}

/**
 * Function 1.4: This function Takes an Array of Strings.
 * The Strings are seperatet with the character ",".
 * The strings get split up in Arrays and the function returns an Array of Arrays of IDs.
 *
 * @export
 * @param {Array} arrStrIDs
 * @return {Array}
 */
export function getArrayOfArrayIDsFromArrayOfStrings(arrStrIDs) {
  let strRegEx = /("|\s)/gim;
  arrStrIDs = arrStrIDs.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "");
      return x;
    }
  });
  let arrArrIDs = arrStrIDs.map(function (x) {
    if (x != null) {
      x = x.split(",");
      return x;
    }
  });
  return arrArrIDs;
}

/**
 * Function 1.5: Takes an Array of Strings of paths and reformats the path to a readable one.
 *
 * @export
 * @param {Array} arrStrPaths
 * @return {Array}
 */
export function getArrayPathsFromArrayStrings(arrStrPaths) {
  let strRegEx = /(\.|::)/gim;
  arrStrPaths = arrStrPaths.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "/");
      return x;
    }
  });
  return arrStrPaths;
}

/**
 * Function 1.6: Takes a normal formated String of a path and redormats the path,
 * so that it can be used in a Rest API request.
 *
 * @export
 * @param {String} strFilepath
 * @return {String}
 */
export function getAPIFilepathFromStringFilepath(strFilepath) {
  return strFilepath.replaceAll("/", "%2f");
}

/**
 * Function 1.7: This function takes an Array of JSON objects and returns an Array,
 * that contains the "path" attribute of every JSON object that are from a certain filetype.
 *
 * @export
 * @param {Array} arrJSONFileData
 * @param {String} strFiletype
 * @return {Array}
 */
export function getFilepathFromFiletype(arrJSONFileData, strFiletype) {
  let arrFilepaths = [];
  for (let i = 0; i < arrJSONFileData.length; i++) {
    const jsonFileData = arrJSONFileData[i];
    if (jsonFileData.path.endsWith(strFiletype)) {
      arrFilepaths.push(jsonFileData.path);
    }
  }
  return arrFilepaths;
}

/**
 * Function 1.8: This function creates a unique ID
 *
 * @export
 * @return {String}
 */
export function createUUID() {
  return uuidv4();
}

/**
 * Function 1.9: This fucntion takes an Array of Dictionaries and checks if there are
 * duplicate Dictionaries in it. if thats the case the duplications get deleted out of the Array.
 * The Array without duplicated gets returned at the end.
 *
 * @export
 * @param {Array} arrWorking
 * @return {Array}
 */
export function getUniqueObjectArray(arrWorking) {
  return arrWorking.filter(
    (v, i, a) =>
      a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) === i
  );
}
