const MongoClient = require('mongodb').MongoClient;
const R = require('ramda');
const { people, courses, trainingSessions } = require('./training-data.js');
const createAllCollections = require('./load');
const extractData = require('./extract');

const url = 'mongodb://localhost:27017/mongoTraining';

MongoClient.connect(url)
  .then(createAllCollections)
  .then(db => {
    extractData(db);
    db.close();
  })
  .catch(err => console.error('err -> ', err));
