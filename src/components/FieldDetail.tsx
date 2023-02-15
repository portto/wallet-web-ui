import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as CheckVerified } from "src/assets/images/icons/check-verified.svg";
import FormattedMessage from "src/components/FormattedMessage";

export enum BadgeType {
  Verified,
  Unverified,
}

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

const FieldDetail = ({
  children,
  badgeText,
  badgeType,
  warningText,
}: {
  children: ReactNode;
  badgeText?: string | ReactNode;
  badgeType: BadgeType;
  warningText?: string | ReactNode;
}) => {
  const getBadge = () => {
    return badgeType === BadgeType.Verified ? (
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
      <Box mt="space.m" color="font.alert">
        {warningText}
      </Box>
      <Box mt="space.xl" wordBreak="break-all" fontSize="size.body.3">
        {children}
      </Box>
    </>
  );
};
export default FieldDetail;
