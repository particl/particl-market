FROM mhart/alpine-node:9.6.1

ENV BUILD_PACKAGES git wget curl bash make gcc g++ python libc6-compat build-base openssl-dev ca-certificates libssl1.0 openssl libstdc++
ENV RUBY_PACKAGES ruby ruby-dev ruby-bundler ruby-json ruby-bigdecimal ruby-io-console
ENV NPM_PACKAGES wait-port yarn ts-node tslint typescript
ENV GEM_PACKAGES kontena-cli

# update and install all of the required packages, then remove the apk cache
RUN apk --update add --no-cache $BUILD_PACKAGES && \
    apk add --no-cache $RUBY_PACKAGES

RUN npm install -g -s --no-progress $NPM_PACKAGES
RUN gem install $GEM_PACKAGES --no-rdoc --no-ri
RUN gem cleanup

# RUN apk add --no-cache fftw-dev --repository https://dl-3.alpinelinux.org/alpine/edge/main/
# RUN apk add --no-cache vips-dev --repository https://dl-3.alpinelinux.org/alpine/edge/testing/
#RUN npm install -g wait-port
#RUN npm install -g -s --no-progress yarn
#RUN npm install -g ts-node
#RUN npm install -g tslint
#RUN npm install -g typescript
#RUN echo 'check_certificate = off' >> /etc/wgetrc \
#    && wget -O ruby-install-0.6.0.tar.gz https://github.com/postmodern/ruby-install/archive/v0.6.0.tar.gz \
#    && tar xzf ruby-install-0.6.0.tar.gz \
#    && cd ruby-install-0.6.0 \
#    && make install \
#    && ruby-install --system --latest ruby \
#    && gem install --no-ri --no-rdoc bundler \
#    && gem update --system \
#    && rm -rf ruby-install* \
#    && ruby --version \
#    && ruby-install --cleanup



RUN mkdir -p /app/data/database
RUN mkdir -p /root/.kontena/certs

WORKDIR /app/

# install dockerize
RUN wget https://github.com/jwilder/dockerize/releases/download/v0.6.0/dockerize-linux-amd64-v0.6.0.tar.gz \
    && tar -xzvf dockerize-linux-amd64-v0.6.0.tar.gz

COPY package.json /app
COPY yarn.lock /app
COPY . /app/
COPY .kontena_client.json /root/.kontena_client.json

# setup config files
RUN cp -f .env.ci.app1 /app/.env
RUN cp -f .env.ci.test /app/.env.test
RUN cp -f .env.ci.blackbox /app/.env.blackbox

#RUN yarn install --check-files

#VOLUME /app/data
#VOLUME /app/
#CMD [ "yarn", "serve" ]
#CMD [ "bin/entrypoint.sh" ]

EXPOSE 3000 3100 3200
