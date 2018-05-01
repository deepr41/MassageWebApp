var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser'); 
var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb"

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

var mongocon = function(){
    var date = new Date()
    addFile("a.txt","Deepak",date);
    console.log("Inserted",date);
}

function addFile(name,owner,date,path){
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        var myOBJ = {name:name,owner:owner,date:date,path:path};
        dbo.collection("Files").insertOne(myOBJ, function(err,res){
            if(err) throw err;
            console.log("Inserted in Mongodb")
            db.close()
        });
    });

}


app.get('/signup.html',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    res.sendFile( __dirname + "/" + "signup.html" );
    return res.end()
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
        dbo.collection('myTable').insert({email:email, pass:pass, fname:fname, lname:lname}, function(err, result){
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
        dbo.collection('myTable').update({email:email}, {$set:{fname:fname, lname:lname}}, function(err, result){
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
    console.log(JSON.stringify(req.body));
    var email = req.body.email;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        //console.log(email+" : "+pass);
        dbo.collection('myTable').deleteOne({email:email}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            res.end("Success");
        })
    });
})


app.get('/loginpage.html',function(req,res){
    //res.writeHead(200, {'Content-Type': 'text/html'});
    res.sendFile( __dirname + "/" + "loginpage.html" );
    return res.end()
})
app.post('/login', function(req, res){
    console.log(JSON.stringify(req.body));
    var email = req.body.email;
    var pass = req.body.pass;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        console.log(email+" : "+pass);
        dbo.collection('myTable').findOne({email:email, pass:pass}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }

            console.log(result);
            if(!result){
                res.end("Failure");
            }else{
                res.end("Success");
            }
        })
        

    });
})


app.get('/profile.html',function(req,res){
    res.sendFile( __dirname + "/" + "profile.html" );
    return res.end()
})

app.post('/fetch', function(req, res){
    console.log(JSON.stringify(req.body));
    var email = req.body.email;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db('mydb');
        //console.log(email+" : "+pass);
        dbo.collection('myTable').findOne({email:email}, function(err, result){
            if(err){
                res.end("Failure");
                return;
            }
            console.log(result);
            res.end(JSON.stringify(result));
        })
        

    });
})

// function delFile(name)

app.get('/addFile',function(req,res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('Owner : <input type="text" name="owner"/>');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end()
})

app.post('/fileupload',function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(files.filetoupload.name);
        var oldpath = files.filetoupload.path;
        var newpath = __dirname+'/public/files/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            addFile(files.filetoupload.name,fields.owner,new Date(),newpath)
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('File succesfully uploaded!');
            console.log("File uploaded")
            res.write('<br><br><a href="/">Go Home</a>')
            res.end();
      });
    });
})

app.post('/deleteFile',function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var dbo = db.db('mydb');
            var query = {name : fields.delName}
            dbo.collection('Files').find(query).toArray(function(err,res){
                console.log(res[0].name)
                function myUnlink(i,res){
                    fs.unlink(res[i].path,function(err){
                        if(err) throw err
                    });
                    console.log(res[i].name)
                }
                for(i=0;i<res.length;i++){
                    myUnlink(i,res);
                    }
                res.writeHead(200, {'Content-type':'text/html'});
                res.write("File successfully deleted")
                res.end();
            });
        });
    });
})

app.post('/deleteAll',function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var dbo = db.db('mydb');
            dbo.collection('Files').find({}).toArray(function(err,res){
                console.log(res[0].name)
                function myUnlink(i,res){
                    fs.unlink(res[i].path,function(err){
                        if(err) throw err
                    });
                    console.log(res[i].name)
                }
                for(i=0;i<res.length;i++){
                    myUnlink(i,res);
                    }
                res.writeHead(200, {'Content-type':'text/html'});
                res.write("File successfully deleted")
                res.end();
            });
        });
    });
})

app.get('/',function(req,res){
    fs.readFile(__dirname+'/public/index.html',function(err,data){
        if(err) throw err
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
})

app.get('/del_file',function(req,res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="deleteFile" method="post" enctype="multipart/form-data">');
    res.write('FileName : <input type="text" name ="delName">');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end()  
})


var server = app.listen(5000,function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Server started at http://%s:%s",host,port);
})