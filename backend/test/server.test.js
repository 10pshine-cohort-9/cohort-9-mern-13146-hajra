process.env.NODE_ENV = "test";
const dotenv = require("dotenv");
const { expect } = require("chai");
const sinon = require("sinon");
const { startServer, isValidPort } = require("../server");

describe("server.js - isValidPort", () => {
  it("accepts a valid port number", () => {
    expect(isValidPort(5000)).to.equal(true);
  });

  it("rejects a non-integer value", () => {
    expect(isValidPort(3.14)).to.equal(false);
  });

  it("rejects a port below 1", () => {
    expect(isValidPort(0)).to.equal(false);
  });

  it("rejects a port above 65535", () => {
    expect(isValidPort(70000)).to.equal(false);
  });
});




describe("server.js - isValidPort", () => {
  it("accepts a valid port number", () => {
    expect(isValidPort(5000)).to.equal(true);
  });

  it("rejects a non-integer value", () => {
    expect(isValidPort(3.14)).to.equal(false);
  });

  it("rejects a port below 1", () => {
    expect(isValidPort(0)).to.equal(false);
  });

  it("rejects a port above 65535", () => {
    expect(isValidPort(70000)).to.equal(false);
  });
});

describe("server.js - startServer", () => {
  let server;

  afterEach(() => {
    if (server && server.listening) {
      server.close();
    }
    sinon.restore();
  });

  it("connects to the database and starts listening successfully", async () => {
    const originalPort = process.env.PORT;
    process.env.PORT = "0";

    server = await startServer();

    expect(server).to.exist;
    expect(server.listening).to.equal(true);

    process.env.PORT = originalPort;
  });

  it("calls process.exit(1) when the database connection fails", async () => {
    const pool = require("../src/config/db");
    const exitStub = sinon.stub(process, "exit");
    const poolStub = sinon.stub(pool, "getConnection").rejects(new Error("Simulated DB failure"));

    await startServer();

    expect(exitStub.calledWith(1)).to.equal(true);

    poolStub.restore();
  });

  it("logs an error and exits when the port is already in use", async function () {
  this.timeout(5000);
  const exitStub = sinon.stub(process, "exit");

  const serverA = await startServer();
  const serverB = await startServer(); 

  const start = Date.now();
  while (!exitStub.called && Date.now() - start < 2000) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  expect(exitStub.calledWith(1)).to.equal(true);

  serverA.close();
  if (serverB && serverB.listening) {
    serverB.close();
  }
});
});


describe("server.js - invalid PORT handling", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("logs an error and exits when PORT is invalid", () => {
    const exitStub = sinon.stub(process, "exit");
    const loggerModule = require("../src/logger/logger");
    const errorStub = sinon.stub(loggerModule, "error");

    const originalPort = process.env.PORT;
    process.env.PORT = "70000"; 

    delete require.cache[require.resolve("../server")];
    require("../server");

    expect(errorStub.calledWith("Invalid PORT configuration")).to.equal(true);
    expect(exitStub.calledWith(1)).to.equal(true);

    process.env.PORT = originalPort;
    delete require.cache[require.resolve("../server")];
  });
});


describe("server.js - default PORT fallback", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("defaults to port 5000 when PORT is not set in the environment", () => {
    const originalPort = process.env.PORT;
    delete process.env.PORT;

    const dotenvStub = sinon.stub(dotenv, "config");

    delete require.cache[require.resolve("../server")];
    const { PORT } = require("../server");

    expect(PORT).to.equal(5000);

    dotenvStub.restore();
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
    delete require.cache[require.resolve("../server")];
  });
});