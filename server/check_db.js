const { TutorPayment } = require('./app/models');
async function run() {
  const payments = await TutorPayment.findAll();
  console.log(JSON.stringify(payments.map(p => p.toJSON()), null, 2));
}
run();
