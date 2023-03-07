import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactComponent as ArrowNext } from "src/assets/images/icons/arrow-next.svg";
import { FieldContext } from "src/context/field";
import InnerPage from "./InnerPage";

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
  const { blockchain } = useParams<{ blockchain: string }>();

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
            <InnerPage
              isShown={showHidableInfo}
              blockchain={blockchain}
              onLastStepClick={closeHidableInfo}
              scrollable
            >
              <Box px="space.l" py="space.m">
                {hidableInfo}
              </Box>
            </InnerPage>
          </>
        )}
      </Flex>
    </FieldContext.Provider>
  );
};
export default Field;
