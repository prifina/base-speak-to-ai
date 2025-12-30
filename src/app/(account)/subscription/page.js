"use client";

import { useContext, useEffect, useRef, useReducer } from "react";
import { Box, Text, Flex, VStack } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";

export default function SubscriptionPage() {
  const { loaded: authLoaded } = useContext(AuthContext);
  const effectCalled = useRef(false);
  const { activeGroup, knowledgebaseId } = useStore(
    useShallow((state) => ({
      activeGroup: state.activeGroup,
      knowledgebaseId: state.knowledgebaseId,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      networkConfig: null,
      subscription: null,
      userInfo: null,
    }
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const host = window.location.hostname;
        const env = host === "localhost" && !process.env.NEXT_PUBLIC_ENV 
          ? "dev" 
          : process.env.NEXT_PUBLIC_ENV || "dev";
        
        const networkId = activeGroup || "x_prifina";
        
        console.log("Active Group:", activeGroup);
        console.log("Network ID:", networkId);
        console.log("Environment:", env);
        console.log("Knowledgebase ID:", knowledgebaseId);

        const [networkRes, subscriptionRes, userInfoRes] = await Promise.all([
          fetch(`/api/get-network-config?networkId=${networkId}&env=${env}`),
          knowledgebaseId ? fetch(`/api/get-subscription?knowledgebaseId=${knowledgebaseId}`) : Promise.resolve(null),
          knowledgebaseId ? fetch(`/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}&opt=STATUS`) : Promise.resolve(null),
        ]);

        const networkData = await networkRes.json();
        const subscriptionData = subscriptionRes ? await subscriptionRes.json() : null;
        const userInfoData = userInfoRes ? await userInfoRes.json() : null;
        
        console.log("Network Config:", networkData.networkConfig);
        console.log("Subscription:", subscriptionData?.subscription);
        console.log("User Info:", userInfoData);
        
        setState({ 
          networkConfig: networkData.networkConfig,
          subscription: subscriptionData?.subscription || null,
          userInfo: userInfoData?.user || null,
          loading: false 
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setState({ loading: false });
      }
    }

    if (!effectCalled.current && authLoaded) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authLoaded, activeGroup, knowledgebaseId]);

  if (!authLoaded || state.loading) {
    return <Loading />;
  }

  return (
    <Flex flexDir="column" gap="40px" p="28px">
      <Box pl={{ base: "42px", md: "0" }}>
        <Text textStyle="pageTitle">Subscription</Text>
      </Box>
      <VStack align="stretch" gap="6">
        <Text>Subscription details and management will be displayed here.</Text>
        {state.networkConfig && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              Network: {state.networkConfig.networkId}
            </Text>
          </Box>
        )}
        {state.subscription && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              Status: {state.subscription.status}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Plan: {state.subscription.plan}
            </Text>
          </Box>
        )}
        {state.userInfo && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              User Status: {state.userInfo.status}
            </Text>
            {state.userInfo.trialEnds && (
              <Text fontSize="sm" color="gray.600">
                Trial Ends: {state.userInfo.trialEnds}
              </Text>
            )}
            {state.userInfo.statusChanged && (
              <Text fontSize="sm" color="gray.600">
                Status Changed: {new Date(state.userInfo.statusChanged).toLocaleDateString()}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Flex>
  );
}
