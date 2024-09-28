const CryptoModel = require("./crypto.model");
const binanceIntegration = require("./binanceIntegration");

const mainQuote = {
    name: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707",
    nameFull: "Tether",
};

class Service {
    constructor() {
        this.runCronJobs().then();
    }

    async getCryptos(page, limit, search, sortBy) {
        const skip = (page - 1) * limit;
        const searchTerm = search ?? '';
        const pipeline = [
            {
                $match: {
                    $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { nameFull: { $regex: searchTerm, $options: 'i' } }
                    ]
                }
            },
            {
                $addFields: {
                    priceChangeDailyPercentAbs: { $abs: "$priceChangeDailyPercent" }
                }
            },
            {
                $sort: sortBy === 'volatility' ? { priceChangeDailyPercentAb: 1 } : { marketCapRank: 1 }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ];
        
        const cryptos = await CryptoModel.aggregate(pipeline);
        

        const totalCount = await CryptoModel.countDocuments();
        const pairs = cryptos.map((crypto) => crypto.name + mainQuote.name);

        const tickers = pairs.length ? (await binanceIntegration.getTickers(pairs)) : [];
        const cryptosMapped = cryptos.map((crypto) => ({
            id: crypto._id,
            name: crypto.name,
            nameFull: crypto.nameFull,
            image: crypto.image,
            price: tickers.find((ticker) => ticker.symbol === crypto.name + mainQuote.name)?.lastPrice,
            mainQuote,
            pairName: crypto.name + mainQuote.name,
            ticker: tickers.find((ticker) => ticker.symbol === crypto.name + mainQuote.name),
        }));

        return {
            data: cryptosMapped,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        };

    }

    async getCryptoInfo(id) {
        const crypto = await CryptoModel.findById(id);

        if (!crypto) return null;

        const pairName = crypto.name + mainQuote.name;
        const [ticker] = await binanceIntegration.getTickers([pairName]);

        return {
            crypto,
            ticker,
            mainQuote,
            pairName,
        };
    }

    async getHistory(pair, interval) {
        const history = await binanceIntegration.getPrices(pair, '1h');
        const cryptoName = pair.slice(0, -mainQuote.name.length);
        
        const crypto = await CryptoModel.findOne({ name: cryptoName });
        console.log(cryptoName, crypto)
        const now = new Date();
        const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
        let nextHourInMillis = nextHour.getTime();

        const predicted = crypto.predictedPrices.map((predicted) => {
            const record = {
                time: nextHourInMillis,
                price: predicted,
            };

            nextHourInMillis += 60 * 60 * 1000;

            return record;
        });

        return {
            currentPrices: history,
            predictedPrices: predicted,
        };
    }

    async runCronJobs() {
        const cryptos = await CryptoModel.find();

        let index = 0;
        setTimeout(() => {
            setInterval(async () => {
                const crypto = cryptos[index];


                const info = await this.getCryptoInfo(crypto._id);
                const history = await binanceIntegration.getPrices(info.pairName, '1h');
                const predicted = await binanceIntegration.predictPrices(history);

                const prices = predicted.map((record) => record.price);
                const first = predicted[0];
                const last = predicted[predicted.length - 1];
                const isShort = last.price < first.price;
                const update = {
                    priceChangeDailyPercent: Number(info.ticker.priceChangePercent),
                    predictedPriceChangePercent: (Math.abs(last.price - first.price) * (isShort ? -1 : 1)) / info.ticker.lastPrice,
                    predictedPriceChangeInterval: Math.abs(last.time - first.time),
                    predictedPrices: prices,
                };

                await CryptoModel.updateOne({ name: crypto.name }, update);
                index++;

                if (index === cryptos.length) {
                    index = 0;
                }
            }, 20000);
        }, 20000);
    }
}

module.exports = new Service();