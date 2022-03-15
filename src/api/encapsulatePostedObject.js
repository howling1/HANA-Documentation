/** Section 1: main function to encapsulate the crawled data */
/**
 *Function 1.1: encapsulates necessary data from crawled data to a JSON object that matchs the
 *format of the pre-defined table on our HANA
 *
 * @export
 * @param {Array} crawledData
 * @return {Json Obejct}
 */
export function encapsulatePostedObject(crawledData) {
  // traverse xso artifacts and its array attributes
  let traverseXSOArtifactsResult = traverseXSOArtifacts(crawledData[0]);

  // traverse hdb roles and its array attributes
  let traverseHDBRolesResult = traverseHDBRoles(crawledData[1]);

  // traverse calculation views and its array attributes
  let traverseCalculationViewsResult = traverseCalculationViews(crawledData[2]);

  // traverse analytical priviledges
  let traverseAnalyticalPriviledgesResult = traverseAnalyticalPriviledges(
    crawledData[3]
  );

  return {
    XSODataArtifacts: traverseXSOArtifactsResult[0],
    Associations: traverseXSOArtifactsResult[1],
    XSODataArtifactToAssociation: traverseXSOArtifactsResult[2],
    HDBRoles: traverseHDBRolesResult[0],
    CatalogSchemas: traverseHDBRolesResult[1],
    HDBRoleToCatalogSchema: traverseHDBRolesResult[2],
    Packages: traverseHDBRolesResult[3],
    HDBRoleToPackage: traverseHDBRolesResult[4],
    CalculationViews: traverseCalculationViewsResult,
    AnalyticalPriviledges: traverseAnalyticalPriviledgesResult[0],
    AttributeViews: traverseAnalyticalPriviledgesResult[1],
    AnalyticalPriviledgeToAttributeView: traverseAnalyticalPriviledgesResult[2],
    XSODataArtifactToPrincipalCV: crawledData[4],
    XSODataArtifactToAssoDependentCV: crawledData[5],
    XSODataArtifactToAssoOverCV: crawledData[6],
    HDBRoleToAnalyticalPrivilege: crawledData[7],
    HDBRoleToCalculationView: crawledData[8],
    HDBRoleToExtendedRole: crawledData[9],
    PrincipalCVToConnectedCV: crawledData[10],
    AnalyticalPrivilegeToCalculationView: crawledData[11],
  };
}

/** Section 2: traverse to encapusulate crawled data from .xsodata file*/
/**
 *Function 2.1: Traverses all XSO data artifacts crawled from files to extract necessary data for tables
 *on our HANA system
 *
 * @param {Array} xsoArtifacts
 * @return {Array}
 */
function traverseXSOArtifacts(xsoArtifacts) {
  let toPostXSADataArtifacts = [];
  let toPostAssociations = [];
  let toPostXSODataArtifactToAssoication = [];

  for (let i = 0; i < xsoArtifacts.length; i++) {
    let GeneratedLocalKeysString = "";
    let KeysString = "";

    if (typeof xsoArtifacts[i].GeneratedLocalKeys != "undefined") {
      for (let j = 0; j < xsoArtifacts[i].GeneratedLocalKeys.length; j++) {
        GeneratedLocalKeysString += xsoArtifacts[i].GeneratedLocalKeys[j].Key;
        if (j < xsoArtifacts[i].GeneratedLocalKeys.length - 1) {
          GeneratedLocalKeysString += ",";
        }
      }
    }

    if (typeof xsoArtifacts[i].Keys != "undefined") {
      for (let j = 0; j < xsoArtifacts[i].Keys.length; j++) {
        KeysString += xsoArtifacts[i].Keys[j].Key;
        if (j < xsoArtifacts[i].Keys.length - 1) {
          KeysString += ",";
        }
      }
    }

    toPostXSADataArtifacts.push({
      XSODataArtifactID: xsoArtifacts[i].ID,
      ClusterName: xsoArtifacts[i].ClusterName,
      ExpoName: xsoArtifacts[i].ExpoName,
      Filepath: xsoArtifacts[i].Filepath,
      GeneratedLocalKeys: GeneratedLocalKeysString,
      Keys: KeysString,
      Name: xsoArtifacts[i].Name,
      Priviledges: xsoArtifacts[i].Privileges,
    });

    traverseAssociations(
      xsoArtifacts[i].ID,
      xsoArtifacts[i].Associations,
      toPostAssociations,
      toPostXSODataArtifactToAssoication
    );
  }

  return [
    toPostXSADataArtifacts,
    toPostAssociations,
    toPostXSODataArtifactToAssoication,
  ];
}

