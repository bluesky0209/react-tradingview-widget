import {
	makeApiRequest,
	generateSymbol,
	parseFullSymbol,
} from './helpers.js';
import axios from "axios";

import {
	subscribeOnStream,
	unsubscribeFromStream,
} from './streaming.js';

const lastBarsCache = new Map();

const configurationData = {
	supported_resolutions: ['1D', '1W', '1M'],
	exchanges: [{
		value: 'SOLANA',
		name: 'SOLANA',
		desc: 'SOLANA',
	}
	],
};

export default {
	onReady: (callback) => {
		console.log('[onReady]: Method call');
		setTimeout(() => callback(configurationData));
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
	) => {
		const symbolData = {
			ticker: "Solana:SOL/USD",
			name: "SOL/USD",
			description: "SOL/USD",
			type: "crypto",
			session: '24x7',
			timezone: 'Etc/UTC',
			exchange: "Solana",
			minmov: 1,
			pricescale: 100,
			has_intraday: false,
			has_no_volume: true,
			has_weekly_and_monthly: false,
			supported_resolutions: configurationData.supported_resolutions,
			volume_precision: 2,
			data_status: 'streaming',
		}
		onSymbolResolvedCallback(symbolData);
	},

	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		const { from, to, firstDataRequest } = periodParams;
		console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
		const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
		const urlParameters = {
			e: parsedSymbol.exchange,
			fsym: parsedSymbol.fromSymbol,
			tsym: parsedSymbol.toSymbol,
			toTs: to,
			limit: 2000,
		};
		const query = Object.keys(urlParameters)
			.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
			.join('&');
		try {
			const data = {
				"Response": "Success", "Type": 100, "Aggregated": false, "TimeTo": 1641513600, "TimeFrom": 1468713600, "FirstValueInArray": true, "ConversionType": { "type": "force_direct", "conversionSymbol": "" },
				"Data": [
					{ "time": 1468713600, "close": 680.37, "high": 689.96, "low": 663.61, "open": 664.41, "volumefrom": 19465.55, "volumeto": 13189216.83, "conversionType": "force_direct", "conversionSymbol": "" },
					{ "time": 1468800000, "close": 674.19, "high": 686.74, "low": 666.02, "open": 683.99, "volumefrom": 17486.99, "volumeto": 11839820.79, "conversionType": "force_direct", "conversionSymbol": "" },
					{ "time": 1468886400, "close": 674.93, "high": 676.51, "low": 665, "open": 673.19, "volumefrom": 10466.13, "volumeto": 7027149.75, "conversionType": "force_direct", "conversionSymbol": "" },
					{ "time": 1468972800, "close": 667.22, "high": 676, "low": 661, "open": 675.08, "volumefrom": 12698.37, "volumeto": 8480645.47, "conversionType": "force_direct", "conversionSymbol": "" },
					{ "time": 1469059200, "close": 664.99, "high": 668, "low": 654.97, "open": 665.6, "volumefrom": 10439.11, "volumeto": 6919560.65, "conversionType": "force_direct", "conversionSymbol": "" }
				]
			};
			// you can use the other data.
			if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
				// "noData" should be set if there is no data in the requested period.
				onHistoryCallback([], {
					noData: true,
				});
				return;
			}

			let bars = [];

			data.Data.forEach(bar => {
				console.log(bar, "ssssssssssssss")
				if (bar.time >= from && bar.time < to) {
					bars = [...bars, {
						time: bar.time * 1000,
						low: bar.low,
						high: bar.high,
						open: bar.open,
						close: bar.close,
					}];
				}
			});

			console.log(`[getBars]: returned ${bars.length} bar(s)`);
			onHistoryCallback(bars, {
				noData: false,
			});
		} catch (error) {
			console.log('[getBars]: Get error', error);
			onErrorCallback(error);
		}
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback,
	) => {
		console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
		subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscribeUID,
			onResetCacheNeededCallback,
			lastBarsCache.get(symbolInfo.full_name),
		);
	},

	unsubscribeBars: (subscriberUID) => {
		console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
		unsubscribeFromStream(subscriberUID);
	},
};
