FROM mhart/alpine-node:8.9.0

RUN apk add --no-cache make gcc g++ python git
RUN apk add --no-cache vips-dev fftw-dev --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
RUN npm install -g wait-port
RUN npm install -g -s --no-progress yarn
RUN npm install -g ts-node
RUN npm install -g typescript
#RUN npm install sqlite3 --save

RUN mkdir -p /app/data
WORKDIR /app/
COPY package.json /app
COPY yarn.lock /app
RUN yarn install

#COPY . /app/
#RUN bin/ci-create-dbs.sh
#RUN bin/ci-create-build-version.sh

#VOLUME /app/data
#VOLUME /app/

#CMD [ "yarn", "serve" ]
#CMD [ "bin/entrypoint.sh" ]
EXPOSE 3000 3100 3200
