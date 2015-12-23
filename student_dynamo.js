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
  var params = {
    TableName: tableName,
    Item: {
            "ssn":ssn,
            "fname": fName,
            "lname": lName,
            "school": school
          },
    Expected : { "ssn": {"Exists": false}}
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

exports.updateStudent = function (ssn, updateFields, callback) {
  var exprAttrJSON = {};
  var updateString = "set";
  if (updateFields.fname !== undefined) {
    exprAttrJSON[":f"] = updateFields.fname;
    updateString += " fname = :f,"
  }
  if (updateFields.lname !== undefined) {
    exprAttrJSON[":l"] = updateFields.lname;
    updateString += " lname = :l,"
  }
  if (updateFields.school !== undefined) {
    exprAttrJSON[":s"] = updateFields.school;
    updateString += " school = :s,";
  }
  updateString = updateString.substring(0, updateString.length - 1);

  var params = {
    TableName: tableName,
    Key: {
      "ssn": ssn
    },
    UpdateExpression: updateString,
    ExpressionAttributeValues: exprAttrJSON,
    ReturnValues:"UPDATED_NEW"
  };
  dynamoDoc.update(params, function(err, data) {
    if (err) {
      console.log("There was an error", JSON.stringify(err, null, 2));
      callback(err, undefined);
    }
    else {
      console.log("Updated Item", JSON.stringify(data, null, 2));
      callback(undefined, data);
    }
  });
};

exports.deleteStudent = function(ssn, callback) {
  var params = {
    TableName: tableName,
    Key: { "ssn": ssn }
  };
  dynamoDoc.delete(params, function(err, data) {
    if (err) {
      console.log("Could not delete student", JSON.stringify(err, null, 2));
      callback(err, undefined);
    }
    else {
      console.log("Deleted student");
      callback(undefined, data);
    }
  });
};