/**
 *Function 2.2: Traverses all associations included in XSO data artifacts crawled from files to extract
 *necessary data for tables on our HANA system
 * @param {String} xsoDataArtifactID
 * @param {Array} associations
 * @param {Array} toPostAssociations
 * @param {Array} toPostXSODataArtifactToAssoication
 */
function traverseAssociations(
  xsoDataArtifactID,
  associations,
  toPostAssociations,
  toPostXSODataArtifactToAssoication
) {
  for (let i = 0; i < associations.length; i++) {
    let DependentCalculationViewArttributesString = "";
    let PrincipalCalculationViewArttributesString = "";
    let OverDependentArttributesString = "";
    let OverPrincipalArttributesString = "";

    if (typeof associations[i].DependentCalculationViewIDs != "undefined") {
      for (
        let j = 0;
        j < associations[i].DependentCalculationViewIDs.length;
        j++
      ) {
        DependentCalculationViewArttributesString +=
          associations[i].DependentCalculationViewIDs[j].Key;
        if (j < associations[i].DependentCalculationViewIDs.length - 1) {
          DependentCalculationViewArttributesString += ",";
        }
      }
    }

    if (typeof associations[i].PrincipalCalculationViewIDs != "undefined") {
      for (
        let j = 0;
        j < associations[i].PrincipalCalculationViewIDs.length;
        j++
      ) {
        PrincipalCalculationViewArttributesString +=
          associations[i].PrincipalCalculationViewIDs[j].Key;
        if (j < associations[i].PrincipalCalculationViewIDs.length - 1) {
          PrincipalCalculationViewArttributesString += ",";
        }
      }
    }

    if (typeof associations[i].OverDependentIDs != "undefined") {
      for (let j = 0; j < associations[i].OverDependentIDs.length; j++) {
        OverDependentArttributesString +=
          associations[i].OverDependentIDs[j].Key;
        if (j < associations[i].OverDependentIDs.length - 1) {
          OverDependentArttributesString += ",";
        }
      }
    }

    if (typeof associations[i].OverPrincipalIDs != "undefined") {
      for (let j = 0; j < associations[i].OverPrincipalIDs.length; j++) {
        OverPrincipalArttributesString +=
          associations[i].OverPrincipalIDs[j].Key;
        if (j < associations[i].OverPrincipalIDs.length - 1) {
          OverPrincipalArttributesString += ",";
        }
      }
    }

    toPostAssociations.push({
      AssociationID: associations[i].ID,
      DependentCalculationViewArttributes:
        DependentCalculationViewArttributesString,
      DependentCalculationViewName:
        associations[i].DependentCalculationViewName,
      DependentMultiplicity: associations[i].DependentMultiplicity,
      Name: associations[i].Name,
      OverCalculationViewCluster:
        typeof associations[i].OverCalculationViewCluster != "undefined"
          ? associations[i].OverCalculationViewCluster
          : "",
      OverCalculationViewName:
        typeof associations[i].OverCalculationViewName != "undefined"
          ? associations[i].OverCalculationViewName
          : "",
      OverCalculationViewPath:
        typeof associations[i].OverCalculationViewPath != "undefined"
          ? associations[i].OverCalculationViewPath
          : "",
      OverDependentArttributes: OverDependentArttributesString,
      OverPrincipalArttributes: OverPrincipalArttributesString,
      OverPrincipalType:
        typeof associations[i].OverPrincipalType != "undefined"
          ? associations[i].OverPrincipalType
          : "",
      PrincipalCalculationViewArttributes:
        PrincipalCalculationViewArttributesString,
      PrincipalCalculationViewName:
        associations[i].PrincipalCalculationViewName,
      PrincipalMultiplicity: associations[i].PrincipalMultiplicity,
      PrincipalTypes: associations[i].PrincipalTypes,
      Type: associations[i].Type,
    });

    toPostXSODataArtifactToAssoication.push({
      XSODataArtifactID: xsoDataArtifactID,
      AssociationID: associations[i].ID,
    });
  }
}

