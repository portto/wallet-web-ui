import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { ReactComponent as ArrowBack } from "src/assets/images/icons/arrow-back.svg";
import { ReactComponent as ArrowNext } from "src/assets/images/icons/arrow-next.svg";

export const FieldLine = () => (
  <Box w="100%" h="0.5px" bg="background.tertiary" />
);

const Field = ({
  title,
  children = null,
  icon = null,
  hidableInfo = "",
}: {
  title: string;
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
    <Flex py="16px" alignItems="center">
      <Box>
        <Flex alignItems="center" mb="6px">
          <Text color="font.secondary" mr="6px" fontSize="size.body.3">
            {title}
          </Text>

          {icon && <span>{icon}</span>}
        </Flex>

        <Text color="font.primary" fontSize="size.body.3">
          {children}
        </Text>
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
            left={showHidableInfo ? "0" : "100%"}
            bg="white"
            overflowY="scroll"
          >
            <Box padding="16px 20px">
              <ArrowBack
                width="20px"
                height="20px"
                cursor="pointer"
                onClick={onCloseHidableInfo}
              />
            </Box>

            <Box padding="16px 20px">{hidableInfo}</Box>
          </Box>
        </>
      )}
    </Flex>
  );
};
export default Field;
