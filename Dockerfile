FROM mhart/alpine-node:8.9.0

RUN npm install yarn -g
WORKDIR /app
COPY package.json yarn.lock ./
RUN mkdir data
RUN yarn install
COPY ./ ./

RUN npm test

EXPOSE 3000
VOLUME ["/app/data"]

CMD npm run serve
