"use strict";

const db = require("../db.js");
const Customer = require("./customer.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testCustomerIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */
describe("create", function () {

  const newCustomer = {
    firstName: "testcustFirst1",
    lastName: "testcustLast1",
    phone: "testcust1234",
    notes: "testcust notes",
  };

  test("works", async function () {

    const customer = await new Customer(newCustomer);
    customer.save();

    const result = await db.query(
      `SELECT id, first_name, last_name, phone, notes
       FROM customers
       WHERE first_name = 'testcustFirst1';`);

    expect(result.rows[0]).toEqual({
      id: expect.any(Number),
      first_name: "testcustFirst1",
      last_name: "testcustLast1",
      phone: "testcust1234",
      notes: "testcust notes",
    });
  });

});

describe("get all customers", function () {
  test("works", async function () {

    const { testCustId1, testCustId2, testCustId3 } = testCustomerIds;
    const customers = await Customer.all();

    expect(customers).toEqual([
      new Customer(
        {
          id: testCustId1,
          firstName: "testfirst1",
          lastName: "testlast1",
          phone: "1",
          notes: "testnotes1",
        }),
      new Customer(
        {
          id: testCustId2,
          firstName: "testfirst2",
          lastName: "testlast2",
          phone: "2",
          notes: "testnotes2",
        }),
      new Customer(
        {
          id: testCustId3,
          firstName: "testfirst3",
          lastName: "testlast3",
          phone: "3",
          notes: "testnotes3",
        }),
    ]);

    const result = await db.query(
      `SELECT id, first_name, last_name, phone, notes
       FROM customers;`);

    expect(result.rows).toEqual([
      {
        id: testCustId1,
        first_name: "testfirst1",
        last_name: "testlast1",
        phone: "1",
        notes: "testnotes1",
      },
      {
        id: testCustId2,
        first_name: "testfirst2",
        last_name: "testlast2",
        phone: "2",
        notes: "testnotes2",
      },
      {
        id: testCustId3,
        first_name: "testfirst3",
        last_name: "testlast3",
        phone: "3",
        notes: "testnotes3",
      },
    ]);
  });
});


describe("get specific customers", function () {

  test("works with valid customer", async function () {

    const { testCustId1 } = testCustomerIds;

    const customer = await Customer.get(testCustId1);

    expect(customer.fullName).toEqual("testfirst1 testlast1");
    expect(customer).toEqual(
      new Customer(
        {
          id: testCustId1,
          firstName: "testfirst1",
          lastName: "testlast1",
          phone: "1",
          notes: "testnotes1",
        })
    );
  });

  test("can fetch reservations for valid customer", async function () {

    const { testCustId1 } = testCustomerIds;

    const customer = await Customer.get(testCustId1);
    const customerReservations = await customer.getReservations();

    expect(customerReservations[0].customerId).toEqual(testCustId1);
    expect(customerReservations[0].numGuests).toEqual(50);
  });

  test("throws error for invalid customer", async function () {
    try {
      const customer = await Customer.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err.message).toEqual("No such customer: 0");
    }
  });
});


describe("update specific customers", function () {

  test("works with valid customer", async function () {

    const { testCustId2 } = testCustomerIds;

    const updatedTestCustId2 = await new Customer({
      id: testCustId2,
      firstName: "updatedFirst2",
      lastName: "updatedLast2",
      phone: "updated1234",
      notes: "updated customer notes",
    });

    updatedTestCustId2.save();
    const result = await db.query(
      `SELECT id, first_name, last_name, phone, notes
       FROM customers
       WHERE first_name = 'updatedFirst2';`);

    const updatedCustomerInDb = result.rows[0];

    expect(updatedCustomerInDb.first_name).toEqual("updatedFirst2");
    expect(updatedCustomerInDb.id).toEqual(testCustId2);

  });

  test("can fetch reservations for valid customer", async function () {

    const { testCustId1 } = testCustomerIds;

    const customer = await Customer.get(testCustId1);
    const customerReservations = await customer.getReservations();

    expect(customerReservations[0].customerId).toEqual(testCustId1);
    expect(customerReservations[0].numGuests).toEqual(50);
  });

  test("throws error for invalid customer", async function () {
    try {
      const customer = await Customer.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err.message).toEqual("No such customer: 0");
    }
  });
});


describe("search specific customers", function () {

  test("works with just first name", async function () {

    const { testCustId2 } = testCustomerIds;
    const searchResult = await Customer.all('testfirst2');
    const foundCustomer = searchResult[0];

    expect(foundCustomer.id).toEqual(testCustId2);

  });

  test("works with just last name", async function () {

    const { testCustId2 } = testCustomerIds;
    const searchResult = await Customer.all('testlast2');
    const foundCustomer = searchResult[0];

    expect(foundCustomer.id).toEqual(testCustId2);

  });

  test("works with first and last name", async function () {

    const { testCustId2 } = testCustomerIds;
    const searchResult = await Customer.all('testfirst2 testlast2');
    const foundCustomer = searchResult[0];

    expect(foundCustomer.id).toEqual(testCustId2);

  });

  test("works with invalid input", async function () {

    const searchResult = await Customer.all('does not exist');

    expect(searchResult.length).toEqual(0);

  });

});

describe("find top customers", function () {

  test("doesn't include customers with no reservations", async function () {

    const { testCustId3 } = testCustomerIds;
    const topCustomers = await Customer.getTopTen();

    const onlyCustomersWithReservations = topCustomers.every(
      function (customer) {
        return customer.id !== testCustId3;
      }
    );

    expect(onlyCustomersWithReservations).toEqual(true);

  });

  test("orders top customers correctly", async function () {

    const { testCustId1, testCustId2 } = testCustomerIds;
    const topCustomers = await Customer.getTopTen();

    expect(topCustomers[0].id).toEqual(testCustId2);
    expect(topCustomers[1].id).toEqual(testCustId1);

  });

});