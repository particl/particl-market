FROM mhart/alpine-node:9.6.1

ENV BUILD_PACKAGES git wget curl bash make gcc g++ python libc6-compat build-base openssl-dev ca-certificates libssl1.0 openssl libstdc++
ENV NPM_PACKAGES wait-port yarn ts-node tslint typescript

# update and install all of the required packages, then remove the apk cache
RUN apk --update add --no-cache $BUILD_PACKAGES
RUN npm install -g -s --no-progress $NPM_PACKAGES

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
