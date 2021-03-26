import express from 'express';
import mongoose from 'mongoose';

import expressGraphQL from 'express-graphql';
const { graphqlHTTP } = expressGraphQL;

import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import schema from './graphql/index.js';

const app = express();
const PORT = process.env.PORT || 4000; // move to env
const dbURI = 'mongodb+srv://admin:Liop890890!@cluster0.adxil.mongodb.net/hope?retryWrites=true&w=majority'; // move to env
// const APP_SECRET = 'sdlfkj08234lksdf'; // move to env 

// import authRoute from './routes/auth';
// git subtree push --prefix server heroku master

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (err) => {
    console.error(err);
});
db.once('open', () => {
    console.log('DB started successfully');
});

app.use(
    cookieParser(),
    bodyParser.json(),
    cors({
        origin: ['http://localhost:3000', 'https://605db29e28d190f3b1b526d5--hca-grade-portal.netlify.app'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        credentials: true
    })
);

// app.use('/api/auth', authRoute);
app.use('/graphql', (req, res) => {
    return graphqlHTTP({
        schema: schema,
        graphiql: true,
        context: { req, res }
    })(req, res);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});