var Consumer = require('sqs-consumer');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
AWS.config.apiVersions = {
  sqs: '2012-11-05',
  // other service API versions
};


AWS.config.update({accessKeyId: '', secretAccessKey: ''});
//
 var sqs = new AWS.SQS({region:'us-east-1'});
// var params = {
//   QueueName: 'ResponseProcessor', /* required */
// };
// sqs.createQueue(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log("Queue created" + data);           // successful response
// });
// var params = {
//   Name: 'TweetsToShow' /* required */
// };
// sns.createTopic(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else
//   {
//     console.log("Topic created " + data.TopicArn);
//     var subscribeparams = {
//       Protocol: 'http', /* required */
//       TopicArn: data.TopicArn, /* required */
//       Endpoint: 'http://default-environment-cmynnybqp8.elasticbeanstalk.com/receive'
//     };
//     sns.subscribe(subscribeparams, function(err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else     console.log("Sent subscribe request " + data.SubscriptionArn );           // successful response
//     });
//   }          // successful response
// });
//

var app = Consumer.create({
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/828055001145/RequestProcessor',
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
  var reqMethod;
  var bodyParameters;
  reqMethod = operation;
  bodyParameters = req.Body;
  var body = JSON.parse(bodyParameters);
  console.log(body);
  if (operation == "GET" || operation == "PUT" || operation == "DELETE")
  {
    instanceToRouteTo += "/" + body.Id;
  }
  console.log('Sending ' + operation + ' request to ' + instanceToRouteTo);
  request({ url : instanceToRouteTo, method : operation, json : body}, function (error, response, body) {
    var messageparams = {
      MessageBody: JSON.stringify(response.body), /* required */
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/828055001145/'+ ResponseQueue , /* required */
      DelaySeconds: 0
    };
    sqs.sendMessage(messageparams, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log("Message sent " + data);           // successful response
    });
    callback(null, response.body);
  });
}



app.on('error', function (err) {
  console.log(err.message);
});

app.start();

//});
