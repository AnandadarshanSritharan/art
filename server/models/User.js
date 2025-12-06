const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isArtist: { type: Boolean, default: false },
    bio: { type: String },
    profileImage: { type: String },
    socialLinks: {
        website: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        whatsapp: { type: String },
    },
    phone: { type: String },
    address: { type: String },
    country: { type: String },
    termsAccepted: { type: Boolean, default: false },
    termsVersion: { type: Number },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
