FROM mhart/alpine-node:16
LABEL maintainer="charlie@portto.com"

ENV NODE_ENV=production
ENV REACT_APP_ENV=development
ENV REACT_APP_VERSION=0.0.0
ENV REACT_APP_GA_UA=UA-145395677-10
ENV REACT_APP_AMPLITUDE_KEY=3c7fda85041ce49b44c8baa936b17bbb
ENV REACT_APP_SENTRY_LINK=https://7fc3ab92354d4a72b23f611b4c1fcedd@o396696.ingest.sentry.io/5337606
ENV REACT_APP_API_BASE=https://wallet-dev.blocto.app
ENV REACT_APP_BLOCTO_ADDRESS=0xf086a545ce3c552d

RUN yarn build
RUN yarn global add serve

COPY . /wallet-web-ui
WORKDIR /wallet-web-ui


CMD ["serve", "-s" ,"build", "-l", "80"]