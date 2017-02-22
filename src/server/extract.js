const R = require('ramda');

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
const extractDataByExternalId = R.reduce((accu, value) => ({ ...accu, [value.externalId]: value }), {});

const extractDataByObjectId = R.reduce((accu, value) => ({ ...accu, [value._id]: value }), {});

const extractData = (db) => {
  const peopleExtId = db.collection('people').find().toArray().then(extractDataByExternalId);
  const coursesExtId = db.collection('courses').find().toArray().then(extractDataByExternalId);

  const peopleByObjId = db.collection('people').find().toArray().then(extractDataByObjectId);
  const coursesByObjId = db.collection('courses').find().toArray().then(extractDataByObjectId);

  const sessionsObj = db.collection('trainingSessions').find().toArray();

  return Promise.all([peopleByObjId, coursesByObjId])
    .then(([people, courses]) => {
      db.close();
      return sessionsObj.then(R.map(({ userId, courseId }) => ({
        user: people[userId],
        courses: courses[courseId],
      })))
    })
}

module.exports = extractData;
