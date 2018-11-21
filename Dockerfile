FROM mhart/alpine-node:9.6.1

RUN apk add --no-cache make gcc g++ python git build-base openssl-dev curl bash
RUN apk add --no-cache --update fftw-dev
RUN npm install --global -s --no-progress wait-port yarn ts-node tslint typescript

RUN mkdir -p /app/data/database
WORKDIR /app/
COPY package.json /app
COPY yarn.lock /app

#RUN yarn install
#COPY . /app/
#RUN bin/ci-create-dbs.sh
#RUN bin/ci-create-build-version.sh
#VOLUME /app/data
#VOLUME /app/
#CMD [ "yarn", "serve" ]
#CMD [ "bin/entrypoint.sh" ]

EXPOSE 3000 3100 3200
