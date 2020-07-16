const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
console.log(db);

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false, //useFindAndModify set to false so that we can use function FindOneAndUpdate
    });
    console.log('MongoDB Connected!');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
