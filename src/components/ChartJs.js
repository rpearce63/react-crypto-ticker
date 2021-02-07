import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-streaming";

const ChartJs = ({ data: chartData }) => {
  const [chartValues, setChartValues] = useState([]);

  console.log(chartData);

  useEffect(() => {
    //console.log("rendering ChartJs");
    setChartValues((v) => [...v, { x: Date.now(), y: chartData.BTC }]);
    //return () => console.log("unmounting ChartJs");
  }, [chartData]);

  useEffect(() => {
    console.log("chartValues: ", chartValues[chartValues.length - 1]);
  }, [chartValues]);

  console.log(chartValues.length, chartValues[10]);
  return (
    <Line
      data={{
        datasets: [
          {
            label: "BTC",
            borderColor: "rgb(255,99,132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            lineTension: 0,
            borderDash: [8, 4],
            data: chartValues,
          },
          //   {
          //     data: [],
          //     label: "ETH",
          //     borderColor: "rgb(54, 162, 235)",
          //     backgroundColor: "rgba(54, 162, 235, 0.5)",
          //   },
        ],
      }}
      options={{
        scales: {
          xAxes: [
            {
              type: "realtime",
              //realtime: {
              // onRefresh: function (chart) {
              //   console.log(chart.data.datasets[0]);
              //   chart.data.datasets[0].data.push({
              //     x: Date.now(),
              //     y: chartData.BTC,
              //   });
              // },
              //},
            },
          ],
        },
      }}
    />
  );
};

export default ChartJs;
