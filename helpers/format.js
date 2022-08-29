const enumsNormal = {
  0: "No.",
  1: "Trx_Code",
  2: "Tanggal_Trx",
  3: "Jam_Trx",
  4: "Ref_No",
  5: "Trace_No",
  6: "Terminal_ID",
  7: "Merchant_PAN",
  8: "Acquirer",
  9: "Issuer",
  10: "Customer_PAN",
  11: "Nominal",
  12: "Merchant_Category",
  13: "Merchant_Criteria",
  14: "Response_Code",
  15: "Merchant_Name_&_Location",
  16: "Convenience_Fee",
  17: "Interchange_Fee",
};

const enumsDispute = {
  0: "No.",
  1: "Trx_Code",
  2: "Tanggal_Trx",
  3: "Jam_Trx",
  4: "Ref_No",
  5: "Trace_No",
  6: "Terminal_ID",
  7: "Merchant_PAN",
  8: "Acquirer",
  9: "Issuer",
  10: "Customer_PAN",
  11: "Nominal",
  12: "Merchant_Category",
  13: "Merchant_Criteria",
  14: "Response_Code",
  15: "Merchant_Name_&_Location",
  16: "Convenience_Fee",
  17: "Interchange_Fee",
  18: "Dispute_Tran_Code",
  19: "Dispute_Amount",
  20: "Fee_Return",
  21: "Dispute_Net_Amount",
  22: "Registration_Number",
};

const mappingNormalColumns = (row, object) => {
  let store = [];

  row?.map((a) => a?.split(" ")?.map((b) => store.push(b)));

  if (store[6]?.indexOf("9360") !== -1) {
    store.splice(6, 0, "");
  }

  if (store[7]?.indexOf("9360") !== -1 && store[7]?.length <= 8) {
    store.splice(7, 0, "");
  }

  if (store[10]?.indexOf("9360") === -1) {
    store.splice(10, 0, "");
  }

  for (let i = 0; i <= 14; i++) {
    object[enumsNormal[i]] = store[i];
  }

  let merchant = "";

  for (let m = 15; m < store.length - 3; m++) {
    if (m == store.length - 3) {
      merchant += `${store[m]}`;
    } else {
      merchant += `${store[m]} `;
    }
  }

  object[enumsNormal[15]] = merchant.split(" ").join("_");
  object[enumsNormal[16]] = store[store.length - 3];
  object[enumsNormal[17]] = store[store.length - 1];
};

const mappingDisputeColumns = (row, object) => {
  let store = [];

  row?.map((a) => a?.split(" ")?.map((b) => store.push(b)));

  store = store.filter((e) => e != "C");

  if (store[6]?.indexOf("93600") !== -1) {
    store.splice(6, 0, "");
  }

  if (store[7]?.indexOf("93600") !== -1 && store[7]?.length <= 8) {
    store.splice(7, 0, "");
  }

  if (store[10]?.indexOf("93600") === -1) {
    store.splice(10, 0, "");
  }

  for (let i = 0; i <= 14; i++) {
    object[enumsDispute[i]] = store[i];
  }

  if (!isNaN(parseFloat(store[store.length - 1]?.replace(".00")))) {
    let merchant = "";

    for (let m = 15; m < store.length - 6; m++) {
      if (m == store.length - 3) {
        merchant += `${store[m]}`;
      } else {
        merchant += `${store[m]} `;
      }
    }

    object[enumsDispute[15]] = merchant.split(" ").join("_");
    object[enumsDispute[16]] = store[store.length - 6];
    object[enumsDispute[17]] = store[store.length - 5];
    object[enumsDispute[18]] = store[store.length - 4];
    object[enumsDispute[19]] = store[store.length - 3];
    object[enumsDispute[20]] = store[store.length - 2];
    object[enumsDispute[21]] = store[store.length - 1];
    object[enumsDispute[22]] = "";
  } else {
    let merchant = "";

    for (let m = 15; m < store.length - 7; m++) {
      if (m == store.length - 3) {
        merchant += `${store[m]}`;
      } else {
        merchant += `${store[m]} `;
      }
    }

    object[enumsDispute[15]] = merchant.split(" ").join("_");
    object[enumsDispute[16]] = store[store.length - 7];
    object[enumsDispute[17]] = store[store.length - 6];
    object[enumsDispute[18]] = store[store.length - 5];
    object[enumsDispute[19]] = store[store.length - 4];
    object[enumsDispute[20]] = store[store.length - 3];
    object[enumsDispute[21]] = store[store.length - 2];
    object[enumsDispute[22]] = store[store.length - 1];
  }
};

module.exports = {
  mappingNormalColumns,
  mappingDisputeColumns,
};
