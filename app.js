require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const jobScheduler = require('./utility/jsftp');

app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(cors());
app.use(helmet());

const port = process.env.PORT || 3128;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  jobScheduler();
});
