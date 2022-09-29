"use strict";

const db = require("../db.js");
let testCustomerIds = {};
let testReservationIds = {};

async function commonBeforeAll() {

  await db.query("DELETE FROM reservations");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM customers");
  // noinspection SqlWithoutWhere

  const testCustomersResult = await db.query(`
    INSERT INTO customers(
      first_name, last_name, phone, notes)
    VALUES ('testfirst1', 'testlast1', 1, 'testnotes1'),
           ('testfirst2', 'testlast2', 2, 'testnotes2'),
           ('testfirst3', 'testlast3', 3, 'testnotes3')
    RETURNING id`
  );

  testCustomerIds.testCustId1 = testCustomersResult.rows[0].id;
  testCustomerIds.testCustId2 = testCustomersResult.rows[1].id;
  testCustomerIds.testCustId3 = testCustomersResult.rows[2].id;

  const testReservationsResult = await db.query(`
        INSERT INTO reservations(
          customer_id,
          num_guests,
          start_at,
          notes)
        VALUES ($1, '50', '2018-09-08 12:20:07', 'testresnote1'),
               ($2, '75', '2018-09-08 12:20:07', 'testresnote2'),
               ($2, '80', '2018-09-08 12:20:07', 'testresnote3')
        RETURNING id`,
    [
      testCustomerIds.testCustId1,
      testCustomerIds.testCustId2
    ]);

  testReservationIds.testResId1 = testReservationsResult.rows[0].id;
  testReservationIds.testResId2 = testReservationsResult.rows[1].id;

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testCustomerIds,
  testReservationIds
};