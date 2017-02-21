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
      Extract data from mongo and rebuild 3 objects:

  `people`: JS object where keys are externalIds and values documents from people
  `courses`: JS object where keys are externalIds and values documents from courses
    collection.
  `sessions`: JS ARRAY made of objects { user: people[userId], course: courses[courseId] }

  If 2 sessions are about the same user or course they should share the same object: Do not
  duplicate in memory objects with same _id !!!!
____________________________________________________________________

  - people = [{...}, {...}, ...]    =>    { 0: {...}, 1: {...}, ... }
  - same for courses
  - sessions = [ user: people[userId], courses: courses[coursesId] ]
*/

//________________________________ Extract data from collections _________________

const extractCollectionData = (db, collection) => {
  return db.collection(collection).find().toArray()
    .then(R.reduce((accu, value) => ({ ...accu, [value.externalId]: value }), {}))
}

const extractData = (db) => {
  const peopleObj = extractCollectionData(db, 'people');
  const coursesObj = extractCollectionData(db, 'courses').then(console.log)
  const sessionsObj = db.collection('trainingSessions').find().toArray();

  // sessionsObj.then(console.log);

  Promise.all([peopleObj, coursesObj])
    .then(([peopleObj, coursesObj]) => {
      sessionsObj.then(sessionsObj => R.map(item => console.log(item.userId))(sessionsObj))
      // sessionsObj.then(R.reduce((accu, value) => ([ ...accu, { user: peopleObj[value.userId], courses: coursesObj[value.coursesId] } ]), []))
      // .then(sessionsObj => {
      //   console.log('sessions: ', sessionsObj);


        // const userId = 1;
        // const coursesId = 1;
        // console.log('test: ', sessionsObj[0].user[userId.toString()]);
        // console.log('cmp: ', sessionsObj[0].user[userId.toString()], 'cmp: ', sessionsObj[0].courses[coursesId.toString()])
      // })
    })
}
