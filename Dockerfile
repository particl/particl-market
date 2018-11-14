FROM mhart/alpine-node:9.6.1

RUN apk add --update --no-cache gcc g++ make libc6-compat python git build-base openssl-dev curl bash
# RUN apk add --no-cache fftw-dev --repository https://dl-3.alpinelinux.org/alpine/edge/main/
# RUN apk add --no-cache vips-dev --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
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
