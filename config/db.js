const { connect } = require("mongoose");

async function connectdb() {
  try {
    await connect(process.env.MONGO_URI);
    console.log("db connected");
  } catch (error) {
    console.log({ message: error.message });
  }
}

module.exports = connectdb;
