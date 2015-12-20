var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var SQS = require('./sqs.js');

//Initialize the queue
SQS.queueInitiator();


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 16387;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// middle-ware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:16386/api)
router.get('/', function(req, res) {
  // Logic to show student here
  res.json({ message: 'Welcome to our student Instance 1 api!!' });
});



//API endpoint to add student to the students table
router.route('/student')

// create a new student (accessed at POST http://localhost:16386/api/student)
.post(function(req, res) {


SQS.sendMessage(req);



  function handleResult(response)
  {
    console.log('Callback received');
    console.log(response);
    console.log("Status code " +response.statusCode);
    if(response.statusCode == 200){
      console.log('200');
      res.status(200);
      res.json({ message: 'Student added!' , returnStatus : '200'});

    }

    else if(response.statusCode == 500){
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
router.route('/student/:student_id')

// get the student with that id (accessed at GET http://localhost:16386/api/student/:student_id)
.get(function(req, res) {



  SQS.sendMessage(req);

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


  SQS.sendMessage(req);

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
// Logic to show student here
// res.json({ message: 'Student details from Student Instance 1!' });



// update the student with this id (accessed at PUT http://localhost:16386/api/student/:student_id)
.put(function(req, res) {
  //Logic to update student details here


  SQS.sendMessage(req);

  function handleResult(response)
  {
    console.log('Callback received');
    console.log("Status code " +response.statusCode);
    if(response.statusCode == 200){
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

  //res.json({ message: 'Student updated!' });


});
