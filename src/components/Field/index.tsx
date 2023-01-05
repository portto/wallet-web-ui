import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { ReactComponent as ArrowBack } from "src/assets/images/icons/arrow-back.svg";
import { ReactComponent as ArrowNext } from "src/assets/images/icons/arrow-next.svg";

export const FieldLine = () => <Box w="100%" h="0.5px" bg="border.tertiary" />;

const Field = ({
  title,
  children = null,
  icon = null,
  hidableInfo = "",
}: {
  title: string | ReactNode;
  hidableInfo?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
}) => {
  const [showHidableInfo, setShowHidableInfo] = useState(false);

  const onClickNext = () => {
    setShowHidableInfo(true);
  };

  const onCloseHidableInfo = () => setShowHidableInfo(false);

  return (
    <Flex py="space.m" alignItems="center">
      <Box>
        <Flex alignItems="center" mb="space.3xs">
          <Text color="font.secondary" mr="space.3xs" fontSize="size.body.3">
            {title}
          </Text>

          {icon && <span>{icon}</span>}
        </Flex>

        <Box color="font.primary" fontSize="size.body.3">
          {children}
        </Box>
      </Box>

      {hidableInfo && (
        <>
          <Box ml="auto">
            <ArrowNext
              width="16px"
              height="16px"
              cursor="pointer"
              onClick={onClickNext}
            />
          </Box>
          <Box
            pos="absolute"
            w="100%"
            top="0"
            right="0"
            bottom="0"
            zIndex={1}
            left={showHidableInfo ? "0" : "100%"}
            bg="white"
            overflowY="scroll"
          >
            <Box px="space.l" py="space.m">
              <ArrowBack
                width="20px"
                height="20px"
                cursor="pointer"
                onClick={onCloseHidableInfo}
              />
            </Box>

            <Box px="space.l" py="space.m">
              {hidableInfo}
            </Box>
          </Box>
        </>
      )}
    </Flex>
  );
};
export default Field;
