import Layout from "components/Layout";
import Loading from "components/Loading";
import React, { Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { logPageView } from "services/Amplitude";
import { sendPageView } from "services/GoogleAnalytics";
import { EVM_CHAINS } from "utils/constants";

const Authenticate = React.lazy(() => import("features/Authenticate"));
const EVM = {
  Transaction: React.lazy(() => import("features/EVM/Transaction")),
  Signing: React.lazy(() => import("features/EVM/Signing"))
};

const supportedEVMChains = EVM_CHAINS.join("|");

const App = () => {
  const location = useLocation();

  useEffect(() => {
    sendPageView(location.pathname);
    logPageView({ pathname: location.pathname });
  }, [location]);

  return (
    <Layout>
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
            path={`/:appId/:blockchain(${supportedEVMChains})/user-signature`}
            render={() => <EVM.Signing />}
          />
        </Switch>
      </Suspense>
    </Layout>
  );
};

export default App;
