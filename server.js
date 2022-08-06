/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  // If someone clicked the option for a random monster  it'll be passed in the querystring
  if (request.query.randomize) {
    // We need to load our monster data file, pick one at random, and add it to the params
    const monsters = require("./src/monsters.json");
    const allMonsters = Object.keys(monsters);
    let currentMonster = allMonsters[(allMonsters.length * Math.random()) << 0];

    // Add the monster properties to the params object
    params = {
      monster: monsters[currentMonster],
      monsterError: null,
      seo: seo,
    };
  }

  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view("/src/pages/index.hbs", params);
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/", function (request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  // If the user submitted a monster through the form it'll be passed here in the request body
  let monster = request.body.monster;

  // If it's not empty, let's try to find the monster
  if (monster) {
    // ADD CODE FROM TODO HERE TO SAVE SUBMITTED FAVORITES

    // Load our monster data file
    const monsters = require("./src/monsters.json");

    // Take our form submission, remove whitespace, and convert to lowercase
    monster = monster.toLowerCase().replace(/\s/g, "");

    // Now we see if that monster is a key in our monsters object
    if (monsters[monster]) {
      // Found one!
      params = {
        monster: monsters[monster],
        monsterError: null,
        seo: seo,
      };
    } else {
      // Return the user value as the error property
      params = {
        monsterError: request.body.monster,
        seo: seo,
      };
    }
  }

  // The Handlebars template will use the parameter values to update the page with the chosen monster info
  return reply.view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
