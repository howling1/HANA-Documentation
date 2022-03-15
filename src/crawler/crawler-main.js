/** Section 1: extract data from all HANA artifact files. */
import { extractDataFromXSODataFile } from "./crawler-xsodata.js";
import { extractDataFromAllHdbroleFiles } from "./crawler-hdbrole.js";
import { extractDataFromAllCalculationViewFiles } from "./crawler-calculationview.js";
import { extractDataFromAllAnalyticalPrivilegeFiles } from "./crawler-analyticalprivilege.js";
import { getAllFilePathsFromProjectRepository } from "./gitlab-api.js";
import { getUniqueObjectArray } from "./crawler-helpfunctions.js";
/**
 * Function 1.1: extracts data from SAP Hana database structure like .xsodata file, .hdbrole files, .analiticprivilege files, and calculationview files
 * and stores them in to arrays of dictonary to send them in formatted and ordered form to a SAP Hana database. At the end this data will be used
 * to visualize connections between roles, calculation views and their clusters.
 */
export async function extractAllDataFromDatabaseFolder() {
  /** Retrieving all file paths of the repostitory folder structure */
  const jsonFilepaths = await getAllFilePathsFromProjectRepository();
  /** Realtive filepath to the api.xsodata file. */
  let strXSODataFilepath = "";
  for (let i = 0; i < jsonFilepaths.length; i++) {
    const strPath = jsonFilepaths[i].path;
    if (strPath.endsWith("api.xsodata")) {
      strXSODataFilepath = strPath;
    }
  }

  /** Extract all artifact data from api.xsodata file with their associations from given api.xsodata filepath. */
  await extractDataFromXSODataFile(strXSODataFilepath);

  /** Extract role data from all .hdbrole files in given directory folderpath. */
  await extractDataFromAllHdbroleFiles(jsonFilepaths);

  /** Extract calculation view data from all .calculationview files in given directory folderpath. */
  await extractDataFromAllCalculationViewFiles(jsonFilepaths);

  /** Extract analytic privilege data from all .analyticprivilege in given directory folderpath. */
  await extractDataFromAllAnalyticalPrivilegeFiles(jsonFilepaths);

  const promiseXSODataArtifacts =
    extractDataFromXSODataFile(strXSODataFilepath);
  const promiseHDBRoleFileData = extractDataFromAllHdbroleFiles(jsonFilepaths);
  const promiseCalculationViewFileData =
    extractDataFromAllCalculationViewFiles(jsonFilepaths);
  const promiseAnalyticalPrivilegeData =
    extractDataFromAllAnalyticalPrivilegeFiles(jsonFilepaths);

  const [
    arrDictXSODataArtifacts,
    arrDictHDBRoleFileData,
    arrDictCalculationViewFileData,
    arrDictAnalyticalPrivilegeData,
  ] = await Promise.all([
    promiseXSODataArtifacts,
    promiseHDBRoleFileData,
    promiseCalculationViewFileData,
    promiseAnalyticalPrivilegeData,
  ]);

  /** Connection XSODataArtifact To CalculationView */
  let arrDictConnXSOArtiToAssoPrincipalCV = [];
  for (let i = 0; i < arrDictXSODataArtifacts.length; i++) {
    const dictXSODataArtifact = arrDictXSODataArtifacts[i];
    for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
      const dictCalculationView = arrDictCalculationViewFileData[j];
      if (
        dictXSODataArtifact.Name == dictCalculationView.Name &&
        dictXSODataArtifact.ClusterName == dictCalculationView.ClusterName
      ) {
        arrDictConnXSOArtiToAssoPrincipalCV.push({
          XSODataArtifactID: dictXSODataArtifact.ID,
          AssoPrincipalCVID: dictCalculationView.ID,
        });
      }
    }
  }
  arrDictConnXSOArtiToAssoPrincipalCV = getUniqueObjectArray(
    arrDictConnXSOArtiToAssoPrincipalCV
  );

  /** Connection XSODataArtifact To DependentCalculationView */
  let arrDictConnXSOArtiToAssoDepCV = [];
  for (let i = 0; i < arrDictXSODataArtifacts.length; i++) {
    const dictXSODataArtifact = arrDictXSODataArtifacts[i];
    for (let x = 0; x < dictXSODataArtifact.Associations.length; x++) {
      const dictXSOAssoCV = dictXSODataArtifact.Associations[x];
      for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
        const dictCalculationView = arrDictCalculationViewFileData[j];
        if (
          dictXSOAssoCV.DependentCalculationViewName ==
            dictCalculationView.Name &&
          dictCalculationView.ClusterName != "_fundamentals"
        ) {
          arrDictConnXSOArtiToAssoDepCV.push({
            XSODataArtifactID: dictXSODataArtifact.ID,
            AssoDependentCVID: dictCalculationView.ID,
          });
        }
      }
    }
  }
  arrDictConnXSOArtiToAssoDepCV = getUniqueObjectArray(
    arrDictConnXSOArtiToAssoDepCV
  );

  /** Connection XSODataArtifact To OverCalculationView */
  let arrDictConnXSOArtiToAssoOverCV = [];
  for (let i = 0; i < arrDictXSODataArtifacts.length; i++) {
    const dictXSODataArtifact = arrDictXSODataArtifacts[i];
    for (let x = 0; x < dictXSODataArtifact.Associations.length; x++) {
      const dictXSOAssoCV = dictXSODataArtifact.Associations[x];
      for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
        const dictCalculationView = arrDictCalculationViewFileData[j];
        if (
          dictXSOAssoCV.OverCalculationViewName == dictCalculationView.Name &&
          dictXSOAssoCV.OverCalculationViewCluster ==
            dictCalculationView.ClusterName
        ) {
          arrDictConnXSOArtiToAssoOverCV.push({
            XSODataArtifactID: dictXSODataArtifact.ID,
            AssoOverCVID: dictCalculationView.ID,
          });
        }
      }
    }
  }
  arrDictConnXSOArtiToAssoOverCV = getUniqueObjectArray(
    arrDictConnXSOArtiToAssoOverCV
  );

  /** Connection HDBRole To AnalyticalPrivilege */
  let arrDictConnHDBRoleToAP = [];
  for (let i = 0; i < arrDictHDBRoleFileData.length; i++) {
    const dictHDBRole = arrDictHDBRoleFileData[i];
    for (let x = 0; x < dictHDBRole.AnalyticalPrivilegePaths.length; x++) {
      const dictHDBRoleAP = dictHDBRole.AnalyticalPrivilegePaths[x];
      for (let j = 0; j < arrDictAnalyticalPrivilegeData.length; j++) {
        const dictAnalyticalPrivilege = arrDictAnalyticalPrivilegeData[j];
        if (
          dictHDBRoleAP.Name == dictAnalyticalPrivilege.Name &&
          dictHDBRoleAP.ClusterName == dictAnalyticalPrivilege.ClusterName
        ) {
          arrDictConnHDBRoleToAP.push({
            HDBRoleID: dictHDBRole.ID,
            AnalyticalPrivilegeID: dictAnalyticalPrivilege.ID,
          });
        }
      }
    }
  }
  arrDictConnHDBRoleToAP = getUniqueObjectArray(arrDictConnHDBRoleToAP);

  /** Connection HDBRole To DesigneTimeObjects (CalculationViews) */
  let arrDictConnHDBRoleToCV = [];
  for (let i = 0; i < arrDictHDBRoleFileData.length; i++) {
    const dictHDBRole = arrDictHDBRoleFileData[i];
    for (let x = 0; x < dictHDBRole.DesignTimeObjects.length; x++) {
      const dictHDBRoleCV = dictHDBRole.DesignTimeObjects[x];
      for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
        const dictCalculationView = arrDictCalculationViewFileData[j];
        if (
          dictHDBRoleCV.Name == dictCalculationView.Name &&
          dictHDBRoleCV.ClusterName == dictCalculationView.ClusterName
        ) {
          arrDictConnHDBRoleToCV.push({
            HDBRoleID: dictHDBRole.ID,
            CalculationViewID: dictCalculationView.ID,
          });
        }
      }
    }
  }
  arrDictConnHDBRoleToCV = getUniqueObjectArray(arrDictConnHDBRoleToCV);

  /** Connection HDBRole To ExtendedHDBRole */
  let arrDictConnHDBRoleToExtendedHDBRole = [];
  for (let i = 0; i < arrDictHDBRoleFileData.length; i++) {
    const dictHDBRolePrncipal = arrDictHDBRoleFileData[i];
    for (let x = 0; x < dictHDBRolePrncipal.ExtendedRoles.length; x++) {
      const dictHDBRoleExtendRole = dictHDBRolePrncipal.ExtendedRoles[x];
      for (let j = 0; j < arrDictHDBRoleFileData.length; j++) {
        const dictHDBRole = arrDictHDBRoleFileData[j];
        if (
          dictHDBRoleExtendRole.Name == dictHDBRole.Name &&
          dictHDBRoleExtendRole.ClusterName == dictHDBRole.ClusterName
        ) {
          arrDictConnHDBRoleToExtendedHDBRole.push({
            PrincipalHDBRoleID: dictHDBRolePrncipal.ID,
            ExtendedHDBRoleID: dictHDBRole.ID,
          });
        }
      }
    }
  }
  arrDictConnHDBRoleToExtendedHDBRole = getUniqueObjectArray(
    arrDictConnHDBRoleToExtendedHDBRole
  );

  /** Connection CalculationView To CalculationView */
  let arrDictConnCvToCV = [];
  for (let i = 0; i < arrDictCalculationViewFileData.length; i++) {
    const dictCVPrncipal = arrDictCalculationViewFileData[i];
    for (let x = 0; x < dictCVPrncipal.Connections.length; x++) {
      const dictCVConnection = dictCVPrncipal.Connections[x];
      for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
        const dictCV = arrDictCalculationViewFileData[j];
        if (
          dictCVConnection.Name == dictCV.Name &&
          dictCVConnection.ClusterName == dictCV.ClusterName
        ) {
          arrDictConnCvToCV.push({
            PrincipalCVID: dictCVPrncipal.ID,
            ConnectedCVID: dictCV.ID,
          });
        }
      }
    }
  }
  arrDictConnCvToCV = getUniqueObjectArray(arrDictConnCvToCV);

  /** Connection AnalyticalPivilege To CalculationView */
  let arrDictConnAPToCV = [];
  for (let i = 0; i < arrDictAnalyticalPrivilegeData.length; i++) {
    const dictAP = arrDictAnalyticalPrivilegeData[i];
    for (let x = 0; x < dictAP.CalculationViews.length; x++) {
      const dictAPCV = dictAP.CalculationViews[x];
      for (let j = 0; j < arrDictCalculationViewFileData.length; j++) {
        const dictCV = arrDictCalculationViewFileData[j];
        if (
          dictAPCV.Name == dictCV.Name &&
          dictAPCV.ClusterName == dictCV.ClusterName
        ) {
          arrDictConnAPToCV.push({
            AnalyticalPivilegeID: dictAP.ID,
            CalculationViewID: dictCV.ID,
          });
        }
      }
    }
  }
  arrDictConnAPToCV = getUniqueObjectArray(arrDictConnAPToCV);

  return [
    arrDictXSODataArtifacts,
    arrDictHDBRoleFileData,
    arrDictCalculationViewFileData,
    arrDictAnalyticalPrivilegeData,
    arrDictConnXSOArtiToAssoPrincipalCV,
    arrDictConnXSOArtiToAssoDepCV,
    arrDictConnXSOArtiToAssoOverCV,
    arrDictConnHDBRoleToAP,
    arrDictConnHDBRoleToCV,
    arrDictConnHDBRoleToExtendedHDBRole,
    arrDictConnCvToCV,
    arrDictConnAPToCV,
  ];
}
