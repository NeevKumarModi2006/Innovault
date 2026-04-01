const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
    try {
        const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/innovault';
        console.log('Connecting to database...');
        await mongoose.connect(url);
        
        console.log('Dropping database...');
        await mongoose.connection.db.dropDatabase();
        
        console.log('✅ Database cleared successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing database:', err);
        process.exit(1);
    }
}

clearDatabase();
