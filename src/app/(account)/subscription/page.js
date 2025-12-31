"use client";

import {
  useContext,
  useEffect,
  useRef,
  useReducer,
  useCallback,
  useState,
} from "react";
import { Box, Text, Flex, VStack, useDisclosure } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useWebSocket } from "@/hooks/useWebSocket";
import SubscriptionPlansContainer from "@/components/SubscriptionPlansContainer";
import BillingInformation from "@/components/BillingInformation";

export default function SubscriptionPage() {
  const { loaded: authLoaded } = useContext(AuthContext);
  const effectCalled = useRef(false);
  const authFetch = useAuthFetch();
  const [isMobile] = useMediaQuery("(max-width: 992px)");
  const {
    activeGroup,
    knowledgebaseId,
    cognitoId,
    language,
    verifiedEmail,
    env,
    setSocketUpdate,
  } = useStore(
    useShallow((state) => ({
      activeGroup: state.activeGroup,
      knowledgebaseId: state.knowledgebaseId,
      cognitoId: state.cognitoId,
      language: state.language,
      verifiedEmail: state.verifiedEmail,
      env: state.env,
      setSocketUpdate: state.setSocketUpdate,
    }))
  );
  const billingModalEventTypes = {
    NONE: 0,
    SUCCESS: 1,
    FAILURE: 2,
    CANCEL: 3,
  };
  const paymentWinRef = useRef();
  const customerPortalRef = useRef();
  const [connectionId, setConnectionId] = useState(null);

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

  const {
    isOpen: isSubscriptionEventModalOpen,
    onClose: onSubscriptionEventModalClose,
    onOpen: onSubscriptionEventModalOpen,
  } = useDisclosure();

  const changeModalEvent = useCallback(
    (eventType) => {
      setModalEvent(eventType);
      onSubscriptionEventModalOpen();
    },
    [onSubscriptionEventModalOpen]
  );

  const handleSocketUpdate = useCallback(
    (socketStatus) => {
      console.log("STRIPE SOCKET STATUS ", socketStatus);
      effectCalled.current = false;
      setStripeUpdate(true);
      // pure side-effect: no subscriptions, no timeouts, etc.
      switch (socketStatus.status) {
        case "CANCELLED":
          changeModalEvent(billingModalEventTypes.CANCEL);
          break;
        case "FAIL":
          changeModalEvent(billingModalEventTypes.FAILURE);
          break;
        case "PROCESS":
        case "UPDATE":
          changeModalEvent(billingModalEventTypes.SUCCESS);
          break;
        default:
          break;
      }
    },
    [changeModalEvent, billingModalEventTypes]
    /*
    (msg) => {
      console.log("[SUBSCRIPTION WEBSOCKET] Message received:", msg);
      
      if (msg.event === "NOTIFY" && msg.status === "SUBSCRIPTION-UPDATE") {
        console.log("[SUBSCRIPTION WEBSOCKET] Subscription updated, refreshing data...");
        setState({ stripeUpdate: true });
      }
    },
    []
    */
  );

  useWebSocket({
    site: knowledgebaseId,
    enabled: !!knowledgebaseId,
    setConnectionId,
    onSocketUpdate: handleSocketUpdate,
  });

  useEffect(() => {
    async function fetchData() {
      try {
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
        /* 
        {
    "subscriptionId": "sub_1Sk3Z4Q7ZJ2BotyW7YesnmMY",
    "cognitoId": "4cd55fd1-4831-4d90-a4e3-4f77d4fcb59d",
    "currentPeriodEnd": 1798639580,
    "currentPeriodStart": 1767103580,
    "customerId": "cus_ThST76vomHGUvx",
    "knowledgebaseId": "0466833b-b476-4c2a-959e-9c62ef469035",
    "paymentStatus": "paid",
    "plan": "price_1ROGKzQ7ZJ2BotyWRwqAJkNK",
    "productId": "prod_SIs5LiXY47C4OC",
    "stage": "dev",
    "status": "active",
    "updated": "2025-12-30T14:06:24.596Z"
} */
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
  }, [authLoaded, activeGroup, knowledgebaseId, env, authFetch]);

  useEffect(() => {
    return () => {
      if (paymentWinRef.current && !paymentWinRef.current.closed) {
        paymentWinRef.current.close();
      }
      if (customerPortalRef.current && !customerPortalRef.current.closed) {
        customerPortalRef.current.close();
      }
    };
  }, []);

  const openStripeLink = useCallback((url) => {
    const existing = paymentWinRef.current;
    if (existing && !existing.closed) {
      // window already open → just load the new URL and bring it forward
      existing.location.href = url; // same origin (stripe.com), so assignment is allowed
      existing.focus();
    } else {
      // open a fresh one and remember the handle
      paymentWinRef.current = window.open(
        url,
        "stripeCustomerPayment",
        "popup"
      );
    }
  }, []);

  const onSubscribe = (e) => {
    const planIdx = parseInt(e.target.dataset.planidx);
    console.log("PLAN IDX", planIdx);
    if (
      !state.planDetails ||
      !Array.isArray(state.planDetails) ||
      !state.planDetails[planIdx] ||
      !state.planDetails[planIdx].prices ||
      !state.planDetails[planIdx].prices[0] ||
      !state.portalConfigurationId
    ) {
      console.error("Unable to subscribe: Invalid plan selection or state.");
      return;
    }
    if (state.paymentLinks[planIdx]) {
      let paymentLink = `${state.paymentLinks[planIdx].url}?client_reference_id=${cognitoId}_${knowledgebaseId}&locale=${language}`;
      if (verifiedEmail !== "") {
        paymentLink += `&prefilled_email=${encodeURIComponent(verifiedEmail)}`;
      }
      openStripeLink(paymentLink);
    }
  };

  const openCustomerPortal = useCallback(
    async (additionalRoute = "") => {
      try {
        console.log("OPEN CUSTOMER PORTAL ", state.portalConfigurationId);
        if (!state.portalConfigurationId || !state.subscription?.customerId) {
          return;
        }
        if (customerPortalRef.current && !customerPortalRef.current.closed) {
          customerPortalRef.current.focus();
          return;
        }

        const portalRes = await authFetch(`/api/get-portal-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: state.subscription.customerId,
            env,
            configurationId: state.portalConfigurationId,
          }),
        });
        const portalData = await portalRes.json();

        if (portalData && portalData.url) {
          customerPortalRef.current = window.open(
            `${portalData.url}${additionalRoute ? `/${additionalRoute}` : ""}`,
            "stripeCustomerPortal",
            "popup"
          );
        }
      } catch (err) {
        console.error("Stripe portal error", err);
      }
    },
    [state.portalConfigurationId, state.subscription, authFetch, env]
  );

  /* 
  const openCustomerPortal = () => {
    if (state.paymentLinks?.customerPortal) {
      window.open(state.paymentLinks.customerPortal, "_blank");
    }
  }; */

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
      {((state.subscribed && state.subscribed !== "") ||
        state.kbStatus.status !== "Free") &&
        state.kbStatus.status !== "" && (
          <BillingInformation
            isMobile={isMobile}
            state={state}
            openCustomerPortal={openCustomerPortal}
          />
        )}
    </Flex>
  );
}
