var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
AWS.config.apiVersions = {
  sqs: '2012-11-05',
  // other service API versions
};


AWS.config.update({accessKeyId: '', secretAccessKey: '',region: 'us-east-1'});

var sqs = new AWS.SQS({region:'us-east-1'});
console.log("Student Router is running");

var app = Consumer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/455518163747/RequestProcessor',
  messageAttributeNames : ['ResponseQueue','CorrelationId','Operation'],
  handleMessage: function (message, done) {

    invokeandProcessResponse(message , function(err, result){
      console.log("Inside invoke and response");
    });
    done();
  }
});

var invokeandProcessResponse = function(req, callback){
  var ResponseQueue = req.MessageAttributes.ResponseQueue.StringValue;
  var CorrelationId = req.MessageAttributes.CorrelationId.StringValue;
  var operation = req.MessageAttributes.Operation.StringValue;
  var instanceToRouteTo = "http://localhost:16386/api/student";

  var body = JSON.parse(req.Body);
  var reqMethod;
  var bodyParameters;
  var ssn = body.ssn;
  reqMethod = operation;

  console.log(body);

  console.log("Correlation ID for Transaction");
  console.log(CorrelationId);
  if (operation == "GET" || operation == "PUT" || operation == "DELETE")
  {
    instanceToRouteTo += "/" + ssn;
  }
  console.log('Sending ' + operation + ' request to ' + instanceToRouteTo);

  request(
    { url : instanceToRouteTo,
      method : operation,
      json : body
    }, function (error, response, body) {

    var messageparams = {
      MessageAttributes:{

        CorrelationId:{
                          DataType: 'String', /* required */
                          StringValue: CorrelationId
                      }
     },
      MessageBody: JSON.stringify(response.body), /* required */
      QueueUrl: ResponseQueue , /* required */
      DelaySeconds: 0
    };
    sqs.sendMessage(messageparams, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log("Message sent to SQS Response Queue" + data);           // successful response
    });
    callback(null, response.body);
  });
}



app.on('error', function (err) {
  console.log(err.message);
});

app.start();

//});
