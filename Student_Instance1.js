/*
*
*
*/

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');


var http = require('http');
var sd = require('./student_dynamo.js');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 16386;        // set our port


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

// more routes for our API will happen here


/************************************************************
*
* Student API Endpoints
*
*************************************************************/


//API endpoint to add student to the students table


router.route('/')
  .get(function(req, res) {
    res.send({'status': "All systems go!"});
  })
  .post(function(req, res) {
    sd.createTable(function(response) {
      res.send({message: response});
    });
  });


//API end point to get student details (accessed at GET http://localhost:16386/api/student/id)
router.route('/student/:ssn')

// get the student with that id (accessed at GET http://localhost:16386/api/student/:student_id)
.get(function(req, res) {
    var ssn = parseInt(req.params.ssn);
    console.log(ssn);

    sd.getStudentForSsn(ssn, function(err,data) {

      if (!err) {
        var result = data.Items[0];
        console.log(result);
        res.send(result);
      }
      else {
        console.log(err);
      }
    });
});

router.route('/student')


.post(function(req,res) {

  var ssn = parseInt(req.body.ssn);
  var fname = req.body.fname;
  var lname = req.body.lname;
  var school = req.body.school;

  sd.addStudent(ssn, fname, lname, school, function(err,response) {

      if (!err) {
        res.json({message: "New student added"})
    }
  });

});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
