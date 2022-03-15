async function apitest() {
  const response = await fetch(
    "https://gitlab.lrz.de/api/v4/projects/15760/repository/tree?private_token=glpat-cJXHRaeNY_gTx1T8FgfA&recursive=true&path=ui/proteomicsdb/db/models/api_v2&per_page=100"
  );
  const myJson = await response.json(); //extract JSON from the http response
  console.log(myJson);
}

apitest();
