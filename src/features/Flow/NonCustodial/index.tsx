import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateNonCustodial } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { onTransactionDecline } from "src/services/Frame";
import { KEY_SESSION_ID, getItem } from "src/services/LocalStorage";
import { Chains } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const NonCustodial = () => {
  const {
    authorizationId,
    blockchain = Chains.flow,
    appId,
  } = useParams<{
    authorizationId?: string;
    blockchain?: Chains;
    appId?: string;
  }>();
  const [dAppInfo, setdAppInfo] = useState<{ url?: string }>({ url: "" });

  useEffect(() => {
    fetchDappInfo({ id: appId }).then((data) => {
      setdAppInfo(data);
    });
  }, [appId]);

  const handleClose = useCallback(() => {
    const { url = "" } = dAppInfo;
    if (authorizationId) {
      updateNonCustodial({ authorizationId }).then(() => {
        onTransactionDecline({
          blockchain,
          l6n: url,
          errorMessage: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR,
        });
      });
    }
  }, [authorizationId, blockchain, dAppInfo]);

  return (
    <Box position="relative">
      <Header blockchain={blockchain} onClose={handleClose} />
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center">
            <LoadingLogo mb="space.s" />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
            >
              <FormattedMessage intlKey="feature.authz.nonCustodial.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.authz.nonCustodial.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default NonCustodial;
