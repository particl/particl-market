FROM mhart/alpine-node:8.9.0

RUN npm install yarn -g
WORKDIR /app
COPY package.json yarn.lock ./
RUN mkdir data
# RUN yarn install
RUN set -ex; \
  if [ "$NODE_ENV" = "production" ]; then \
    yarn install --no-cache --frozen-lockfile --production; \
  elif [ "$NODE_ENV" = "development" ]; then \
    yarn install --no-cache --frozen-lockfile; \
  elif [ "$NODE_ENV" = "test" ]; then \
    yarn install --no-cache --frozen-lockfile; \
  fi;
COPY ./ ./

EXPOSE 3000
VOLUME /app/data

CMD npm run serve
