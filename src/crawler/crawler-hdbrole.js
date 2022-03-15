/** Section 1: Extract data from .hdbrole files. */
import {
  getCapturingGroupFromRegEx,
  getCapturingGroupFromGlobalRegEx,
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
export async function extractDataFromAllHdbroleFiles(arrJSONFileData) {
  /** Gets an array of all filepaths of files from type .hdbrole. */
  const arrStrRoleFileFilepaths = getFilepathFromFiletype(
    arrJSONFileData,
    ".hdbrole"
  );

  /**
   * Gos through all filepaths and returns the content of a file and stores it in a String.
   * Added to this file meta information from the filepath gets extracted like creation and modification time.
   */
  let arrStrRoleFileContents = [];
  for (let i = 0; i < arrStrRoleFileFilepaths.length; i++) {
    const strFilepath = arrStrRoleFileFilepaths[i];
    if (strFilepath != null) {
      let strFileContent = await getRawStringFileFromPath(strFilepath);
      arrStrRoleFileContents.push(strFileContent);
    }
  }
  /** Extracts data from each filecontent Strings in the Array and returns a Directory for each of them. */
  let arrDictRoleFileData = arrStrRoleFileContents.map(function (strFile) {
    if (strFile != null) {
      let dictFile = extractDataFromHdbroleFile(strFile);
      return dictFile;
    }
  });
  /**
   * Adds the file location of the file in the local directory and adds the previously gathered file metadata
   *  to the directory of each element in the Array.
   */
  for (let i = 0; i < arrDictRoleFileData.length; i++) {
    arrDictRoleFileData[i]["ID"] = createUUID();
    arrDictRoleFileData[i]["FileLocation"] = arrStrRoleFileFilepaths[i];
  }
  /** Returns an Array of Dictonaries for each .hdbrole file found in the given directoryfolderpath. */
  return arrDictRoleFileData;
}

/**
 * Function 1.2: takes a content string from a .hdbrole file and extracts data from it.
 * It returns the retreived Data, stored in a dictionary object.
 *
 * @param {string} strFile
 * @return {Dictonary}
 */
function extractDataFromHdbroleFile(strFile) {
  let strRegEx;
  /** Creates the .hdbrole dictonary structure. */
  let dictRole = {
    Filepath: "",
    ExtendedRoles: [],
    AnalyticalPrivilegePaths: [],
    ClusterName: "",
    Name: "",
    DesignTimeObjects: [],
    RunTimeObjects: [],
    SystemPrivileges: [],
    CatalogSchemas: [],
    Packages: [],
    RawFileString: "",
  };

  /**
   * Store the original string file format and content to possibly add as option
   * for the user to look at if he misses information of comments etc. that
   * dont get crawled by the RegEx crawler.
   */
  dictRole.RawFileString = strFile;

  /**
   * Clear string from comments, and replace all types of spaces like linebreaks, tabs, and multiple whitespaces in a row with a single space
   * for easier extraction with RegEx.
   */
  strRegEx = /(\/\/.+\n)/gim;
  strFile = strFile.replace(strRegEx, " ");
  strRegEx = /\s+/gim;
  strFile = strFile.replace(strRegEx, " ");

  /** Extract .hdbrole file basic information */
  /**
   * Capturing group 1:
   * Retrieves filepath of role Artifact.
   * The amount of folders, in this case combination of word and dots, before the "::" is not relevant with this RegEx.
   */
  strRegEx = /role\s((?:\w+)(?:\.\w+)*\.(\w+)::(\w+))/im;
  let strFilepath = getCapturingGroupFromRegEx(strRegEx, strFile, 1);
  /** Adds the crawled Information to the role Dictonary. */
  dictRole.Filepath = strFilepath;
  /**
   * Capturing group 2:
   * Retrieves word before the "::" of the filepath from capturing group 1, which is equal to the cluster name in our case.
   */
  let strClusterName = getCapturingGroupFromRegEx(strRegEx, strFile, 2);
  /** Adds the crawled Information to the role Dictonary. */
  dictRole.ClusterName = strClusterName;
  /**
   * Capturing group 3:
   * Retrieves word after the "::" of the filepath from capturing group 1, which is equal to the role name in our case.
   */
  let strRoleName = getCapturingGroupFromRegEx(strRegEx, strFile, 3);
  /** Adds the crawled Information to the role Dictonary. */
  dictRole.Name = strRoleName;

  /** Extractes extended roles. */
  strRegEx = /extends\srole\s(.*?){/im;
  /** Makes sure that the file contains extended roles. */
  let strExtendedRoles =
    strFile.match(strRegEx) == null ? "" : strFile.match(strRegEx)[1];
  let arrStrExtendedRolePaths = [];
  let arrStrExtendedRoleClusterNames = [];
  let arrStrExtendedRoleNames = [];
  if (strExtendedRoles) {
    /**
     * Capturing group 1:
     * Retrieves filepath of role Artifact.
     * The amount of folders, in this case combination of word and dots, before the "::" is not relevant with this RegEx.
     */
    strRegEx = /(\w+(?:\.\w+)*\.(\w+)::(\w+))\s?\,?\s?/gim;
    arrStrExtendedRolePaths = getCapturingGroupFromGlobalRegEx(
      strRegEx,
      strExtendedRoles,
      1
    );
    /**
     * Capturing group 2:
     * Retrieves word before the "::" of the filepath from capturing group 1, which is equal to the cluster name in our case.
     */
    arrStrExtendedRoleClusterNames = getCapturingGroupFromGlobalRegEx(
      strRegEx,
      strExtendedRoles,
      2
    );
    /**
     * Capturing group 3:
     * Retrieves word after the "::" of the filepath from capturing group 1, which is equal to the role name in our case.
     */
    arrStrExtendedRoleNames = getCapturingGroupFromGlobalRegEx(
      strRegEx,
      strExtendedRoles,
      3
    );

    /** Go over results of capturing groups and modify result to make it easier to handle if necessary. */
    /** Replace "." and "::" with "/" to generate a real filepath. */
    strRegEx = /(\.|::)/gim;
    arrStrExtendedRolePaths = arrStrExtendedRolePaths.map(function (x) {
      if (x != null) {
        x = x.replace(strRegEx, "/");
        return x;
      }
    });
  }
  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  if (arrStrExtendedRolePaths.length > 0) {
    let arrDictExtendedRoles = [];
    for (let i = 0; i < arrStrExtendedRolePaths.length; i++) {
      let dictExtendedRole = {
        ID: createUUID(),
        Path: arrStrExtendedRolePaths[i],
        ClusterName: arrStrExtendedRoleClusterNames[i],
        Name: arrStrExtendedRoleNames[i],
      };
      arrDictExtendedRoles.push(dictExtendedRole);
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.ExtendedRoles = arrDictExtendedRoles;
  }

  /** Extractes analytic privilege data. */
  strRegEx = /analytic\sprivilege\s?:\s(.*?)\;/im;
  /**
   * Capturing group 1:
   * Retrieves filepath of analytic privilege Artifact.
   * The amount of folders, in this case combination of word and dots, before the ":" is not relevant with this RegEx.
   */
  let strAnalyticalPrivilegePaths = getCapturingGroupFromRegEx(
    strRegEx,
    strFile,
    1
  );
  /**
   * Delete space characters like linebreaks tabs and whithespaces
   * Split the into an array with the delimiter ,
   */
  strRegEx = /(\s*)/gim;
  if (strAnalyticalPrivilegePaths) {
    strAnalyticalPrivilegePaths = strAnalyticalPrivilegePaths.replace(
      strRegEx,
      ""
    );
    let arrStrAnalyticalPrivilegePaths = strAnalyticalPrivilegePaths.split(",");
    /**
     * Modify path format to match normal filepath format with \ not . and :
     * except the last one because its the file type.
     */
    strRegEx = /:|[.](?=.*[.])/im;
    let strRegExNames = /(\w+):(\w+)./im;
    for (let i = 0; i < arrStrAnalyticalPrivilegePaths.length; i++) {
      if (arrStrAnalyticalPrivilegePaths[i] != null) {
        let dictAnalyticalPrivilege = {
          ID: createUUID(),
          Path: arrStrAnalyticalPrivilegePaths[i].replace(strRegEx, "/"),
          Name: getCapturingGroupFromRegEx(
            strRegExNames,
            arrStrAnalyticalPrivilegePaths[i],
            2
          ),
          ClusterName: getCapturingGroupFromRegEx(
            strRegExNames,
            arrStrAnalyticalPrivilegePaths[i],
            1
          ),
        };
        arrStrAnalyticalPrivilegePaths[i] = dictAnalyticalPrivilege;
      }
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.AnalyticalPrivilegePaths = arrStrAnalyticalPrivilegePaths;
  }

  /** Extractes all sql design time objects. */
  strRegEx =
    /(?:sql\sobject\s((?:\w+)(?:\.\w+)*\.(\w+):(\w+)\.\w+)\s?:(.*?)\;)/gim;
  /**
   * Capturing group 1:
   * Retrieves filepath of analytic privilege Artifact.
   * The amount of folders, in this case combination of word and dots, before the ":" is not relevant with this RegEx.
   */
  let arrStrDTOPaths = getCapturingGroupFromGlobalRegEx(strRegEx, strFile, 1);
  /**
   * Capturing group 2:
   * Retrieves word before the ":" of the filepath from capturing group 1, which is equal to the cluster name in our case.
   */
  let arrStrDTOClusterNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    2
  );
  /**
   * Capturing group 3:
   * Retrieves word after the ":" of the filepath from capturing group 1, which is equal to the analytic privilege role name in our case.
   */
  let arrStrDTOArtifactNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    3
  );
  /**
   * Capturing group 4:
   * Retrieves strings between last capturing group and the character ";" that closes an Artifact description,
   * which is equal to the all privileges of the analytic privilege role in our case.
   */
  let arrStrDTOPrivelages = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    4
  );
  /**
   * Modify path format to match normal filepath format with \ not . and :
   * except the last one because its the file type
   */
  strRegEx = /:|[.](?=.*[.])/gim;
  arrStrDTOPaths = arrStrDTOPaths.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "/");
      return x;
    }
  });
  /**
   * Delete space characters like linebreaks tabs and whithespaces
   * Split the into an array with the delimiter ,
   */
  strRegEx = /(\s*)/gim;
  arrStrDTOPrivelages = arrStrDTOPrivelages.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "");
      return x;
    }
  });
  for (let i = 0; i < arrStrDTOPrivelages.length; i++) {
    if (arrStrDTOPrivelages[i] != null) {
      let arrElement = arrStrDTOPrivelages[i].split(",");
      for (let j = 0; j < arrElement.length; j++) {
        arrElement[j] = arrElement[j].trim();
        let dictPivilege = {
          ID: createUUID(),
          Privilege: arrElement[j],
        };
        arrElement[j] = dictPivilege;
      }
      arrStrDTOPrivelages[i] = arrElement;
    }
  }
  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  if (arrStrDTOPaths.length > 0) {
    let arrDictDesignTimeObjects = [];
    for (let i = 0; i < arrStrDTOPaths.length; i++) {
      let dictDesignTimeObject = {
        ID: createUUID(),
        Path: arrStrDTOPaths[i],
        ClusterName: arrStrDTOClusterNames[i],
        Name: arrStrDTOArtifactNames[i],
        Privelages: arrStrDTOPrivelages[i],
      };
      arrDictDesignTimeObjects.push(dictDesignTimeObject);
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.DesignTimeObjects = arrDictDesignTimeObjects;
  }

  /** Extractes all sql run time objects. */
  strRegEx = /(?:catalog\ssql\sobject\s"(\w+)"\."(\w+)"\s?:(.*?)\;)/gim;
  /**
   * Capturing group 1:
   * Retrieves word between the characters " after after the keyword "catalog sql obect", which is in our case the database schema of the sql run time object.
   */
  let arrStrRTODBSchemaNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    1
  );
  /**
   * Capturing group 2:
   * Retrieves word between the characters " after after capturing group 1, which is in our case the database table of the sql run time object.
   */
  let arrStrRTODBTableNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    2
  );
  /**
   * Capturing group 3:
   * Retrieves strings between last capturing group and the character ";" that closes an Artifact description,
   * which is equal to the all privileges of the sql run time object in our case.
   */
  let arrStrRTOPrivelages = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    3
  );
  /**
   * Delete space characters like linebreaks tabs and whithespaces
   * Split the into an array with the delimiter ,
   */
  strRegEx = /(\s*)/gim;
  arrStrRTOPrivelages = arrStrRTOPrivelages.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "");
      return x;
    }
  });
  for (let i = 0; i < arrStrRTOPrivelages.length; i++) {
    if (arrStrRTOPrivelages[i] != null) {
      let arrElement = arrStrRTOPrivelages[i].split(",");
      for (let j = 0; j < arrElement.length; j++) {
        arrElement[j] = arrElement[j].trim();
        let dictPivilege = {
          ID: createUUID(),
          Privilege: arrElement[j],
        };
        arrElement[j] = dictPivilege;
      }
      arrStrRTOPrivelages[i] = arrElement;
    }
  }
  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  if (arrStrRTODBSchemaNames.length > 0) {
    let arrDictRunTimeObjects = [arrStrRTODBSchemaNames.length];
    for (let i = 0; i < arrStrRTODBSchemaNames.length; i++) {
      let dictRunTimeObject = {
        ID: createUUID(),
        DBSchemaName: arrStrRTODBSchemaNames[i],
        DBTableName: arrStrRTODBTableNames[i],
        Privelages: arrStrRTOPrivelages[i],
      };
      arrDictRunTimeObjects.push(dictRunTimeObject);
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.RunTimeObjects = arrDictRunTimeObjects;
  }

  /** Extractes all package objects. */
  strRegEx = /package\s(\w+)\s?:(.*?);/gim;
  /**
   * Capturing group 1:
   * Retrieves content between the characters " after after the keyword "package", which is in our case the name of the package.
   */
  let arrStrPackageNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    1
  );
  /**
   * Capturing group 2:
   * Retrieves strings between the character ":" and the character ";" that closes an package description,
   * which is equal to the all privileges of the package object in our case.
   */
  let arrStrPackagePrivileges = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    2
  );
  /**
   * Delete space characters like linebreaks tabs and whithespaces
   * Split the into an array with the delimiter ,
   */
  strRegEx = /(\s*)/gim;
  arrStrPackagePrivileges = arrStrPackagePrivileges.map(function (x) {
    if (x != null) {
      x = x.replace(strRegEx, "");
      return x;
    }
  });
  for (let i = 0; i < arrStrPackagePrivileges.length; i++) {
    if (arrStrPackagePrivileges[i] != null) {
      let arrElement = arrStrPackagePrivileges[i].split(",");
      for (let j = 0; j < arrElement.length; j++) {
        arrElement[j] = arrElement[j].trim();
        let dictPivilege = {
          ID: createUUID(),
          Privilege: arrElement[j],
        };
        arrElement[j] = dictPivilege;
      }
      arrStrPackagePrivileges[i] = arrElement;
    }
  }
  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  if (arrStrPackageNames.length > 0) {
    let arrDictPackages = [];
    for (let i = 0; i < arrStrPackageNames.length; i++) {
      let dictPackage = {
        ID: createUUID(),
        Name: arrStrPackageNames[i],
        Privileges: arrStrPackagePrivileges[i],
      };
      arrDictPackages.push(dictPackage);
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.Packages = arrDictPackages;
  }

  /** Extractes all catalog schema objects. */
  strRegEx = /catalog\sschema\s?"(\w+)"\s?:(.*?);/gim;
  /**
   * Capturing group 1:
   * Retrieves content between the characters " after after the keyword "catalog schema", which is in our case the name of the database.
   */
  let arrStrCatalogSchemasDBNames = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    1
  );
  /**
   * Capturing group 2:
   * Retrieves strings between the character ":" and the character ";" that closes an catalog schema description,
   * which is equal to the all privileges of the catalog schema object in our case.
   */
  let arrStrCatalogSchemasPrivileges = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    2
  );
  /**
   * Delete space characters like linebreaks tabs and whithespaces
   * Split the into an array with the delimiter ,
   */
  strRegEx = /(\s*)/gim;
  arrStrCatalogSchemasPrivileges = arrStrCatalogSchemasPrivileges.map(function (
    x
  ) {
    if (x != null) {
      x = x.replace(strRegEx, "");
      return x;
    }
  });
  for (let i = 0; i < arrStrCatalogSchemasPrivileges.length; i++) {
    if (arrStrCatalogSchemasPrivileges[i] != null) {
      let arrElement = arrStrCatalogSchemasPrivileges[i].split(",");
      for (let j = 0; j < arrElement.length; j++) {
        arrElement[j] = arrElement[j].trim();
        let dictPivilege = {
          ID: createUUID(),
          Privilege: arrElement[j],
        };
        arrElement[j] = dictPivilege;
      }
      arrStrCatalogSchemasPrivileges[i] = arrElement;
    }
  }
  /**
   * Create an array of dictionaries.
   * One artifact is represented by one dictonary in the array that holds all crawled data from above.
   */
  if (arrStrCatalogSchemasDBNames.length > 0) {
    let arrDictCatalogSchemas = [];
    for (let i = 0; i < arrStrCatalogSchemasDBNames.length; i++) {
      let dictCatalogSchema = {
        ID: createUUID(),
        DatabaseName: arrStrCatalogSchemasDBNames[i],
        Privileges: arrStrCatalogSchemasPrivileges[i],
      };
      arrDictCatalogSchemas.push(dictCatalogSchema);
    }
    /** Adds the crawled Information to the role Dictonary. */
    dictRole.CatalogSchemas = arrDictCatalogSchemas;
  }

  /** Extractes all system privilege objects. */
  strRegEx = /system\sprivilege\s?:(.*?);/gim;
  /**
   * Capturing group 1:
   * Retrieves strings between the character ":" and the character ";" that closes an system privilege description,
   * which is equal to the all privileges of the system privilege object in our case.
   */
  let arrStrSYSPrivileges = getCapturingGroupFromGlobalRegEx(
    strRegEx,
    strFile,
    1
  );
  for (let i = 0; i < arrStrSYSPrivileges.length; i++) {
    if (arrStrSYSPrivileges[i] != null) {
      let dictSYSPrivilege = {
        ID: createUUID(),
        Privileges: arrStrSYSPrivileges[i].trim(),
      };
      arrStrSYSPrivileges[i] = dictSYSPrivilege;
    }
  }
  /** Adds the crawled Information to the role Dictonary. */
  dictRole.SystemPrivileges = arrStrSYSPrivileges;

  return dictRole;
}
