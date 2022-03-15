import { ODataBatch } from "odata-batch";
import axios from "axios";

/** Section 1: clear tables of HANA database */
/**
 *Function 1.1: Send GET requests to all tables on our HANA system to get IDs of all entries
 *
 * @return {Json Object}
 */
async function getIDsFromTables() {
  let XSODataArtifacts = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/XSODataArtifacts?$select=XSODataArtifactID&$format=json"
  );
  let HDBRoles = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoles?$select=HDBRoleID&$format=json"
  );
  let CalculationViews = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/CalculationViews?$select=CalculationViewID&$format=json"
  );
  let Associations = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/Associations?$select=AssociationID&$format=json"
  );
  let XSODataArtifactToAssociation = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/XSODataArtifactToAssociation?$format=json"
  );
  let AnalyticalPriviledges = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/AnalyticalPriviledges?$select=AnalyticalPriviledgeID&$format=json"
  );
  let CatalogSchemas = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/CatalogSchemas?$select=CatalogSchemaID&$format=json"
  );
  let Packages = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/Packages?$select=PackageID&$format=json"
  );
  let HDBRoleToCatalogSchema = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoleToCatalogSchema?$format=json"
  );
  let HDBRoleToExtendedRole = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoleToExtendedRole?$format=json"
  );
  let HDBRoleToPackage = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoleToPackage?$format=json"
  );
  let AttributeViews = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/AttributeViews?$select=AttributeViewID&$format=json"
  );
  let AnalyticalPriviledgeToAttributeView = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/AnalyticalPriviledgeToAttributeView?$format=json"
  );
  let XSODataArtifactToPrincipalCV = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/XSODataArtifactToPrincipalCV?$format=json"
  );
  let XSODataArtifactToAssoDependentCV = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/XSODataArtifactToAssoDependentCV?$format=json"
  );
  let AnalyticalPrivilegeToCalculationView = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/AnalyticalPrivilegeToCalculationView?$format=json"
  );
  let PrincipalCVToConnectedCV = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/PrincipalCVToConnectedCV?$format=json"
  );
  let HDBRoleToCalculationView = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoleToCalculationView?$format=json"
  );
  let HDBRoleToAnalyticalPrivilege = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/HDBRoleToAnalyticalPrivilege?$format=json"
  );
  let XSODataArtifactToAssoOverCV = await axios.get(
    "http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/XSODataArtifactToAssoOverCV?$format=json"
  );

  return {
    XSODataArtifacts: XSODataArtifacts,
    Associations: Associations,
    XSODataArtifactToAssociation: XSODataArtifactToAssociation,
    HDBRoles: HDBRoles,
    CatalogSchemas: CatalogSchemas,
    HDBRoleToCatalogSchema: HDBRoleToCatalogSchema,
    Packages: Packages,
    HDBRoleToPackage: HDBRoleToPackage,
    CalculationViews: CalculationViews,
    AnalyticalPriviledges: AnalyticalPriviledges,
    AttributeViews: AttributeViews,
    AnalyticalPriviledgeToAttributeView: AnalyticalPriviledgeToAttributeView,
    XSODataArtifactToPrincipalCV: XSODataArtifactToPrincipalCV,
    XSODataArtifactToAssoDependentCV: XSODataArtifactToAssoDependentCV,
    XSODataArtifactToAssoOverCV: XSODataArtifactToAssoOverCV,
    HDBRoleToAnalyticalPrivilege: HDBRoleToAnalyticalPrivilege,
    HDBRoleToCalculationView: HDBRoleToCalculationView,
    HDBRoleToExtendedRole: HDBRoleToExtendedRole,
    PrincipalCVToConnectedCV: PrincipalCVToConnectedCV,
    AnalyticalPrivilegeToCalculationView: AnalyticalPrivilegeToCalculationView,
  };
}

/**
 *Function 1.2: Sends batch delete request to our HANA system to delete all entries of all tables
 *
 * @param {Array} calls
 * @return {Promise}
 */
