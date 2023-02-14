import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as CheckVerified } from "src/assets/images/icons/check-verified.svg";
import FormattedMessage from "src/components/FormattedMessage";

const VerifiedBadge = ({ children }: { children?: ReactNode }) => (
  <Flex
    padding="space.m"
    alignItems="center"
    bg="background.secondary"
    borderRadius="12px"
  >
    <CheckVerified />
    <Box ml="space.xs" fontSize="size.body.3">
      {children}
    </Box>
  </Flex>
);

const UnVerifiedBadge = ({ children }: { children?: ReactNode }) => (
  <Flex
    padding="space.m"
    alignItems="center"
    bg="background.alert"
    borderRadius="12px"
  >
    <CheckAlert />
    <Box ml="space.xs" fontSize="size.body.3">
      {children}
    </Box>
  </Flex>
);

const TransactionContent = ({
  children,
  verified,
  badgeText,
}: {
  children: ReactNode;
  verified?: boolean;
  badgeText?: string | ReactNode;
}) => {
  const getBadge = () => {
    if (!badgeText) {
      return verified ? (
        <VerifiedBadge>
          <FormattedMessage intlKey="app.authz.operationVerified" />
        </VerifiedBadge>
      ) : (
        <UnVerifiedBadge>
          <FormattedMessage intlKey="app.authz.operationNotVerified" />
        </UnVerifiedBadge>
      );
    }

    return verified ? (
      <VerifiedBadge>{badgeText}</VerifiedBadge>
    ) : (
      <UnVerifiedBadge>{badgeText}</UnVerifiedBadge>
    );
  };

  return (
    <>
      <Heading
        as="h3"
        fontSize="size.heading.3"
        fontWeight="weight.l"
        mb="space.m"
      >
        <FormattedMessage intlKey="app.authz.operation" />
      </Heading>
      {getBadge()}
      <Box mt="space.xl" wordBreak="break-all" fontSize="size.body.3">
        {children}
      </Box>
    </>
  );
};
export default TransactionContent;
