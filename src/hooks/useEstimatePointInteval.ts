import { estimatePoint } from "src/apis";
import useInterval from "src/hooks/useInterval";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains } from "src/types";

interface EstimatePointParams {
  rawObject: object;
  blockchain: Chains;
  sessionId: string;
}

export default function useEstimatePointInterval(
  { rawObject, blockchain, sessionId }: EstimatePointParams,
  delay = 100000
) {
  const { send } = useTransactionMachine();

  useInterval(() => {
    estimatePoint({ rawObject, sessionId, blockchain }).then(
      ({ cost, discount, error_code, chain_error_msg }) => {
        send({
          type: "updateTransaction",
          data: {
            fee: cost,
            discount,
            mayFail: !!error_code,
            failReason: chain_error_msg || error_code,
          },
        });
      }
    );
  }, delay);
}