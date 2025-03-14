import React, { useEffect, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import './style.scss';

const NewStockChart = () => {
  let root = null;
  let stockChart = null;
  let currentLabel = null;
  let currentValueDataItem = null;
  let ws = null;

  const [klinesLiveData, setKlinesLiveData] = useState(null);
  const [myCurrentLabel, setMyCurrentLabel] = useState(null);
  const [myCurrentValueDataItem, setMyCurrentValueDataItem] = useState(null);
  const [myStockChart, setMyStockChart] = useState(null);
  const [chartChanged, setChartChanged] = useState(false);

  useEffect(() => {
    console.log('chartsetup log');
    newChartSetup();
    ws_klines();

    return () => {
      root.dispose();
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (klinesLiveData) {
      newUpdateLiveFeedData();
    }
  }, [klinesLiveData]);

  const ws_klines = () => {
    ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (event) => {
      const klines_data = JSON.parse(event.data);

      const liveFeedData = {
        Date: new Date(klines_data.k.t).getTime(), // Assuming the timestamp is in milliseconds
        Open: parseFloat(klines_data.k.o),
        High: parseFloat(klines_data.k.h),
        Low: parseFloat(klines_data.k.l),
        Close: parseFloat(klines_data.k.c),
        Volume: parseFloat(klines_data.k.v),
      };

      setKlinesLiveData(liveFeedData);
    };
  }

  const newUpdateLiveFeedData = () => {
    // Get the series for candlestick chart
    let valueSeries = myStockChart.get("stockSeries");

    // Get the current timestamp
    let date = klinesLiveData.Date; //Date.now();

    // Variable to store the new value for the live feed
    let value;
    let volume;

    // Get the last data object in the series
    let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
    if (lastDataObject) {
      // Get the previous date and closing value from the last data object
      let previousDate = lastDataObject.Date;
      let previousValue = lastDataObject.Close;

      // set live price value
      value = klinesLiveData.Close;
      volume = klinesLiveData.Volume;

      // Get the high, low, and open values from the last data object
      let high = lastDataObject.High;
      let low = lastDataObject.Low;
      let open = lastDataObject.Open;

      // Check if a minute has passed since the previous data point
      if (am5.time.checkChange(date, previousDate, "minute")) {
        open = value;
        high = value;
        low = value;

        let dObj1 = {
          Date: date,
          Close: value,
          Open: value,
          Low: value,
          High: value,
          Volume: volume,
        };

        // Add the new data object to the series
        valueSeries.data.push(dObj1);

        previousDate = date;
      } else {
        if (value > high) {
          high = value;
        }

        if (value < low) {
          low = value;
        }

        // Update the existing data object for the current minute
        let dObj2 = {
          Date: date,
          Close: value,
          Open: open,
          Low: low,
          High: high,
          Volume: volume,
        };

        // Replace the last data object in the series with the updated data
        valueSeries.data.setIndex(valueSeries.data.length - 1, dObj2);
      }
      // Update the live data label and animation if available
      if (myCurrentLabel) {
        myCurrentValueDataItem.set("value", value);
        myCurrentLabel.set("text", value);
        let bg = myCurrentLabel.get("background");
        if (bg) {
          if (value < open) {
            bg.set("fill", 'red');
          }
          else {
            bg.set("fill", 'green');
          }
        }
      }

    }

  }

  // data
  const generateChartData = (series) => {
    const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&limit=1000&interval=1m';
    // const url = 'http://192.168.100.80:8800/match-trader-klines?s=BTCUSD&tf=1m&userId=1&sId=2418&categoryId=2';

    am5.net
      .load(url)
      .then(function (result) {
        // Set data on all series of the chart
        // const res = am5.JSONParser.parse(result.response);
        let res = JSON.parse(result.response)


        const chartData = res.map((item) => {
          return {
            Date: new Date(item[0]).getTime(), // Assuming the timestamp is in milliseconds
            Open: parseFloat(item[1]),
            High: parseFloat(item[2]),
            Low: parseFloat(item[3]),
            Close: parseFloat(item[4]),
            Volume: parseFloat(item[5]),
          };
        });
        // Load the first 50 candles initially
        series.data.setAll(chartData);
        // //2nd series parameter
        // series.data.setAll(chartData);

      });

  }


  const loadAdditionalData = (series, axis) => {
    const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&limit=1000&interval=1m';
  
    am5.net
      .load(url)
      .then((result) => {
        let res = JSON.parse(result.response);
  
        const newChartData = res.map((item) => {
          return {
            Date: new Date(item[0]).getTime(),
            RealDate: new Date(item[0]),
            Open: parseFloat(item[1]),
            High: parseFloat(item[2]),
            Low: parseFloat(item[3]),
            Close: parseFloat(item[4]),
            Volume: parseFloat(item[5]),
          };
        });
  
        // Append new data to existing chart data
        series.data.insertIndex(0, ...newChartData); // Add new candles at the beginning
  
        // Update the axis range to include new data
        axis.set("start", 0.1); // Adjust this based on how much you want to zoom
        axis.set("end", 1.0);
      });
  };
  


  const newChartSetup = () => {
    // if (root && ws) {
    //   root.dispose();
    //   ws.close();
    // }
    // Create root element
    root = am5.Root.new("chartdiv");

    const myTheme = am5.Theme.new(root);

    // myTheme.rule("Grid", ["scrollbar", "minor"]).setAll({
    //   visible: false
    // });

    myTheme.rule("Grid").setAll({
      // fill: am5.color(0x808080),
      stroke: am5.color(0x808080),
      strokeWidth: 1,
    });

    myTheme.rule("Label").setAll({
      fill: am5.color(0x808080),
    });

    myTheme.rule("Candlestick").states.create("riseFromOpen", {
      fill: am5.color('rgb(17, 209, 97)'),
      stroke: am5.color('rgb(17, 209, 97)')
    });
    
    myTheme.rule("Candlestick").states.create("dropFromOpen", {
      fill: am5.color('rgb(17, 209, 97)'),
      stroke: am5.color('rgb(17, 209, 97)')
    });

    // root.setThemes([
    //   am5themes_Animated.new(root),
    //   myTheme
    // ]);

    // root.setThemes([
    //   am5themes_Dark.new(root),
    //   myTheme,
    // ]);

    // root.setThemes([
    //   am5themes_Animated.new(root),
    //   am5themes_Dark.new(root),
    //   myTheme,
    // ]);

    //     root.setThemes(
    //    [am5themes_Animated.new(root), am5themes_Dark.new(root), myTheme],
    // );

    // root.set("background", am5.Rectangle.new(root, {
    //   fill: am5.color(0xf0f0f0), // Replace with your desired color code
    //   fillOpacity: 1
    // }));

  //   root.container.set("background", am5.Rectangle.new(root, {
  //     fill: am5.color(0xf3f3f3) // Set your desired color here
  // }));
    

    // Create a stock chart
    stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {
        paddingRight: 0,
        // background: am5.color('rgb(17, 209, 97)')
      })
    );
    setMyStockChart(stockChart);

    // Set global number format
    root.numberFormatter.set("numberFormat", "#,###.00");

    // Create a main stock panel (chart)
    const mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true,
        pinchZoomX: true,
        // fill: am5.color(0xf3f3f3)
      })
    );

    // Create value axis
    // const valueAxis = mainPanel.yAxes.push(
    //   am5xy.ValueAxis.new(root, {
    //     renderer: am5xy.AxisRendererY.new(root, {
    //       pan: "zoom"
    //     }),
    //     extraMin: 0.1, // adds some space for for main series
    //     tooltip: am5.Tooltip.new(root, {}),
    //     numberFormat: "#,###.00",
    //     extraTooltipPrecision: 2
    //   })
    // );

    let valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        start: 1.5, //show 10% candles on load
        autoZoom: true,
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
        extraMin: 0.1, // adds some space for for main series
        extraMax: 0.4, // adds some space for for main series
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2,
      })
    );

    // const dateAxis = mainPanel.xAxes.push(
    //   am5xy.GaplessDateAxis.new(root, {
    //     extraMax: 0.1,
    //     baseInterval: {
    //       timeUnit: "minute",
    //       count: 1
    //     },
    //     renderer: am5xy.AxisRendererX.new(root, {
    //       pan: "zoom",
    //       minorGridEnabled: true
    //     }),
    //     tooltip: am5.Tooltip.new(root, {}),
    //     end: 1.1,
    //   })
    // );

    let dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        start: 0.9, //show  10% candles on load
        // minZoomCount: 4,
        // groupData: true,
        // groupCount: 30,
        baseInterval: {
          timeUnit: "minute",
          count: 1,
        },
        // gridIntervals: [
        //   { timeUnit: "minute", count: 1 },
        //   { timeUnit: "minute", count: 5 },
        //   { timeUnit: "minute", count: 10 },
        //   { timeUnit: "minute", count: 15 },
        //   { timeUnit: "minute", count: 100 },
        //   { timeUnit: "day", count: 1 },
        //   { timeUnit: "day", count: 1 },
        //   { timeUnit: "month", count: 1 },
        // ],
        renderer: am5xy.AxisRendererX.new(root, {
          pan: "zoom",
        }),
        tooltip: am5.Tooltip.new(root, {}),
        end: 1.1, // increase the end value to add space on the right side
      })
    );

