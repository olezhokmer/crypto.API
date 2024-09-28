const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cryptoSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique : true,
    },
    image: {
        type: String,
        required: true,
    },
    nameFull: {
        type: String,
        required: false,
    },
    marketCapRank: {
        type: Number,
        required: false,
    },
    priceChangeDailyPercent: {
        type: Number,
        required: false,
    },
    predictedPriceChangePercent: {
        type: Number,
        required: false,
    },
    predictedPriceChangeInterval: {
        type: Number,
        required: false,
    },
    predictedPrices: {
        type: Array,
        required: false,
    },
});

module.exports = mongoose.model('Crypto', cryptoSchema);