/** Section 3: traverse to encapusulate crawled data from .hdbrole file*/
/**
 *Function 3.1: Traverses all roles crawled from files to extract necessary data for tables on our HANA system
 *
 * @param {Array} HDBRoles
 * @return {Array}
 */
function traverseHDBRoles(HDBRoles) {
  let toPostHDBRoles = [];
  let toPostCatalogSchemas = [];
  let toPostHDBRoleToCatalogSchema = [];
  let toPostPackages = [];
  let toPostHDBRoleToPackage = [];

  for (let i = 0; i < HDBRoles.length; i++) {
    toPostHDBRoles.push({
      HDBRoleID: HDBRoles[i].ID,
      ClusterName: HDBRoles[i].ClusterName,
      FileLocation: HDBRoles[i].FileLocation,
      Filepath: HDBRoles[i].Filepath,
      Name: HDBRoles[i].Name,
    });

    traverseCatalogSchemas(
      HDBRoles[i].ID,
      HDBRoles[i].CatalogSchemas,
      toPostCatalogSchemas,
      toPostHDBRoleToCatalogSchema
    );
    traversePackages(
      HDBRoles[i].ID,
      HDBRoles[i].Packages,
      toPostPackages,
      toPostHDBRoleToPackage
    );
  }

  return [
    toPostHDBRoles,
    toPostCatalogSchemas,
    toPostHDBRoleToCatalogSchema,
    toPostPackages,
    toPostHDBRoleToPackage,
  ];
}

/**
 *Function 3.2: Traverses all packages included in roles crawled from files to extract necessary data for tables
 *on our HANA system
 *
 * @param {String} HDBRoleID
 * @param {Array} Packages
 * @param {Array} toPostPackages
 * @param {Array} toPostHDBRoleToPackage
 */
function traversePackages(
  HDBRoleID,
  Packages,
  toPostPackages,
  toPostHDBRoleToPackage
) {
  for (let i = 0; i < Packages.length; i++) {
    let PriviledgesString = "";

    // traverse privileges and concatenate as a whole
    for (let j = 0; j < Packages[i].Privileges.length; j++) {
      PriviledgesString += Packages[i].Privileges[j].Privilege;
      if (j < Packages[i].Privileges.length - 1) {
        PriviledgesString += ",";
      }
    }

    toPostPackages.push({
      PackageID: Packages[i].ID,
      Name: Packages[i].Name,
      Priviledges: PriviledgesString,
    });

    toPostHDBRoleToPackage.push({
      HDBRoleID: HDBRoleID,
      PackageID: Packages[i].ID,
    });
  }
}

/**
 *Function 3.3: Traverses all catalog schemas included in roles crawled from files to extract necessary
 *data for tables on our HANA system
 *
 * @param {String} HDBRoleID
 * @param {Array} CatalogSchemas
 * @param {Array} toPostCatalogSchemas
 * @param {Array} toPostHDBRoleToCatalogSchema
 */
function traverseCatalogSchemas(
  HDBRoleID,
  CatalogSchemas,
  toPostCatalogSchemas,
  toPostHDBRoleToCatalogSchema
) {
  for (let i = 0; i < CatalogSchemas.length; i++) {
    let PriviledgesString = "";

    // traverse privileges and concatenate as a whole
    for (let j = 0; j < CatalogSchemas[i].Privileges.length; j++) {
      PriviledgesString += CatalogSchemas[i].Privileges[j].Privilege;
      if (j < CatalogSchemas[i].Privileges.length - 1) {
        PriviledgesString += ",";
      }
    }

    toPostCatalogSchemas.push({
      CatalogSchemaID: CatalogSchemas[i].ID,
      DatabaseName: CatalogSchemas[i].DatabaseName,
      Priviledges: PriviledgesString,
    });

    toPostHDBRoleToCatalogSchema.push({
      HDBRoleID: HDBRoleID,
      CatalogSchemaID: CatalogSchemas[i].ID,
    });
  }
}

