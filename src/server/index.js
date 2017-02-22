const MongoClient = require('mongodb').MongoClient;
const R = require('ramda');
const { people, courses, trainingSessions } = require('./training-data.js');
const createAllCollections = require('./load');
const extractData = require('./extract');

const url = 'mongodb://localhost:27017/mongoTraining';

MongoClient.connect(url)
  .then(createAllCollections)
  .then(extractData)
  .then(sessions => computeTrainingPoints(sessions))
  // .then(sessions => computeTrainingPoints(sessions))
  .catch(err => console.error('err -> ', err));

//________________________________ Compute data from collections _________________


const splitByUserId = (sessions, currId) => {
  return R.reduce((accu, value) => {
    const id = value.user.externalId;
    if (id !== currId) return accu;
    accu[id] = (!accu[id])
      ? R.concat([], value.courses.skillPoints)
      : R.concat(accu[id], value.courses.skillPoints);
    return accu;
  }, {})(sessions)
}

const compute = sessions => {
  const splitCourses = R.flatten(R.uniq(R.map(session => {
    const currId = session.user.externalId;
    return splitByUserId(sessions, currId);
  })(sessions)))

  const mergeSkills = (accu, value) => ({
    ...accu,
    [value.skill]:
      (accu[value.skill])
      ? {
        ...accu[value.skill],
        points: accu[value.skill].points + value.points,
      }
      : { ...value }
  });

  return R.map(value => ({ [R.keys(value)[0]]: R.reduce(mergeSkills, {}, value[R.keys(value)[0]]) }), splitCourses);
};


const getTotal = R.reduce((accu, value) => accu + value.points, 0);

const getDetails = (skillPoints) => {

  return R.reduce((accu, value) => {
    // console.log('value: ', value);
    // console.log('accu: ', accu);
    const details = {
      skill: value.skill,
      value: value.points
    };
    accu = value;
    return details;
  }, [])(skillPoints)
}

const computeTrainingPoints = sessions => {
  let total = 0;
  let details = [];
  // console.log('sessions: ', sessions);
  const test = R.reduce((accu, value) => {
    if (accu.firstName && value.user.firstName && accu.firstName !== value.user.firstName) {
      console.log('break accu: ', accu);
      total = 0;
      details = [];
    } else {
      total += getTotal(value.courses.skillPoints);
      details = compute(sessions);
    }
    const computeTest = {
      firstName: value.user.firstName,
      lastName: value.user.lastName,
      points: {
        total,
        details,
      },
    };
    // console.log(computeTest);
    return computeTest;
  }, [])(sessions)
  // console.log('test: ', test);
}
