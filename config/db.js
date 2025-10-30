const { connect } = require("mongoose");

async function connectdb() {
  try {
    await connect("mongodb://localhost:27017");
    console.log("db connected");
  } catch (error) {
    console.log({ message: error.message });
  }
}

module.exports = connectdb;
