const mongoose = require('../../database');

const ProductSchema = new mongoose.Schema({
    deviceSerialKey: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    planType: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        default: true
    },
    user: {
        vinculatedUser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;