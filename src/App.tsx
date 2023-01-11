import React, { Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import Layout from "src/components/Layout";
import Loading from "src/components/Loading";
import { logPageView } from "src/services/Amplitude";
import { sendPageView } from "src/services/GoogleAnalytics";
import { EVM_CHAINS } from "src/utils/constants";

const Authenticate = React.lazy(() => import("src/features/Authenticate"));
const EVM = {
  Transaction: React.lazy(() => import("src/features/EVM/Transaction")),
  Signing: React.lazy(() => import("src/features/EVM/Signing")),
};

const supportedEVMChains = EVM_CHAINS.join("|");

const App = () => {
  const location = useLocation();

  useEffect(() => {
    sendPageView(location.pathname);
    logPageView({ pathname: location.pathname });
  }, [location]);

  return (
    <Suspense
      fallback={
        <Layout>
          <Loading />
        </Layout>
      }
    >
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
          path={`/:appId/:blockchain(${supportedEVMChains})/user-signature`}
          render={() => <EVM.Signing />}
        />
      </Switch>
    </Suspense>
  );
};

export default App;
