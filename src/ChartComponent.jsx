import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5stock from "@amcharts/amcharts5/stock";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
const ChartComponent = () => {
  useEffect(() => {
    // Create root element
    let root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0
    }));

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineX.set("forceHidden", true);
    cursor.lineY.set("forceHidden", true);

    // Generate random data
    let date = new Date();
    date.setHours(0, 0, 0, 0);

    let value = 20;
    function generateData() {
      value = am5.math.round(Math.random() * 10 - 4.8 + value, 1);
      if (value < 0) {
        value = Math.random() * 10;
      }

      if (value > 100) {
        value = 100 - Math.random() * 10;
      }
      am5.time.add(date, "day", 1);
      return {
        date: date.getTime(),
        value: value
      };
    }

    function generateDatas(count) {
      let data = [];
      for (var i = 0; i < count; ++i) {
        data.push(generateData());
      }
      return data;
    }

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
        minGridDistance: 90
      })
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    // Add series
    let series = chart.series.push(am5xy.LineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true
    });

    // Add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    // DRAGGABLE RANGE
    let rangeDataItem = yAxis.makeDataItem({});
    yAxis.createAxisRange(rangeDataItem);

    let container = am5.Container.new(root, {
      centerY: am5.p50,
      // draggable: true,
      // layout: root.verticalLayout
      layout: root.horizontalLayout
    })

    // container.adapters.add("x", function() {
    //   return 0;
    // });

    // container.adapters.add("y", function(y) {
    //   return Math.max(0, Math.min(chart.plotContainer.height(), y));
    // });

    // container.events.on("dragged", function() {
    //   updateLabel();
    // });

    yAxis.topGridContainer.children.push(container);

    rangeDataItem.set("bullet", am5xy.AxisBullet.new(root, {
      sprite: container
    }));

    rangeDataItem.get("grid").setAll({
      strokeOpacity: 1,
      visible: true,
      stroke: am5.color(0x000000),
      strokeDasharray: [2, 2]
    })

    let background = am5.RoundedRectangle.new(root, {
      fill: am5.color(0xffffff),
      fillOpacity: 1,
      strokeOpacity: 0.5,
      cornerRadiusTL: 0,
      cornerRadiusBL: 0,
      cursorOverStyle: "ns-resize",
      stroke: am5.color(0xff0000)
    })

    container.set("background", background);

    let label = container.children.push(am5.Label.new(root, {
      paddingTop: 5,
      paddingBottom: 5
    }))

    let xButton = container.children.push(am5.Button.new(root, {
      cursorOverStyle: "pointer",
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 2,
      paddingRight: 8
    }))

    xButton.set("label", am5.Label.new(root, {
      text: "X",
      paddingBottom: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingLeft: 0,
      fill: am5.color(0xff0000)
    }))

    xButton.get("background").setAll({
      strokeOpacity: 0,
      fillOpacity: 0
    })

    xButton.events.on("click", function() {
      yAxis.disposeDataItem(rangeDataItem);
    })

    function updateLabel(value) {
      let y = container.y();
      console.log('conatiner y', y);
      let position = yAxis.toAxisPosition(y / chart.plotContainer.height());
console.log("positions", position);
      if (value == null) {
        value = yAxis.positionToValue(position);
      }

      label.set("text", root.numberFormatter.format(value, "#.00") + ">Stop loss");

      rangeDataItem.set("value", value);
    }

    series.events.on("datavalidated", () => {
      let max = yAxis.getPrivate("max", 1);
      let min = yAxis.getPrivate("min", 0);

      let value = min + (max - min) / 2;
      rangeDataItem.set("value", value);
      updateLabel(value);
    })

    let data = generateDatas(300);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
};

export default ChartComponent;
