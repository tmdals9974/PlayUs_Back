require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4500;

app.use(require('cors')())
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;

// CONNECT TO MONGODB SERVER
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

app.use('/users', require('./routes/users'));

app.listen(port, () => console.log(`Server listening on port ${port} / http://localhost:${port}`));
