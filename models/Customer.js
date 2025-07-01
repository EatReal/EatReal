const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    orderId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productKey: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Customer', customerSchema); 