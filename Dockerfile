FROM mhart/alpine-node:16
LABEL maintainer="charlie@portto.com"

ENV NODE_ENV=production

RUN yarn global add serve

COPY . /wallet-webapp
WORKDIR /wallet-webapp


CMD ["serve", "-s" ,"build", "-l", "80"]