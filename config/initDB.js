const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

exports.initDB = async () => {
    try {
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