console.log(dateAxis.events);

    dateAxis.events.on("rangechanged", (ev) => {
      const axis = ev.target;

      console.log("range changed", axis);
      
    
      // Check if the user scrolled to the leftmost point
      if (axis.get("start") === 0) {
        loadAdditionalData(valueSeries, axis);
      }
    });
    mainPanel.events.on("wheelended", (ev) => {
      const axis = ev.target;

      console.log("wheel changed", axis);
      
    
      // Check if the user scrolled to the leftmost point
      if (axis.get("start") === 0) {
        loadAdditionalData(valueSeries, axis);
      }
    });

    // add range which will show current value
    currentValueDataItem = valueAxis.createAxisRange(valueAxis.makeDataItem({ value: 0 }));

    setMyCurrentValueDataItem(currentValueDataItem);

    currentLabel = currentValueDataItem.get("label");
    if (currentLabel) {
      currentLabel.setAll({
        fill: am5.color(0xffffff),
        background: am5.Rectangle.new(root, { fill: am5.color(0x000000) })
      })

      setMyCurrentLabel(currentLabel);
    }

    const currentGrid = currentValueDataItem.get("grid");
    if (currentGrid) {
      currentGrid.setAll({ strokeOpacity: 0.5, strokeDasharray: [2, 5] });
    }

    // Adding value series
    const valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: 'selectedSymbol',
        clustered: false,
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        // riseFromOpen: am5.color('rgb(17, 209, 97)'),
        // riseFromOpen: am5.color('rgb(17, 209, 97)')
      })
    );

    //#region Volume axis start
    var volumeAxisRenderer = am5xy.AxisRendererY.new(root, {
      inside: true
    });

    volumeAxisRenderer.labels.template.set("forceHidden", true);
    volumeAxisRenderer.grid.template.set("forceHidden", true);

    var volumeValueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
      numberFormat: "#.#a",
      height: am5.percent(20),
      y: am5.percent(100),
      centerY: am5.percent(100),
      renderer: volumeAxisRenderer
    }));

    var volumeSeries = mainPanel.series.push(am5xy.ColumnSeries.new(root, {
      name: "Volume",
      clustered: false,
      valueXField: "Date",
      valueYField: "Volume",
      xAxis: dateAxis,
      yAxis: volumeValueAxis,
      legendValueText: "[bold]{valueY.formatNumber('#,###.0a')}[/]"
    }));

    volumeSeries.columns.template.setAll({
      strokeOpacity: 0,
      fillOpacity: 0.2
    });

    // color columns by stock rules
    volumeSeries.columns.template.adapters.add("fill", function (fill, target) {
      return am5.color('#ffff00');
    })

    //#endregion


    // SET default color to chart candles
    // setTimeout(() => {
    //   console.log('before', valueSeries.columns.template.states);

    //   valueSeries.columns.template.states.create("riseFromOpen", {
    //     fill: am5.color('rgb(17, 209, 97)'),
    //     stroke: am5.color('rgb(17, 209, 97)')
    //   });

    //   valueSeries.columns.template.states.create("dropFromOpen", {
    //     fill: am5.color('rgb(245, 36, 36)'),
    //     stroke: am5.color('rgb(245, 36, 36)')
    //   });
    //   // valueSeries.dropFromOpenState.properties.fill = am5.color('rgb(245, 36, 36)');
    //   // valueSeries.dropFromOpenState.properties.stroke =  am5.color('rgb(245, 36, 36)');
    // }, 1000);

    // Set main value/volume series
    stockChart.set("stockSeries", valueSeries);
    stockChart.set("volumeSeries", volumeSeries);


    // Add a stock legend Shows on the left top of chart
    // const valueLegend = mainPanel.plotContainer.children.push(
    //   am5stock.StockLegend.new(root, {
    //     stockChart: stockChart
    //   })
    // );

    // // Set main series
    // valueLegend.data.setAll([valueSeries]);

    // Add cursor(s)
    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        // snapToSeries: [valueSeries],
        // snapToSeriesBy: "y!"
      })
    );

    // Add scrollbar
    // const scrollbar = mainPanel.set(
    //   "scrollbarX",
    //   am5xy.XYChartScrollbar.new(root, {
    //     orientation: "horizontal",
    //     height: 10
    //   })
    // );
    // stockChart.toolsContainer.children.push(scrollbar);

    var scrollbarX = am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
      width: 100,
      x: am5.p100,
      centerX: am5.p100,
      dx: -65,
      y: 8,
      centerY: am5.p100,
    });

    // scrollbarX.thumb.setAll({
    //   fill: am5.color('#000000'),
    //   fillOpacity: 0
    // });

    scrollbarX.startGrip.setAll({
      visible: true,
      scale: 0.6
    });

    scrollbarX.endGrip.setAll({
      visible: true,
      scale: 0.6
    });

    // scrollbarX.get("background").setAll({
    //   fill: am5.color('#000000'),
    //   fillOpacity: 0,
    //   cornerRadiusTR: 100,
    //   cornerRadiusBR: 100,
    //   cornerRadiusTL: 100,
    //   cornerRadiusBL: 100
    // });

    // mainPanel.set("scrollbarX", scrollbarX);


    var seriesSwitcher = am5stock.SeriesTypeControl.new(root, {
      stockChart: stockChart
    });

    seriesSwitcher.events.on("selected", function (ev) {
      setSeriesType(ev.item.id);
    });

    function getNewSettings(series) {
      var newSettings = [];
      am5.array.each(["name", "valueYField", "highValueYField", "lowValueYField", "openValueYField", "calculateAggregates", "valueXField", "xAxis", "yAxis", "legendValueText", "stroke", "fill"], function (setting) {
        newSettings[setting] = series.get(setting);
      });
        // Include custom states for candlestick series
  // if (series instanceof am5xy.CandlestickSeries) {
  // console.log('instance of');
  //   newSettings.states = series.states;
  // }

      return newSettings;
    }

    function setSeriesType(seriesType) {
      // Get current series and its settings
      var currentSeries = stockChart.get("stockSeries");
      var newSettings = getNewSettings(currentSeries);

      // Remove previous series
      var data = currentSeries.data.values;
      mainPanel.series.removeValue(currentSeries);

      // Create new series
      var series;
      var selST;
      switch (seriesType) {
        case "line":
          series = mainPanel.series.push(am5xy.LineSeries.new(root, newSettings));
          selST = seriesType;
          break;
        case "candlestick":
        case "procandlestick":
          newSettings.clustered = false;
          series = mainPanel.series.push(am5xy.CandlestickSeries.new(root, newSettings));
          if (seriesType == "procandlestick") {
            series.columns.template.get("themeTags").push("pro");
          }
          selST = seriesType;
          break;
        case "ohlc":
          newSettings.clustered = false;
          series = mainPanel.series.push(am5xy.OHLCSeries.new(root, newSettings));
          selST = seriesType;
          break;
      }

      // Set new series as stockSeries
      if (series) {
        // valueLegend.data.removeValue(currentSeries);
        // console.log('data of series', data);
        if (selST != 'line'
        ) {

          // setTimeout(() => {
          //   series.columns.template.states.create("riseFromOpen", {
          //     fill: am5.color('rgb(17, 209, 97)'),
          //     stroke: am5.color('rgb(17, 209, 97)')
          //   });

          //   series.columns.template.states.create("dropFromOpen", {
          //     fill: am5.color('rgb(245, 36, 36)'),
          //     stroke: am5.color('rgb(245, 36, 36)')
          //   });
          // }, 1000);

        }
        series.data.setAll(data);
        stockChart.set("stockSeries", series);
        // var cursor = mainPanel.get("cursor");
        // if (cursor) {
        //   cursor.set("snapToSeries", [series]);
        // }
        // valueLegend.data.insertIndex(0, series);
      }
    }



    // Stock toolbar
    let toolbar = am5stock.StockToolbar.new(root, {
      container: document.getElementById("chartcontrols"),
      stockChart: stockChart,
      controls: [
        // symbolSearchList,
        seriesSwitcher,
        // am5stock.SeriesTypeControl.new(root, {
        //     stockChart: stockChart
        // }),
        // intervalSwitcher,
        // am5stock.IndicatorControl.new(root, {
        //   stockChart: stockChart,
        //   // legend: valueLegend,
        // }),
        // am5stock.DrawingControl.new(root, {
        //   stockChart: stockChart,
        // }),
        // am5stock.ResetControl.new(root, {
        //   stockChart: stockChart,
        // }),
        // am5stock.SettingsControl.new(root, {
        //   stockChart: stockChart,
        // }),
        // am5stock.DataSaveControl.new(root, {
        //   stockChart: stockChart,
        // }),
        am5stock.IndicatorControl.new(root, {
          stockChart: stockChart,
        }),
        am5stock.DrawingControl.new(root, {
          stockChart: stockChart,
        }), 
        am5stock.SettingsControl.new(root, {
          stockChart: stockChart,
        }),
        am5stock.ResetControl.new(root, {
          stockChart: stockChart,
        }),
      ],
    });

    //two ways to achive this functionality
    generateChartData(valueSeries)
    // generateChartData([valueSeries])

    // root.autoResize = false;

  }

  return (
    <div className="Chart">
      <div id="chartcontrols"></div>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>

    </div>

  );
};

export default NewStockChart;
