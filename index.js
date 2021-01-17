const express = require('express')
const {ApolloServer, PubSub} = require('apollo-server-express')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers/index')
const {urlDB} = require('./config')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context:({req}) => ({req, pubsub})
}) 

const port = process.env.PORT || 5000
const app = express()
const path = '/';

server.applyMiddleware({app, path})

mongoose.connect(urlDB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
  
})
  .then(() => {
    console.log('connect DB')
  }).catch((e) => console.error(e))

app.listen({port}, () => {
  console.log(`Server running at ${port}`)
})
