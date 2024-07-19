
const isValidObject = (obj) => {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        return false;
      }
    }
    return true; 
};





module.exports = {
    isValidObject
  };