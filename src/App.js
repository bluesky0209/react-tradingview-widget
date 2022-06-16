import Datafeed from './datafeed.js';
import { widget } from "./charting_library"
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    window.tvWidget = new widget({
      symbol: 'Bitfinex:BTC/USD', // default symbol
      interval: '1D', // default interval
      fullscreen: true, // displays the chart in the fullscreen mode
      container: 'tv_chart_container',
      datafeed: Datafeed,
      theme: 'Dark',
      library_path: './charting_library/',
    });
  })
  return (
    <div id="tv_chart_container"></div>
  );
}

export default App;
