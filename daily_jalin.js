const fs = require("fs");
const readline = require("readline");
const json2xls = require("p3x-json2xls-worker-thread");
const moment = require("moment");

let DEFAULT_DAY_READ = 1;
let transactions = [];
let transactions_dispute = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processNormalData = async (day, type) => {
  const DIR_PATHNAME = `download/${type.toLowerCase()}/`;
  const DIR_SOURCENAME = `upload/${type.toLowerCase()}/`;

  const TODAY_DATE = moment()
    .subtract(day - 1, "days")
    .format("YYMMDD");
  const DOWNLOAD_FILENAME = `${DIR_PATHNAME}${type}_${TODAY_DATE}_FORMATTED.xlsx`;
  const UPLOAD_FILENAME = `QR_SETTLE_360004_000898_${TODAY_DATE}_${type}`;
  const SOURCE_UPLOAD = `${DIR_SOURCENAME}${UPLOAD_FILENAME}`;

  let store = [];
  let realRows = [];

  try {
    if (fs.existsSync(SOURCE_UPLOAD)) {
      const fileStream = fs.createReadStream(SOURCE_UPLOAD);

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
            object["Tanggal_Trx"] =
              `2022-${item[1]?.trim()?.split("/")[1]}-${
                item[1]?.trim()?.split("/")[0]
              }` || "";

            object["Jam_Trx"] = item[2]?.split(" ")[0] || "";
            object["Ref_No"] = item[2]?.split(" ")[1] || "";

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
              object["Convenience_Fee"] = item[item.length - 2] || "";
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
              object["Convenience_Fee"] = item[item.length - 2] || "";
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
              object["Convenience_Fee"] = item[item.length - 2] || "";
              object["Interchange_Fee"] = item[item.length - 1] || "";
            }

            data.push(object);
          }
        });

        transactions = [...transactions, ...data];

        // const xlsBinary = await json2xls(data);
        // await fs.writeFileSync(
        //   DOWNLOAD_FILENAME,
        //   xlsBinary,
        //   "binary",
        //   (err) => {
        //     if (err) {
        //       console.log("writeFileSync error :", err);
        //     }
        //     console.log("The file has been saved!");
        //   }
        // );
      });
    } else {
      console.log(`Warning!! File tidak ditemukan: ${UPLOAD_FILENAME} \n \n`);
    }
  } catch (error) {
    console.log(error);
  }
};

const processDisputeData = async (day, type) => {
  const DIR_PATHNAME = `download/${type.toLowerCase()}/`;
  const DIR_SOURCENAME = `upload/${type.toLowerCase()}/`;

  const TODAY_DATE = moment()
    .subtract(day - 1, "days")
    .format("YYMMDD");
  // const DOWNLOAD_FILENAME = `${DIR_PATHNAME}DISPUTE_${type}_${TODAY_DATE}_FORMATTED.xlsx`;
  const UPLOAD_FILENAME = `QR_SETTLE_360004_000898_${TODAY_DATE}_${type}`;
  const SOURCE_UPLOAD = `${DIR_SOURCENAME}${UPLOAD_FILENAME}`;

  let store = [];
  let realRows = [];

  try {
    if (fs.existsSync(SOURCE_UPLOAD)) {
      const fileStream = fs.createReadStream(SOURCE_UPLOAD);

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

        generatedRows.forEach(async (item, row_index) => {
          let object = {};

          if (item !== null) {
            if (item[0].includes("--------------------------")) return;

            object["No."] = item[0] || "";
            object["Trx_Code"] = item[1] || "";
            object["Tanggal_Trx"] =
              `2022-${item[2]?.trim()?.split("/")[2]}-${
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
              object["Convenience_Fee"] = item[item.length - 7] || "";
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
              object["Convenience_Fee"] = item[item.length - 7] || "";
              object["Interchange_Fee"] = item[item.length - 6] || "";
              object["Dispute_Tran_Code"] = item[item.length - 5] || "";
              object["Dispute_Amount"] = item[item.length - 4] || "";
              object["Fee_Return"] = item[item.length - 3] || "";
              object["Dispute_Net_Amount"] = item[item.length - 2] || "";
              object["Registration_Number"] = item[item.length - 1] || "";
            }

            data.push(object);
          }
        });

        transactions_dispute = [...transactions_dispute, ...data];

        // const xlsBinary = await json2xls(data);
        // await fs.writeFileSync(
        //   DOWNLOAD_FILENAME,
        //   xlsBinary,
        //   "binary",
        //   (err) => {
        //     if (err) {
        //       console.log("writeFileSync error :", err);
        //     }
        //     console.log("The file has been saved!");
        //   }
        // );
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const Main = async () => {
  rl.question("H- berapa transaksi yang mau dibaca: ", async function (day) {
    rl.question("ACQ or ISS: ", async function (type) {
      console.log("\n");
      if (day && type) {
        DEFAULT_DAY_READ = day;

        for (let index = DEFAULT_DAY_READ; index >= 1; index--) {
          await processNormalData(index, type.toUpperCase());
          await processDisputeData(index, type.toUpperCase());
        }

        setTimeout(async () => {
          const DIR_PATHNAME = `download/${type.toLowerCase()}/`;
          const DOWNLOAD_FILENAME_NORMAL = `${DIR_PATHNAME}JALIN_${type.toUpperCase()}_${moment().format(
            "YYMMDD"
          )}.xlsx`;
          const DOWNLOAD_FILENAME_DISPUTE = `${DIR_PATHNAME}JALIN_DISPUTE_${type.toUpperCase()}_${moment().format(
            "YYMMDD"
          )}.xlsx`;

          if (transactions && transactions.length !== 0) {
            const xlsBinary = await json2xls(transactions);
            await fs.writeFileSync(
              DOWNLOAD_FILENAME_NORMAL,
              xlsBinary,
              "binary",
              (err) => {
                if (err) {
                  console.log("writeFileSync error :", err);
                }
                console.log("The file has been saved!");
              }
            );
          }

          if (transactions_dispute && transactions_dispute.length !== 0) {
            const xlsBinary2 = await json2xls(transactions_dispute);

            await fs.writeFileSync(
              DOWNLOAD_FILENAME_DISPUTE,
              xlsBinary2,
              "binary",
              (err) => {
                if (err) {
                  console.log("writeFileSync error :", err);
                }
                console.log("The file has been saved!");
              }
            );
          }
        }, 5000);
      } else {
        console.log("TRY AGAIN!! \n");
      }
      rl.close();
    });
  });
};

Main();
