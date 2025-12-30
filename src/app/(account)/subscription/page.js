"use client";

import { useContext, useEffect, useRef, useReducer } from "react";
import { Box, Text, Flex, VStack } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useMediaQuery } from "@/lib/useMediaQuery";
import SubscriptionPlansContainer from "@/components/SubscriptionPlansContainer";

export default function SubscriptionPage() {
  const { loaded: authLoaded } = useContext(AuthContext);
  const effectCalled = useRef(false);
  const authFetch = useAuthFetch();
  const [isMobile] = useMediaQuery("(max-width: 992px)");
  const { activeGroup, knowledgebaseId } = useStore(
    useShallow((state) => ({
      activeGroup: state.activeGroup,
      knowledgebaseId: state.knowledgebaseId,
    }))
  );
  const billingModalEventTypes = {
    NONE: 0,
    SUCCESS: 1,
    FAILURE: 2,
    CANCEL: 3,
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      networkConfig: null,
      subscription: null,
      userInfo: null,
      subscribed: "",
      planName: "",
      planDetails: [],
      paymentLinks: [],
      portalConfigurationId: "",
      networkId: "x_prifina",
      currentStatus: "",
      kbStatus: {},
      stripeUpdate: false,
      isProcessing: false,
    }
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const host = window.location.hostname;
        const env =
          host === "localhost" && !process.env.NEXT_PUBLIC_ENV
            ? "dev"
            : process.env.NEXT_PUBLIC_ENV || "dev";

        const networkId = activeGroup || "x_prifina";

        console.log("[SUBSCRIPTION] Active Group:", activeGroup);
        console.log("[SUBSCRIPTION] Network ID:", networkId);
        console.log("[SUBSCRIPTION] Environment:", env);
        console.log("[SUBSCRIPTION] Knowledgebase ID:", knowledgebaseId);
        //console.log("[SUBSCRIPTION] All cookies:", document.cookie);

        const [networkRes, subscriptionRes, userInfoRes] = await Promise.all([
          authFetch(
            `/api/get-network-config?networkId=${networkId}&env=${env}`
          ),
          knowledgebaseId
            ? authFetch(
                `/api/get-subscription?knowledgebaseId=${knowledgebaseId}`
              )
            : Promise.resolve(null),
          knowledgebaseId
            ? authFetch(
                `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}&opt=STATUS`
              )
            : Promise.resolve(null),
        ]);

        const networkData = await networkRes.json();
        const subscriptionData = subscriptionRes
          ? await subscriptionRes.json()
          : null;
        const userInfoData = userInfoRes ? await userInfoRes.json() : null;

        console.log(
          "[SUBSCRIPTION] Network Config:",
          networkData.networkConfig,
          networkData.plans
        );
        console.log(
          "[SUBSCRIPTION] Subscription:",
          subscriptionData?.subscription
        );
        console.log("[SUBSCRIPTION] User Info:", userInfoData);
        let subscribed = "";
        if (
          Array.isArray(networkData?.plans) &&
          networkData.plans[0].items.length > 0
        ) {
          for (const pp of networkData.plans[0].items) {
            if (
              subscriptionData?.subscription !== null &&
              Array.isArray(pp.prices) &&
              pp.prices.length > 0 &&
              pp.prices[0].priceId === subscriptionData?.subscription.plan
            ) {
              subscribed = pp.prices[0].priceId;
            }
          }
        }

        if (
          ["incomplete_expired", "past_due", "unpaid"].includes(
            subscriptionData?.subscription?.status
          )
        ) {
          //changeModalEvent(billingModalEventTypes.FAILURE);
        }

        setState({
          subscription: subscriptionData?.subscription || null,
          userInfo: userInfoData?.user || null,
          loading: false,
          subscribed,
          productName: networkData.plans[0].name,
          planDetails: networkData.plans[0].items, // one plan for now
          paymentLinks: networkData.networkConfig.paymentLinks,
          portalConfigurationId:
            networkData.networkConfig.portalConfigurationId,
          networkId,
          currentStatus: subscriptionData?.subscription?.status,
          kbStatus: {
            status: userInfoData.user?.status || "",
            trialEnds: userInfoData.user?.trialEnds,
            statusChanged: userInfoData.user?.statusChanged,
          },
        });
      } catch (error) {
        console.error("[SUBSCRIPTION] Failed to fetch data:", error);
        setState({ loading: false });
      }
    }

    if (!effectCalled.current && authLoaded) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authLoaded, activeGroup, knowledgebaseId, authFetch]);

  const onSubscribe = (e) => {
    const planIdx = parseInt(e.target.dataset.planidx);

    if (
      !state.planDetails ||
      !Array.isArray(state.planDetails) ||
      !state.planDetails[idx] ||
      !state.planDetails[idx].prices ||
      !state.planDetails[idx].prices[0] ||
      !state.portalConfigurationId
    ) {
      console.error("Unable to subscribe: Invalid plan selection or state.");
      return;
    }
    if (state.paymentLinks[planIdx]) {
      let paymentLink = `${state.paymentLinks[planidx].url}?client_reference_id=${cognitoId}_${site}&locale=${language}`;
      if (verifiedEmail !== "") {
        paymentLink += `&prefilled_email=${encodeURIComponent(verifiedEmail)}`;
      }
    }
  };

  const xonSubscribe = useCallback(
    async (e) => {
      if (isProcessing) return; // Early return if already processing!
      setIsProcessing(true); // <--- Set as soon as user clicks
      try {
        //const token = await getIDToken();
        //console.log(`${window.location.origin}${pathname}`);
        // Defensive check
        const idx = e.target.dataset.planidx;

        if (
          !state.planDetails ||
          !Array.isArray(state.planDetails) ||
          !state.planDetails[idx] ||
          !state.planDetails[idx].prices ||
          !state.planDetails[idx].prices[0] ||
          !state.portalConfigurationId
        ) {
          console.error(
            "Unable to subscribe: Invalid plan selection or state."
          );
          return;
        }

        if (state.paymentLinks[e.target.dataset.planidx]) {
          // https://buy.stripe.com/test_aFa00l1xbad56GW7xWgEg0b?prefilled_email=eee%40eee.com
          let paymentLink = `${
            state.paymentLinks[e.target.dataset.planidx].url
          }?client_reference_id=${cognitoId}_${site}&locale=${language}`;
          if (verifiedEmail !== "") {
            paymentLink += `&prefilled_email=${encodeURIComponent(
              verifiedEmail
            )}`;
          }
          // we may need to update the existing payment link to include the return url or try to include it in admin app...
          //paymentLink +="&after_completion[type]=redirect&after_completion[redirect][url]=${encodeURIComponent(window.location.origin + pathname?session_id={CHECKOUT_SESSION_ID})}`;"
          console.log("PAYMENT LINK ", paymentLink);

          openStripeLink(paymentLink);
        }
      } catch (err) {
        console.error("Subscription error", err);
      } finally {
        setIsProcessing(false); // <--- Always re-enable
      }
    },
    [
      state.planDetails,
      state.portalConfigurationId,
      state.paymentLinks,
      cognitoId,
      site,
      language,
      verifiedEmail,
      openStripeLink,
      isProcessing,
      // getIDToken
    ]
  );

  const openCustomerPortal = () => {
    if (state.paymentLinks?.customerPortal) {
      window.open(state.paymentLinks.customerPortal, "_blank");
    }
  };

  if (!authLoaded || state.loading) {
    return <Loading />;
  }

  return (
    <Flex flexDir="column" gap="40px" p="28px">
      <Box pl={{ base: "42px", md: "0" }}>
        <Text textStyle="pageTitle">Subscription plans for AI Twin</Text>
      </Box>
      <SubscriptionPlansContainer
        state={state}
        isMobile={isMobile}
        stripeUpdate={state.stripeUpdate}
        onSubscribe={onSubscribe}
        isProcessing={state.isProcessing}
        openCustomerPortal={openCustomerPortal}
      />
    </Flex>
  );
}
