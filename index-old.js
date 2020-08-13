let MongoClient = require('mongodb').MongoClient;

let url = 'mongodb://localhost:27017';

let findDocuments = function (db, callback) {
    let collection = db.collection("tours");

    collection.find({ "tourPackage": "Snowboard Cali" }).toArray((err, docs) => {
        console.log(docs);
        callback;
    })
}
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        throw err;
    }
    console.log("Connected successfully to the mongo server");

    let db = client.db("learning_mongo");
    findDocuments(db, () => {
        client.close();
    });
});