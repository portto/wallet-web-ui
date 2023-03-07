import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { ReactComponent as ArrowBack } from "src/assets/images/icons/arrow-back.svg";
import { ReactComponent as ArrowNext } from "src/assets/images/icons/arrow-next.svg";
import { FieldContext } from "src/context/field";

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

  const openHidableInfo = () => {
    setShowHidableInfo(true);
  };

  const closeHidableInfo = () => setShowHidableInfo(false);

  return (
    <FieldContext.Provider value={{ openHidableInfo, closeHidableInfo }}>
      <Flex py="space.m" alignItems="center">
        <Box maxWidth="100%">
          <Flex alignItems="center" mb="space.3xs">
            <Text color="font.secondary" mr="space.3xs" fontSize="size.body.3">
              {title}
            </Text>

            {icon && <span>{icon}</span>}
          </Flex>

          <Box
            color="font.primary"
            fontSize="size.body.3"
            whiteSpace="pre-wrap"
          >
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
                onClick={openHidableInfo}
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
                  onClick={closeHidableInfo}
                />
              </Box>

              <Box px="space.l" py="space.m">
                {hidableInfo}
              </Box>
            </Box>
          </>
        )}
      </Flex>
    </FieldContext.Provider>
  );
};
export default Field;
