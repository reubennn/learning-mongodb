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
        // Get tour list
        {
            method: "GET",
            path: "/api/tours",
            config: { json: { space: 2 } }, // Makes it more readable in a browser
            handler: function (request, h) {
                let findObject = {};
                // If user enters key value set, find it
                for (let key in request.query) {
                    findObject[key] = request.query[key];
                } //e.g. localhost:3000/api/tours?tourPackage=Backpack Cal
                return collection.find(findObject).toArray();
            }
        },
        // Add new tour
        {
            method: "POST",
            path: "/api/tours",
            handler: function (request, h) {
                return ("Adding new tour");
            }
        },
        // Get a single tour
        {
            method: "GET",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                return collection.findOne({ "tourName": request.params.name });
            } // e.g. localhost:3000/api/tours/Big Sur Retreat
        },
        // Update a single tour
        {
            method: "PUT",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                // request.payload variables
                return ("Updating " + request.params.name);
            }
        },
        // Delete a single tour
        {
            method: "DELETE",
            path: "/api/tours/{name}",
            handler: function (request, h) {
                return ("Deleting " + request.params.name).code(204);
            }
        },
        // Home page
        {
            method: "GET",
            path: "/",
            handler: function (request, h) {
                return ("Hello world from Hapi/Mongo example.")
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

