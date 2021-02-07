import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import PriceCard from "./PriceCard";
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import Widgets from "fusioncharts/fusioncharts.widgets";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import { clientDateTime, getElapsedTime } from "./utils";

import moment from "moment";
import dayjs from "dayjs";
import Duration from "dayjs/plugin/duration";
import { getAccounts } from "./coinbase.api";

dayjs.extend(Duration);
require("log-timestamp")(function () {
  return `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}]`;
});
ReactFC.fcRoot(FusionCharts, Charts, Widgets, FusionTheme);

let chartRef = null;
let startTime = null;
let stopTime = null;

const BodyWSS = () => {
  const ws = useRef(null);
  const [btc, setBtc] = useState(0);
  const [xrp, setXrp] = useState(0);
  const [eth, setEth] = useState(0);
  const [doge, setDoge] = useState(0);
  const [balances, setBalances] = useState({ BTC: 0.0, ETH: 0.0 });
  const [showChart, toggleChart] = useState(false);

  //const [usd, setUsd] = useState(0);

  const dataSource = useRef({
    chart: {
      caption: "Crypto Ticker",
      subCaption: "",
      xAxisName: "Local Time",
      yAxisName: "USD",
      numberPrefix: "$",
      refreshinterval: "1",
      slantLabels: "1",
      numdisplaysets: "7200",
      showLabels: false,
      labeldisplay: "rotate",
      showValues: "0",
      showRealTimeValue: "0",
      theme: "fusion",
      decimals: 4,
      drawanchors: false,
      numDivLines: 10,
      setAdaptiveYMin: true,
    },
    categories: [
      {
        category: [
          {
            label: clientDateTime().toString(),
          },
        ],
      },
    ],
    dataset: [
      {
        seriesname: "ETH",
        parentyaxis: "P",
        data: [
          {
            value: 0,
          },
        ],
      },
      {
        seriesname: "BTC",
        parentyaxis: "S",
        data: [
          {
            value: 0,
          },
        ],
      },
    ],
  });

  const chartConfigs = {
    type: "realtimelinedy",
    renderAt: "chart-container",
    width: "100%",
    height: "550",
    dataFormat: "json",
  };

  const fetchAcountBalances = useCallback(async () => {
    console.log("getting account balances");
    try {
      const acctBalances = await getAccounts();

      setBalances(
        acctBalances.reduce(
          (valuesObj, item) => ({
            ...valuesObj,
            [item.type]: parseFloat(item.balance),
          }),
          {}
        )
      );

      // setValues(vals);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchAcountBalances();
    const refreshInterval = setInterval(() => {
      fetchAcountBalances();
    }, dayjs.duration(1, "hours").asMilliseconds());
    return () => {
      //console.log("clearing refreshInterval");
      clearInterval(refreshInterval);
    };
  }, [fetchAcountBalances]);

  const processMsg = (msgData) => {
    const data = JSON.parse(msgData);
    data.bitcoin && setBtc(parseFloat(data.bitcoin));
    data.xrp && setXrp(parseFloat(data.xrp));
    data.ethereum && setEth(parseFloat(data.ethereum));
    data.dogecoin && setDoge(parseFloat(data.dogecoin));
  };

  const updateDataSource = useCallback(() => {
    const ds = dataSource.current;

    ds.dataset[0]["data"][0].value === 0 &&
      (ds.dataset[0]["data"][0].value = eth);
    ds.dataset[1]["data"][0].value === 0 &&
      (ds.dataset[1]["data"][0].value = btc);
  }, [btc, eth]);

  useEffect(() => {
    let x_axis = clientDateTime();
    let y_axis1 = eth;
    let y_axis2 = btc;

    updateDataSource();
    showChart || toggleChart(true);

    chartRef?.feedData?.(
      "&label=" + x_axis + "&value=" + y_axis1 + "|" + y_axis2
    );
    //return () => chartRef.dispose();
  }, [eth, btc, updateDataSource, showChart]);

  const startWs = useCallback(() => {
    ws.current = new WebSocket(
      "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,xrp,dogecoin"
    );
    ws.current.onopen = () => {
      startTime = dayjs();
      console.log(`connection opened.`);
    };
    ws.current.onclose = () => {
      stopTime = dayjs();
      const duration = dayjs.duration(stopTime.diff(startTime));
      console.log(`connection closed. \
      Total uptime: ${getElapsedTime(duration)}`);
      console.log("socket closed. Restart in 2 seconds");
      setTimeout(() => {
        ws.readyState === WebSocket.Closed && startWs();
      }, 2000);
    };
    ws.current.onmessage = (msg) => {
      processMsg(msg.data);
    };
  }, []);

  useEffect(() => {
    startWs();
    return () => ws.current.close();
  }, [startWs]);

  const getChartRef = (chart) => {
    //console.log("getting new chartRef");
    chartRef = chart;
  };

  const totalBalance = () => {
    return Object.keys(balances)
      .reduce((total, k) => {
        let value = 0;
        try {
          value = eval(k.toLowerCase());
        } catch (e) {
          value = 0;
        }
        return total + balances[k] * value;
      }, 0)
      .toFixed(2);

    // return Object.values(values)
    //   .reduce((total, v) => total + v)
    //   .toFixed(2);
  };
  return (
    <div className="row mt-5 mt-xs-4">
      <div className="header">
        <div className="balance">Balance: {totalBalance()}</div>
        {startTime && (
          <div className="up-time">
            Uptime: {getElapsedTime(dayjs.duration(dayjs().diff(startTime)))}
          </div>
        )}
      </div>

      <div className="col-12 mb-3">
        <div className="card-deck custom-card-deck">
          <PriceCard
            header="Bitcoin(BTC)"
            src={"/bitcoin.png"}
            alt="fireSpot"
            label="(Price in USD)"
            value={btc}
            balance={balances.BTC}
          />
          <PriceCard
            header="Ripple(XRP)"
            src={"/ripple-xrp.png"}
            alt="fireSpot"
            label="(Price in USD)"
            value={xrp}
          />
          <PriceCard
            header="Ethereum(ETH)"
            src={"/ethereum.png"}
            alt="fireSpot"
            label="(Price in USD)"
            value={eth}
            balance={balances.ETH}
          />
          <PriceCard
            header="DogeCoin"
            src={"/doge.png"}
            alt="fireSpot"
            label="(Price in USD)"
            value={doge}
          />
        </div>
      </div>
      <div className="col-12">
        <div className="card custom-card mb-5 mb-xs-4">
          <div className="card-body">
            {showChart ? (
              <ReactFC
                {...chartConfigs}
                dataSource={dataSource.current}
                onRender={getChartRef}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyWSS;
