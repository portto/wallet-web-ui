import { createAuthnQueue, getDappInfo, getDappMetadata } from "apis";
import { useEffect } from "react";
import { useAuthenticateMachine } from "machines/authenticate";
import Loading from "components/Loading";

const Connecting = () => {
  const { context, send } = useAuthenticateMachine();

  // enqueue current user into request waiting queue
  useEffect(() => {
    createAuthnQueue().then((data) => send({ type: "updateQueue", data }));
  }, [send]);

  // gather current dapp info
  useEffect(() => {
    const { accessToken } = context.user || {};
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      const fetchDapp = id
        ? getDappInfo({ id }).then(({ logo, name, web }) =>
          Promise.resolve({
            logo,
            name,
            url: web.web_domain,
          })
        )
        : getDappMetadata({ url }).then(({ result }) =>
          Promise.resolve({
            logo: result.thumbnail,
            name: result.title,
          })
        );
      fetchDapp.then((data) => {
        send({ type: "updateDapp", data });
        send(accessToken ? "skipLogin" : "ready");
      });
    }
  }, [send, context]);

  return <Loading />;
};

export default Connecting;
