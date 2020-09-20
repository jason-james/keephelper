/* Imports */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import TBTC from "@keep-network/tbtc.js";
import axios from "axios";
import { shortenEthAddress } from "../utils";
import infinityLoader from "../images/infinityLoader.svg";

am4core.useTheme(am4themes_animated);

const NUMBER_OF_STEPS = 5;

export function DepositTracker(props) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const { getWeb3, deposit } = props;

  const chart = useRef(null);

  const getSeriesStartLocation = chart => {
    let n = 1;
    chart.data.forEach(item => {
      if (item.value !== 0) {
        n -= 1 / NUMBER_OF_STEPS;
      }
    });
    return n;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let web3 = await getWeb3();
      let chartData = await getDepositChartData(web3, deposit);
      setChartData(chartData);
      setLoading(false);
    };
    fetchData();
  }, [deposit]);

  useLayoutEffect(() => {
    let iconPath =
      "m46.103,27.444c0.637-4.258-2.605-6.547-7.038-8.074l1.438-5.768-3.511-0.875-1.4,5.616c-0.923-0.23-1.871-0.447-2.813-0.662l1.41-5.653-3.509-0.875-1.439,5.766c-0.764-0.174-1.514-0.346-2.242-0.527l0.004-0.018-4.842-1.209-0.934,3.75s2.605,0.597,2.55,0.634c1.422,0.355,1.679,1.296,1.636,2.042l-1.638,6.571c0.098,0.025,0.225,0.061,0.365,0.117-0.117-0.029-0.242-0.061-0.371-0.092l-2.296,9.205c-0.174,0.432-0.615,1.08-1.609,0.834,0.035,0.051-2.552-0.637-2.552-0.637l-1.743,4.019,4.569,1.139c0.85,0.213,1.683,0.436,2.503,0.646l-1.453,5.834,3.507,0.875,1.439-5.772c0.958,0.26,1.888,0.5,2.798,0.726l-1.434,5.745,3.511,0.875,1.453-5.823c5.987,1.133,10.489,0.676,12.384-4.739,1.527-4.36-0.076-6.875-3.226-8.515,2.294-0.529,4.022-2.038,4.483-5.155zm-8.022,11.249c-1.085,4.36-8.426,2.003-10.806,1.412l1.928-7.729c2.38,0.594,10.012,1.77,8.878,6.317zm1.086-11.312c-0.99,3.966-7.1,1.951-9.082,1.457l1.748-7.01c1.982,0.494,8.365,1.416,7.334,5.553z";
    let chart = am4core.create("chartdiv", am4charts.SlicedChart);
    chart.paddingLeft = am4core.percent(-25);

    chart.data = chartData;
    let series = chart.series.push(new am4charts.PictorialStackedSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "name";

    series.slicesContainer.background.fill = am4core.color("#676767");
    series.slicesContainer.background.fillOpacity = 0.2;

    series.maskSprite.path = iconPath;

    series.labelsContainer.width = am4core.percent(100);
    series.alignLabels = true;
    series.slices.template.propertyFields.fill = "color";
    series.slices.template.propertyFields.stroke = "color";

    let gradientModifier = new am4core.LinearGradientModifier();
    gradientModifier.lightnesses = [0.2, -0.7];
    series.slices.template.fillModifier = gradientModifier;
    series.slices.template.strokeModifier = gradientModifier;
    series.startLocation = getSeriesStartLocation(chart);
    series.endLocation = 1;

    series.hiddenState.properties.startLocation = 1;
    series.ticks.template.locationX = 0.75;
    series.ignoreZeroValues = true;

    let label = series.labels.template;
    label.wrap = true;
    label.maxWidth = 150;

    const htmlAdapter = (text, target, key) => {
      if (target.dataItem && target.dataItem.value < 2000) {
        return `<span role="img" aria-label="close-circle" class="anticon anticon-close-circle"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg></span> {name}`;
      } else {
        return '<span role="img" aria-label="check-circle" class="anticon anticon-check-circle"><svg viewBox="64 64 896 896" focusable="false" class="" data-icon="check-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z"></path><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg></span><span class="anticon-class"></span> {name} ';
      }
    };

    series.tooltipText = "{name}";

    label.adapter.add("html", htmlAdapter);

    return () => {
      chart.dispose();
    };
  }, [loading]);

  return (
    <div>
      {loading && (
        <div style={{ textAlign: "center", marginTop: "15%" }}>
          <img src={infinityLoader} />
        </div>
      )}
      {!loading && (
        <div id="chartdiv" style={{ width: "100%", height: "500px" }} />
      )}
    </div>
  );
}

