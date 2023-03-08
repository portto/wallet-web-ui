import { useCallback, useEffect, useState } from "react";
import { estimatePoint } from "src/apis";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains } from "src/types";

interface EstimatePointParams {
  rawObject: object;
  blockchain: Chains;
}

export default function useEstimatePoint({
  rawObject,
  blockchain,
}: EstimatePointParams) {
  const { send } = useTransactionMachine();
  const [hasEstimated, setHasEstimated] = useState(false);
  const estimate = useCallback(() => {
    estimatePoint({ rawObject, blockchain }).then(
      ({
        cost = "0",
        discount = "0",
        error_code,
        chain_error_msg,
        options,
      }) => {
        setHasEstimated(true);
        send({
          type: "updateTransaction",
          data: {
            fee: parseFloat(cost),
            discount: parseFloat(discount),
            mayFail: !!error_code,
            failReason: chain_error_msg || error_code,
            txFeeOptions: options,
          },
        });
      }
    );
  }, [blockchain, rawObject, send]);

  useEffect(() => {
    estimate();
  }, [estimate]);

  return [hasEstimated];
}
