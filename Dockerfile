FROM mhart/alpine-node:16
LABEL maintainer="charlie@portto.com"

ENV NODE_ENV=production

COPY . /wallet-web-ui
WORKDIR /wallet-web-ui

RUN yarn global add serve

CMD ["serve", "-s" ,"build", "-l", "80"]