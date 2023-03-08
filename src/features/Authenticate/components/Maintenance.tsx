import MaintenanceComponent from "src/components/Maintenance";
import { useAuthenticateMachine } from "src/machines/authenticate";

const Maintenance = () => {
  const { send } = useAuthenticateMachine();
  return <MaintenanceComponent onClose={() => send("close")} />;
};

export default Maintenance;
