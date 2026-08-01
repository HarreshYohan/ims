const { TutorPayment } = require('./app/models');
async function run() {
  const payments = await TutorPayment.findAll();
  console.log(JSON.stringify(payments, null, 2));
}
run();
