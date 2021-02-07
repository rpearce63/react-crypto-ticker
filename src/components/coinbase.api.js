import Client from "coinbase/lib/Client";
require("log-timestamp");

export const getAccounts = () => {
  const client = new Client({
    apiKey: process.env.REACT_APP_COINBASE_API_KEY,
    apiSecret: process.env.REACT_APP_COINBASE_SECRET,
    strictSSL: false,
  });

  return new Promise((resolve, reject) => {
    client.getAccounts({}, (err, accounts) => {
      if (err) {
        console.log(`Error: ${err}`);
        reject(err);
      }

      const balances = accounts
        ? accounts.map((a) => {
            //console.log(a.currency, a.native_balance);
            return {
              type: a.currency,
              balance: a.balance.amount,
            };
          })
        : [];
      //console.log(`balances: ${JSON.stringify(balances)}`);
      resolve(balances);
    });
  });
};
