const mongoose = require('mongoose');

const connectToMongoDB = async (uri) => {
    try{
        await mongoose.connect(uri);
        console.log('Database Connected');
    }catch(err){
        console.log('Error in mongoDB connection');
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectToMongoDB;