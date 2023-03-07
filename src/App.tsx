import React, { Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import Loading from "src/components/Loading";
import { logPageView } from "src/services/Amplitude";
import { sendPageView } from "src/services/GoogleAnalytics";
import { EVM_CHAINS } from "src/utils/constants";
import { KEY_ACCESS_TOKEN, setItem } from "./services/LocalStorage";

const Authenticate = React.lazy(() => import("src/features/Authenticate"));
const EVM = {
  Transaction: React.lazy(() => import("src/features/EVM/Transaction")),
  Signing: React.lazy(() => import("src/features/EVM/Signing")),
};

const Flow = {
  Signing: React.lazy(() => import("src/features/Flow/Signing")),
  Transaction: React.lazy(() => import("src/features/Flow/Transaction")),
  PreAuthz: React.lazy(() => import("src/features/Flow/PreAuthz")),
  NonCustodial: React.lazy(() => import("src/features/Flow/NonCustodial")),
};

const SOL = {
  Transaction: React.lazy(() => import("src/features/Solana/Transaction")),
};

const Aptos = {
  Transaction: React.lazy(() => import("src/features/Aptos/Transaction")),
  Signing: React.lazy(() => import("src/features/Aptos/Signing")),
};

const AppSDKFallback = React.lazy(() => import("src/features/AppSDKFallback"));

const supportedEVMChains = EVM_CHAINS.join("|");

const App = () => {
  const location = useLocation();

  useEffect(() => {
    sendPageView(location.pathname);
    logPageView({ pathname: location.pathname });
  }, [location]);

  // handle injected access token from in-app browser to enable seemless login
  useEffect(() => {
    const injectedToken = (window as any).accessToken;
    if (injectedToken) {
      setItem(KEY_ACCESS_TOKEN, injectedToken);
    }
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route
          path="/:appId/:blockchain/authn/:userEmail?"
          render={() => <Authenticate />}
        />
        <Route
          path={`/:appId/:blockchain(${supportedEVMChains})/authz/:authorizationId?`}
          render={() => <EVM.Transaction />}
        />
        <Route
          path={`/:appId/:blockchain(${supportedEVMChains})/user-signature/:signatureId`}
          render={() => <EVM.Signing />}
        />
        <Route
          path={`/:appId/:blockchain(flow)/authz/:authorizationId?`}
          render={() => <Flow.Transaction />}
        />
        <Route
          path={`/:appId/:blockchain(flow)/pre-authz`}
          render={() => <Flow.PreAuthz />}
        />
        <Route
          path={`/:appId/:blockchain(flow)/non-custodial/:authorizationId?`}
          render={() => <Flow.NonCustodial />}
        />
        <Route
          path={`/:appId/:blockchain(flow)/user-signature/:signatureId?`}
          render={() => <Flow.Signing />}
        />
        <Route
          path={`/:appId/:blockchain(solana)/authz/:authorizationId?`}
          render={() => <SOL.Transaction />}
        />
        <Route
          path={`/:appId/:blockchain(aptos)/authz/:authorizationId?`}
          render={() => <Aptos.Transaction />}
        />
        <Route
          path={`/:appId/:blockchain(aptos)/user-signature/:signatureId?`}
          render={() => <Aptos.Signing />}
        />
        <Route
          path={`/:appId/:blockchain/sdk`}
          render={() => <AppSDKFallback />}
        />
      </Switch>
    </Suspense>
  );
};

export default App;
