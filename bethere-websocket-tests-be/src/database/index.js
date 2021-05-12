const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/be-there" , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

/* const clusterUri = "mongodb+srv://debora:tininha123@bethere-bd.ppxvl.mongodb.net/<dbname>?retryWrites=true&w=majority" */

/* mongoose.connect(
  clusterUri,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connected to db")
); */

module.exports = mongoose;