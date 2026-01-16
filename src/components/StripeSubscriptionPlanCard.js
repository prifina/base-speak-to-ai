"use client";
import {
  Button,
  Flex,
  Spacer,
  Text,
  List,
  Box,
} from "@chakra-ui/react";
import { UI_TEXT } from "../lib/uiStrings";

const SubscriptionPlanCard = ({
  price = "$0",
  title,
  interval,
  list,
  type,
  active = undefined,
  details,
  planIdx,
  onClick,
  isMobile,
  disabled,
}) => {
  return (
    <Box
      w={isMobile ? "full" : "300px"}
      bg="gray.50"
      p={5}
      borderRadius="xl"
      border={active ? "3px solid" : "1px solid"}
      borderColor={active ? "teal.600" : "gray.200"}
      display="flex"
      flexDirection="column"
      gap={6}
    >
      <Text color="gray.900" fontWeight="semibold" fontSize="2xl">
        {title}
      </Text>
      <Flex flexDirection="column" gap={8}>
        {type !== "info" ? (
          <>
            <Flex alignItems="baseline" gap={1}>
              <Text color="gray.900" fontWeight="semibold" fontSize="3xl">
                {price[0]}
              </Text>
              <Text color="gray.900" fontWeight="semibold" fontSize="3xl">
                {price.slice(1)}
              </Text>
              {interval && (
                <Text
                  color="gray.500"
                  fontWeight="medium"
                  fontSize="xl"
                  ml={1}
                >
                  {UI_TEXT.subscription.per || "per"}
                  {interval.intervalCount > 1
                    ? ` ${interval.intervalCount} `
                    : " "}
                  {interval.interval}
                </Text>
              )}
            </Flex>

            <List.Root spacing={3} color="gray.500">
              {list.map((item, key) => {
                return <List.Item key={key}>{item}</List.Item>;
              })}
            </List.Root>
            <Spacer />
            {active === true ? (
              <Button
                onClick={onClick}
                mt="auto"
                variant="outline"
                colorPalette="teal"
              >
                {UI_TEXT.subscription.manageButton || "Manage your subscription"}
              </Button>
            ) : (
              <Button
                mt="auto"
                variant="solid"
                colorPalette="teal"
                disabled={active || disabled}
                onClick={
                  active !== true && disabled !== true ? onClick : undefined
                }
                data-planidx={planIdx}
              >
                {UI_TEXT.subscription.subscribeButton || "Subscribe"}
              </Button>
            )}
          </>
        ) : (
          <>
            <Text color="gray.500">{details}</Text>
            <Spacer />
            <Button
              variant="outline"
              colorPalette="teal"
            >
              {UI_TEXT.subscription.contactButton || "Contact us"}
            </Button>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default SubscriptionPlanCard;