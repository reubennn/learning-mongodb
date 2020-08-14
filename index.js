const MongoClient = require("mongodb").MongoClient;
const Hapi = require("@hapi/hapi");

const url = "mongodb://localhost:27017";

const PORT = 3000;
const HOST = "localhost";

let collection;

const init = async () => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.error(err);
            throw err;
        }
        console.log("Connected successfully to the Mongo server");

        let db = client.db("learning_mongo");
        collection = db.collection("tours");
    });

    const server = Hapi.server({
        port: PORT,
        host: HOST
    });

    server.route([
        /*
        ** Delete a single tour
        ** HTTP request: http://localhost:3000/
        */
        {
            method: "GET",
            path: "/",
            handler: function (request, h) {
                return ("Hello, World! - from Hapi/Mongo example.")
            }
        },

        /*
        ** Get tour list
        ** HTTP request example: http://localhost:3000/api/tours?tourPackage=Backpack Cal
        */
        {
            method: "GET",
            path: "/api/tours",
            config: { json: { space: 2 } }, // Makes it more readable in a browser
            handler: function (request, h) {
                let findObject = {};
                // If user enters key value set, find it
                for (let key in request.query) {
                    findObject[key] = request.query[key];
                }
                return collection.find(findObject).toArray();
            }
        },

        /*
        ** Add new tour
        ** HTTP request example: http://localhost:3000/api/tours
        **                          Body(raw): {
        **                                "tourName":"Reuben's Awesome Tour",
        **                                "tourPackage":"Fun in the sun",
        **                                "tourPrice":10000,
        **                                "tourLength":5
        **                            }
        */
        {
            method: "POST",
            path: "/api/tours",
            handler: function (request, h) {
                console.log("POST request on /api/tours. Received:");
                console.log(request.payload);
                // Insert document ONLY if the document does not already exist
                return collection.updateOne(
                    request.payload,
                    { $setOnInsert: request.payload }, // Has no effect if the query does not insert
                    { upsert: true } // Creates the document when no document matches the query
                );
            }
        },

        /*
        ** Get a single tour
        ** HTTP request example: http://localhost:3000/api/tours/Big Sur Retreat
        */
        {
            method: "GET",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                return collection.findOne(
                    { "tourName": request.params.name }
                );
            }
        },

        /*
        ** Update a single tour
        ** HTTP request example: http://localhost:3000/api/tours/Reuben's Awesome Tour
        **                          Body(raw): {
        **                              "tourBlurb": "Get your tan on"
        **                          }
        ** HTTP request example with replace: http://localhost:3000/api/tours/Reuben's Awesome Tour?replace=true
        **                          Body(raw): {
        **                              "tourBlurb": "Get your tan on"
        **                          }
        */
        {
            method: "PUT",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                // Replace the document with the new query key-value pairs
                if (request.query.replace == "true") { // Query parameter: replace = "true"
                    console.log(`PUT request on /api/tours/${request.params.name}. Replacing document with key values pairs:`);
                    console.log(request.payload);
                    request.payload.tourName = request.params.name;
                    return collection.replaceOne(
                        { "tourName": request.params.name },
                        request.payload
                    );
                } else {
                    // Append the query key-value pair onto the document
                    console.log(`PUT request on /api/tours/${request.params.name}. Updating document with key values:`);
                    console.log(request.payload);
                    // Insert document ONLY if the document does not already exist
                    return collection.updateOne(
                        { tourName: request.params.name },
                        { $set: request.payload }
                    );
                }
            }
        },

        /*
        ** Delete a single tour
        ** HTTP request example: http://localhost:3000/api/tours/Reuben's Awesome Tour
        */
        {
            method: "DELETE",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                return collection.deleteOne(
                    { tourName: request.params.name },
                )
                    // As Node.js is asynchronous, we need to provide a Promise, which executes AFTER collection.deleteOne()
                    .then(mongoStatus => {
                        return h.response(mongoStatus).code(200); // Send response and status code
                    });
            }
        }
    ]);

    await server.start();
    console.log(`Hapi Server is listening on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

