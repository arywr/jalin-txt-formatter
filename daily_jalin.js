const fs = require("fs");
const readline = require("readline");
const moment = require("moment");
const xlsx = require("xlsx");

let DEFAULT_DAY_READ = 1;
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processNormalData = async (day, type) => {
  const TODAY_DATE = moment()
    .subtract(day - 1, "days")
    .format("YYMMDD");
  const UPLOAD_FILENAME = `QR_SETTLE_360004_000898_${TODAY_DATE}_${type}`;
  const SOURCE_FILENAME = `upload/${UPLOAD_FILENAME}`;

  let store = [];
  let realRows = [];

  try {
    if (fs.existsSync(SOURCE_FILENAME)) {
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

        column = column.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

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
            object["No."] = item[0]?.split(" ")[0] || "";
            object["Trx_Code"] = item[0]?.split(" ")[1] || "";
            object["Tanggal_Trx"] =
              `2022-${item[1]?.trim()?.split("/")[1]}-${
                item[1]?.trim()?.split("/")[0]
              }` || "";

            object["Jam_Trx"] = item[2]?.split(" ")[0] || "";
            object["Ref_No"] = item[2]?.split(" ")[1] || "";
            object["Trace_No"] = item[2]?.split(" ")[2] || "";

            if (item[3]?.split(" ")?.length === 2) {
              object["Terminal_ID"] = "";
              object["Merchant_PAN"] = item[3]?.split(" ")[0] || "";
              object["Acquirer"] = item[3]?.split(" ")[1] || "";
              object["Issuer"] = item[4] || "";
              object["Customer_PAN"] = item[5] || "";
              object["Nominal"] =
                parseFloat(item[6]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[6]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[7] || "";
              object["Response_Code"] = item[8] || "";

              let merchant = "";

              for (let i = 10; i < item.length - 2; i++) {
                if (i == item.length - 3) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 2]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 1] || "";
            } else if (item[3]?.split(" ")?.length === 3) {
              object["Terminal_ID"] = item[3]?.split(" ")[0] || "";
              object["Merchant_PAN"] = item[3]?.split(" ")[1] || "";
              object["Acquirer"] = item[3]?.split(" ")[0] || "";
              object["Issuer"] = item[4] || "";
              object["Customer_PAN"] = item[5] || "";
              object["Nominal"] =
                parseFloat(item[6]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[6]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[7] || "";
              object["Response_Code"] = item[8] || "";

              let merchant = "";

              for (let i = 10; i < item.length - 2; i++) {
                if (i == item.length - 3) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 2]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 1] || "";
            } else if (
              item[3]?.split(" ")?.length === 1 &&
              item[4]?.split(" ")?.length === 1
            ) {
              object["Terminal_ID"] = item[3];
              object["Merchant_PAN"] = item[4];
              object["Acquirer"] = item[5];
              object["Issuer"] = item[6];
              object["Customer_PAN"] = item[7];
              object["Nominal"] =
                parseFloat(item[8]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[8]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[9];
              object["Response_Code"] = item[10];

              let merchant = "";

              for (let i = 11; i < item.length - 2; i++) {
                if (i == item.length - 3) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 2]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 1] || "";
            } else {
              object["Terminal_ID"] = item[3]?.trim() || "";
              object["Merchant_PAN"] = item[4]?.split(" ")[0] || "";
              object["Acquirer"] = item[4]?.split(" ")[1] || "";
              object["Issuer"] = item[5] || "";
              object["Customer_PAN"] = item[6] || "";
              object["Nominal"] =
                parseFloat(item[7]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[7]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[8] || "";
              object["Response_Code"] = item[9] || "";

              let merchant = "";

              for (let i = 10; i < item.length - 2; i++) {
                if (i == item.length - 3) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 2]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 1] || "";
            }

            object[
              "Jalin_Unique_Code"
            ] = `${object["Ref_No"]}_${object["Customer_PAN"]}_${object["Nominal"]}`;

            object["Report_Date"] = TODAY_DATE;
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
    } else {
      console.log(`Warning!! File tidak ditemukan: ${UPLOAD_FILENAME} \n \n`);
    }
  } catch (error) {
    console.log(error);
  }
};

