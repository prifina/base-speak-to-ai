"use client";

import {
  useContext,
  useEffect,
  useRef,
  useReducer,
  useCallback,
  useState,
  useMemo,
} from "react";
import {
  Box,
  Text,
  Flex,
  VStack,
  useDisclosure,
  Button,
  Dialog,
  Spinner,
} from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useWebSocket } from "@/hooks/useWebSocket";
import { BiError } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";
import { MdInfoOutline } from "react-icons/md";
import { UI_TEXT } from "@/lib/uiStrings";
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
  const billingModalEventTypes = useMemo(
    () => ({
      NONE: 0,
      SUCCESS: 1,
      FAILURE: 2,
      CANCEL: 3,
    }),
    []
  );
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
      modalEvent: 0, // Use literal 0 instead of billingModalEventTypes.NONE
    }
  );

  const {
    isOpen: isSubscriptionEventModalOpen,
    onClose: onSubscriptionEventModalClose,
    onOpen: onSubscriptionEventModalOpen,
  } = useDisclosure();

  const changeModalEvent = useCallback(
    (eventType) => {
      console.log("[SUBSCRIPTION] changeModalEvent called with:", eventType);
      console.log("[SUBSCRIPTION] Current modal state:", state.modalEvent);
      console.log("[SUBSCRIPTION] Current modal open state:", isSubscriptionEventModalOpen);
      setState({ modalEvent: eventType });
      onSubscriptionEventModalOpen();
    },
    [onSubscriptionEventModalOpen, state.modalEvent, isSubscriptionEventModalOpen]
  );

  const setStripeUpdate = useCallback((value) => {
    setState({ stripeUpdate: value });
  }, []);

  const handleSocketUpdate = useCallback(
    (socketStatus) => {
      console.log("STRIPE SOCKET STATUS ", socketStatus);

      // Handle STRIPE events
      if (socketStatus.event === "STRIPE") {
        console.log("[SUBSCRIPTION] Processing STRIPE event with status:", socketStatus.status);
        setStripeUpdate(true);

        switch (socketStatus.status) {
          case "CANCELLED":
          case "LAMBDA_PROCESSED":
            console.log("[SUBSCRIPTION] Triggering CANCEL modal");
            changeModalEvent(billingModalEventTypes.CANCEL);
            // Delay fetchData to allow modal to show first
            setTimeout(() => {
              effectCalled.current = false;
            }, 100);
            break;
          case "FAIL":
            console.log("[SUBSCRIPTION] Triggering FAILURE modal");
            changeModalEvent(billingModalEventTypes.FAILURE);
            setTimeout(() => {
              effectCalled.current = false;
            }, 100);
            break;
          case "PROCESS":
          case "UPDATE":
            console.log("[SUBSCRIPTION] Triggering SUCCESS modal");
            changeModalEvent(billingModalEventTypes.SUCCESS);
            setTimeout(() => {
              effectCalled.current = false;
            }, 100);
            break;
          default:
            console.log("[SUBSCRIPTION] Unknown status:", socketStatus.status);
            break;
        }
      }
    },
    [changeModalEvent, billingModalEventTypes, setStripeUpdate]
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
          stripeUpdate: false,
          isProcessing: false,
        });
      } catch (error) {
        console.error("[SUBSCRIPTION] Failed to fetch data:", error);
        setState({ loading: false, stripeUpdate: false, isProcessing: false });
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

  const formatPlanTitle = useCallback((plan) => {
    return plan?.name || UI_TEXT.subscription.defaultPlan;
  }, []);

  const BillingStatusModal = () => {
    const currentPlan = (state.planDetails || []).find(
      (obj) => obj.prices?.[0]?.priceId === state.subscribed
    );

    const ModalText = ({ title, subtitle }) => (
      <Flex flexDirection="column" gap="24px">
        <Text fontSize="24px" fontWeight={600} textAlign="center">
          {title}
        </Text>
        <Text textAlign="center">{subtitle}</Text>
      </Flex>
    );

    return (
      <Dialog.Root
        open={isSubscriptionEventModalOpen}
        onOpenChange={onSubscriptionEventModalClose}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Flex
              backgroundColor="#f6f9f9"
              justifyContent="center"
              height="100%"
              alignItems="center"
            >
              <Flex
                maxWidth="508px"
                padding="40px 24px"
                backgroundColor="rgba(248, 252, 252, 1)"
                flexDirection="column"
                alignItems="center"
                gap="40px"
                borderRadius="12px"
              >
                {state.modalEvent === billingModalEventTypes.SUCCESS && (
                  <>
                    <FiCheckCircle color="rgba(0, 132, 122, 1)" size="80px" />
                    {state.stripeUpdate ? (
                      <Spinner size="xl" />
                    ) : (
                      <>
                        <ModalText
                          title={UI_TEXT.subscription.modal.success.title}
                          subtitle={UI_TEXT.subscription.modal.success.subtitle
                            .replace("{planName}", formatPlanTitle(currentPlan))
                            .replace("{date}", state.subscription?.currentPeriodEnd
                              ? new Date(state.subscription.currentPeriodEnd * 1000).toLocaleDateString()
                              : "-")}
                        />
                        <Button
                          color="white"
                          backgroundColor="rgba(13, 119, 110, 1)"
                          width="100%"
                          onClick={onSubscriptionEventModalClose}
                        >
                          {UI_TEXT.subscription.modal.success.button}
                        </Button>
                      </>
                    )}
                  </>
                )}
                {state.modalEvent === billingModalEventTypes.FAILURE && (
                  <>
                    <BiError color="rgba(231, 29, 29, 1)" size="80px" />
                    {state.stripeUpdate ? (
                      <Spinner size="xl" />
                    ) : (
                      <>
                        <ModalText
                          title={UI_TEXT.subscription.modal.failure.title}
                          subtitle={UI_TEXT.subscription.modal.failure.subtitle}
                        />
                        <Button
                          color="white"
                          backgroundColor="rgba(13, 119, 110, 1)"
                          width="100%"
                          onClick={() => openCustomerPortal()}
                        >
                          {UI_TEXT.subscription.modal.failure.button}
                        </Button>
                      </>
                    )}
                  </>
                )}
                {state.modalEvent === billingModalEventTypes.CANCEL && (
                  <>
                    <MdInfoOutline color="rgba(102, 107, 106, 1)" size="80px" />
                    {state.stripeUpdate ? (
                      <Spinner size="xl" />
                    ) : (
                      <>
                        <ModalText
                          title={UI_TEXT.subscription.modal.cancel.title}
                          subtitle={UI_TEXT.subscription.modal.cancel.subtitle
                            .replace("{date}", state.subscription?.currentPeriodEnd
                              ? new Date(state.subscription.currentPeriodEnd * 1000).toLocaleDateString()
                              : "-")}
                        />
                        <Button
                          color="white"
                          backgroundColor="rgba(13, 119, 110, 1)"
                          width="100%"
                          onClick={onSubscriptionEventModalClose}
                        >
                          {UI_TEXT.subscription.modal.cancel.button}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  };

  if (!authLoaded || state.loading) {
    return <Loading />;
  }

  return (
    <>
      <Flex flexDir="column" gap="40px" p="28px">
        <Box pl={{ base: "42px", md: "0" }}>
          <Text textStyle="pageTitle">{UI_TEXT.subscription.sectionTitle}</Text>
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
      <BillingStatusModal />
    </>
  );
}
