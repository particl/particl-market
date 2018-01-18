# FROM node:6.9.5-alpine
FROM mhart/alpine-node:8.9.0

RUN apk add --no-cache make gcc g++ python
RUN npm install -g -s --no-progress yarn

RUN mkdir -p /app/data
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app

RUN yarn install
COPY . /app

VOLUME /app/data

RUN mkdir -p /app/node_modules/images/vendor/linux_musl-x64-57
COPY docker/linux_musl-x64-57/binding.node /app/node_modules/images/vendor/linux_musl-x64-57/binding.node
RUN rm -rf /app/data/marketplace*db; npm run db:migrate; cp /app/data/marketplace.db /app/data/marketplace-test.db

# CMD npm run serve
CMD [ "yarn", "serve" ]
EXPOSE 3000 3100 3200 41738 41935 51738 51935
