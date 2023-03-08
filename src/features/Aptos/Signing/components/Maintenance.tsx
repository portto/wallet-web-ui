import MaintenanceComponent from "src/components/Maintenance";
import { useSigningMachine } from "src/machines/signing";

const Maintenance = () => {
  const { send } = useSigningMachine();
  return <MaintenanceComponent onClose={() => send("close")} />;
};

export default Maintenance;
