import { useCallback, useState } from "react";
import { estimatePoint } from "src/apis";
import useInterval from "src/hooks/useInterval";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains } from "src/types";

interface EstimatePointParams {
  rawObject: object;
  blockchain: Chains;
}

export default function useEstimatePointInterval(
  { rawObject, blockchain }: EstimatePointParams,
  delay = 10000
) {
  const { send } = useTransactionMachine();
  const [hasEstimated, setHasEstimated] = useState(false);
  const estimate = useCallback(() => {
    estimatePoint({ rawObject, blockchain }).then(
      ({ cost, discount, error_code, chain_error_msg }) => {
        setHasEstimated(true);
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
  }, [blockchain, rawObject, send]);

  useInterval(estimate, delay);

  return [hasEstimated];
}
