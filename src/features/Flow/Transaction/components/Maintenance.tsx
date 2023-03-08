import MaintenanceComponent from "src/components/Maintenance";
import { useTransactionMachine } from "src/machines/transaction";

const Maintenance = () => {
  const { send } = useTransactionMachine();
  return <MaintenanceComponent onClose={() => send("close")} />;
};

export default Maintenance;
