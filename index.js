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
        return new Date(ast.value); // ast value is always in string format
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
    id: ID!
    date: Date!
    amount: Int!
    status: StatusValues!
    counterpartyName: String!
    methodCode: Int
    note: String
  }

  type Query {
    allTransactions: [Transaction]
    methodTransactions(Method: String!): [Transaction]
    balance: Int
    methodMap: [Mapping]
    healthCheck: Boolean
  }

  type Mutation {
    addTransaction(date: Date!, amount: Int!, status: StatusValues!, counterpartyName: String!, methodCode: Int, note: String): Transaction
    updateTransaction(id: Int!): Transaction
    deleteTransaction(id: Int!): Boolean
  }
`);

// Default mapping data
var mappingData = [
  {
    id: '12',
    value: 'Card Purchase',
  },
  {
    id: '34',
    value: 'ACH',
  },
  {
    id: '56',
    value: 'Wire',
  },
  {
    id: '78',
    value: 'Fee',
  },
  {
    id: '-1', // Default for transactions with positive values
    value: 'Incoming',
  },
  {
    id: '-2', // Default for transactions with negative values
    value: 'Outgoing',
  },
];

// Default transaction info for to ensure availaiblity for testing
var transactions = [
  {
    id: 0,
    date: '2023-09-24T23:29:56.901Z',
    amount: 1,
    status: 'Pending',
    counterpartyName: 'Test01',
    methodCode: -1,
    note: 'TestValue1, please ignore',
  },
  {
    id: 1,
    date: '2023-09-24T23:29:56.901Z',
    amount: -1,
    status: 'Pending',
    counterpartyName: 'Test02',
    methodCode: -2,
    note: 'TestValue2, please ignore',
  },
  {
    id: 2,
    date: '2023-09-24T23:29:56.901Z',
    amount: 2,
    status: 'Posted',
    counterpartyName: 'Test03',
    methodCode: -1,
    note: 'TestValue3, please ignore',
  },
  {
    id: 3,
    date: '2023-09-24T23:29:56.901Z',
    amount: -2,
    status: 'Posted',
    counterpartyName: 'Test04',
    methodCode: -2,
    note: 'TestValue4, please ignore',
  },
];

// The root provides a resolver function for each API endpoint
const root = {
  healthCheck: (args) => {
    return true;
  },
  addTransaction: (args) => {
    return createTransaction(args);
  },
  updateTransaction: (args) => {
    return updateTransaction(args);
  },
  deleteTransaction: (args) => {
    return deleteTransaction(args);
  },
  allTransactions: (args) => {
    return requestAllTransactions(args);
  },
  methodTransactions: (args) => {
    return requestTransactionsByMethod(args);
  },
  balance: (args) => {
    return requestTotalAllTransactionsBalance(args);
  },
  methodMap: (args) => {
    return requestMethodCodeMapping(args);
  },
};

// This function is for creating a new transaction
var createTransaction = function (args) {
  if (!args.Method) {
    if (arg.Amount >= 0) {
      args.Method == 'Incoming';
    } else {
      args.Method == 'Outgoing';
    }
  }
  if (!args.MethodCode) {
    args.MethodCode = mappingData.filter((value) => args.Method)[0];
  }
  const newTransaction = {
    Date: args.Date,
    Amount: args.Amount,
    Status: args.Status,
    CounterpartyName: args.CounterpartyName,
    MethodCode: args.MethodCode,
    Note: args.Note,
  };
  transactions.push(newTransaction);
  // Call the GraphQL mutation resolver to add a new transaction
  return newTransaction;
};

// This function is for updating a transaction entry
var updateTransaction = function (args) {
  if (args.Method) {
    args.MethodCode = mappingData.filter((value) => args.Method)[0];
  }
  transactions.map((transaction) => {
    if (transaction.id == args.id) {
      Object.keys(args).forEach((key) => {
        if (key !== id) {
          transaction[key] = args[key];
        }
      });
    }
  });
  return updatedTransaction;
};

// This function is for removing a transaction entry
var deleteTransaction = function (args) {
  const index = transactions.findIndex(
    (transaction) => transaction.id === args.id
  );
  if (index !== -1) {
    // Remove the transaction at the specified index
    transactions.splice(index, 1);
    return true; // Return true to indicate successful deletion
  }
  return false;
};

// This function is for listing all transactions entry
var requestAllTransactions = function (args) {
  return transactions;
};

// This function is for getting all transactions by a method
var requestTransactionsByMethod = function (args) {
  args.MethodCode = mappingData.filter((value) => args.Method)[0];
  return transactions.filter(
    (MethodCode) => transactions.MethodCode === args.MethodCode
  );
};

// This function is for getting the current account balance
var requestTotalAllTransactionsBalance = function () {
  let totalBalance = 0;
  transactions.forEach((transaction) => {
    totalBalance += transaction.amount;
  });
  return totalBalance;
};

// This function is for requesting method mapping
var requestMethodCodeMapping = function (args) {
  return mappingData;
};

const app = express();
app.use(
  '/',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000, () =>
  console.log('Running a GraphQL API server at http://localhost:4000/')
);

/* 
I used the following query to test basic functionality: 

*/
