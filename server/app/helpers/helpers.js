const { Op } = require('sequelize');

async function findBy(model, columnName, value) {
  try {
    console.log(model, columnName, value)
    const result = await model.findOne({
      where: {
        [columnName]: {
          [Op.eq]: value
        }
      }
    });
    return result;
  } catch (error) {
    throw new Error(`Error finding ${model.name}: ${error.message}`);
  }
}

const TimetableData = [
  {id:1, timeslot:"7.00-9.00"},
  {id:2, timeslot:"9.00-11.00"},
  {id:3, timeslot:"11.00-13.00"},
  {id:4, timeslot:"13.00-15.00"},
  {id:5, timeslot:"15.00-17.00"},
  {id:6, timeslot:"17.00-19.00"},
  {id:7, timeslot:"19.00-21.00"}]

module.exports = {
  TimetableData
};