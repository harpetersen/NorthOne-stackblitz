const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// For including a Date scalar
const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null;
    },
  }),
};


// Construct a schema, using GraphQL schema language
const schema = buildSchema(`

  scalar Date

  enum StatusValues {
    Pending
    Posted
  }

  type Mapping {
    id: String!
    value: String!
  }

  type Transaction {
    ID: ID!
    Date: Date!
    Amount: Int!
    Status: StatusValues!
    CounterpartyName: String!
    MethodCode: Int
    Note: String
  }

  type Query {
    allTransactions: [Transaction]
    methodTransactions(value: String!): [Transaction]
    balance: Int
    methodMap: [Mapping]
  }

  type Mutation {
    addTransaction: Transaction
    updateTransaction(id: Int!): Transaction
    deleteTransaction(id: Int!): Int
  }
`);


// Default mapping data
var mappingData = [
  {
    id: 12,
    value: 'Card Purchase',
  }, 
  {
    id: 34,
    value: 'ACH',
  }, 
  {
    id: 56,
    value: 'Wire',
  }, 
  {
    id: 78,
    value: 'Fee',
  }, 
  {
    id: -1, // Default for transactions with positive values
    value: 'Incoming',
  }, 
  {
    id: -2, // Default for transactions with negative values
    value: 'Outgoing',
  }
] 

// Default transaction info for to ensure availaiblity for testing
var transactions = [
  {
    ID: 0,
    Date: '2023-09-24T23:29:56.901Z',
    Amount: 1,
    Status: 'Pending',
    CounterpartyName: 'Test01',
    MethodCode: -1,
    Note: 'TestValue1, please ignore'
  }, 
  {
    ID: 1,
    Date: '2023-09-24T23:29:56.901Z',
    Amount: -1,
    Status: 'Pending',
    CounterpartyName: 'Test02',
    MethodCode: -2,
    Note: 'TestValue2, please ignore'
  },
  {
    ID: 2,
    Date: '2023-09-24T23:29:56.901Z',
    Amount: 2,
    Status: 'Posted',
    CounterpartyName: 'Test03',
    MethodCode: -1,
    Note: 'TestValue3, please ignore'
  }, 
  {
    ID: 3,
    Date: '2023-09-24T23:29:56.901Z',
    Amount: -2,
    Status: 'Posted',
    CounterpartyName: 'Test04',
    MethodCode: -2,
    Note: 'TestValue4, please ignore'
  },
] 

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return 'Hello, world!';
  },
  addTransaction: createTransaction,
  updateTransaction: updateTransaction,
  deleteTransaction: deleteTransaction,
  allTransactions: requestAllTransactions,
  methodTransactions: requestTransactionsByMethod,
  balance: requestTotalAllTransactionsBalance,
  methodMap: requestMethodCodeToNameMap
};

// This function is for creating a new transaction
var createTransaction = function(args){
  args.Method = mappingData.filter(value => args.Method)[0]
  const newTransaction = {
    Date: args.Date,
    Amount: args.Amount,
    Status: args.Status,
    CounterpartyName: args.CounterpartyName,
    MethodCode: args.MethodCode,
    Note: args.Note,
  }
  transactions.push(newTransaction);
  // Call the GraphQL mutation resolver to add a new transaction
  return newTransaction
}

// This function is for updating a transaction entry
var updateTransaction = function(args){
  return
}

// This function is for removing a transaction entry
var deleteTransaction = function(args){
  return
}

// This function is for listing all transactions entry
var requestAllTransactions = function(args){
  return 
}

// This function is for getting all transactions by a method
var requestTransactionsByMethod = function(args){
  return
}

// This function is for getting the current account balance
var requestTotalAllTransactionsBalance = function(args){
  return
}

// This function is for requesting method mapping
var requestMethodCodeToNameMap = function(args){
  
}

const app = express();
app.use(
  '/',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: {
      defaultQuery: '{\n  hello\n}\n',
    },
  })
);

app.listen(4000, () =>
  console.log('Running a GraphQL API server at http://localhost:4000/')
);
