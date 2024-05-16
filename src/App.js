import { useState } from 'react'
// import Chart from './Chart';
import './App.css';
// import ChartComponent from './ChartComponent';
import StockChart from './StockChart';
import NewStockChart from './NewStockChart';
import "./style.scss";

function App() {
  return (
    <>
      {/* <Chart /> */}
      {/* <ChartComponent /> */}
      {/* <StockChart /> */}
      {/* <NewStockChart /> */}
      <div className="chart-box"
                    style={{ height: '60vh' }}
                  >
                    <div className="">
                    <NewStockChart />
                    </div>
                  </div>
      {/* <XYChart /> */}
    </>
  )
}

export default App
