const MongoClient = require('mongodb').MongoClient;
const R = require('ramda');
const { people, courses, trainingSessions } = require('./training-data.js');
const createAllCollections = require('./load');

const url = 'mongodb://localhost:27017/mongoTraining';

MongoClient.connect(url)
  .then(createAllCollections)
  .then(db => {
    // console.log('db: ', db);
    extractData(db);
    db.close();
  })
  .catch(err => console.error('err -> ', err));

/*
  ['a','b','c'].reduce(function(result, item) {
    result[item] = item; //a, b, c
    return result;
  }, {})
*/
/*
      Extract data from mongo and rebuild 3 objects:

  `people`: JS object where keys are externalIds and values documents from people
  `courses`: JS object where keys are externalIds and values documents from courses
    collection.
  `sessions`: JS ARRAY made of objects { user: people[userId], course: courses[courseId] }

  If 2 sessions are about the same user or course they should share the same object: Do not
  duplicate in memory objects with same _id !!!!

*/

//________________________________ Extract data from collections _________________
const extractData = (db) => {
  db.collection('people').find().toArray()
    .then(list => {
        return R.reduce((accu, value) => ({ ...accu, [value.externalId]: value }), {})(list)
    })
    .then(console.log)
    // .then(R.reduce((acc, value) => ({ [value.externalId]: value }) ))
}
