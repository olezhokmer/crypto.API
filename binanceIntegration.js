const axios = require('axios');

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
}

module.exports = new BinanceIntegration();