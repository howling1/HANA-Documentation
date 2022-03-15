/** Section 1: extract data from .calculationview files. */
import {
  parseXMLStringToJSObject,
  getCapturingGroupFromGlobalRegEx,
  getCapturingGroupFromRegEx,
  getFilepathFromFiletype,
  createUUID,
} from "./crawler-helpfunctions.js";
import { getRawStringFileFromPath } from "./gitlab-api.js";

/**
 * Function 1.1: The function takes an Array of JSON objects and extracts data from every file,
 * that is on the path from every JSON object and returns an Array of Dictionaries with
 * one Dictionary for each file
 *
 * @export
 * @param {Array} arrJSONFileData
 * @return {Array}
 */
export async function extractDataFromAllCalculationViewFiles(arrJSONFileData) {
  /** Gets an array of all filepaths of files from type .hdbrole. */
  const arrStrCalculationViewFilepaths = getFilepathFromFiletype(
    arrJSONFileData,
    ".calculationview"
  );

  /** Extract .calculationview file basic information */
  let strRegEx = /(\w+)\/(\w+)\./gim;
  /**
   * Capturing group 1:
   * Retrieves Cluster Name of CalculationView Artifact.
   * It extracts the word between the "/" character and the last "/" character.
   */
  let arrStrCalculationViewClusterName = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    arrStrCalculationViewFilepaths.join(";"),
    1
  );
  /**
   * Capturing group 2:
   * Retrieves Name of CalculationView Artifact.
   * It extracts the word between the "/" character and the "." character.
   */
  let arrStrCalculationViewName = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    arrStrCalculationViewFilepaths.join(";"),
    2
  );

  /**
   * Gos through all filepaths and returns the content of a file and stores it in a String.
   * Added to this file meta information from the filepath gets extracted like creation and modification time.
   */
  let arrStrXMLs = [];
  for (let i = 0; i < arrStrCalculationViewFilepaths.length; i++) {
    const strFilepath = arrStrCalculationViewFilepaths[i];
    if (strFilepath != null) {
      let strXML = await getRawStringFileFromPath(strFilepath);
      arrStrXMLs.push(strXML);
    }
  }
  /** Parses the strings of the xml files to JS objects that are easy to search through. */
  let arrObjXML = arrStrXMLs.map(function (strXML) {
    if (strXML != null) {
      let objXML = parseXMLStringToJSObject(strXML);
      return objXML;
    }
  });
  /** Extracts data from each JS object in the Array and returns a Directory for each of them. */
  let arrDictFileData = arrObjXML.map(function (objXML) {
    if (objXML != null) {
      let dictData = extractDataFromCalculationViewDictonary(objXML);
      return dictData;
    }
  });
  /**
   * Adds the file location of the file in the local directory and adds the previously gathered file metadata
   *  to the directory of each element in the Array.
   */
  for (let i = 0; i < arrDictFileData.length; i++) {
    arrDictFileData[i]["ID"] = createUUID();
    arrDictFileData[i]["Name"] = arrStrCalculationViewName[i];
    arrDictFileData[i]["ClusterName"] = arrStrCalculationViewClusterName[i];
    arrDictFileData[i]["FileLocation"] = arrStrCalculationViewFilepaths[i];
    arrDictFileData[i]["RawStringXMLFile"] = arrStrXMLs[i];
  }

  return arrDictFileData;
}

/**
 * Function 1.2: Gets a JS object and extracts needed data. After that it returns a Dictonary of that extracted data.
 *
 * @param {Object} objXML
 * @return {Dictonary}
 */
function extractDataFromCalculationViewDictonary(objXML) {
  /** Creates the .calculationview dictonary structure. */
  let dictXMLData = {
    NameDesc: "",
    Connections: [],
    Attributes: [],
  };

  /** Adds the crawled Information to the CalculationView Dictonary. */
  dictXMLData.NameDesc =
    objXML["Calculation:scenario"].descriptions["@_defaultDescription"];

  /** Retrieve the connections of the CalculationView. */
  let arrDictCVConnections = [];
  let objXMLDataObj = objXML["Calculation:scenario"].dataSources.DataSource;
  /** Check if its an array of results or a single result and add the result to the Dictonary. */
  if (Array.isArray(objXMLDataObj)) {
    arrDictCVConnections = [];
    for (let i = 0; i < objXMLDataObj.length; i++) {
      const arrObjConnection = objXMLDataObj[i];
      let strRegEx = /\.|::/gim;
      let strPath = "";
      if (arrObjConnection.resourceUri != null) {
        strPath = arrObjConnection.resourceUri.replace(strRegEx, "/");
      }
      strRegEx = /(\w+)\/\w+\/(\w+)$/im;
      let dictConnection = {
        ID: createUUID(),
        Name: getCapturingGroupFromRegEx(strRegEx, strPath, 2),
        ClusterName: getCapturingGroupFromRegEx(strRegEx, strPath, 1),
        Path: strPath,
        CalculationViewID:
          arrObjConnection["@_id"] != null ? arrObjConnection["@_id"] : "",
        Type:
          arrObjConnection["@_type"] != null ? arrObjConnection["@_type"] : "",
      };
      arrDictCVConnections.push(dictConnection);
    }
  } else if (objXMLDataObj != null) {
    let strRegEx = /\.|::/gim;
    let strPath = "";
    if (objXMLDataObj.resourceUri != null) {
      strPath = objXMLDataObj.resourceUri.replace(strRegEx, "/");
    }
    strRegEx = /(\w+)\/\w+\/(\w+)$/im;
    let dictConnection = {
      ID: createUUID(),
      Name: getCapturingGroupFromRegEx(strRegEx, strPath, 2),
      ClusterName: getCapturingGroupFromRegEx(strRegEx, strPath, 1),
      Path: strPath,
      CalculationViewID:
        objXMLDataObj["@_id"] != null ? objXMLDataObj["@_id"] : "",
      Type: objXMLDataObj["@_type"] != null ? objXMLDataObj["@_type"] : "",
    };
    arrDictCVConnections.push(dictConnection);
  }
  /** Adds the crawled Information to the CalculationView Dictonary. */
  dictXMLData.Connections = arrDictCVConnections;

  /** Retrieve the attributes of the CalculationView. */
  let arrDictCVAttributes = [];
  objXMLDataObj =
    objXML["Calculation:scenario"].logicalModel.attributes.attribute;
  /** Check if its an array of results or a single result and add the result to the Dictonary. */
  if (Array.isArray(objXMLDataObj)) {
    arrDictCVAttributes = [];
    for (let i = 0; i < objXMLDataObj.length; i++) {
      const arrObjAttribute = objXMLDataObj[i];
      let dictAttributes = {
        ID: createUUID(),
        AttributeID: arrObjAttribute != null ? arrObjAttribute["@_id"] : "",
        DefaultDescription:
          arrObjAttribute.descriptions != null
            ? arrObjAttribute.descriptions["@_defaultDescription"]
            : "",
      };
      arrDictCVAttributes.push(dictAttributes);
    }
  } else if (objXMLDataObj != null) {
    arrDictCVAttributes = [1];
    let dictAttributes = {
      ID: createUUID(),
      AttributeID: objXMLDataObj != null ? objXMLDataObj["@_id"] : "",
      DefaultDescription:
        objXMLDataObj.descriptions != null
          ? objXMLDataObj.descriptions["@_defaultDescription"]
          : "",
    };
    arrDictCVAttributes.push(dictAttributes);
  }
  dictXMLData.Attributes = arrDictCVAttributes;

  return dictXMLData;
}
