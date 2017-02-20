var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var R = require('ramda');
var file = require('./training-data.js');

const url = 'mongodb://localhost:27017/mongoTraining';

MongoClient.connect(url)
  .then(db => createAllCollections(db))
  .then(db => {
    // extractData(db);
    db.close();
  })
  .catch(err => console.error('err -> ', err));

//________________________________ Extract data from collections _________________
const extractData = (db) => {
  db.collection('people').find().toArray()
    .then(R.reduce((acc, value) => ({ ...acc, [value.externalId]: value })))
    .then(res => console.log('res:', res))
    .catch(err => console.error('err: ', err))
}


//________________________________ Create all collections et load all documents _________________
const createAllCollections = db => {
  const peoplePromise = createCollection(db, 'people').then(insertDocsInPeopleCollection(db));
  const coursesPromise = createCollection(db, 'courses').then(insertDocsInCoursesCollection(db));
  Promise.all([peoplePromise, coursesPromise])
    .then(([peoplePromise, coursesPromise]) => {
      console.log('peoplePromise: ', peoplePromise);
      console.log('coursesPromise: ', coursesPromise.s.db);
    })
    .catch(console.error)
  // createCollection(db, 'trainingSessions');
  // insertDocsInSessionsCollection(db);
  return db;
};

const updateData = collection => {
  const newCollection = R.map(doc => {
    const setExternalId = { externalId: doc.id, ...doc };
    return R.omit('id')(setExternalId);
  })(collection)
  return newCollection;
};

const createCollection = (db, collectionName) => {
  return db.createCollection(collectionName)
    .then(console.log("Collection created"))
    .catch(err => console.error('[create collection] err: ', err));
};

const insertDocsInPeopleCollection = (db) => {
  const collection = db.collection('people');
  return collection.insertMany(updateData(file.people))
    .then(() => console.log('Documents added to people collection'))
    .catch(err => console.error('[insert docs(people)] err: ', err));
};

const insertDocsInCoursesCollection = (db) => {
  const collection = db.collection('courses');
  return collection.insertMany(updateData(file.courses))
    .then(() => console.log('Documents added to courses collection'))
    .catch(err => console.error('[insert docs(courses)] err: ', err));
};
//
// const insertDocsInSessionsCollection = (db) => {
//   const collection = db.collection('trainingSessions');
//   collection.insertMany(file.trainingSessions)
//     .then(() => console.log('Documents added to trainingSessions collection'))
//     .catch(err => console.error('[insert docs(sessions)] err: ', err));
// };
