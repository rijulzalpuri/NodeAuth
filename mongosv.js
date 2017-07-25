var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var myobj = [{ ques: "In which decade was the American Institute of Electrical Engineers (AIEE) founded?", answer: "b" },
    { ques: "What is part of a database that holds only one type of information?", answer: "b" },
    { ques: "In which decade with the first transatlantic radio broadcast occur?", answer: "d" },
    { ques: "'OS' computer abbreviation usually means ??", answer: "b" },
    { ques: "In which decade with the first transatlantic radio broadcast occur?", answer: "b" },
    ]
    db.collection("Question").insertMany(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 record inserted");
        db.close();
    });
});