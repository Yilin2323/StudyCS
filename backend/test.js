const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const username = 'route_test';
        const email = 'route_test@test.com';
        const password = 'password123';

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) console.log('exists');

        user = new User({ username, email, password });
        await user.save();
        console.log('SUCCESS');

    } catch (err) {
        console.error('🔥 CAUGHT IT:', err);
    } finally {
        process.exit();
    }
}
test();
