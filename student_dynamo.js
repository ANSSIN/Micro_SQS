var AWS = require('aws-sdk');

AWS.config.update({
  region:"us-east-1"
});

var dynamo = new AWS.DynamoDB();
var tableName = 'Student';
var dynamoDoc = new AWS.DynamoDB.DocumentClient();

exports.createTable = function(callback) {
var params = {
  TableName: tableName,
  KeySchema: [
    {AttributeName: "ssn", KeyType: "HASH"}
  ],
  AttributeDefinitions: [
    { AttributeName: "ssn", AttributeType: "N"}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// create a table
dynamo.createTable(params, function(err, data) {
  if (err) {
    console.log(JSON.stringify(err, null, 2));
    callback(err);
  }
  else {
    console.log(JSON.stringify(data, null, 2));
    callback(data);
  }
});
};

exports.addStudent = function(ssn, fName, lName, school, callback) {
// var ssn = 123;
// var fName = "Gaurang";
// var lName = "Sadekar";
// var school = "JNS";
  var params = {
    TableName: tableName,
    Item: {
            "ssn":ssn,
            "fname": fName,
            "lname": lName,
            "school": school
          }
  };
  console.log("Adding new Student");
  dynamoDoc.put(params, function(err, data) {
    if (err) {
      console.log("Couldn't add student",JSON.stringify(err, null, 2));
      callback(err, undefined)
    }
    else {
      console.log("New student added");
      callback(undefined, data);
    }
  });
};

exports.getStudentForSsn = function(ssn, callback) {
  // ddb.get(tableName)
  //    .query({ssn: ssn})
  //    .fetch(function(err, data) {
  //      if (err) {
  //        console.log(JSON.stringify(err, null, 2));
  //      }
  //      else {
  //        callback(data);
  //      }
  //    })
  var params = {
    TableName: tableName,
    KeyConditionExpression: "ssn = :ssn",
    ExpressionAttributeValues: { ":ssn": ssn }
  }
  dynamoDoc.query(params, function(err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    }
    else {
      console.log("Query Succeeded");
      callback(data);
    }
  })
};
