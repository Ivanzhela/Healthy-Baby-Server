const mongoose = require('mongoose');
const { CONNECTION_STRING } = require('./env');

mongoose.set('strictQuery', false);

exports.initDB = async () => {
    try {
        // mongoose.connection.on('open', () => console.log('DB is connected!'));
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        return conn;

    } catch(err) {

        console.log(err.message);
        return process.exit(1);
    }
};