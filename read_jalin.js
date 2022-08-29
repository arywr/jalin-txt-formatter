const dir = "./upload/";
const fs = require("fs");
const xlsx = require("xlsx");
const readline = require("readline");
const moment = require("moment");
const {
  mappingNormalColumns,
  mappingDisputeColumns,
} = require("./helpers/format");

let trx = {
  acq: {
    normal: [],
    dispute: [],
  },
  iss: {
    normal: [],
    dispute: [],
  },
};

fs.readdir(dir, (err, files) => {
  files.forEach(async (file) => {
    if (file.indexOf("ACQ") !== -1) {
      console.log(`Processing: ${file}`);
      await processNormalNew(file, "ACQ");
      await processDisputeNew(file, "ACQ");
      return;
    }

    if (file.indexOf("ISS") !== -1) {
      console.log(`Processing: ${file}`);
      await processNormalNew(file, "ISS");
      await processDisputeNew(file, "ISS");
      return;
    }

    return;
  });

  setTimeout(async () => {
    let wb = xlsx.utils.book_new();

    let ws_acq_normal = null;
    let ws_acq_dispute = null;
    let ws_iss_normal = null;
    let ws_iss_dispute = null;

    if (trx?.acq?.normal?.length) {
      ws_acq_normal = xlsx.utils.json_to_sheet(trx?.acq?.normal);
    }

    if (trx?.acq?.dispute?.length) {
      ws_acq_dispute = xlsx.utils.json_to_sheet(trx?.acq?.dispute);
    }

    if (trx?.iss?.normal?.length) {
      ws_iss_normal = xlsx.utils.json_to_sheet(trx?.iss?.normal);
    }

    if (trx?.iss?.dispute?.length) {
      ws_iss_dispute = xlsx.utils.json_to_sheet(trx?.iss?.dispute);
    }

    if (ws_acq_normal !== null) {
      xlsx.utils.book_append_sheet(wb, ws_acq_normal, "ACQ");
    }

    if (ws_acq_dispute !== null) {
      xlsx.utils.book_append_sheet(wb, ws_acq_dispute, "DISPUTE ACQ");
    }

    if (ws_iss_normal !== null) {
      xlsx.utils.book_append_sheet(wb, ws_iss_normal, "ISS");
    }

    if (ws_iss_dispute !== null) {
      xlsx.utils.book_append_sheet(wb, ws_iss_dispute, "DISPUTE ISS");
    }

    const filename = `download/jalin_${moment().format("YYMMDD")}.xlsx`;

    await xlsx.writeFile(wb, filename, { compression: true });
  }, 5000);
});

const processNormalNew = async (file, type) => {
  let SOURCE_FILENAME = `upload/${file}`;

  let store = [];
  let realRows = [];

  try {
    const fileStream = fs.createReadStream(SOURCE_FILENAME);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on("line", function (line) {
      store.push(line);
    });

    rl.on("close", async function () {
      let hasColumn = false;
      let column = null;

      store.forEach((item, index, array) => {
        if (item.includes("Trx_Code") && hasColumn === false) {
          column = item.split(" ").filter(Boolean);
        }

        if (
          item.includes("--------") &&
          array[index - 1].includes("Trx_Code") &&
          !array[index - 1].includes("Dispute_Tran_Code")
        ) {
          let nextIndex = index + 1;
          let rows = [];

          do {
            rows.push(array[nextIndex]);
            nextIndex++;
          } while (
            !array[nextIndex].split(" ").includes("--------") &&
            !array[nextIndex + 1].includes("SUB TOTAL")
          );

          realRows = [...realRows, ...rows];
        }
      });

      column = column?.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

      generatedRows = realRows.map((list) => {
        return list
          .split("  ")
          .filter(Boolean)
          ?.map((list) => list?.trim());
      });

      let data = [];
      generatedRows.forEach((item) => {
        let object = {};

        if (item !== null) {
          mappingNormalColumns(item, object);

          object["Nominal"] = parseFloat(object?.Nominal.replace(/,/g, ""));
          object[
            "Jalin_Unique_Code"
          ] = `${object["Ref_No"]}_${object["Customer_PAN"]}_${object["Nominal"]}`;
          object["Report_Date"] = file?.split("_")[4];

          data.push(object);
        }
      });

      trx = {
        ...trx,
        [type.toLowerCase()]: {
          ...trx[type.toLowerCase()],
          normal: [...trx[type.toLowerCase()].normal, ...data],
        },
      };
    });
  } catch (error) {
    console.log(error);
  }
};

const processDisputeNew = async (file, type) => {
  let SOURCE_FILENAME = `upload/${file}`;

  let store = [];
  let realRows = [];

  try {
    const fileStream = fs.createReadStream(SOURCE_FILENAME);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on("line", function (line) {
      store.push(line);
    });

    rl.on("close", async function () {
      let hasColumn = false;
      let column = null;

      store.forEach((item, index, array) => {
        if (item.includes("Dispute_Tran_Code") && hasColumn === false) {
          column = item.split(" ").filter(Boolean);
          hasColumn = true;
        }

        if (
          item.includes("--------") &&
          array[index - 1].includes("Dispute_Tran_Code")
        ) {
          let nextIndex = index + 1;
          let rows = [];

          do {
            rows.push(array[nextIndex]);
            nextIndex++;
          } while (
            !array[nextIndex].split(" ").includes("--------") &&
            !array[nextIndex + 1].includes("SUB TOTAL")
          );

          realRows = [...realRows, ...rows];
        }
      });

      column = column?.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

      generatedRows = realRows.map((list) => {
        return list
          .split("  ")
          .filter(Boolean)
          ?.map((list) => list?.trim());
      });

      let data = [];

      generatedRows.forEach(async (item) => {
        let object = {};

        if (item !== null) {
          if (item[0].includes("--------------------------")) return;

          mappingDisputeColumns(item, object);

          object["Nominal"] = parseFloat(object?.Nominal.replace(/,/g, ""));
          object[
            "Jalin_Unique_Code"
          ] = `${object["Ref_No"]}_${object["Customer_PAN"]}_${object["Nominal"]}`;
          object["Report_Date"] = file?.split("_")[4];

          data.push(object);
        }
      });

      trx = {
        ...trx,
        [type.toLowerCase()]: {
          ...trx[type.toLowerCase()],
          dispute: [...trx[type.toLowerCase()].dispute, ...data],
        },
      };
    });
  } catch (error) {
    console.log(error);
  }
};
