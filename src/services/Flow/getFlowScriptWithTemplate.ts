import { FlowTransaction } from "../../types";
// use flow transaction object to generate script info.
export default function getFlowScriptWithTemplate(
  transaction: FlowTransaction
) {
  const interaction = transaction && transaction.interaction;
  const message = (interaction && interaction.message) || {};
  const params = message.params || [];
  const args = message.arguments || [""];

  const argsString = args
    .map((arg) => `${interaction.arguments[arg].value}`)
    .join(", ");
  const paramsString = params
    .map(
      (param) =>
        `  ${interaction.params[param].key}: ${interaction.params[param].value}`
    )
    .join(",\n");
  const script = message.cadence || "";

  return {
    arguments: `- Arguments: [${argsString}]\n\n`,
    params: `- Params: {\n${paramsString}\n}\n\n`,
    script,
  };
}
