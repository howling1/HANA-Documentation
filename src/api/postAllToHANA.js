import { ODataBatch } from "odata-batch";

/** Section 1: post all data to HANA database */
/**
 * Function 1.1: Sends all data crawled from files to HANA in a POST request. HANA will then insert the data to
 * pre-defined tables.
 *
 * @export
 * @param {JSON Object} toPostData
 * @return {Promise}
 */
export function postAllToHANA(toPostData) {
  let calls = [];

  for (var [key, value] of Object.entries(toPostData)) {
    for (let i = 0; i < value.length; i++) {
      calls.push({
        method: "POST",
        url: key,
        data: value[i],
      });
    }
  }

  console.log(calls);

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