async function getDepositChartData(web3, depositEvent) {
  let tbtc = await getTbtc(web3);
  let deposit = await tbtc.Deposit.withAddress(
    depositEvent.returnValues._depositContractAddress
  );
  let state = await deposit.getCurrentState();
  let data;
  if (state == 1) {
    data = [
      {
        name: " BTC address generated by signing group",
        value: 1000,
        color: am4core.color("#00d1b2")
      }
    ];
  } else if (state == 2) {
    let bitcoinAddress = await deposit.bitcoinAddress;
    let r = await axios.get(`/btcAddress`, {
      params: {
        btcAddress: bitcoinAddress
      }
    });
    if (r.data.txrefs) {
      let confs = r.data.txrefs[0].confirmations;
      if (confs == process.env.REACT_APP_REQUIRED_CONFIRMATIONS) {
        data = [
          {
            name: ` : BTC confirmations, ${confs}/${
              process.env.REACT_APP_REQUIRED_CONFIRMATIONS
            }`,
            value: 2000,
            color: am4core.color("#00d1b2")
          },
          {
            name: ` Payment sent to BTC address ${shortenEthAddress(
              bitcoinAddress
            )}`,
            value: 2000,
            color: am4core.color("#00d1b2")
          },
          {
            name: " BTC address generated by signing group",
            value: 2000,
            color: am4core.color("#00d1b2")
          }
        ];
      } else {
        data = [
          {
            name: ` Got all confirmations, currently ${confs}/${
              process.env.REACT_APP_REQUIRED_CONFIRMATIONS
            }`,
            value: 1000,
            color: am4core.color("#00d1b2")
          },
          {
            name: ` Payment sent to BTC address ${shortenEthAddress(
              bitcoinAddress
            )}`,
            value: 2000,
            color: am4core.color("#00d1b2")
          },
          {
            name: " BTC address generated by signing group",
            value: 2000,
            color: am4core.color("#00d1b2")
          }
        ];
      }
    } else {
      data = [
        {
          name: ` Payment sent to BTC address ${shortenEthAddress(
            bitcoinAddress
          )}`,
          value: 1000,
          color: am4core.color("#00d1b2")
        },
        {
          name: " BTC address generated by signing group",
          value: 2000,
          color: am4core.color("#00d1b2")
        }
      ];
    }
  } else if (state == 3 || state == 0) {
    data = [
      {
        name: "Setup for this deposit has failed - Please try again.",
        value: 1000,
        color: am4core.color("#00d1b2")
      }
    ];
  } else {
    data = [
      {
        name: " Deposit active & tBTC Minted",
        value: 2000,
        color: am4core.color("#00d1b2")
      },
      {
        name: " Proof sent to signing group",
        value: 2000,
        color: am4core.color("#00d1b2")
      },
      {
        name: ` ${process.env.REACT_APP_REQUIRED_CONFIRMATIONS}/${
          process.env.REACT_APP_REQUIRED_CONFIRMATIONS
        } BTC confirmations`,
        value: 2000,
        color: am4core.color("#00d1b2")
      },
      {
        name: ` Payment sent to BTC address`,
        value: 2000,
        color: am4core.color("#00d1b2")
      },
      {
        name: " BTC address generated by signing group",
        value: 2000,
        color: am4core.color("#00d1b2")
      }
    ];
  }
  return data;
}

async function getTbtc(web3) {
  const tbtc = await TBTC.withConfig({
    web3: web3,
    bitcoinNetwork: "testnet",
    electrum: {
      testnet: {
        server: "electrumx-server.test.tbtc.network",
        port: 50002,
        protocol: "ssl"
      },
      testnetWS: {
        server: "electrumx-server.test.tbtc.network",
        port: 50003,
        protocol: "ws"
      }
    }
  });

  return tbtc;
}
