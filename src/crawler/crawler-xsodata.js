/** Section 1: Extract data from .xsodata file */
import {
  getCapturingGroupFromGlobalRegEx,
  getArrayOfArrayIDsFromArrayOfStrings,
  getArrayPathsFromArrayStrings,
  createUUID,
} from "./crawler-helpfunctions.js";
import { getRawStringFileFromPath } from "./gitlab-api.js";

/**
 * Function 1.1: This function takes a file path to an .xsodatafile, extracts information
 * about XSODataArtifacts stores them in Diconaries
 * and returns the information in an Array of Diconaries
 *
 * @export
 * @param {String} strFilepath
 * @return {Array}
 */
export async function extractDataFromXSODataFile(strFilepath) {
  /** Get a String from the api.xsodata file. */
  let strXSODataFile = await getRawStringFileFromPath(strFilepath);

  /**
   * Clear string from comments, and replace all types of spaces like linebreaks, tabs, and multiple whitespaces in a row with a single space
   * for easier extraction with RegEx.
   */
  let strRegEx = /(\/\/.+\n)/gim;
  strXSODataFile = strXSODataFile.replace(strRegEx, " ");
  strRegEx = /\s+/gim;
  strXSODataFile = strXSODataFile.replace(strRegEx, " ");

  /**
   * Global RegEx String for extraction of all artifact data of the api.xsodata file.
   * As it is global all occurences of the described capturing groups are matched.
   */
  strRegEx =
    /"((?:\w+)(?:\.\w+)*\.(\w+)::(\w+))"\s?as\s?"(\w+)"\s?key\s?(?:\((.*?)\)|generate\slocal(.*?)parameters\svia\sentity)\s?(?:\s?navigates\s?\((.*?)\))?(.*?);/gim;
  /** Retrieve specific capturing groups from RegEx result object. */
  /**
   * Capturing group 1:
   * Retrieves the file path of CalulationView Artifact. Example of match: "proteomicsdb.db.models.api_v2.repository::Experiment".
   * The amount of folders, in this case combination of word and dots, before the "::" is not relevant with this RegEx.
   */
  let arrStrFilepaths = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    1
  );
  /**
   * Capturing group 2:
   * Retrieves word before the "::" of the filepath from capturing group 1, which is equal to the cluster name in our case.
   */
  let arrStrClusterNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    2
  );
  /**
   * Capturing group 3:
   * Retrieves word after the "::" of the filepath from capturing group 1, which is equal to the CulculationView name in our case.
   */
  let arrStrArtifactNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    3
  );
  /**
   * Capturing group 4:
   * Retrieves word after the "as" after filepath from capturing group 1,
   * which is equal to the exposed name of the CulculationView name in our case.
   */
  let arrStrArtifactExposedNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    4
  );
  /**
   * Capturing group 5:
   * Retrieves all words in the brackets after keyword "key" and capturing group 4,
   * which is equal to all IDs in a CulculationView in our case.
   */
  let arrStrArtifactKeys = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    5
  );
  /**
   * Capturing group 5:
   * Retrieves all words in the brackets after keyword "key generate local" and capturing group 4,
   * which is equal to all locally generated IDs in a CulculationView in our case.
   */
  let arrStrArtifactGeneratedLocalKeys = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    6
  );
  /**
   * Capturing group 7:
   * Retrieves strings between brackets after keyword "navigates" if keyword exists,
   * which is equal to the all navigations of the CulculationView in our case.
   */
  let arrStrArtifactNavis = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    7
  );
  /**
   * Capturing group 8:
   * Retrieves strings between last capturing group and the character ";" that closes an Artifact description,
   * which is equal to the all privileges of the CulculationView in our case.
   */
  let arrStrArtifactPrivileges = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    8
  );

  /** Go over results of capturing groups and modify result to make it easier to handle if necessary. */
  /** Replace "." and "::" with "/" to generate a real filepath. */
  arrStrFilepaths = getArrayPathsFromArrayStrings(arrStrFilepaths);
  /** Split keys into array with delimiter ",". */
  let arrArrStrArtifactGeneratedLocalKeys =
    getArrayOfArrayIDsFromArrayOfStrings(arrStrArtifactGeneratedLocalKeys);
  for (let i = 0; i < arrArrStrArtifactGeneratedLocalKeys.length; i++) {
    if (arrArrStrArtifactGeneratedLocalKeys[i] != null) {
      let arrElement = arrArrStrArtifactGeneratedLocalKeys[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrArrStrArtifactGeneratedLocalKeys[i] = arrElement;
    }
  }
  /** Split keys into array with delimiter ",". */
  let arrArrStrArtifactKeys =
    getArrayOfArrayIDsFromArrayOfStrings(arrStrArtifactKeys);
  for (let i = 0; i < arrArrStrArtifactKeys.length; i++) {
    if (arrArrStrArtifactKeys[i] != null) {
      let arrElement = arrArrStrArtifactKeys[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrArrStrArtifactKeys[i] = arrElement;
    }
  }
  /** Split navigations into array with delimiter "," and trim result String */
  for (let i = 0; i < arrStrArtifactNavis.length; i++) {
    if (arrStrArtifactNavis[i] != null) {
      let arrElement = arrStrArtifactNavis[i].split(",");
      for (let j = 0; j < arrElement.length; j++) {
        arrElement[j] = arrElement[j].trim();
        let dictNavigation = {
          ID: createUUID(),
          Navigations: arrElement[j],
        };
        arrElement[j] = dictNavigation;
      }
      arrStrArtifactNavis[i] = arrElement;
    }
  }
  /** Trim privileges Strings. */
  arrStrArtifactPrivileges = arrStrArtifactPrivileges.map(function (x) {
    if (x != null) {
      x = x.trim();
      return x;
    }
  });

  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  let arrArtifacts = [];
  for (let i = 0; i < arrStrFilepaths.length; i++) {
    let dictArtifact = {
      ID: createUUID(),
      Filepath: arrStrFilepaths[i],
      ClusterName: arrStrClusterNames[i],
      Name: arrStrArtifactNames[i],
      ExpoName: arrStrArtifactExposedNames[i],
      Keys: arrArrStrArtifactKeys[i],
      GeneratedLocalKeys: arrArrStrArtifactGeneratedLocalKeys[i],
      Navigates: arrStrArtifactNavis[i],
      Privileges: arrStrArtifactPrivileges[i],
      Associations: [],
    };
    arrArtifacts.push(dictArtifact);
  }

  /**
   * Global RegEx String for extraction of all association data of the api.xsodata file.
   * As it is global all occurences of the described capturing groups are matched.
   */
  strRegEx =
    /(association|association\svia\sparameters)\s?"(\w+)"\s?(principal|with\sreferential\sconstraint\sprincipal)\s?"(\w+)"\s?\((.*?)\)\s?multiplicity\s?"(\*|\d)"\s?dependent\s?"(\w+)"\s?\((.*?)\)\s?multiplicity\s?"(\*|\d)"\s?(?:over\s?"((?:\w+)(?:\.\w+)*\.(\w+)::(\w+))"\s?(principal|with\sreferential\sconstraint\sprincipal)\s?\((.*?)\)\s?dependent\s?\((.*?)\))?;/gim;
  /** Retrieve specific capturing groups from RegEx result object. */
  /**
   * Capturing group 1:
   * Retrieves association type from the beginning of each association,
   * in our case either "association" or "association via parameters".
   */
  let arrAssociationTypes = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    1
  );
  /**
   * Capturing group 2:
   * Retrieves word between the characters " after the first capturing group, which is in our case the association name.
   */
  let arrAssociationNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    2
  );
  /**
   * Capturing group 3:
   * Retrieves words after capturing group 2, which is in our case the principle type,
   * either just "principle" or "with referential contraint principle".
   */
  let arrAssociationPrincipalTypes = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    3
  );
  /**
   * Capturing group 4:
   * Retrieves word between the characters ", which is in our case the name of the principle calculation view.
   */
  let arrAssociationPrincipalCalculationViews =
    getCapturingGroupFromGlobalRegEx(strRegEx, strXSODataFile, 4);
  /**
   * Capturing group 5:
   * Retrieves words between brackets, which are in our case the IDs of the principle calculation view.
   */
  let arrAssociationPrincipalCalculationViewIDs =
    getCapturingGroupFromGlobalRegEx(strRegEx, strXSODataFile, 5);

  /**
   * Capturing group 6:
   * Retrieves character between characters ",
   * which are in our case the multiplicities of the principle calculation view.
   */
  let arrAssociationPrincipalMultiplicities = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    6
  );
  /**
   * Capturing group 7:
   * Retrieves word between the characters ", which is in our case the name of the dependent calculation view.
   */
  let arrAssociationDependentCalculationViews =
    getCapturingGroupFromGlobalRegEx(strRegEx, strXSODataFile, 7);
  /**
   * Capturing group 8:
   * Retrieves words between brackets, which are in our case the IDs of the dependent calculation view.
   */
  let arrAssociationDependentCalculationViewIDs =
    getCapturingGroupFromGlobalRegEx(strRegEx, strXSODataFile, 8);
  /**
   * Capturing group 9:
   * Retrieves character between characters ",
   * which are in our case the multiplicities of the dependent calculation view.
   */
  let arrAssociationDependentMultiplicities = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    9
  );
  /**
   * Capturing group 10:
   * Retrieves words and characters between characters " after keyword "over",
   * which are in our case the filepath of the connected calculation view via the keyword "over".
   */
  let arrOverAssociationCalculationViewPaths = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    10
  );
  /**
   * Capturing group 11:
   * Retrieves word before the "::" of the filepath from capturing group 10,
   * which are in our case the cluster name of the calculation view.
   */
  let arrOverAssociationCalculationViewClusters =
    getCapturingGroupFromGlobalRegEx(strRegEx, strXSODataFile, 11);
  /**
   * Capturing group 12:
   * Retrieves word after the "::" of the filepath from capturing group 10,
   * which are in our case the name of the calculation view.
   */
  let arrOverAssociationCalculationViewNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    12
  );
  /**
   * Capturing group 13:
   * Retrieves words after capturing group 2, which is in our case the principle type,
   * either just "principle" or "with referential contraint principle" of the connected CalculationView.
   */
  let arrOverAssociationPrincipalTypes = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    13
  );
  /**
   * Capturing group 14:
   * Retrieves words between brackets, which are in our case the IDs of the principle connected CalculationView.
   */
  let arrOverAssociationPrincipalIDs = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    14
  );
  /**
   * Capturing group 15:
   * Retrieves words between brackets, which are in our case the IDs of the dependent connected CalculationView.
   */
  let arrOverAssociationDependentIDs = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strXSODataFile,
    15
  );

  /** Go over results of capturing groups and modify result to make it easier to handle if necessary. */
  /** Split keys into array with delimiter ",". */
  arrAssociationPrincipalCalculationViewIDs =
    getArrayOfArrayIDsFromArrayOfStrings(
      arrAssociationPrincipalCalculationViewIDs
    );
  for (let i = 0; i < arrAssociationPrincipalCalculationViewIDs.length; i++) {
    if (arrAssociationPrincipalCalculationViewIDs[i] != null) {
      let arrElement = arrAssociationPrincipalCalculationViewIDs[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrAssociationPrincipalCalculationViewIDs[i] = arrElement;
    }
  }
  /** Split keys into array with delimiter ",". */
  arrAssociationDependentCalculationViewIDs =
    getArrayOfArrayIDsFromArrayOfStrings(
      arrAssociationDependentCalculationViewIDs
    );
  for (let i = 0; i < arrAssociationDependentCalculationViewIDs.length; i++) {
    if (arrAssociationDependentCalculationViewIDs[i] != null) {
      let arrElement = arrAssociationDependentCalculationViewIDs[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrAssociationDependentCalculationViewIDs[i] = arrElement;
    }
  }
  /** Split keys into array with delimiter ",". */
  arrOverAssociationPrincipalIDs = getArrayOfArrayIDsFromArrayOfStrings(
    arrOverAssociationPrincipalIDs
  );
  for (let i = 0; i < arrOverAssociationPrincipalIDs.length; i++) {
    if (arrOverAssociationPrincipalIDs[i] != null) {
      let arrElement = arrOverAssociationPrincipalIDs[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrOverAssociationPrincipalIDs[i] = arrElement;
    }
  }
  /** Split keys into array with delimiter ",". */
  arrOverAssociationDependentIDs = getArrayOfArrayIDsFromArrayOfStrings(
    arrOverAssociationDependentIDs
  );
  for (let i = 0; i < arrOverAssociationDependentIDs.length; i++) {
    if (arrOverAssociationDependentIDs[i] != null) {
      let arrElement = arrOverAssociationDependentIDs[i];
      for (let j = 0; j < arrElement.length; j++) {
        let dictKey = {
          ID: createUUID(),
          Key: arrElement[j],
        };
        arrElement[j] = dictKey;
      }
      arrOverAssociationDependentIDs[i] = arrElement;
    }
  }
  /** Split keys into array with delimiter ",". */
  arrOverAssociationCalculationViewPaths = getArrayPathsFromArrayStrings(
    arrOverAssociationCalculationViewPaths
  );

  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  let arrAssociations = [];
  for (let i = 0; i < arrAssociationNames.length; i++) {
    let dictAssociation = {
      ID: createUUID(),
      Type: arrAssociationTypes[i],
      Name: arrAssociationNames[i],
      PrincipalTypes: arrAssociationPrincipalTypes[i],
      PrincipalCalculationViewName: arrAssociationPrincipalCalculationViews[i],
      PrincipalCalculationViewIDs: arrAssociationPrincipalCalculationViewIDs[i],
      PrincipalMultiplicity: arrAssociationPrincipalMultiplicities[i],
      DependentCalculationViewName: arrAssociationDependentCalculationViews[i],
      DependentCalculationViewIDs: arrAssociationDependentCalculationViewIDs[i],
      DependentMultiplicity: arrAssociationDependentMultiplicities[i],
      OverCalculationViewPath: arrOverAssociationCalculationViewPaths[i],
      OverCalculationViewCluster: arrOverAssociationCalculationViewClusters[i],
      OverCalculationViewName: arrOverAssociationCalculationViewNames[i],
      OverPrincipalType: arrOverAssociationPrincipalTypes[i],
      OverPrincipalIDs: arrOverAssociationPrincipalIDs[i],
      OverDependentIDs: arrOverAssociationDependentIDs[i],
    };
    arrAssociations.push(dictAssociation);
  }

  /** Connect the crawled Artifact data with the crawled Association data. */
  arrArtifacts.map(function (dictArtifact) {
    arrAssociations.map(function (dictAssociation) {
      if (dictArtifact.Name == dictAssociation.PrincipalCalculationViewName) {
        dictArtifact.Associations.push(dictAssociation);
      }
    });
  });

  /** Returns the connected Artifact data and all Artifact filepaths for crawling specific .calcualtionview files later. */
  return arrArtifacts;
}
