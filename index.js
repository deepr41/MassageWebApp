var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser'); 
var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb"

var cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));
app.use(cookieParser())

app.get('/hrsignup',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    res.sendFile(__dirname+"/public/"+"signup.html" );
})


app.get('/', function(err, res){
    res.redirect("/hrlogin");
})

app.post('/signup',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    console.log(JSON.stringify(req.body));
    var email = req.body.email;
    var pass = req.body.pass;
    var fname = req.body.fname;
    var lname = req.body.lname;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        console.log(email+" : "+pass);
        dbo.collection('hrLogin').insert({email:email, pass:pass, fname:fname, lname:lname}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            res.end("Success");
        })
    });
})

app.post('/update',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    console.log(JSON.stringify(req.body));
    var email = req.body.email;
    var fname = req.body.fname;
    var lname = req.body.lname;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        //console.log(email+" : "+pass);
        dbo.collection('hrLogin').update({email:email}, {$set:{fname:fname, lname:lname}}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            res.end("Success");
        })
    });
})

app.post('/delete',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //if(req.cookies.email)
    console.log(JSON.stringify(req.body));
    var email = req.cookies.email;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        //console.log(email+" : "+pass);
        dbo.collection('hrLogin').deleteOne({email:email}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            res.clearCookie("email");
            res.end("Success");
        })
    });
})


app.get('/hrlogin',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    console.log("Testt : "+req.cookies.email);
    if(req.cookies.email){
        res.redirect("/hrprofile");
        return;
    }
    res.sendFile( __dirname + "/public/" + "login.html" );
})
app.post('/login', function(req, res){
    console.log(JSON.stringify(req.body));
    var email = req.body.email;
    var pass = req.body.pass;

    

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        console.log(email+" : "+pass);
        dbo.collection('hrLogin').findOne({email:email, pass:pass}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }

            console.log(result);
            if(!result){
                res.end("Failure");
            }else{
                res.cookie("email", email);
                res.end("Success");
            }
        })
        

    });
})

app.get("/logout", function(err, res){
    res.clearCookie("email");
    res.redirect("/hrlogin");
})

app.get('/hrprofile',function(req,res){
    // if(!req.cookies.email){
    //     res.redirect("/hrlogin");
    // }
    res.sendFile( __dirname + "/public/" + "profile.html" );
})

app.post('/fetch', function(req, res){
    console.log(JSON.stringify(req.body));
    var email = req.cookies.email;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        //console.log(email+" : "+pass);
        dbo.collection('hrLogin').findOne({email:email}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            console.log(result);
            res.end(JSON.stringify(result));
        })
        

    });
})

var server = app.listen(3300,function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Server started at http://%s:%s",host,port);
})