import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'

import passport from 'passport'
import session from 'express-session'
import connectMongo from 'connect-mongodb-session'

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import {  buildContext } from 'graphql-passport'

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import connectDB from './db/connectDB.js';
import { configurePassPort } from './passport/passport.config.js'

dotenv.config();
configurePassPort();
const app = express();
const httpServer = http.createServer(app);
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
});

store.on('error', (err) => {
    console.log(err);
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,//whether to save session if nothing is changed
        saveUninitialized: false,
        cookie:{
            maxAge: 1000 * 60 * 60 * 24 * 7,//7 days
            httpOnly: true,
        },
        store: store,
    })
);

//initialise the passport middleware
app.use(passport.initialize());
app.use(passport.session());//session management

const server = new ApolloServer({
    typeDefs:mergedTypeDefs,
    resolvers:mergedResolvers,
    plugins:[ApolloServerPluginDrainHttpServer({httpServer})]
})

await server.start();

app.use(
    '/',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
    express.json(),
    expressMiddleware(server,{
        context:async ({req,res}) => buildContext({req,res})
    }),

);
await new Promise(resolve => httpServer.listen({port: 4000}, resolve));
await connectDB();
console.log(`Server ready at http://localhost:4000/`);
