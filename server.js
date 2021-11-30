const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = 4000

// parse requests of content-type: application/json
app.use(bodyParser.json());

app.use(cors({
    origin: process.env.FRONT_END_URL
}));

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
// });

require("./app/routes/routes")(app);

// set port, listen for requests
app.listen(port, () => {
    console.log("Server is running on port 4000.");
});