const processDisputeData = async (day, type) => {
  const TODAY_DATE = moment()
    .subtract(day - 1, "days")
    .format("YYMMDD");
  const UPLOAD_FILENAME = `QR_SETTLE_360004_000898_${TODAY_DATE}_${type}`;
  const SOURCE_FILENAME = `upload/${UPLOAD_FILENAME}`;

  let store = [];
  let realRows = [];

  try {
    if (fs.existsSync(SOURCE_FILENAME)) {
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

        column = column.map((value) => value.trim()?.replace(/ +(?= )/g, ""));

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

            object["No."] = item[0] || "";
            object["Trx_Code"] = item[1] || "";
            object["Tanggal_Trx"] =
              `2022-${item[2]?.trim()?.split("/")[1]}-${
                item[2]?.trim()?.split("/")[0]
              }` || "";

            object["Jam_Trx"] = item[3]?.split(" ")[0] || "";
            object["Ref_No"] = item[3]?.split(" ")[1] || "";
            object["Trace_No"] = item[3]?.split(" ")[2] || "";

            if (item[4]?.split(" ")?.length === 2) {
              object["Terminal_ID"] = "";
              object["Merchant_PAN"] = item[4]?.split(" ")[0] || "";
              object["Acquirer"] = item[4]?.split(" ")[1] || "";
              object["Issuer"] = item[5] || "";
              object["Customer_PAN"] = item[6] || "";
              object["Nominal"] =
                // item[7]?.split(" ")[0]?.replace(",", "") || "";
                parseFloat(item[7]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[7]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[8] || "";
              object["Response_Code"] = item[9] || "";

              let merchant = "";

              for (let i = 10; i < item.length - 7; i++) {
                if (i == item.length - 8) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 7]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 6] || "";
              object["Dispute_Tran_Code"] = item[item.length - 5] || "";
              object["Dispute_Amount"] = item[item.length - 4] || "";
              object["Fee_Return"] = item[item.length - 3] || "";
              object["Dispute_Net_Amount"] = item[item.length - 2] || "";
              object["Registration_Number"] = item[item.length - 1] || "";
            } else if (
              item[3]?.split(" ")?.length === 1 &&
              item[4]?.split(" ")?.length === 1
            ) {
              object["Terminal_ID"] = item[3];
              object["Merchant_PAN"] = item[4];
              object["Acquirer"] = item[5];
              object["Issuer"] = item[6];
              object["Customer_PAN"] = item[7];
              object["Nominal"] =
                parseFloat(item[8]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[8]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[9];
              object["Response_Code"] = item[10];

              let merchant = "";

              for (let i = 11; i < item.length - 2; i++) {
                if (i == item.length - 3) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 7]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 6] || "";
              object["Dispute_Tran_Code"] = item[item.length - 5] || "";
              object["Dispute_Amount"] = item[item.length - 4] || "";
              object["Fee_Return"] = item[item.length - 3] || "";
              object["Dispute_Net_Amount"] = item[item.length - 2] || "";
              object["Registration_Number"] = item[item.length - 1] || "";
            } else {
              object["Terminal_ID"] = item[4]?.trim() || "";
              object["Merchant_PAN"] = item[5]?.split(" ")[0] || "";
              object["Acquirer"] = item[5]?.split(" ")[1] || "";
              object["Issuer"] = item[6] || "";
              object["Customer_PAN"] = item[7] || "";
              object["Nominal"] =
                parseFloat(item[8]?.split(" ")[0]?.replace(/,/g, "")) || "";
              object["Merchant_Category"] = item[8]?.split(" ")[1] || "";
              object["Merchant_Criteria"] = item[9] || "";
              object["Response_Code"] = item[10] || "";
              let merchant = "";

              for (let i = 10; i < item.length - 7; i++) {
                if (i == item.length - 8) {
                  merchant += `${item[i]}`;
                } else {
                  merchant += `${item[i]} `;
                }
              }

              object["Merchant_Name_&_Location"] =
                merchant.split(" ").join("_") || "";
              object["Convenience_Fee"] =
                item[item.length - 7]?.replace("C", "") || "";
              object["Interchange_Fee"] = item[item.length - 6] || "";
              object["Dispute_Tran_Code"] = item[item.length - 5] || "";
              object["Dispute_Amount"] = item[item.length - 4] || "";
              object["Fee_Return"] = item[item.length - 3] || "";
              object["Dispute_Net_Amount"] = item[item.length - 2] || "";
              object["Registration_Number"] = item[item.length - 1] || "";
            }

            object[
              "Jalin_Unique_Code"
            ] = `${object["Ref_No"]}_${object["Customer_PAN"]}_${object["Nominal"]}`;
            object["Report_Date"] = TODAY_DATE;
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
    }
  } catch (error) {
    console.log(error);
  }
};

const Main = async () => {
  rl.question("H- berapa transaksi yang mau dibaca: ", async function (day) {
    console.log("\n");
    if (day) {
      DEFAULT_DAY_READ = day;

      for (let index = DEFAULT_DAY_READ; index >= 1; index--) {
        await processNormalData(index, "ACQ");
        await processDisputeData(index, "ACQ");

        await processNormalData(index, "ISS");
        await processDisputeData(index, "ISS");
      }

      setTimeout(async () => {
        var wb = xlsx.utils.book_new();

        var ws_acq_normal = null;
        var ws_acq_dispute = null;
        var ws_iss_normal = null;
        var ws_iss_dispute = null;

        if (trx?.acq?.normal?.length) {
          var ws_acq_normal = xlsx.utils.json_to_sheet(trx?.acq?.normal);
        }

        if (trx?.acq?.dispute?.length) {
          var ws_acq_dispute = xlsx.utils.json_to_sheet(trx?.acq?.dispute);
        }

        if (trx?.iss?.normal?.length) {
          var ws_iss_normal = xlsx.utils.json_to_sheet(trx?.iss?.normal);
        }

        if (trx?.iss?.dispute?.length) {
          var ws_iss_dispute = xlsx.utils.json_to_sheet(trx?.iss?.dispute);
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

        await xlsx.writeFile(wb, filename);
      }, 5000);
    } else {
      console.log("TRY AGAIN!! \n");
    }
    rl.close();
  });
};

Main();
