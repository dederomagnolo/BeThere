const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // quando busca um user/lista o campo password nao deve ser retornado
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
});

UserSchema.pre('save', async function(next){
    console.log("aqui")
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;