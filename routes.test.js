"use strict";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testCustomerIds
} = require("./models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**************************** GET REQUESTS ****/
describe("GET / ", function () {
  test("gets all customers", async function () {

    const { testCustId1 } = testCustomerIds;

    const resp = await request(app).get("/");

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain(testCustId1);
  });

  test('gets specific customers', async function () {

    const { testCustId1 } = testCustomerIds;

    const resp = await request(app).get("/?search=testfirst1");

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain(testCustId1);
  });

});

describe("GET /top-ten/", function () {
  test("gets top customers", async function () {

    const { testCustId1, testCustId3 } = testCustomerIds;

    const resp = await request(app).get("/top-ten/");

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain(testCustId1);
    expect(resp.text).not.toContain(testCustId3);
  });

});

describe("GET /add/", function () {
  test("displays add customer form", async function () {

    const resp = await request(app).get("/add/");

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain('Add a Customer');
  });

});

describe("GET /:id/", function () {
  test("gets valid customer", async function () {

    const { testCustId1 } = testCustomerIds;

    const resp = await request(app).get(`/${testCustId1}/`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain('testfirst1');
  });

  test("handles for invalid customer", async function () {

    const resp = await request(app).get(`/0/`);

    expect(resp.statusCode).toEqual(404);
  });

});

describe("GET /:id/edit", function () {
  test("displays edit form for valid customer", async function () {

    const { testCustId1 } = testCustomerIds;

    const resp = await request(app).get(`/${testCustId1}/edit`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toContain('Edit Customer');
    expect(resp.text).toContain('testfirst1');
  });

  test("handles for invalid customer", async function () {

    const resp = await request(app).get(`/0/edit`);

    expect(resp.statusCode).toEqual(404);
  });

});

/**************************** POST REQUESTS ****/

describe("POST /add/", function () {
  test("adds new customer", async function () {

    const newCustomerData = {
      firstName: "routestestingfirst1",
      lastName: "routestestinglast1",
      phone: "100000000",
      notes: "test cust note in routes test"
    };

    const resp = await request(app)
      .post("/add")
      .send(newCustomerData)

    expect(resp.statusCode).toEqual(302);
  });

  test("missing data prompts server error", async function () {

    const invalidCustomerData = {
      lastName: "routestestinglast1",
      notes: "test cust note in routes test"
    };

    const resp = await request(app)
      .post("/add")
      .send(invalidCustomerData)

    expect(resp.statusCode).toEqual(500);
  });

});

describe("POST /:id/edit", function () {
  test("edits existing customer", async function () {

    const { testCustId1 } = testCustomerIds;
    const updatedCustomerData = {
      firstName: "routestestingfirst1edited",
      lastName: "routestestinglast1",
      phone: "100000000",
      notes: "test cust note in routes test"
    };

    const resp = await request(app)
      .post(`/${testCustId1}/edit`)
      .send(updatedCustomerData)

    expect(resp.statusCode).toEqual(302);
  });

  test("throws 404 if customer doesn't exist", async function () {

    const updatedCustomerData = {
      firstName: "routestestingfirst1edited",
      lastName: "routestestinglast1",
      phone: "100000000",
      notes: "test cust note in routes test"
    };

    const resp = await request(app)
      .post("/0/edit")
      .send(updatedCustomerData)

    expect(resp.statusCode).toEqual(404);
  });

  test("missing data prompts server error", async function () {

    const { testCustId1 } = testCustomerIds;
    const invalidCustomerData = {
      lastName: "routestestinglast1",
      notes: "test cust note in routes test"
    };

    const resp = await request(app)
      .post(`/${testCustId1}/edit`)
      .send(invalidCustomerData)

    expect(resp.statusCode).toEqual(500);
  });

});


describe("POST /:id/add-reservation", function () {
  test("adds reservation for existing customer", async function () {

    const { testCustId1 } = testCustomerIds;
    const newReservationData = {
      startAt: "startAt=2018-09-08 12:20:07",
      numGuests: 100,
      notes: "test res note in routes tests"
    }

    const resp = await request(app)
      .post(`/${testCustId1}/add-reservation`)
      .send(newReservationData)

    expect(resp.statusCode).toEqual(302);
  });

  test("missing data prompts server error", async function () {

    const { testCustId1 } = testCustomerIds;
    const invalidReservationData = {
      startAt: "startAt=2018-09-08 12:20:07"
    }

    const resp = await request(app)
      .post(`/${testCustId1}/add-reservation`)
      .send(invalidReservationData)

    expect(resp.statusCode).toEqual(500);
  });

});