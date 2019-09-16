# Open Product Evaluation Server

Open Product Evaluation Server is a service which provides an API to evaluate different products e.g. apps or websites.
The difference to other survey apps is the focus on fast and easy reviews of your products which results in different types of questions like google forms or other survey apps usually provide.

Install OPE and run in production:

1. Clone project
2. Run `npm install`
3. Run MongoDB with `npm run mongo` (needs to be installed)
4. Run `npm run setup` to enter settings
5. Run GraphQL Server with `npm start`
6. Server now runs on http://localhost:3000 (default settings)

Install OPE and run in development:

1. Clone project
2. Run `npm install`
3. Run MongoDB with `npm run mongo` (needs to be installed)
4. Run `npm run setup` to enter settings (important: check development when asked for environment)
5. Run GraphQL Server with `npm dev`
6. Server now runs on http://localhost:3000 (default settings)
7. Run vue cli for frontend with webpack-dev-server `npm run serve`
8. Frontend now runs on http://localhost:8080 (default settings)

For more informations about graphql types, queries, mutations and subscriptions see OPE's API-Documentation via `npm run start && npm run docs` or this projects [Wiki](https://github.com/th-koeln/open-product-evaluation-server/wiki).

You can find the [GraphQL Playground](https://github.com/graphcool/graphql-playground) on http://localhost:3000/playground (development only).

You can find [Voyager](https://github.com/graphcool/graphql-playground) on http://localhost:3000/voyager (development only).
