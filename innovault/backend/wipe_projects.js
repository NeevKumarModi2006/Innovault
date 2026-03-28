require('dotenv').config();
const mongoose = require('mongoose');

async function wipeProjects() {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/innovault');
        console.log('Connected to DB');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const hasProjects = collections.some(c => c.name === 'projects');
        
        if (hasProjects) {
            await mongoose.connection.collection('projects').drop();
            console.log('Successfully dropped the projects collection.');
        } else {
            console.log('Projects collection does not exist yet.');
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
    }
}

wipeProjects();
