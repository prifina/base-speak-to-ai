"use client";
import { SimpleGrid, Wrap, WrapItem } from "@chakra-ui/react";

import SubscriptionPlanCard from "@/components/StripeSubscriptionPlanCard2";
import {
  formatCurrencyFromMinorUnit,
  formatSubscriptionPlanTitle,
} from "@/utils";

const SubscriptionPlansContainer = ({
  state,
  isMobile,
  stripeUpdate,
  onSubscribe,
  isProcessing = false,
  openCustomerPortal,
}) => {
  /*
  const showAllPlans =
    !state.subscribed ||
    state.subscribed === "" ||
    (state.subscription?.status === "canceled" &&
      state.subscription.currentPeriodEnd * 1000 < Date.now());

  console.log({
    periodEndDate: state.subscription.currentPeriodEnd * 1000,
    now: Date.now(),
  });
*/
  const showAllPlans =
    !state.subscribed ||
    state.subscribed === "" ||
    ["Free", "Terminated"].indexOf(state.kbStatus.status) > -1;

  // Defensive array filtering
  const planDetails = showAllPlans
    ? (state.planDetails || []).filter(Boolean)
    : [
        (state.planDetails || []).find(
          (a) =>
            a.prices &&
            a.prices.some((price) => price.priceId === state.subscribed)
        ),
      ].filter(Boolean);

  const renderPlanCard = (obj, index) => {
    const price0 = obj?.prices?.[0];
    if (!price0) return null; // Skip plans with no price
    return (
      <SubscriptionPlanCard
        key={`card-${index}`}
        price={formatCurrencyFromMinorUnit(price0.unitAmount || 0)}
        isMobile={isMobile}
        title={formatSubscriptionPlanTitle(obj)}
        list={obj.marketingFeatures}
        interval={price0.recurring}
        active={!showAllPlans}
        planIdx={index}
        disabled={isProcessing || stripeUpdate}
        onClick={showAllPlans ? onSubscribe : () => openCustomerPortal()}
      />
    );
  };

  if (isMobile) {
    return (
      <SimpleGrid
        maxW={`${350 * state.planDetails.length}px`}
        gap={"10px"}
        minChildWidth={"100px"}
      >
        {planDetails.map(renderPlanCard)}
      </SimpleGrid>
    );
  } else {
    return (
      <Wrap spacing="30px">
        {planDetails.map((obj, index) => (
          <WrapItem key={`Plan_${index}`}>
            {renderPlanCard(obj, index)}
          </WrapItem>
        ))}
      </Wrap>
    );
  }
};

export default SubscriptionPlansContainer;
