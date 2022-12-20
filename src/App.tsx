import Layout from "components/Layout";
import Loading from "components/Loading";
import React, { Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { logPageView } from "services/Amplitude";
import { sendPageView } from "services/GoogleAnalytics";

const Authenticate = React.lazy(() => import("features/Authenticate"));
const EVM = {
  Transaction: React.lazy(() => import("features/EVM/Transaction"))
};

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
            path="/authn/:appId?/:userEmail?"
            render={() => <Authenticate />}
          />
          <Route
            path="/:appId/authz/:blockchain(ethereum|bsc|polygon|avalanche)/:authorizationId?"
            render={() => <EVM.Transaction />}
          />
        </Switch>
      </Suspense>
    </Layout>
  );
};

export default App;