function sendBatchDeleteReuqest(calls) {
  const headers = {
    "Accept-Charset": "utf-8",
  };

  const config = {
    url: `http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic/documentation_project/docuAPI.xsodata/$batch`,
    headers,
    calls,
  };

  let batchOperation = new ODataBatch(config);

  return new Promise((resolve, reject) => {
    batchOperation
      .send()
      .then(function (resp) {
        resolve(resp);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

/**
 *Function 1.3: Encapsulates delete requests in a single batch delete request and call request sending function
 *to send batch delete request to our HANA system
 *
 * @return {*}
 * @export
 */
export async function deleteAllFromHANA() {
  let calls = [];
  let tables = await getIDsFromTables();

  if (tables.XSODataArtifacts.data.d.results.length > 0) {
    for (let i = 0; i < tables.XSODataArtifacts.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "XSODataArtifacts('" +
          tables.XSODataArtifacts.data.d.results[i].XSODataArtifactID +
          "')",
      });
    }
  }

  if (tables.HDBRoles.data.d.results.length > 0) {
    for (let i = 0; i < tables.HDBRoles.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url: "HDBRoles('" + tables.HDBRoles.data.d.results[i].HDBRoleID + "')",
      });
    }
  }

  if (tables.CalculationViews.data.d.results.length > 0) {
    for (let i = 0; i < tables.CalculationViews.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "CalculationViews('" +
          tables.CalculationViews.data.d.results[i].CalculationViewID +
          "')",
      });
    }
  }

  if (tables.Associations.data.d.results.length > 0) {
    for (let i = 0; i < tables.Associations.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "Associations('" +
          tables.Associations.data.d.results[i].AssociationID +
          "')",
      });
    }
  }

  if (tables.XSODataArtifactToAssociation.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.XSODataArtifactToAssociation.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "XSODataArtifactToAssociation(" +
          "XSODataArtifactID='" +
          tables.XSODataArtifactToAssociation.data.d.results[i]
            .XSODataArtifactID +
          "',AssociationID='" +
          tables.XSODataArtifactToAssociation.data.d.results[i].AssociationID +
          "')",
      });
    }
  }

  if (tables.AnalyticalPriviledges.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.AnalyticalPriviledges.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "AnalyticalPriviledges('" +
          tables.AnalyticalPriviledges.data.d.results[i]
            .AnalyticalPriviledgeID +
          "')",
      });
    }
  }

  if (tables.CatalogSchemas.data.d.results.length > 0) {
    for (let i = 0; i < tables.CatalogSchemas.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "CatalogSchemas('" +
          tables.CatalogSchemas.data.d.results[i].CatalogSchemaID +
          "')",
      });
    }
  }

  if (tables.Packages.data.d.results.length > 0) {
    for (let i = 0; i < tables.Packages.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url: "Packages('" + tables.Packages.data.d.results[i].PackageID + "')",
      });
    }
  }

  if (tables.HDBRoleToCatalogSchema.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.HDBRoleToCatalogSchema.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "HDBRoleToCatalogSchema(" +
          "HDBRoleID='" +
          tables.HDBRoleToCatalogSchema.data.d.results[i].HDBRoleID +
          "',CatalogSchemaID='" +
          tables.HDBRoleToCatalogSchema.data.d.results[i].CatalogSchemaID +
          "')",
      });
    }
  }

  if (tables.HDBRoleToExtendedRole.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.HDBRoleToExtendedRole.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "HDBRoleToExtendedRole(" +
          "PrincipalHDBRoleID='" +
          tables.HDBRoleToExtendedRole.data.d.results[i].PrincipalHDBRoleID +
          "',ExtendedHDBRoleID='" +
          tables.HDBRoleToExtendedRole.data.d.results[i].ExtendedHDBRoleID +
          "')",
      });
    }
  }

  if (tables.HDBRoleToPackage.data.d.results.length > 0) {
    for (let i = 0; i < tables.HDBRoleToPackage.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "HDBRoleToPackage(" +
          "HDBRoleID='" +
          tables.HDBRoleToPackage.data.d.results[i].HDBRoleID +
          "',PackageID='" +
          tables.HDBRoleToPackage.data.d.results[i].PackageID +
          "')",
      });
    }
  }

  if (tables.AttributeViews.data.d.results.length > 0) {
    for (let i = 0; i < tables.AttributeViews.data.d.results.length; i++) {
      calls.push({
        method: "DELETE",
        url:
          "AttributeViews('" +
          tables.AttributeViews.data.d.results[i].AttributeViewID +
          "')",
      });
    }
  }

  if (tables.AnalyticalPriviledgeToAttributeView.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.AnalyticalPriviledgeToAttributeView.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "AnalyticalPriviledgeToAttributeView(" +
          "AnalyticalPriviledgeID='" +
          tables.AnalyticalPriviledgeToAttributeView.data.d.results[i]
            .AnalyticalPriviledgeID +
          "',AttributeViewID='" +
          tables.AnalyticalPriviledgeToAttributeView.data.d.results[i]
            .AttributeViewID +
          "')",
      });
    }
  }

  if (tables.XSODataArtifactToPrincipalCV.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.XSODataArtifactToPrincipalCV.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "XSODataArtifactToPrincipalCV(" +
          "XSODataArtifactID='" +
          tables.XSODataArtifactToPrincipalCV.data.d.results[i]
            .XSODataArtifactID +
          "',AssoPrincipalCVID='" +
          tables.XSODataArtifactToPrincipalCV.data.d.results[i]
            .AssoPrincipalCVID +
          "')",
      });
    }
  }

  if (tables.XSODataArtifactToAssoDependentCV.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.XSODataArtifactToAssoDependentCV.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "XSODataArtifactToAssoDependentCV(" +
          "XSODataArtifactID='" +
          tables.XSODataArtifactToAssoDependentCV.data.d.results[i]
            .XSODataArtifactID +
          "',AssoDependentCVID='" +
          tables.XSODataArtifactToAssoDependentCV.data.d.results[i]
            .AssoDependentCVID +
          "')",
      });
    }
  }

  if (tables.AnalyticalPrivilegeToCalculationView.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.AnalyticalPrivilegeToCalculationView.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "AnalyticalPrivilegeToCalculationView(" +
          "AnalyticalPivilegeID='" +
          tables.AnalyticalPrivilegeToCalculationView.data.d.results[i]
            .AnalyticalPivilegeID +
          "',CalculationViewID='" +
          tables.AnalyticalPrivilegeToCalculationView.data.d.results[i]
            .CalculationViewID +
          "')",
      });
    }
  }

  if (tables.PrincipalCVToConnectedCV.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.PrincipalCVToConnectedCV.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "PrincipalCVToConnectedCV(" +
          "PrincipalCVID='" +
          tables.PrincipalCVToConnectedCV.data.d.results[i].PrincipalCVID +
          "',ConnectedCVID='" +
          tables.PrincipalCVToConnectedCV.data.d.results[i].ConnectedCVID +
          "')",
      });
    }
  }

  if (tables.HDBRoleToCalculationView.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.HDBRoleToCalculationView.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "HDBRoleToCalculationView(" +
          "HDBRoleID='" +
          tables.HDBRoleToCalculationView.data.d.results[i].HDBRoleID +
          "',CalculationViewID='" +
          tables.HDBRoleToCalculationView.data.d.results[i].CalculationViewID +
          "')",
      });
    }
  }

  if (tables.HDBRoleToAnalyticalPrivilege.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.HDBRoleToAnalyticalPrivilege.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "HDBRoleToAnalyticalPrivilege(" +
          "HDBRoleID='" +
          tables.HDBRoleToAnalyticalPrivilege.data.d.results[i].HDBRoleID +
          "',AnalyticalPrivilegeID='" +
          tables.HDBRoleToAnalyticalPrivilege.data.d.results[i]
            .AnalyticalPrivilegeID +
          "')",
      });
    }
  }

  if (tables.XSODataArtifactToAssoOverCV.data.d.results.length > 0) {
    for (
      let i = 0;
      i < tables.XSODataArtifactToAssoOverCV.data.d.results.length;
      i++
    ) {
      calls.push({
        method: "DELETE",
        url:
          "XSODataArtifactToAssoOverCV(" +
          "XSODataArtifactID='" +
          tables.XSODataArtifactToAssoOverCV.data.d.results[i]
            .XSODataArtifactID +
          "',AssoOverCVID='" +
          tables.XSODataArtifactToAssoOverCV.data.d.results[i].AssoOverCVID +
          "')",
      });
    }
  }

  console.log(calls);

  if (calls.length == 0) {
    return "No data to delte";
  }

  try {
    return await sendBatchDeleteReuqest(calls);
  } catch (error) {
    if (error.toString() == "SyntaxError: Unexpected end of JSON input") {
      return "Successful delete";
    } else {
      return error.toString();
    }
  }
}
