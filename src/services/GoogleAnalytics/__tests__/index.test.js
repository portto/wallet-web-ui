// import { sendPageView } from '../';

describe("ga", () => {
  it("should initial ga and add plugins", async () => {
    jest.resetModules();
    window.location.host = "localhost:3000";
    window.ga = jest.fn();
    const { loadGA } = require.requireActual("../");

    await loadGA();

    expect(window.ga.mock.calls).toMatchSnapshot();
  });

  // it('should send default path page view with sendPageView', () => {
  //   window.ga = jest.fn();

  //   sendPageView();

  //   expect(window.ga).toHaveBeenCalledWith('send', 'pageview', location.pathname);
  // });

  // it('should send page view of path with sendPageView', () => {
  //   window.ga = jest.fn();

  //   const mockedPath = Symbol('pathname');

  //   sendPageView(mockedPath);

  //   expect(window.ga).toHaveBeenCalledWith('send', 'pageview', mockedPath);
  // });

  it("should read correct UA depends on environment", () => {
    jest.resetModules();
    window.location.host = "cobinhood.com";
    const { GA_UA } = require.requireActual("../");

    expect(GA_UA).toMatchSnapshot();
  });
});
