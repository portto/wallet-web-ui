import { rest, setupWorker } from "msw";

const ENV = process.env.REACT_APP_ENV || "local";

const initMocks = async () => {
  if (!["local", "test"].includes(ENV)) return;
  // mock apis
  const settings = (await import("./config.js")).default;
  const getHandlers = settings.gets.map(({ url, response }) =>
    rest.get(url, (req, res, ctx) =>
      response instanceof Function
        ? response(req, res, ctx)
        : res(ctx.json(response))
    )
  );
  const postHandlers = settings.posts.map(({ url, response }) =>
    rest.post(url, (req, res, ctx) =>
      response instanceof Function
        ? response(req, res, ctx)
        : res(ctx.json(response))
    )
  );

  const worker = setupWorker(...getHandlers, ...postHandlers);
  worker.start();
};

export default initMocks;
