import { Flex, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import checkVerified from "src/assets/images/icons/check-verified.svg";
import Button from "src/components/Button";
import DownloadApp from "src/components/DownloadApp";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";

const TransactionSent = ({
  blockchain,
  onClose,
}: {
  blockchain: string;
  onClose: () => void;
}) => {
  const [isDownloadPageShown, setIsDownloadPageShown] = useState(false);

  const toggleDownloadPage = () => {
    setIsDownloadPageShown((prev) => !prev);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isNotInApp = !window[blockchain]?.isBlocto;
  return (
    <>
      <Header blockchain={blockchain} onClose={onClose} />

      <Flex
        flex="1"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        px="space.3xl"
        pt="space.5xl"
        pb="space.m"
      >
        <Flex flexDirection="column" alignItems="center" textAlign="center">
          <Image src={checkVerified} width="48px" height="48px" />
          <Text
            fontSize="size.heading.4"
            fontWeight="weight.l"
            lineHeight="line.height.subheading.1"
            mt="space.l"
            mb="space.s"
          >
            <FormattedMessage intlKey="feature.authz.done.title" />
          </Text>

          <Text fontSize="size.body.3">
            <FormattedMessage intlKey="feature.authz.done.description" />
          </Text>
        </Flex>

        <Flex width="100%" flexDirection="column">
          <Button mb={isNotInApp ? "space.xs" : ""} onClick={onClose}>
            <FormattedMessage intlKey="app.general.ok" />
          </Button>
          {isNotInApp && (
            <Button variant="secondary" onClick={toggleDownloadPage}>
              <FormattedMessage intlKey="app.general.downloadBloctoApp" />
            </Button>
          )}
        </Flex>
      </Flex>

      <DownloadApp
        isShown={isDownloadPageShown}
        blockchain={blockchain}
        onLastStepClick={toggleDownloadPage}
        actionKey="app.general.buyBloctoPoint"
        actionDescriptionKey="app.general.buyBloctoPoint.description"
      />
    </>
  );
};

export default TransactionSent;
