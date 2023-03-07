import { Flex, Image, Link, Text } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { MouseEvent } from "react";
import appStore from "src/assets/images/icons/app-store.svg";
import googlePlay from "src/assets/images/icons/google-play.svg";
import logo from "src/assets/images/icons/logo-margin.svg";
import { MessageKey } from "src/messages";
import FormattedMessage from "./FormattedMessage";
import InnerPage from "./InnerPage";

const DownloadApp = ({
  isShown,
  blockchain,
  onLastStepClick,
  actionKey,
  actionDescriptionKey,
}: {
  isShown: boolean;
  blockchain: string;
  onLastStepClick: (event?: MouseEvent) => void;
  actionKey: MessageKey;
  actionDescriptionKey: MessageKey;
}) => {
  return (
    <InnerPage
      isShown={isShown}
      blockchain={blockchain}
      onLastStepClick={onLastStepClick}
      display="flex"
    >
      <Flex
        flex="1"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        px="space.3xl"
        pt="space.l"
        pb="space.m"
      >
        <Flex flexDirection="column" alignItems="center" textAlign="center">
          <QRCodeSVG
            value={"https://blocto.app.link/download"}
            size={175}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
            includeMargin={false}
            imageSettings={{
              src: logo,
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
          <Text
            fontSize="size.heading.4"
            fontWeight="weight.l"
            lineHeight="line.height.subheading.1"
            mt="space.3xl"
          >
            <FormattedMessage intlKey="app.general.downloadBloctoApp" />
          </Text>
          <Text
            fontSize="size.heading.4"
            fontWeight="weight.l"
            lineHeight="line.height.subheading.1"
            mb="space.s"
          >
            <FormattedMessage intlKey={actionKey} />
          </Text>

          <Text fontSize="size.body.3" color="font.secondary">
            <FormattedMessage intlKey={actionDescriptionKey} />
          </Text>
        </Flex>

        <Flex width="260px" justifyContent="space-between">
          <Link
            href="https://apps.apple.com/app/blocto/id1481181682"
            isExternal
          >
            <Image src={appStore} />
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.portto.blocto"
            isExternal
          >
            <Image src={googlePlay} />
          </Link>
        </Flex>
      </Flex>
    </InnerPage>
  );
};

export default DownloadApp;
