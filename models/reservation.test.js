"use strict";

const db = require("../db.js");
const Reservation = require("./reservation.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testCustomerIds,
  testReservationIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {

  test("works", async function () {

    const { testCustId3 } = testCustomerIds;

    const newReservation = {
      customerId: testCustId3,
      numGuests: 101,
      startAt: "2021-09-08 12:20:07",
      notes: "testCustId3 res notes",
    };

    const reservation = await new Reservation(newReservation);
    reservation.save();

    const result = await db.query(
      `SELECT id, customer_id, num_guests, notes
       FROM reservations
       WHERE customer_id = $1;`, [testCustId3]);
    const addedReservation = result.rows[0];

    expect(addedReservation.customer_id).toEqual(testCustId3);
    expect(addedReservation.num_guests).toEqual(101);

  });

});
