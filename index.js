const {ApolloServer, PubSub} = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers/index')
const {urlDB} = require('./config')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true,
  context:({req}) => ({req, pubsub})
}) 

mongoose.connect(urlDB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
  
})
  .then(() => {
    console.log('connect DB')
  }).catch((e) => console.error(e))

server.listen({port: 5000})
  .then((res) => {
    console.log(`Server running at ${res.url}`)
  })
