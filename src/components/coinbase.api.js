import Client from "coinbase/lib/Client";
require("log-timestamp");

export const getAccounts = () => {
  const client = new Client({
    apiKey: "65ALMM3MZnBLj3LF",
    apiSecret: "mTbqDJF6xix5yiOz0G74Qo5TA6v0KLIU",
    strictSSL: false,
  });

  return new Promise((resolve, reject) => {
    client.getAccounts({}, (err, accounts) => {
      if (err) {
        console.log(`Error: ${err}`);
        reject(err);
      }

      const balances = accounts
        ? accounts.map(a => {
            //console.log(a.currency, a.native_balance);
            return {
              type: a.currency,
              balance: a.native_balance.amount,
            };
          })
        : [];
      //console.log(`balances: ${JSON.stringify(balances)}`);
      resolve(balances);
    });
  });
};
