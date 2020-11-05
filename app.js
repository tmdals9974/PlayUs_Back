require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 4500;

app.use(cors({ origin: true, credentials: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOOSE_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

app.listen(port, () => console.log(`http://localhost:${port}`));
