"use client";

import { useEffect, useContext, useRef, useState, useMemo } from "react";
import { Box, Text, Flex, Input, createListCollection, Select, Portal, Button, IconButton, Spinner, VStack } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { Loading } from "@/components/Loading";
import { UI_TEXT } from "@/lib/uiStrings";
import ReactMarkdown from "react-markdown";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function SessionsPage() {
  const authFetch = useAuthFetch();
  const { loaded: authLoaded } = useContext(AuthContext);
  const { knowledgebaseId } = useStore(
    useShallow((state) => ({
      knowledgebaseId: state.knowledgebaseId,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [quickRange, setQuickRange] = useState(["30"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(["10"]);
  const [showOriginal, setShowOriginal] = useState({});
  const effectCalled = useRef(false);

  const dateRangeOptions = createListCollection({
    items: [
      { label: UI_TEXT.insights.sessions.dateRangeOptions.last7Days, value: "7" },
      { label: UI_TEXT.insights.sessions.dateRangeOptions.last30Days, value: "30" },
      { label: UI_TEXT.insights.sessions.dateRangeOptions.last90Days, value: "90" },
      { label: UI_TEXT.insights.sessions.dateRangeOptions.last6Months, value: "180" },
      { label: UI_TEXT.insights.sessions.dateRangeOptions.lastYear, value: "365" },
      { label: UI_TEXT.insights.sessions.dateRangeOptions.allTime, value: "all" },
      { label: "Custom", value: "custom" },
    ],
  });

  const pageSizeOptions = createListCollection({
    items: [
      { label: "10", value: "10" },
      { label: "25", value: "25" },
      { label: "50", value: "50" },
      { label: "100", value: "100" },
    ],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true);
        const now = new Date();
        let start, end;

        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          const days = quickRange[0] === "all" ? null : parseInt(quickRange[0]);
          start = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : new Date(0);
          end = now;
        }

        const res = await authFetch(
          `/api/list-message-objects?knowledgebaseId=${knowledgebaseId}&createdAtStart=${start.toISOString()}&createdAtEnd=${end.toISOString()}`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.log("ERROR RES", errorData);
          throw new Error("Failed to get message objects");
        }

        const data = await res.json();
        console.log("MESSAGE OBJECTS", data);
        setSessions(data.sessions || []);
        setLoading(false);
        setFetching(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
        setFetching(false);
      }
    }

    if (!effectCalled.current && authLoaded && knowledgebaseId) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authFetch, knowledgebaseId, authLoaded, quickRange, startDate, endDate]);

  const handleQuickRangeChange = (details) => {
    setQuickRange(details.value);
    if (details.value[0] !== "custom") {
      setStartDate("");
      setEndDate("");
      setCurrentPage(1);
      effectCalled.current = false;
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setQuickRange(["custom"]);
    if (e.target.value && endDate) {
      setCurrentPage(1);
      effectCalled.current = false;
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setQuickRange(["custom"]);
    if (startDate && e.target.value) {
      setCurrentPage(1);
      effectCalled.current = false;
    }
  };

  const handlePageSizeChange = (details) => {
    setPageSize(details.value);
    setCurrentPage(1);
  };

  const paginatedSessions = useMemo(() => {
    const size = parseInt(pageSize[0]);
    const start = (currentPage - 1) * size;
    const end = start + size;
    return sessions.slice(start, end);
  }, [sessions, currentPage, pageSize]);

  const totalPages = Math.ceil(sessions.length / parseInt(pageSize[0]));

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sessions-${formatDateRange().replace(/\//g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!authLoaded || loading) {
    return <Loading />;
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    return dateRangeOptions.items.find(item => item.value === quickRange[0])?.label || UI_TEXT.insights.sessions.dateRangeOptions.last30Days;
  };

  return (
    <Box position="relative">
      {fetching && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255, 255, 255, 0.7)"
          zIndex="10"
          alignItems="center"
          justifyContent="center"
        >
          <VStack colorPalette="teal">
            <Spinner
              borderWidth="6px"
              animationDuration="1.2s"
              color="teal.500"
              size="xl"
              width="100px"
              height="100px"
              css={{ "--spinner-track-color": "colors.gray.200" }}
            />
            <Text color="colorPalette.600">Loading...</Text>
          </VStack>
        </Flex>
      )}
      <Flex mb="20px" align="center" gap="12px" wrap="wrap" justify="space-between">
        <Flex align="center" gap="12px">
          <Select.Root
            collection={dateRangeOptions}
            value={quickRange}
            onValueChange={handleQuickRangeChange}
            size="sm"
            width="200px"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select range" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {dateRangeOptions.items.map((option) => (
                    <Select.Item item={option} key={option.value}>
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          {quickRange[0] === "custom" && (
            <>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                size="sm"
                width="150px"
                placeholder="Start date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                size="sm"
                width="150px"
                placeholder="End date"
              />
            </>
          )}
        </Flex>
        <Flex align="center" gap="12px">
          <Button size="sm" variant="outline" onClick={handleExport} colorPalette="teal">
            {UI_TEXT.insights.sessions.exportButton}
          </Button>
          <Text fontSize="12px" color="#7C7C7C">{UI_TEXT.insights.sessions.itemsPerPage}:</Text>
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
      {sessions.length > 0 ? (
        <>
          <Flex mb="16px">
            <Text fontSize="20px" fontWeight={600}>{UI_TEXT.insights.sessions.title}</Text>
          </Flex>
          <Flex overflowY="auto">
            <Flex width="100%" overflowY="auto" direction="column" gap="20px">
              {paginatedSessions.map((session) => (
                <Box key={session.sessionId} borderWidth="1px" borderRadius="8px" p="16px">
                  {/* Session Header */}
                  <Box mb="16px" pb="12px" borderBottomWidth="1px">
                    <Flex justify="space-between" align="center" mb="8px">
                      <Flex align="center" gap="12px">
                        <Text fontSize="14px" fontWeight={600} color="#212529">
                          {new Date(session.startTime + 'Z').toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                          {" - "}
                          {new Date(session.endTime + 'Z').toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Text>
                        {session.sessionLanguage && (
                          <>
                            <Text fontSize="12px" color="teal.600" bg="teal.50" px="8px" py="2px" borderRadius="4px">
                              Translated from {session.sessionLanguage}
                            </Text>
                            <Button
                              size="xs"
                              variant="ghost"
                              color="teal.600"
                              onClick={() => setShowOriginal(prev => ({ ...prev, [session.sessionId]: !prev[session.sessionId] }))}
                            >
                              {showOriginal[session.sessionId] ? "Show translated" : "Show original"}
                            </Button>
                          </>
                        )}
                      </Flex>
                      <Text fontSize="12px" color="#989898">
                        {UI_TEXT.insights.sessions.duration}: {session.durationMin} min
                      </Text>
                    </Flex>
                    <Flex gap="16px" fontSize="12px" color="#7C7C7C">
                      <Text>{UI_TEXT.insights.sessions.messages}: {session.messageCount}</Text>
                      <Text>{UI_TEXT.insights.sessions.avgScore}: {Math.round(session.avgScore * 100)}%</Text>
                      {session.zeroScoreCount > 0 && (
                        <Text>{UI_TEXT.insights.sessions.noContentFound}: {session.zeroScoreCount}</Text>
                      )}
                    </Flex>
                  </Box>

                  {/* Session Messages */}
                  <Flex direction="column" gap="16px">
                    {session.messages.map((message) => (
                      <Box key={message.id} pl="12px" borderLeftWidth="2px" borderLeftColor="#E0E0E0">
                        <Text
                          fontSize="12px"
                          color="#989898"
                          fontWeight={600}
                          mb="8px"
                        >
                          {new Date(message.created_at + 'Z')
                            .toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                        </Text>
                        <Flex align="center" gap="8px" mb="8px">
                          <Text fontWeight={600} color="#212529">
                            {session.sessionLanguage && !showOriginal[session.sessionId] ? message.translated_statement : message.statement}
                          </Text>
                          {message.example_click && (
                            <Text fontSize="10px" color="#7C7C7C" fontStyle="italic">
                              {UI_TEXT.insights.sessions.exampleQuestion}
                            </Text>
                          )}
                        </Flex>
                        <Box
                          maxH="200px"
                          overflowY="auto"
                          color="#555555"
                          mb="8px"
                          css={{
                            '& p': { marginBottom: '0.5em' },
                            '& ul, & ol': { marginLeft: '1.5em', marginBottom: '0.5em' },
                            '& li': { marginBottom: '0.25em' },
                            '& code': { backgroundColor: '#f5f5f5', padding: '0.2em 0.4em', borderRadius: '3px' },
                            '& pre': { backgroundColor: '#f5f5f5', padding: '1em', borderRadius: '5px', overflowX: 'auto' },
                          }}
                        >
                          <ReactMarkdown>{session.sessionLanguage && !showOriginal[session.sessionId] ? message.translated_answer : message.answer}</ReactMarkdown>
                        </Box>
                        <Flex gap="12px" fontSize="12px" color="#989898">
                          <Text>{UI_TEXT.insights.sessions.score}: {Math.round(message.score * 100)}%</Text>
                          {message.quality && (
                            <Text>{UI_TEXT.insights.sessions.quality}: {message.quality}</Text>
                          )}
                        </Flex>
                      </Box>
                    ))}
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center" mt="20px">
            <Text fontSize="12px" color="#7C7C7C">
              {UI_TEXT.insights.sessions.showingText} {((currentPage - 1) * parseInt(pageSize[0])) + 1} {UI_TEXT.insights.sessions.ofText.toLowerCase()} {Math.min(currentPage * parseInt(pageSize[0]), sessions.length)} {UI_TEXT.insights.sessions.ofText.toLowerCase()} {sessions.length} {UI_TEXT.insights.sessions.sessionsText}
            </Text>
            <Flex gap="8px" align="center">
              <IconButton
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <LuChevronLeft />
              </IconButton>
              <Text fontSize="12px">
                {UI_TEXT.insights.sessions.pageText} {currentPage} {UI_TEXT.insights.sessions.ofText.toLowerCase()} {totalPages}
              </Text>
              <IconButton
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <LuChevronRight />
              </IconButton>
            </Flex>
          </Flex>
        </>
      ) : (
        <Text>{UI_TEXT.insights.sessions.noMessages}</Text>
      )}
    </Box>
  );
}
