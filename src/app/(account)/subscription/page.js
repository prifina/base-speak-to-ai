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
  const { activeGroup } = useStore(
    useShallow((state) => ({
      activeGroup: state.activeGroup,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      networkConfig: null,
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

        const res = await fetch(`/api/get-network-config?networkId=${networkId}&env=${env}`);
        const data = await res.json();
        
        setState({ 
          networkConfig: data.networkConfig,
          loading: false 
        });
      } catch (error) {
        console.error("Failed to fetch network config:", error);
        setState({ loading: false });
      }
    }

    if (!effectCalled.current && authLoaded) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authLoaded, activeGroup]);

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
      </VStack>
    </Flex>
  );
}
