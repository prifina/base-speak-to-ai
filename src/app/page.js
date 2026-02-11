"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Heading, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";

function HomePageContent() {
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("invitationCode");
  const eventId = searchParams.get("eventId");
  const participantId = searchParams.get("participantId");
  const [eventData, setEventData] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [preferredUsername, setPreferredUsername] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId && participantId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/get-event?eventId=${eventId}`).then((res) => res.json()),
        fetch(
          `/api/get-participant?eventId=${eventId}&participantId=${encodeURIComponent(participantId)}`,
        ).then((res) => res.json()),
      ])
        .then(async ([eventResult, participantResult]) => {
          setEventData(eventResult.event);
          const participant = participantResult.participant;
          setParticipantData(participant);

          // Check if user has an account
          if (participant?.knowledgebaseId) {
            try {
              const kbResponse = await fetch("/api/get-knowledgebase-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  knowledgebaseId: participant.knowledgebaseId,
                }),
              });
              const kbData = await kbResponse.json();
              if (kbData.preferred_username) {
                setPreferredUsername(kbData.preferred_username);
              }
            } catch (error) {
              console.error("Error checking knowledgebase user:", error);
            }
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    }
  }, [eventId, participantId]);

  // Invitation code case
  if (invitationCode) {
    return (
      <Box maxW="2xl" mx="auto" mt={10}>
        <Heading mb={4}>Invitation</Heading>
        <Text mb={4}>
          You have been invited with code: <strong>{invitationCode}</strong>
        </Text>
        <Text>Invitation acceptance flow will be implemented here.</Text>
      </Box>
    );
  }

  // Event participation case
  if (eventId && participantId) {
    return (
      <Box maxW="2xl" mx="auto" mt={10}>
        <Heading mb={4}>Event Participation</Heading>
        {loading ? (
          <Text>Loading event data...</Text>
        ) : eventData ? (
          <>
            <Text mb={2} fontSize="lg" fontWeight="semibold">
              {eventData.name || eventId}
            </Text>
            {eventData.description && (
              <Text mb={4}>{eventData.description}</Text>
            )}
            {eventData.eventDate && (
              <Text mb={4}>
                Date:{" "}
                <strong>
                  {new Date(eventData.eventDate).toLocaleString()}
                </strong>
              </Text>
            )}
            {participantData && (
              <Text mb={4}>
                Participant:{" "}
                <strong>
                  {participantData.firstName} {participantData.lastName}
                </strong>
              </Text>
            )}
            <Box mt={6} p={4} borderWidth="1px" borderRadius="md">
              {preferredUsername ? (
                <>
                  <Text mb={4}>You already have an account!</Text>
                  <ChakraLink
                    as={Link}
                    href={`/login?username=${preferredUsername}`}
                    color="blue.500"
                    fontWeight="semibold"
                  >
                    Continue with Login
                  </ChakraLink>
                </>
              ) : (
                <>
                  <Text mb={4}>Get started with your event participation</Text>
                  <ChakraLink
                    as={Link}
                    href={`/signup?eventId=${eventId}&participantId=${encodeURIComponent(participantId)}`}
                    color="blue.500"
                    fontWeight="semibold"
                  >
                    Continue with Signup
                  </ChakraLink>
                </>
              )}
            </Box>
          </>
        ) : (
          <Text>Event not found.</Text>
        )}
      </Box>
    );
  }

  // Default landing page
  return (
    <Box maxW="2xl" mx="auto" mt={10}>
      <Heading mb={4}>Welcome</Heading>
      <Text mb={4}>
        This is a public home page. Try going to the{" "}
        <ChakraLink as={Link} href="/home" color="blue.500">
          Home
        </ChakraLink>{" "}
        to see protected navigation in action.
      </Text>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <Box maxW="2xl" mx="auto" mt={10}>
          Loading...
        </Box>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
