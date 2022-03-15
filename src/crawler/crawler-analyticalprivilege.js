/** Section 1: extract data from .analyticprivilege files. */
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
export async function extractDataFromAllAnalyticalPrivilegeFiles(
  arrJSONFileData
) {
  /** Gets an array of all filepaths of files from type .analyticprivilege. */
  const arrAnalyticalPrivilegeFilepaths = getFilepathFromFiletype(
    arrJSONFileData,
    ".analyticprivilege"
  );
  /** Extract .analyticprivilege file basic information */
  let strRegEx = /(\w+)\/(\w+)\./gim;
  /**
   * Capturing group 1:
   * Retrieves Cluster Name of AnalyticPrivilege Artifact.
   * It extracts the word between the "/" character and the last "/" character.
   */
  let arrStrAnalyticPrivilegeViewClusterName = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    arrAnalyticalPrivilegeFilepaths.join(";"),
    1
  );
  /**
   * Capturing group 2:
   * Retrieves Name of AnalyticPrivilege Artifact.
   * It extracts the word between the "/" character and the "." character.
   */
  let arrStrAnalyticPrivilegeName = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    arrAnalyticalPrivilegeFilepaths.join(";"),
    2
  );

  let arrObjFileStats = [];
  /**
   * Gos through all filepaths and returns the content of a file and stores it in a String.
   * Added to this file meta information from the filepath gets extracted like creation and modification time.
   */
  let arrStrXMLs = [];
  for (let i = 0; i < arrAnalyticalPrivilegeFilepaths.length; i++) {
    const strFilepath = arrAnalyticalPrivilegeFilepaths[i];
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
      let dictData = extractDataFromCalculationViewObject(objXML);
      return dictData;
    }
  });
  /**
   * Adds the file location of the file in the local directory and adds the previously gathered file metadata
   * to the directory of each element in the Array.
   */
  for (let i = 0; i < arrDictFileData.length; i++) {
    arrDictFileData[i]["ID"] = createUUID();
    arrDictFileData[i]["Name"] = arrStrAnalyticPrivilegeName[i];
    arrDictFileData[i]["ClusterName"] =
      arrStrAnalyticPrivilegeViewClusterName[i];
    arrDictFileData[i]["FileLocation"] = arrAnalyticalPrivilegeFilepaths[i];
    arrDictFileData[i]["RawStringXMLFile"] = arrStrXMLs[i];
  }
  return arrDictFileData;
}

/**
 * Function 1.2: Gets a JS object and extracts needed data. After that it returns a Dictonary of that extracted data.
 *
 * @param {Object} objXML
 * @return {Dictionary}
 */
