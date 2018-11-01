# Open Product Evaluation Server [![Build Status](https://travis-ci.org/th-koeln/open-product-evaluation-server.svg?branch=master)](https://travis-ci.org/th-koeln/open-product-evaluation-server)

Open Product Evaluation Server is a service which provides an API to evaluate different products e.g. apps or websites.
The difference to other survey apps is the focus on fast and easy reviews of your products which results in different types of questions like google forms or other survey apps usually provide.

Install OPE:

1. Clone project
2. Run `npm install` in root folder
3. Run `npm run build` in root folder
3. Run `npm install` in `/server`
4. Run MongoDB with `npm run mongo` in `/server`
5. Run GraphQL Server with `npm start` in `/server`
6. Server now runs on http://localhost:3000

You can find the [GraphQL Playground](https://github.com/graphcool/graphql-playground) on http://localhost:3000/playground.

You can find [Voyager](https://github.com/graphcool/graphql-playground) on http://localhost:3000/voyager.

## Developer Setup

To add to the development of OPE you may need to change a few settings in your local repository. If you do not use the default settings you need to create a `.env` file in the `/server` directory which holds the environment variables needed. The `config.js` file in the `/server` directory uses these variables or provides default settings if a `.env` can not be found.

A `.env` file looks like this:

```
DEV_DB_NAME = 'openproductevaluation'
NODE_ENV = 'dev'
...
```
