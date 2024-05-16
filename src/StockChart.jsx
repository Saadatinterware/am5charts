import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const StockChart = () => {
  useEffect(() => {
    // Create root element
    const root = am5.Root.new("chartdiv");

    const myTheme = am5.Theme.new(root);

    myTheme.rule("Grid", ["scrollbar", "minor"]).setAll({
      visible: false
    });

    root.setThemes([
      am5themes_Animated.new(root),
      myTheme
    ]);

    // Create a stock chart
    const stockChart = root.container.children.push(
      am5stock.StockChart.new(root, {
        paddingRight: 0
      })
    );

    // Set global number format
    root.numberFormatter.set("numberFormat", "#,###.00");

    // let container = am5.Container.new(root, {
    //   centerY: am5.p50,
    //   // draggable: true,
    //   // layout: root.verticalLayout
    //   layout: root.horizontalLayout
    // })
    


    // Create a main stock panel (chart)
    const mainPanel = stockChart.panels.push(
      am5stock.StockPanel.new(root, {
        wheelY: "zoomX",
        panX: true,
        panY: true
      })
    );

    // Create value axis
    const valueAxis = mainPanel.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom"
        }),
        extraMin: 0.1, // adds some space for for main series
        tooltip: am5.Tooltip.new(root, {}),
        numberFormat: "#,###.00",
        extraTooltipPrecision: 2
      })
    );

    const dateAxis = mainPanel.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        extraMax: 0.1,
        baseInterval: {
          timeUnit: "minute",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {
          pan: "zoom",
          minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    // add range which will show current value
    const currentValueDataItem = valueAxis.createAxisRange(valueAxis.makeDataItem({ value: 0 }));

    // let label = currentValueDataItem.children.push(am5.Label.new(root, {
    //   paddingTop: 5,
    //   paddingBottom: 5
    // }))

    // console.log(label);

    const currentLabel = currentValueDataItem.get("label");
    if (currentLabel) {
      currentLabel.setAll({
        fill: am5.color(0xffffff),
        background: am5.Rectangle.new(root, { fill: am5.color(0x000000) })
      })
    }

    const currentGrid = currentValueDataItem.get("grid");
    if (currentGrid) {
      currentGrid.setAll({ strokeOpacity: 0.5, strokeDasharray: [2, 5] });
    }

    // Add series
    const valueSeries = mainPanel.series.push(
      am5xy.CandlestickSeries.new(root, {
        name: "AMCH",
        clustered: false,
        valueXField: "Date",
        valueYField: "Close",
        highValueYField: "High",
        lowValueYField: "Low",
        openValueYField: "Open",
        calculateAggregates: true,
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText:
          "open: [bold]{openValueY}[/] high: [bold]{highValueY}[/] low: [bold]{lowValueY}[/] close: [bold]{valueY}[/]",
        legendRangeValueText: ""
      })
    );

    // Set main value series
    stockChart.set("stockSeries", valueSeries);

    // Add a stock legend
    const valueLegend = mainPanel.plotContainer.children.push(
      am5stock.StockLegend.new(root, {
        stockChart: stockChart
      })
    );

    // Set main series
    valueLegend.data.setAll([valueSeries]);

    // Add cursor(s)
    mainPanel.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        yAxis: valueAxis,
        xAxis: dateAxis,
        snapToSeries: [valueSeries],
        snapToSeriesBy: "y!"
      })
    );

    // Add scrollbar
    const scrollbar = mainPanel.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 10
      })
    );
    stockChart.toolsContainer.children.push(scrollbar);

    const sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.GaplessDateAxis.new(root, {
        extraMax: 0.1,
        baseInterval: {
          timeUnit: "minute",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true
        })
      })
    );

    const sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    const sbSeries = scrollbar.chart.series.push(
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

    // Data generator
    let firstDate = new Date();
    let lastDate;
    let value = 1200;


    //This part belongs to api
    // data
    function generateChartData() {
      let chartData = [];

      for (let i = 0; i < 50; i++) {
        let newDate = new Date(firstDate);
        newDate.setMinutes(newDate.getMinutes() - i);

        value += Math.round((Math.random() < 0.49 ? 1 : -1) * Math.random() * 10);

        let open = value + Math.round(Math.random() * 16 - 8);
        let low = Math.min(value, open) - Math.round(Math.random() * 5);
        let high = Math.max(value, open) + Math.round(Math.random() * 5);

        chartData.unshift({
          Date: newDate.getTime(),
          Close: value,
          Open: open,
          Low: low,
          High: high
        });

        lastDate = newDate;
      }
      return chartData;
    }

    let data = generateChartData();

    // set data to all series
    valueSeries.data.setAll(data);
    sbSeries.data.setAll(data);

    // update data
    let previousDate;

    //This belongs to ws
    setInterval(() => {
      let valueSeries = stockChart.get("stockSeries");
      let date = Date.now();
      let lastDataObject = valueSeries.data.getIndex(valueSeries.data.length - 1);
      if (lastDataObject) {
        let previousDate = lastDataObject.Date;
        let previousValue = lastDataObject.Close;

        value = am5.math.round(previousValue + (Math.random() < 0.5 ? 1 : -1) * Math.random() * 2, 2);

        let high = lastDataObject.High;
        let low = lastDataObject.Low;
        let open = lastDataObject.Open;

        if (am5.time.checkChange(date, previousDate, "minute")) {
          open = value;
          high = value;
          low = value;

          let dObj1 = {
            Date: date,
            Close: value,
            Open: value,
            Low: value,
            High: value
          };

          valueSeries.data.push(dObj1);
          sbSeries.data.push(dObj1);
          previousDate = date;
        } else {
          if (value > high) {
            high = value;
          }

          if (value < low) {
            low = value;
          }

          let dObj2 = {
            Date: date,
            Close: value,
            Open: open,
            Low: low,
            High: high
          };

          valueSeries.data.setIndex(valueSeries.data.length - 1, dObj2);
          sbSeries.data.setIndex(sbSeries.data.length - 1, dObj2);
        }
        // update current value
        if (currentLabel) {
          currentValueDataItem.animate({ key: "value", to: value, duration: 500, easing: am5.ease.out(am5.ease.cubic) });
          currentLabel.set("text", stockChart.getNumberFormatter().format(value));

          let bg = currentLabel.get("background");
          if (bg) {
            if (value < open) {
              bg.set("fill", root.interfaceColors.get("negative"));
            }
            else {
              bg.set("fill", root.interfaceColors.get("positive"));
            }
          }
        }
      }
    }, 1000);

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
};

export default StockChart;