function extractDataFromCalculationViewObject(objXML) {
  /** Creates the .analyticprivilege dictonary structure. */
  let dictAnalyticPrivilege = {
    XMLName: "",
    ID: createUUID(),
    PrivilegeType: "",
    XMLDateChanged: "",
    XMLDateCreated: "",
    CalculationViews: [],
    AttributeViews: [],
    Privilege: "",
    AccessControl: "",
  };

  /**
   * Checks if JS object contains the specifically requested information and if it does,
   * extracts the information and adds them to the Dictonary.
   */
  let objXMLDataObj = objXML["Privilege:analyticPrivilege"];
  /** Retrieve the name of the AnalyticPrivilege. */
  dictAnalyticPrivilege.XMLName =
    objXMLDataObj.descriptions["@_defaultDescription"] != null
      ? objXMLDataObj.descriptions["@_defaultDescription"]
      : "";
  /** Retrieve the ID of the AnalyticPrivilege. */
  dictAnalyticPrivilege.ID =
    objXMLDataObj["@_id"] != null ? objXMLDataObj["@_id"] : "";
  /** Retrieve the privilege type of the AnalyticPrivilege. */
  dictAnalyticPrivilege.PrivilegeType =
    objXMLDataObj["@_privilegeType"] != null
      ? objXMLDataObj["@_privilegeType"]
      : "";
  /** Retrieve the last modification date of the AnalyticPrivilege file. */
  dictAnalyticPrivilege.XMLDateChanged =
    objXMLDataObj.metadata != null ? objXMLDataObj.metadata["@_changedAt"] : "";
  /** Retrieve the creation date of the AnalyticPrivilege file. */
  dictAnalyticPrivilege.XMLDateCreated =
    objXMLDataObj.metadata != null ? objXMLDataObj.metadata["@_createdAt"] : "";
  /** Retrieve the privilege link of the AnalyticPrivilege. */
  dictAnalyticPrivilege.Privilege =
    objXMLDataObj["@_xmlns:Privilege"] != null
      ? objXMLDataObj["@_xmlns:Privilege"]
      : "";
  /** Retrieve the access control link of the AnalyticPrivilege. */
  dictAnalyticPrivilege.AccessControl =
    objXMLDataObj["@_xmlns:AccessControl"] != null
      ? objXMLDataObj["@_xmlns:AccessControl"]
      : "";

  /** Retrieve the CalculationViews and Attributes contained in the AnalyticPrivilege. */
  let arrDictCalculationViews = [];
  let arrDictAttributeViews = [];
  let arrObjXMLDataObjs =
    objXML["Privilege:analyticPrivilege"].securedModels.modelUri;
  /** Check if its an array of results or a single result and add the result to the Dictonary. */
  let strRegEx = /(\w+)\/\w+\/(\w+)$/im;
  if (Array.isArray(arrObjXMLDataObjs)) {
    for (let i = 0; i < arrObjXMLDataObjs.length; i++) {
      let strPath = arrObjXMLDataObjs[i];
      strPath = strPath.replaceAll(".", "/");
      if (strPath.includes("calculationviews")) {
        let dictCalculationViews = {
          ID: createUUID(),
          Name: getCapturingGroupFromRegEx(strRegEx, strPath, 2),
          ClusterName: getCapturingGroupFromRegEx(strRegEx, strPath, 1),
          Path: strPath,
        };
        arrDictCalculationViews.push(dictCalculationViews);
      } else if (strPath.includes("attributeviews")) {
        let dictAttributeViews = {
          ID: createUUID(),
          Name: getCapturingGroupFromRegEx(strRegEx, strPath, 2),
          ClusterName: getCapturingGroupFromRegEx(strRegEx, strPath, 1),
          Path: strPath,
        };
        arrDictAttributeViews.push(dictAttributeViews);
      }
    }
  } else if (arrObjXMLDataObjs != null) {
    arrObjXMLDataObjs = arrObjXMLDataObjs.replaceAll(".", "/");
    if (arrObjXMLDataObjs.includes("calculationviews")) {
      let dictCalculationViews = {
        ID: createUUID(),
        Name: getCapturingGroupFromRegEx(strRegEx, arrObjXMLDataObjs, 2),
        ClusterName: getCapturingGroupFromRegEx(strRegEx, arrObjXMLDataObjs, 1),
        Path: arrObjXMLDataObjs,
      };
      arrDictCalculationViews.push(dictCalculationViews);
    } else if (arrObjXMLDataObjs.includes("attributeviews")) {
      let dictAttributeViews = {
        ID: createUUID(),
        Name: getCapturingGroupFromRegEx(strRegEx, arrObjXMLDataObjs, 2),
        ClusterName: getCapturingGroupFromRegEx(strRegEx, arrObjXMLDataObjs, 1),
        Path: arrObjXMLDataObjs,
      };
      arrDictAttributeViews.push(dictAttributeViews);
    }
  }
  dictAnalyticPrivilege.CalculationViews = arrDictCalculationViews;
  dictAnalyticPrivilege.AttributeViews = arrDictAttributeViews;

  return dictAnalyticPrivilege;
}