/** Section 4: traverse to encapusulate crawled data from .calculationview file*/
/**
 *Function 4.1: Traverses all calculation views crawled from files to extract necessary data for tables on our
 *HANA system
 *
 * @param {Array} CalculationViews
 * @return {Array}
 */
function traverseCalculationViews(CalculationViews) {
  let toPostCalculationViews = [];

  for (let i = 0; i < CalculationViews.length; i++) {
    let AttributesString = "";

    // traverse all attributes and concatenate as a string
    for (let j = 0; j < CalculationViews[i].Attributes.length; j++) {
      AttributesString += CalculationViews[i].Attributes[j].AttributeID;
      if (j < CalculationViews[i].Attributes.length - 1) {
        AttributesString += ",";
      }
    }

    toPostCalculationViews.push({
      CalculationViewID: CalculationViews[i].ID,
      Attributes: AttributesString,
      ClusterName: CalculationViews[i].ClusterName,
      Name: CalculationViews[i].Name,
    });
  }

  return toPostCalculationViews;
}

/** Section 5: traverse to encapusulate crawled data from .analyticprivilege file*/
/**
 *Function 5.1: Traverses all analytical privilege artifacts crawled from files to
 *extract necessary data required for tables on our HANA system
 *
 * @param {Array} AnalyticalPriviledges
 * @return {Array}
 */
function traverseAnalyticalPriviledges(AnalyticalPriviledges) {
  let toPostAnalyticalPriviledges = [];
  let toPostAttributeViews = [];
  let toPostAnalyticalPriviledgeToAttributeView = [];

  for (let i = 0; i < AnalyticalPriviledges.length; i++) {
    toPostAnalyticalPriviledges.push({
      AnalyticalPriviledgeID: AnalyticalPriviledges[i].ID,
      AccessControl: AnalyticalPriviledges[i].AccessControl,
      ClusterName: AnalyticalPriviledges[i].ClusterName,
      FileLocation: AnalyticalPriviledges[i].FileLocation,
      Name: AnalyticalPriviledges[i].Name,
      Priviledge: AnalyticalPriviledges[i].Priviledge,
      PriviledgeType: AnalyticalPriviledges[i].PriviledgeType,
      XMLDateChanged: AnalyticalPriviledges[i].XMLDateChanged,
      XMLDateCreated: AnalyticalPriviledges[i].XMLDateCreated,
      XMLName: AnalyticalPriviledges[i].XMLName,
    });

    traverseAttributeViews(
      AnalyticalPriviledges[i].ID,
      AnalyticalPriviledges[i].AttributeViews,
      toPostAttributeViews,
      toPostAnalyticalPriviledgeToAttributeView
    );
  }

  return [
    toPostAnalyticalPriviledges,
    toPostAttributeViews,
    toPostAnalyticalPriviledgeToAttributeView,
  ];
}

/**
 *Function 5.2: Traverses attribute views included in all of crawled analytical privilege artifacts to extract
 *necessary data for tables on our HANA system
 *
 * @param {String} AnalyticalPriviledgeID
 * @param {Array} AttributeViews
 * @param {Array} toPostAttributeViews
 * @param {Array} toPostAnalyticalPriviledgeToAttributeView
 */
function traverseAttributeViews(
  AnalyticalPriviledgeID,
  AttributeViews,
  toPostAttributeViews,
  toPostAnalyticalPriviledgeToAttributeView
) {
  for (let i = 0; i < AttributeViews.length; i++) {
    toPostAttributeViews.push({
      AttributeViewID: AttributeViews[i].ID,
      ClusterName: AttributeViews[i].ClusterName,
      Name: AttributeViews[i].Name,
      Path: AttributeViews[i].Path,
    });

    toPostAnalyticalPriviledgeToAttributeView.push({
      AnalyticalPriviledgeID: AnalyticalPriviledgeID,
      AttributeViewID: AttributeViews[i].ID,
    });
  }
}
