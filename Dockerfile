FROM mhart/alpine-node:8.9.0

RUN apk add --no-cache make gcc g++ python git
RUN apk add --no-cache vips-dev fftw-dev --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
RUN npm install -g wait-port
RUN npm install -g -s --no-progress yarn

RUN mkdir -p /app/data
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app

RUN yarn install
COPY . /app
RUN rm -rf /app/data/marketplace*db; npm run db:migrate; cp /app/data/marketplace.db /app/data/marketplace-test.db

#VOLUME /app/data
VOLUME /app/

# CMD npm run serve
CMD [ "yarn", "serve" ]
EXPOSE 3000 3100 3200
