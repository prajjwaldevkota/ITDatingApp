// app.js
import * as cfg from "./config.js";
import Fastify from "fastify";
import mercurius from "mercurius";
import cors from "@fastify/cors";
import { schema } from "./schema.js";
import { resolvers } from "./resolver.js";
import { setAuthorizationHeader } from "./sharedData.js";
import path from "path";
import FastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";

const app = Fastify();

// app.register(cors, {});
//app.register(cors, {});
// additions for handling static file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.register(FastifyStatic, {
root: path.join(__dirname, "public"),
prefix: "/",
});

app.get("/", (req, reply) => reply.sendFile("index.html"));
// if user refreshes page
app.setNotFoundHandler((req, res) => {
res.sendFile("index.html");
});


app.register(mercurius, {
    schema,
    resolvers,
    context: (request, reply) => {
        return { request, reply };
    },
    graphiql: true,
});

app.addHook("preHandler", async (request, reply) => {
    // Access the authorization header from the request
    const authorizationHeader = request.headers['authorization'];

    // Store the authorization header using the shared data module
    setAuthorizationHeader(authorizationHeader);
});

app.listen({ port: 5000 || process.env.PORT });
