import React from "react";
import { Bar } from "react-chartjs-2";

export function LineChart(props) {
  let cd = props.formChartData(props.chartData);
  let axisLabels = cd[0];
  let data1 = cd[1];
  let data2 = cd[2];
  data1.reverse();
  data2.reverse();
  const data = {
    datasets: [
      {
        label: "Value Transferred (tBTC)",
        type: "bar",
        data: data2,
        fill: true,
        backgroundColor: "rgba(54, 54, 54, 0.8)",
        borderColor: "rgba(54, 54, 54, 1)",
        pointBorderColor: "#fff",
        pointBackgroundColor: "rgba(54, 54, 54, 1)",
        yAxisID: "y-axis-2"
      },
      {
        type: "bar",
        label: "Number of Transfers",
        data: data1,
        fill: true,
        backgroundColor: "rgba(0, 209, 178, 0.8)",
        borderColor: "rgba(0, 209, 178, 1)",
        pointBorderColor: "#fff",
        pointBackgroundColor: "rgba(0, 209, 178, 1)",
        yAxisID: "y-axis-1"
      }
    ]
  };

  const options = {
    title: {
      display: true,
      text: "Transfer Statistics - Last 7 days"
    },
    responsive: true,
    tooltips: {
      mode: "label"
    },
    elements: {
      line: {
        fill: false
      }
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false
          },
          labels: axisLabels
        }
      ],
      yAxes: [
        {
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
          gridLines: {
            display: false
          },
          labels: {
            show: true
          }
        },
        {
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          gridLines: {
            display: false
          },
          labels: {
            show: true
          }
        }
      ]
    },
    maintainAspectRatio: true
  };

  return <Bar data={data} options={options} width={650} height={440} />;
}
