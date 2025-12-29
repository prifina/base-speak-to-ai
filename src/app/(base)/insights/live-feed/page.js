"use client";

import {
  useEffect,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Text,
  Flex,
  Table,
  createListCollection,
  Select,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { Loading } from "@/components/Loading";
import { UI_TEXT } from "@/lib/uiStrings";
import ReactMarkdown from "react-markdown";
import { useWebSocket } from "@/hooks/useWebSocket";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function LiveFeedPage() {
  const authFetch = useAuthFetch();
  const { loaded: authLoaded } = useContext(AuthContext);
  const { knowledgebaseId } = useStore(
    useShallow((state) => ({
      knowledgebaseId: state.knowledgebaseId,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connectionId, setConnectionId] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(["10"]);
  const userIdRef = useRef(null);
  const lastFetchTimeRef = useRef(null);
  const effectCalled = useRef(false);

  const pageSizeOptions = createListCollection({
    items: [
      { label: "10", value: "10" },
      { label: "25", value: "25" },
      { label: "50", value: "50" },
    ],
  });

  const fetchNewMessages = useCallback(
    async (createdAt) => {
      const currentUserId = userIdRef.current;
      console.log(
        "[LIVE-FEED] fetchNewMessages called, userId:",
        currentUserId,
        "createdAt:",
        createdAt
      );

      if (!currentUserId) {
        console.log("[LIVE-FEED] No userId, skipping fetch");
        return;
      }

      try {
        const url = createdAt
          ? `/api/get-live-feed?userId=${currentUserId}&createdAt=${createdAt}`
          : `/api/get-live-feed?userId=${currentUserId}`;

        console.log("[LIVE-FEED] Fetching from:", url);
        const messagesRes = await authFetch(url, { method: "GET" });

        if (!messagesRes.ok) {
          throw new Error("Failed to get messages");
        }

        const messagesData = await messagesRes.json();
        const newMessages = messagesData.messages || [];
        console.log("[LIVE-FEED] Received new messages:", newMessages.length);

        if (createdAt && newMessages.length > 0) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }

        const newFetchTime = Date.now();
        setLastFetchTime(newFetchTime);
        lastFetchTimeRef.current = newFetchTime;
      } catch (error) {
        console.error("Fetch new messages error:", error);
      }
    },
    [authFetch]
  );

  const handleSocketUpdate = useCallback(
    (msg) => {
      console.log("[LIVE-FEED WEBSOCKET] Message received:", msg);

      if (msg.event === "NOTIFY" && msg.status === "NEW-MESSAGES") {
        console.log("[LIVE-FEED WEBSOCKET] Fetching new messages...");
        fetchNewMessages(lastFetchTimeRef.current);
        setCurrentPage(1);
      }
    },
    [fetchNewMessages]
  );

  useWebSocket({
    site: knowledgebaseId,
    //site: "00d4d766-bd00-4af3-bde0-c9b9ac78d1a9",
    enabled: !!knowledgebaseId,
    setConnectionId,
    onSocketUpdate: handleSocketUpdate,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // First, get userId from user-knowledgebase
        const userRes = await authFetch(
          `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}`,
          {
            method: "GET",
          }
        );

        if (!userRes.ok) {
          throw new Error("Failed to get user data");
        }

        const userData = await userRes.json();
        const fetchedUserId = userData.user.userId;
        setUserId(fetchedUserId);
        userIdRef.current = fetchedUserId;

        // Then, get messages using userId
        const messagesRes = await authFetch(
          `/api/get-live-feed?userId=${fetchedUserId}`,
          {
            method: "GET",
          }
        );

        if (!messagesRes.ok) {
          const errorData = await messagesRes.json();
          console.log("ERROR RES", errorData);
          throw new Error("Failed to get messages");
        }

        const messagesData = await messagesRes.json();
        console.log("MESSAGES", messagesData);
        setMessages(messagesData.messages || []);
        const initialFetchTime = Date.now();
        setLastFetchTime(initialFetchTime);
        lastFetchTimeRef.current = initialFetchTime;
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    }

    if (!effectCalled.current && authLoaded && knowledgebaseId) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authFetch, knowledgebaseId, authLoaded]);

  const handlePageSizeChange = (details) => {
    setPageSize(details.value);
    setCurrentPage(1);
  };

  const paginatedMessages = useMemo(() => {
    const size = parseInt(pageSize[0]);
    const start = (currentPage - 1) * size;
    const end = start + size;
    return messages.slice(start, end);
  }, [messages, currentPage, pageSize]);

  const totalPages = Math.ceil(messages.length / parseInt(pageSize[0]));

  if (!authLoaded || loading) {
    return <Loading />;
  }

  return (
    <Box>
      {messages.length > 0 ? (
        <>
          <Flex justify="space-between" align="center" mb="16px">
            <Text>Showing the Last 50</Text>
            <Flex align="center" gap="12px">
              <Text fontSize="12px" color="#7C7C7C">
                {UI_TEXT.insights.sessions.itemsPerPage}:
              </Text>
              <Select.Root
                collection={pageSizeOptions}
                value={pageSize}
                onValueChange={handlePageSizeChange}
                size="sm"
                width="80px"
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {pageSizeOptions.items.map((option) => (
                        <Select.Item item={option} key={option.value}>
                          {option.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Flex>
          </Flex>
          <Flex overflowY="auto">
            <Flex width="100%" overflowY="auto">
              <Table.Root width="100%">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>
                      <Flex gap="5px">
                        {UI_TEXT.insights.liveFeed.messagesTableTitle}
                      </Flex>
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedMessages.map((message) => (
                    <Table.Row key={message.id}>
                      <Table.Cell>
                        <Box flexDirection="column">
                          <Text
                            fontSize="12px"
                            color="#989898"
                            fontWeight={600}
                            mb="12px"
                          >
                            {new Date(Number(message.created_at))
                              .toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                              .toUpperCase()}
                          </Text>
                          <Text mb="12px" fontWeight={600} color="#212529">
                            {message.statement}
                          </Text>
                          <Box maxH="200px" overflowY="auto" color="#555555">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p style={{ marginBottom: "12px" }}>
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul
                                    style={{
                                      marginLeft: "20px",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol
                                    style={{
                                      marginLeft: "20px",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li style={{ marginBottom: "4px" }}>
                                    {children}
                                  </li>
                                ),
                                code: ({ inline, children }) =>
                                  inline ? (
                                    <code
                                      style={{
                                        backgroundColor: "#f5f5f5",
                                        padding: "2px 4px",
                                        borderRadius: "3px",
                                      }}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <code
                                      style={{
                                        display: "block",
                                        backgroundColor: "#f5f5f5",
                                        padding: "12px",
                                        borderRadius: "4px",
                                        marginBottom: "12px",
                                        overflowX: "auto",
                                      }}
                                    >
                                      {children}
                                    </code>
                                  ),
                              }}
                            >
                              {message.answer}
                            </ReactMarkdown>
                          </Box>
                          <Text
                            fontSize="14px"
                            color="#989898"
                            fontWeight={600}
                            mt="12px"
                          >
                            {UI_TEXT.insights.messages.score}:{" "}
                            {Math.round(message.score * 100)}%
                          </Text>
                        </Box>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center" mt="20px">
            <Text fontSize="12px" color="#7C7C7C">
              {UI_TEXT.insights.sessions.showingText}{" "}
              {(currentPage - 1) * parseInt(pageSize[0]) + 1}{" "}
              {UI_TEXT.insights.sessions.ofText.toLowerCase()}{" "}
              {Math.min(currentPage * parseInt(pageSize[0]), messages.length)}{" "}
              {UI_TEXT.insights.sessions.ofText.toLowerCase()} {messages.length}{" "}
              {UI_TEXT.insights.liveFeed.messagesText || "messages"}
            </Text>
            <Flex gap="8px" align="center">
              <IconButton
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <LuChevronLeft />
              </IconButton>
              <Text fontSize="12px">
                {UI_TEXT.insights.sessions.pageText} {currentPage}{" "}
                {UI_TEXT.insights.sessions.ofText.toLowerCase()} {totalPages}
              </Text>
              <IconButton
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <LuChevronRight />
              </IconButton>
            </Flex>
          </Flex>
        </>
      ) : (
        <Text>No messages found</Text>
      )}
    </Box>
  );
}
