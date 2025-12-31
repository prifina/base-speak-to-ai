"use client";
import { Flex, Text, Box } from "@chakra-ui/react";
import { LuExternalLink } from "react-icons/lu";

const BillingInformationItem = ({ title, value = "-", isMobile = false }) => {
  return (
    <Flex
      flexDirection={isMobile ? "column" : "row"}
      justifyContent={"space-between"}
    >
      <Text>{title}:</Text>
      <Text wordBreak={"break-all"}>{value}</Text>
    </Flex>
  );
};

const BillingInformation = ({ state, isMobile, openCustomerPortal }) => {
  const localDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <Flex
      border="1px solid"
      borderColor="gray.200"
      borderRadius="12px"
      p="24px"
      flexDirection="column"
      gap="32px"
    >
      <Text color="gray.900" fontWeight={600} fontSize="24px">
        Billing Information
      </Text>
      <Flex flexDirection="column" gap="24px">
        <BillingInformationItem
          title="Status"
          value={state.kbStatus.status}
          isMobile={isMobile}
        />

        {state.kbStatus.status === "Trial" && (
          <BillingInformationItem
            title="Trial Ends"
            value={localDateTime(state.kbStatus.trialEnds)}
            isMobile={isMobile}
          />
        )}

        {state.kbStatus.status === "Subscribed" && (
          <BillingInformationItem
            title="Next Billing Date"
            value={
              state.subscription?.currentPeriodEnd
                ? localDateTime(state.subscription.currentPeriodEnd)
                : "-"
            }
            isMobile={isMobile}
          />
        )}

        <Box height="2px" backgroundColor="gray.300" />
        {state.kbStatus.status === "Subscribed" && (
          <Flex
            color="teal.700"
            fontWeight={600}
            fontSize="16px"
            cursor={state.subscription?.customerId ? "pointer" : "default"}
            onClick={() => {
              if (
                typeof openCustomerPortal === "function" &&
                state.subscription?.customerId
              ) {
                openCustomerPortal();
              }
            }}
            _hover={{
              textDecoration:
                state.subscription?.customerId === undefined
                  ? "none"
                  : "underline",
            }}
            align="center"
            gap="2"
          >
            Manage in Stripe Portal <LuExternalLink />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default BillingInformation;
