import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import axios from 'axios';
let root = null;
let ws = null;
const App = () => {
  useEffect(() => {
    chartSetup()

    return () => {
      console.log("disposeing");
      if (root) {
        root.dispose();
      }
      // ws.close();
    };
  }, []);


  const chartSetup = () => {
    root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a stock chart
    var stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {})
    );

    // Set global number format
    root.numberFormatter.set("numberFormat", "#,###.00");

    //
    // Main (value) panel
    //

    var mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true,
        height: am5.percent(70)
      })
    );

    var valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom"
        }),
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2
      })
    );

    var dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: "day",
          count: 1
        },
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    var valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: "MSFT",
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText: "{valueY}"
      })
    );

    stockChart.set("stockSeries", valueSeries);

    var valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, {
        stockChart: stockChart
      })
    );
    valueLegend.data.setAll([valueSeries]);

    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!"
      })
    );

    var scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50
      })
    );
    stockChart.toolsContainer.children.push(scrollbar);

    var sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        baseInterval: {
          timeUnit: "day",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    var sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    var sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "Close",
        valueXField: "Date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis
      })
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });

    // Define the URL
const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&limit=1000&interval=1m';

// Make the Axios request
axios.get(url)
  .then(response => {
    // Handle the response data here
    const res = am5.JSONParser.parse(response);
    const data = res.data;
    console.log(data);

    let processor = am5.DataProcessor.new(root, {
      dateFields: ["Date"],
      //dateFormat: "yyyy-MM-dd",
      numericFields: [
        "Open",
        "High",
        "Low",
        "Close",
        "Adj Close",
        "Volume",
      ],
    });
    processor.processMany(data);

    const chartData = data.map((item) => {
      return {
        Date: new Date(item[0]).getTime(), // Assuming the timestamp is in milliseconds
        Open: parseFloat(item[1]),
        High: parseFloat(item[2]),
        Low: parseFloat(item[3]),
        Close: parseFloat(item[4]),
        Volume: parseFloat(item[5]),
      };
    });
    console.log(chartData);

    valueSeries.data.push(
      {chartData}
    );

    

    // Set data
    am5.array.each(sbSeries, function (item) {
      item.data.setAll(chartData);
      // let waitLoading;
      // clearTimeout(waitLoading);
      // waitLoading = setTimeout(() => {
      //   if (document.getElementsByClassName("chart-preloader")[0] != undefined) {
      //     document
      //       .getElementsByClassName("chart-preloader")[0]
      //       .setAttribute("role", "hide");
      //   }
      // }, 4000);
    });
  })
  .catch(error => {
    // Handle any errors here
    console.error('Error fetching data:', error);
  });

    // WebSocket
    // ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   const kline = message.k;
    //   valueSeries.data.push({
    //     Date: new Date(kline.t).getTime(),
    //     Open: parseFloat(kline.o),
    //     High: parseFloat(kline.h),
    //     Low: parseFloat(kline.l),
    //     Close: parseFloat(kline.c),
    //     Volume: parseFloat(kline.v)
    //   });

    //   console.log(" before", sbSeries);
      
    //   // Update scrollbar series
    //   sbSeries.data.push({
    //     Date: new Date(kline.t).getTime(),
    //     Close: parseFloat(kline.c)
    //   });
    //   console.log(" after", sbSeries);
    // };


    
  }

  return (
    <>
      <div
        id="chartcontrols"
        style={{ height: "auto", padding: "5px 45px 0 15px" }}
      ></div>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    </>
  );
};

export default App;
