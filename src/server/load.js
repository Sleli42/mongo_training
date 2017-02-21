const R = require('ramda');
const { people, courses, trainingSessions } = require('./training-data.js');

//________________________________ Create all collections et load all documents _________________
const getIds = obj => [ obj.externalId, obj._id ];

const findId = (idToFind, ids) => ids[idToFind];

const updateData = collection => {
  const newCollection = R.map(doc => {
    const setExternalId = { externalId: doc.id, ...doc };
    return R.omit('id')(setExternalId);
  })(collection)
  return newCollection;
};

const createAllCollections = db => {
  const peoplePromise = db.collection('people').insertMany(updateData(people));
  const coursesPromise = db.collection('courses').insertMany(updateData(courses));
  return Promise.all([peoplePromise, coursesPromise])
    .then(([peoplePromise, coursesPromise]) => {
      const userIds = R.fromPairs(R.map(getIds)(peoplePromise.ops));
      const coursesIds = R.fromPairs(R.map(getIds)(coursesPromise.ops));
      const sessionCollection = R.map(item => {
        item.userId = findId(item.userId, userIds);
        item.courseId = findId(item.courseId, coursesIds);
        return item;
      })(trainingSessions)
      db.collection('trainingSessions').insertMany(sessionCollection);
      return db;
    })
    .catch(console.error)
};

module.exports = createAllCollections;
