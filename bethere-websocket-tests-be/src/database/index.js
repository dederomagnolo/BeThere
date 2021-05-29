const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

console.log(process.env.HEROKU_ENV);

// Database connection
mongoose.connect(
  process.env.HEROKU_ENV === "production"
    ? process.env.DB_CONNECTION_PROD
    : process.env.DB_CONNECTION_DEV,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    return err 
      ? console.log(`cannot connect to db: ${err}`) 
      : console.log("connected to db");
  }
);

module.exports = mongoose;