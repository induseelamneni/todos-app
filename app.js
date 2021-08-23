const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`Db error: ${error.massage}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperties = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperties = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            Select * 
            From todo
            Where 
            todo LIKE '%${search_q}%'
            And status = '${status}'
            And priority = '${priority}';`;
      break;
    case hasPriorityProperties(request.query):
      getTodosQuery = `
                Select * 
                From todo 
                Where todo LIKE '%${search_q}%'
                And priority = '${priority}'`;
      break;
    case hasStatusProperties(request.query):
      getTodosQuery = `
                Select * 
                From todo 
                Where todo LIKE '%${search_q}%'
                And status = '${status}'`;
      break;
    default:
      getTodosQuery = `
                Select * 
                From todo 
                Where todo LIKE '%${search_q}%'`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});
