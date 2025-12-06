const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

const artworkSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    dimensions: { type: String }, // e.g., "24x36 inches"
    medium: { type: String }, // e.g., "Oil on Canvas"
    stock: { type: Number, required: true, default: 1 },
    featured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    views: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
});

const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;
