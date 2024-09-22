const CryptoModel = require("./crypto.model");
const binanceIntegration = require("./binanceIntegration");

const mainQuote = {
    name: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707",
    nameFull: "Tether",
};

class Service {
    async getCryptos(page, limit) {
        const skip = (page - 1) * limit;

        const cryptos = await CryptoModel.find()
            .sort({ marketCapRank: 1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await CryptoModel.countDocuments();
        const pairs = cryptos.map((crypto) => crypto.name + mainQuote.name);

        const tickers = await binanceIntegration.getTickers(pairs);
        const cryptosMapped = cryptos.map((crypto) => ({
            id: crypto._id,
            name: crypto.name,
            nameFull: crypto.nameFull,
            image: crypto.image,
            price: tickers.find((ticker) => ticker.symbol === crypto.name + mainQuote.name)?.lastPrice,
        }));

        return {
            data: cryptosMapped,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        };

    }
}

module.exports = new Service();