// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST in JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose = require('mongoose');			// require mongoose and get instance
mongoose.connect('mongodb://admin:welcome1@ds029595.mongolab.com:29595/hop_comments');			//connect to db on mongolab

var Post = require('./models/Posts');		// include ref to Posts db model
var comment = require('./models/Comments'); // include ref to Comments db model
var port = process.env.PORT || 8089;        // set  port

// API ROUTES
// =============================================================================
var router = express.Router();              // create instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('api connection request');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Testing api message.' });   
});

// additional routes here


// /api/posts
router.route('/posts')
    //POST posts
    .post( function(req, res, next) {
        var post = new Post(req.body);
        // set data from request to post obj
        post.title = req.body.title;
        post.link = req.body.link;
        post.comments = req.body.comments;
        post.upvotes = req.body.upvotes;
        // save the post obj into mongo
        post.save(function(err, post){
            if(err)
                res.send(err);

            res.json(post);
            console.log('POST: Post saved successfully!');
        });
    })
    //GET posts
    .get( function(req, res, next) {
        Post.find(function(err, posts){
        if(err)
            return next(err);

             res.json(posts);
            console.log('GET: posts retrieved successfully!');
        });
    });



// api/posts/:post_id
router.route('/posts/:post_id')
    .get(function(req,res){
        Post.findById(req.params.post_id, function(err, post){
            if (err)
                res.send(err);

            console.log('POST: Success retrieving post by id');
            res.json(post);
        });
    })
    // Update a post upvote count with given id.
    .put(function(req,res){
        Post.findById(req.params.post_id, function(err, post){
            if (err){
                console.log('****PUT: Error retrieving post by id');
                res.send(err);
            }
            post.upvotes = post.upvotes + 1;

            post.save(function(err){
                if(err) {
                    res.send(err);
                }
                res.json({message: 'Post upvote ' + req.params.post_id +' updated!'});
                console.log('PUT: update of posts upvotes successful!');
            });
    });

    })
    // Delete a post with given id
    .delete(function(req,res){
       Post.remove({
           _id: req.params.post_id   // the _id syntax is native for MongoDB.
       }, function(err,post) {
           if (err)
           res.send(err);

           res.json({message: 'Post ' + req.params.post_id + ' has been successfully deleted!'});
           console.log('DELETE: posts successful!');
       });
    });






// REGISTER ROUTES -------------------------------
// all  routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on ' + port);