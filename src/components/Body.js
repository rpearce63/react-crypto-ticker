import React from "react";
import PriceCard from "./PriceCard";
//import axios from 'axios';
import FusionCharts from "fusioncharts";

import Charts from "fusioncharts/fusioncharts.charts";
import Widgets from "fusioncharts/fusioncharts.widgets";
import ReactFC from "react-fusioncharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

ReactFC.fcRoot(FusionCharts, Charts, Widgets, FusionTheme);

class Body extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.BASE_URL = "https://api.cryptonator.com/api/ticker/";
    this.updateChartInterval = 0;
    this.refreshTickerInterval = 0;
    this.chartRef = null;
    this.state = {
      btcusd: "-",
      xrpusd: "-",
      ethusd: "-",
      showChart: false,
      initValue: 0,
      dataSource: {
        chart: {
          caption: "Crypto Ticker",
          subCaption: "",
          xAxisName: "Local Time",
          yAxisName: "USD",
          numberPrefix: "$",
          refreshinterval: "1",
          slantLabels: "1",
          numdisplaysets: "100",
          showLabels: false,
          labeldisplay: "rotate",
          showValues: "0",
          showRealTimeValue: "0",
          theme: "fusion",
          decimals: 6,
          drawanchors: false,
          numDivLines: 20,
          setAdaptiveYMin: true,
        },
        categories: [
          {
            category: [
              {
                label: this.clientDateTime().toString(),
              },
            ],
          },
        ],
        dataset: [
          {
            data: [
              {
                value: 0,
              },
            ],
          },
        ],
      },
    };
    this.chartConfigs = {
      type: "realtimeline",
      renderAt: "container",
      width: "100%",
      height: "550",
      dataFormat: "json",
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.getDataFor("btc-usd", "btcusd");
    this.getDataFor("xrp-usd", "xrpusd");
    this.getDataFor("eth-usd", "ethusd");

    this.refreshTickerInterval = setInterval(() => {
      this.refreshTickers();
    }, 60000);
  }

  componentWillUnmount() {
    console.log("clearing intervals from Body");
    this._isMounted = false;
    clearInterval(this.refreshTickerInterval);
    clearInterval(this.updateChartInterval);
  }

  refreshTickers = () => {
    console.log(`refreshing tickers: ${this._isMounted}`);
    if (this._isMounted) {
      this.getDataFor("btc-usd", "btcusd");
      this.getDataFor("eth-usd", "ethusd");
    }
  };

  startUpdatingData = () => {
    this.updateChartInterval = setInterval(() => {
      console.log("startUpdatingData");
      this._isMounted &&
        fetch(this.BASE_URL + "xrp-usd")
          .then(res => res.json())
          .then(d => {
            //console.log(`data: `, d);
            let x_axis = this.clientDateTime();
            let y_axis = d.ticker.price;

            this.chartRef?.feedData?.("&label=" + x_axis + "&value=" + y_axis);
            this.setState({
              xrpusd: d.ticker.price,
            });
          });
    }, 10000);
  };

  getDataFor = (conversion, prop) => {
    console.log(`getting data for ${prop}`);
    fetch(this.BASE_URL + conversion, {
      mode: "cors",
    })
      .then(res => res.json())
      .then(d => {
        //console.log(`ticker: ${JSON.stringify(d)}`);
        if (prop === "xrpusd") {
          const dataSource = this.state.dataSource;
          //   dataSource.chart.yAxisMaxValue =
          //     parseFloat(d.ticker.price) + parseFloat(d.ticker.price * 0.1);
          //   dataSource.chart.yAxisMinValue =
          //     parseFloat(d.ticker.price) - parseFloat(d.ticker.price * 0.1);
          dataSource.dataset[0]["data"][0].value = d.ticker.price;
          this.setState(
            {
              showChart: true,
              dataSource: dataSource,
              initValue: d.ticker.price,
            },
            () => {
              this.startUpdatingData();
            }
          );
        }

        this.setState({
          [prop]: d.ticker.price,
        });
      });
  };

  static addLeadingZero(num) {
    return num <= 9 ? "0" + num : num;
  }

  clientDateTime() {
    var date_time = new Date();
    var curr_hour = date_time.getHours();
    var zero_added_curr_hour = Body.addLeadingZero(curr_hour);
    var curr_min = date_time.getMinutes();
    var curr_sec = date_time.getSeconds();
    var curr_time = zero_added_curr_hour + ":" + curr_min + ":" + curr_sec;
    return curr_time;
  }

  getChartRef = chart => {
    //console.log("getting chart ref");
    this.chartRef = chart;
  };

  render() {
    return (
      <div className="row mt-5 mt-xs-4">
        <div className="col-12 mb-3">
          <div className="card-deck custom-card-deck">
            <PriceCard
              header="Bitcoin(BTC)"
              src={"/bitcoin.png"}
              alt="fireSpot"
              label="(Price in USD)"
              value={this.state.btcusd}
            />
            <PriceCard
              header="Ripple(XRP)"
              src={"/ripple-xrp.png"}
              alt="fireSpot"
              label="(Price in USD)"
              value={this.state.xrpusd}
            />
            <PriceCard
              header="Ethereum(ETH)"
              src={"/ethereum.png"}
              alt="fireSpot"
              label="(Price in USD)"
              value={this.state.ethusd}
            />
          </div>
        </div>
        <div className="col-12">
          <div className="card custom-card mb-5 mb-xs-4">
            <div className="card-body">
              {this.state.showChart ? (
                <ReactFC
                  {...this.chartConfigs}
                  dataSource={this.state.dataSource}
                  onRender={this.getChartRef}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Body;
