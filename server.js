// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// =============================================================================
// Configure settings for SMTP server
var transport = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    auth: {
        user: "",		// TODO: enter email info
        pass: ""
    }
}));
// =============================================================================


// configure app to use bodyParser()
// this will let us get the data from a POST in JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose = require('mongoose');			// require mongoose and get instance
mongoose.connect('mongodb://admin:welcome1@ds029595.mongolab.com:29595/hop_comments');			//connect to db on mongolab

var Post = require('./models/Posts');		// include ref to Posts db model
var Comment = require('./models/Comments'); // include ref to Comments db model
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

// test route to make sure everything is working (accessed at GET http://localhost:8089/api)
router.get('/', function(req, res) {
    res.json({ message: 'Testing api message.' });   
});

// =============================================================================
// api route for email
router.route('/send')
    .get(function(req,res){
       var mailOptions ={
           from: "",			// TODO: enter mailOptions info
           to: '',//req.query.to,
           subject: '', //req.query.subject,
           text: '' ,//req.query.text
           html: '<b></b>'
       }
        transport.sendMail(mailOptions, function(err,resp){

        if(err) res.end('error');

            res.end('sent');

        });
    });

// =============================================================================
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
        }).
            populate({                              // populate is used to tell mongoose to populate the array of comments.
                path:'comments',
                populate:{path: 'comment'}
            });
    });


// =============================================================================
// api/posts/:post_id
router.route('/posts/:post_id')
    .get(function(req,res){
        Post.findById(req.params.post_id, function(err, post){
            if (err)
                res.send(err);

            res.json(post);
            console.log('POST: Success retrieving post by id');
        }).
        populate({                              // populate is used to tell mongoose to populate the array of comments.
                path:'comments',
                populate:{path: 'comment'}
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

           res.json({message: 'DELETE ' + req.params.post_id + ' has been successfully deleted!'});
           console.log('DELETE: posts successful!');
       });
    });


// =============================================================================
// /api/posts/:post_id/comments
router.route('/posts/:post_id/comments')
    // POST a new comment to given post_id
    .post(function(req,res){
        Post.findById(req.params.post_id, function(err, post) {
            if (err)
                res.send(err);

            var comment = new Comment(req.body);
            comment.post = post._id;

            comment.save(function (err, comment) {
                if (err) return next(err);

                post.comments.push(comment);
                post.save(function (err, post_id) {

                    if (err) return next(err);

                    res.json(comment);
                });
            });
        });
    });



// =============================================================================
// /api/posts/:post_id/comments/:comment_id
router.route('/posts/:post_id/comments/:comment_id')
    // Update a comments upvote count with given id.
    .put(function(req,res){
        Comment.findById(req.params.comment_id, function(err, comment){
            if (err){

                res.send(err);
            }
            comment.upvotes = comment.upvotes + 1;

            comment.save(function(err){
                if(err) {
                    res.send(err);
                }
                res.json({message: 'Comment upvotes ' + req.params.comment_id +' updated!'});
                console.log('PUT: update of comment upvotes successful!');
            });
        });
        });



// REGISTER ROUTES -------------------------------
// all  routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on ' + port);