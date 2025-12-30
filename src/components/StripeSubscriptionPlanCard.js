"use client";
import {
  Button,
  Flex,
  Spacer,
  Text,
  List,
} from "@chakra-ui/react";

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
    <Flex
      // maxHeight={"400px"}
      width={isMobile ? "unset" : "300px"}
      backgroundColor={"#f8fcfc"}
      // backgroundColor={"#f8fcfc"}
      // height={"500px"}
      flexDirection={"column"}
      padding={"20px"}
      borderRadius={"20px"}
      border={active ? "3px solid rgba(13, 119, 110, 1)" : "1px solid #EAEBEB"}
      gap={"24px"}
    >
      <Text color={"#111111"} fontWeight={600} fontSize={"24px"}>
        {title}
      </Text>
      <Flex flexDirection={"column"} gap={"32px"}>
        {type !== "info" ? (
          <>
            <Flex alignContent={"center"} gap={"5px"}>
              <Text color={"#111111"} fontWeight={600} fontSize={"32px"}>
                {price[0]}
              </Text>
              <Text color={"#111111"} fontWeight={600} fontSize={"32px"}>
                {price.slice(1)}
              </Text>
              {interval && (
                <Text
                  color={"#767676"}
                  fontWeight={600}
                  alignSelf={"flex-end"}
                  fontSize={"20px"}
                  mb={"5px"}
                >
                  {/* This is not good way for localized strings */}
                  {"per"}
                  {interval.intervalCount > 1
                    ? interval.intervalCount + " "
                    : " "}
                  {interval.interval}
                </Text>
              )}
            </Flex>

            <List.Root spacing={"12px"} color={"#767676"}>
              {list.map((item, key) => {
                return <List.Item key={key}>{item}</List.Item>;
              })}
            </List.Root>
            <Spacer />
            {active === true ? (
              <Button
                onClick={onClick}
                mt={"auto"}
                backgroundColor={"#dbf0ee"}
                color={"#0d776e"}
              >
                Manage your subscription
              </Button>
            ) : (
              <Button
                mt={"auto"}
                backgroundColor={"#0d776e"}
                color={"white"}
                disabled={active || disabled}
                onClick={
                  active !== true && disabled !== true ? onClick : undefined
                }
                data-planidx={planIdx}
              >
                Subscribe
              </Button>
            )}
          </>
        ) : (
          <>
            <Text color={"#767676"}>{details}</Text>
            <Spacer />
            <Button
              color={"#0d776e"}
              borderColor={"#0d776e"}
              variant={"outline"}
            >
              Contact us
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default SubscriptionPlanCard;
