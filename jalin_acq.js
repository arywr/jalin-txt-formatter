const fs = require("fs");
const readline = require("readline");
const json2xls = require("p3x-json2xls-worker-thread");
const moment = require("moment");

const TODAY_DATE = moment().subtract(1, "days").format("YYMMDD");
const DIR_PATHNAME = "download/acq/";
const DIR_SOURCENAME = "upload/acq/";

// Define Variabel
// ==========================================================================================

const uploaded_name = `QR_SETTLE_360004_000898_${TODAY_DATE}_ACQ`; // Nama file yang akan dibaca, bisa di replace!

const download = {
  normal: `${DIR_PATHNAME}acq_${TODAY_DATE}.xlsx`, // Nama file yang akan terdownload untuk transaksi normal
  dispute: `${DIR_PATHNAME}dispute_acq_${TODAY_DATE}.xlsx`, // Nama file yang akan terdonwload untuk transaksi dispute
};

const source = `${DIR_SOURCENAME}${uploaded_name}`;

// ==========================================================================================

const processNormalData = async () => {
  let store = [];
  let realRows = [];

  const fileStream = fs.createReadStream(source);

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

    column = column.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

    generatedRows = realRows.map((list) => {
      return list
        .split("  ")
        .filter(Boolean)
        ?.map((list) => list?.trim());
    });

    let data = [];
    generatedRows.forEach((item, row_index) => {
      let object = {};

      if (item !== null) {
        object["No."] = item[0]?.split(" ")[0] || "";
        object["Trx_Code"] = item[0]?.split(" ")[1] || "";
        object["Tanggal_Trx"] = item[1]?.trim() || "";
        object["Jam_Trx"] = item[2]?.split(" ")[0] || "";
        object["Ref_No"] = item[2]?.split(" ")[1] || "";
        object["Trace_No"] = item[2]?.split(" ")[2] || "";
        object["Terminal_ID"] = item[3]?.trim() || "";
        object["Merchant_PAN"] = item[4]?.split(" ")[0] || "";
        object["Acquirer"] = item[4]?.split(" ")[1] || "";
        object["Issuer"] = item[5] || "";
        object["Customer_PAN"] = item[6] || "";
        object["Nominal"] = item[7]?.split(" ")[0] || "";
        object["Merchant_Category"] = item[7]?.split(" ")[1] || "";
        object["Merchant_Criteria"] = item[8] || "";
        object["Response_Code"] = item[9] || "";
        object["Merchant_Name"] = item[10] || "";
        object["Merchant_Location"] = item[11] || "";
        object["Convenience_Fee"] = item[item.length - 2] || "";
        object["Interchange_Fee"] = item[item.length - 1] || "";

        data.push(object);
      }
    });

    const xlsBinary = await json2xls(data);
    await fs.writeFileSync(download.normal, xlsBinary, "binary", (err) => {
      if (err) {
        console.log("writeFileSync error :", err);
      }
      console.log("The file has been saved!");
    });
  });
};

const processDisputeData = async () => {
  let store = [];
  let realRows = [];

  const fileStream = fs.createReadStream(source);

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

    column = column.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

    generatedRows = realRows.map((list) => {
      return list
        .split("  ")
        .filter(Boolean)
        ?.map((list) => list?.trim());
    });

    let data = [];
    generatedRows.forEach((item, row_index) => {
      let object = {};

      if (item !== null) {
        object["No."] = item[0] || "";
        object["Trx_Code"] = item[1] || "";
        object["Tanggal_Trx"] = item[2] || "";
        object["Jam_Trx"] = item[3]?.split(" ")[0] || "";
        object["Ref_No"] = item[3]?.split(" ")[1] || "";
        object["Trace_No"] = item[3]?.split(" ")[2] || "";
        object["Terminal_ID"] = item[4]?.trim() || "";
        object["Merchant_PAN"] = item[5]?.split(" ")[0] || "";
        object["Acquirer"] = item[5]?.split(" ")[1] || "";
        object["Issuer"] = item[6] || "";
        object["Customer_PAN"] = item[7] || "";
        object["Nominal"] = item[8]?.split(" ")[0] || "";
        object["Merchant_Category"] = item[8]?.split(" ")[1] || "";
        object["Merchant_Criteria"] = item[9] || "";
        object["Response_Code"] = item[10] || "";
        object["Merchant_Name"] = item[11] || "";
        object["Merchant_Location"] = item[12] || "";
        object["Convenience_Fee"] = item[item.length - 7] || "";
        object["Interchange_Fee"] = item[item.length - 6] || "";
        object["Dispute_Tran_Code"] = item[item.length - 5] || "";
        object["Dispute_Amount"] = item[item.length - 4] || "";
        object["Fee_Return"] = item[item.length - 3] || "";
        object["Dispute_Net_Amount"] = item[item.length - 2] || "";
        object["Registration_Number"] = item[item.length - 1] || "";

        data.push(object);
      }
    });

    const xlsBinary = await json2xls(data);
    await fs.writeFileSync(download.dispute, xlsBinary, "binary", (err) => {
      if (err) {
        console.log("writeFileSync error :", err);
      }
      console.log("The file has been saved!");
    });
  });
};

processNormalData();
processDisputeData();
