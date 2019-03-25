FROM node:8 as build-stage
#ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build


FROM node:8 as production-stage
COPY --from=build-stage /usr/src/app ./
EXPOSE 8080
CMD [ "npm", "start" ]