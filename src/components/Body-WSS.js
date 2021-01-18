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
  const [ltc, setLtc] = useState(0);
  const [values, setValues] = useState({ BTC: 0.0, ETH: 0.0 });
  const [showChart, toggleChart] = useState(false);

  const dataSource = useRef({
    chart: {
      caption: "Crypto Ticker",
      subCaption: "",
      xAxisName: "Local Time",
      yAxisName: "USD",
      numberPrefix: "$",
      refreshinterval: "1",
      slantLabels: "1",
      numdisplaysets: "3600",
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
    try {
      const balances = await getAccounts();
      setValues(
        balances.reduce(
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
    }, 60000);
    return () => {
      //console.log("clearing refreshInterval");
      clearInterval(refreshInterval);
    };
  }, [fetchAcountBalances]);

  const processMsg = msgData => {
    const data = JSON.parse(msgData);

    data.bitcoin && setBtc(parseFloat(data.bitcoin));
    data.xrp && setXrp(parseFloat(data.xrp));
    data.ethereum && setEth(parseFloat(data.ethereum));
    data.litecoin && setLtc(parseFloat(data.litecoin));
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
      "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,xrp,litecoin"
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
    ws.current.onmessage = msg => {
      processMsg(msg.data);
    };
  }, []);

  useEffect(() => {
    startWs();
    return () => ws.current.close();
  }, [startWs]);

  const getChartRef = chart => {
    //console.log("getting new chartRef");
    chartRef = chart;
  };

  return (
    <div className="row mt-5 mt-xs-4">
      <div className="header">
        <div className="balance">
          Balance: {(values.BTC + values.ETH).toFixed(2)}
        </div>
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
            balance={values.BTC}
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
            balance={values.ETH}
          />
          <PriceCard
            header="Litecoin(LTC)"
            src={"/ethereum.png"}
            alt="fireSpot"
            label="(Price in USD)"
            value={ltc}
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
