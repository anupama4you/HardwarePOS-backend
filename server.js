const express = require("express"),
	app = express(),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	mysql = require("mysql"); // import mysql module

const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");


// make server object that contain port property and the value for our server.
var server = {
	port: 4000,
};

// use the modules
app.use(cors());

app.use(bodyParser.json());

Sentry.init({
	dsn:
		"https://a1339cca38014dfd9f13686ce831702d@o1113689.ingest.sentry.io/6144408",
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Tracing.Integrations.Express({ app }),
	],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

//All handlers
require("./app/routes/routes")(app);

// starting the server
app.listen(server.port, () =>
	console.log(`Server started, listening port: ${server.port}`)
);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
	// The error id is attached to `res.sentry` to be returned
	// and optionally displayed to the user for support.
	res.statusCode = 500;
	res.end(res.sentry + "\n");
});
