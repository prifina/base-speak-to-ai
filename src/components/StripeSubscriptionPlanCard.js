"use client";
import {
  Button,
  Flex,
  ListItem,
  Spacer,
  Text,
  UnorderedList,
} from "@chakra-ui/react";

/**
 * Subscription Plan Card component.
 *
 * @param {object} props - Subscription Plan Card properties.
 * @param {number} [props.price=0] - The price of the Subscription Plan. The default is 0.
 * @param {string} [props.title] - The title of the Subscription Plan.
 * @param {string} [props.interval] - The interval of the payment of the Subscription Plan.
 * @param {[string]} [props.list] - The list of features to the Subscription Plan.
 * @param {'info' | undefined} [props.type] - Type of Card.
 * @param {boolean} [props.active=false] - Whether the Subscription Plan is active. The default is false.
 * @param {string} [props.details] - Additional Details.
 * @returns {JSX.Element} The rendered Subscription Plan Card component.
 */
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

            <UnorderedList spacing={"12px"} color={"#767676"}>
              {list.map((item, key) => {
                return <ListItem key={key}>{item}</ListItem>;
              })}
            </UnorderedList>
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
                isDisabled={active || disabled}
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
