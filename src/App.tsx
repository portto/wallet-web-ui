import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logPageView } from "services/Amplitude";
import { sendPageView } from "services/GoogleAnalytics";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    sendPageView(location.pathname);
    logPageView({ pathname: location.pathname });
  }, [location]);

  return <Box>Hello world</Box>;
};

export default App;
