const axios = require('axios');

const numberOfHistoricalRecords = 200;

class BinanceIntegration {
    getBinancePairsString(pairs) {
        return "%5B%22" + pairs.join("%22,%22") + "%22%5D";
    }

    async getTickers(pairs) {
        const pairsStr = this.getBinancePairsString(pairs);
        const response = await axios.get('https://api.binance.com/api/v3/ticker?symbols=' + pairsStr);
        const tickers = response.data;

        return tickers;
    }

    async predictPrices(data) {
        const response = await axios.post('http://127.0.0.1:5000/predict', { prices: data });

        return response.data.predictedPrices;
    }

    async getPrices(pair, interval) {
        const endTime = Date.now();
        let startTime;
    
        switch (interval) {
            case '1h':
                startTime = endTime - 60 * 60 * 1000 * numberOfHistoricalRecords;
                break;
            case '1w':
                startTime = endTime - 7 * 24 * 60 * 60 * 1000 * numberOfHistoricalRecords;
                break;
            case '1M':
                startTime = endTime - 30 * 24 * 60 * 60 * 1000 * numberOfHistoricalRecords;
                break;
        }
    
        const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;
    
        const response = await axios.get(url);
        const prices = response.data.map(data => ({
            time: data[0],
            price: parseFloat(data[4]),
        }));

        return prices;
    }
}

module.exports = new BinanceIntegration();