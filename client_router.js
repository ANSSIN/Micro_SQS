var bodyParser = require('body-parser');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var request = require('request');
var http = require('http');

var SQS = require('./sqs.js');
//Initialize the queue
SQS.queueInitiator();
SQS.receiveMessage();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 16387;        // set our port
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middle-ware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Client is working');
  next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
  // Logic to show student here
  res.json({ message: 'Welcome to our client instance api!' });
});

router.route('/student')
.post(function(req, res) {
  invokeandProcessResponse(req,handleResult);
  function handleResult(response)
  {
    console.log('Callback received');
    console.log(response);
    console.log("Status code " +response.statusCode);
    if(response.statusCode == 200) {
      console.log('All ok, 200');
      res.status(200);
      res.json({ message: 'Student added!' , returnStatus : '200'});
    }

    else if(response.statusCode == 500) {
      console.log('500');
      res.status(500);
      res.json({ message: 'Internal Server Error!' , returnStatus : '500' });
    }
    else if(response.statusCode == 409){
      console.log('409');
      res.status(409);
      res.json({ message: 'Student already exists.' , returnStatus : '409'});

    }
  }
});

//API end point to get student details (accessed at GET http://localhost:16386/api/student/id)
router.route('/student/:ssn')
  .get(function(req, res) {
    invokeandProcessResponse(req,handleResult);
    function handleResult(response, err)
    {
      if(err)
      {
        console.error(err.stack || err.message);
        return;
      }
      res.json(response.body);
      console.log("Request handled");
    }
  })

  .delete(function(req, res) {
    invokeandProcessResponse(req,handleResult);
    function handleResult(response)
    {
      console.log('Callback received');
      console.log(response);
      console.log("Status code " +response.statusCode);
      if(response.statusCode == 200){
        console.log('200');

        res.status(200);
        res.json({ message: 'Successfully deleted student' , returnStatus : '200'});
        console.log(res);

      }

      else if(response.statusCode == 500){
        console.log('500');
        res.status(500);
        res.json({ message: 'Internal Server Error!' , returnStatus : '500'});

      }
      else if(response.statusCode == 417){
        console.log('417');
        res.status(417);
        res.json({ message: 'Expectation Failed. Deleting a student that does not exist', returnStatus : '417'});

      }
    }
  })

  .put(function(req, res) {
    invokeandProcessResponse(req,handleResult);
    function handleResult(response)
    {
      console.log('Callback received');
      console.log("Status code " +response.statusCode);
      if(response.statusCode == 200) {
        console.log('200');
        res.status(200);
        res.json({ message: 'Student updated!', returnStatus : '200'});
      }
      else if(response.statusCode == 500){
        console.log('500');
        res.status(500);
        res.json({ message: 'Internal Server Error!', returnStatus : '500'});
      }
      else if(response.statusCode == 400){
        console.log('400');
        res.status(400);
        res.json({ message: 'Bad request. Please check body parameters.', returnStatus : '400'});

      }
      else if(response.statusCode == 417){
        console.log('417');
        res.status(417);
        res.json({ message: 'Updating a student that does not exist', returnStatus : '417'});
      }
    }
});

var invokeandProcessResponse = function(req, callback){
var method = req.method;
var correlationId = Date.now() / 1000 | 0;
var responseQueue = "https://sqs.us-east-1.amazonaws.com/455518163747/ResponseQueue";
correlationId = correlationId + "";
ssn_var = req.params.ssn;

if(method == 'GET' || method == "DELETE"){
  request = {ssn:ssn_var};
  var message1 = {
  Operation : method,
  CorrelationId : correlationId,
  ResponseQueue : responseQueue,
  Request : request
  }
} else if (method == "PUT" || method == "POST") {
  var message1 = {
  Operation : method,
  CorrelationId : correlationId,
  ResponseQueue : responseQueue,
  Request : req.body
  }
}
message = JSON.stringify(message1);
SQS.sendMessage(message,function(response){

});
callback("Message Received");
}



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on ' + port);
