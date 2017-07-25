const express = require('express')
const app = express()
const port = 4000
const nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
app.use(bodyParser());
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
var crypto = require('crypto');

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len);   // return required number of characters
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'scapictest@gmail.com',
        pass: 'Scapic@123'
    }
});
var CurrentUser = ''
app.get('/', (request, response) => {
    //   response.send('Hello from Express!')
    var html = '<a href="/admin">Admin Interface.</a>'

    response.send(html);
})
app.post('/score', function (req, res) {
    console.log(req.body)
    var score = 0
    if (req.body.ques0 == 'B') {
        score++
    }
    if (req.body.ques1 == 'B') {
        score++
    }
    if (req.body.ques2 == 'D') {
        score++
    }
    if (req.body.ques3 == 'B') {
        score++
    }
    if (req.body.ques4 == 'B') {
        score++
    }
    res.send('You Scored' + score)
    updateRecord(score)

})
function updateRecord(score) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var myquery = { name: CurrentUser };
        var newvalues = { $set: { quiz: true, score: score } };
        db.collection("user").updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 record updated");
            db.close();
        });
    });
}
app.get('/verify/:id/:token', (request, response) => {
    //   response.send('Hello from Express!')
    // console.log(request.)
    var verify = false
    var questions = ''
    var html = '<a href="/admin">Checking for values.</a>'
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var query = { name: request.params.id };
        CurrentUser = request.params.id
        db.collection("user").find(query).toArray(function (err, result) {
            if (err) throw err;
            console.log(result[0])
            if (result[0].auth == request.params.token) {
                verify = true
            }
            if (verify) {
                var ress = ''
                if (result[0].quiz) {
                    ress = "Your Score is " + result[0].score
                    response.send(ress);

                }
                else {
                    db.collection("Question").find({}).toArray(function (err, result) {
                        if (err) throw err;
                        console.log(result);
                        // questions=result




                        ress = '<form action="/score" method="post">' +
                            result.map((item, index) => {
                                return '<h5>' + item.ques + '</h5>' + '<input type="checkbox" name="ques' + index + '"' + ' value="A">A'
                                    + '<input type="checkbox" name="ques' + index + '"' + ' value="B">B'
                                    + '<input type="checkbox" name="ques' + index + '"' + ' value="C">C'
                                    + '<input type="checkbox" name="ques' + index + '"' + ' value="D">D'
                            })
                            + '<button type="submit">Submit</button>' +
                            '</form>';

                        response.send(ress);

                        db.close();
                    });
                }


            }
            else {
                response.send("Authentication Unsuccessfulll")
            }
            // console.log(result[0].auth,token);
            db.close();
        });
    });

})

function checkAuth(id, token) {

}
app.get('/admin', function (req, res) {
    //   var userName = req.body.userName;
    var html = '<form action="/admin" method="post">' +
        'Enter your name:' +
        '<input type="email" name="userName" placeholder="..." />' +
        '<br>' +
        '<button type="submit">Submit</button>' +
        '</form>';
    res.send(html);
});
app.post('/admin', function (req, res) {
    var userName = req.body.userName;
    var token = randomValueHex(12)
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var myobj = { name: userName.toString(), auth: token.toString(), quiz: false, score: 0 };
        db.collection("user").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
            db.close();
        });
    });
    sendEmail(userName, token)
    var html = 'Hello: ' + userName + '.<br>' +
        '<a href="/">Try again.</a>';
    res.send(html);
});

function sendEmail(user, token) {
    var url = 'http://localhost:4000/verify/' + user + '/' + token + ''
    var mailOptions = {
        from: 'scapictest@gmail.com',
        to: user,
        subject: 'Sending Email using Node.js',
        html: '<a href=' + url.toString() + '>Click here To Authenticate</a>'
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.send(error)

        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent Succesfully')
        }
    });
}


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})

// Create the Table
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//  db.createCollection("user", function(err, res) {
//     if (err) throw err;
//     console.log("Table created!");
//     db.close();
//   });
// });