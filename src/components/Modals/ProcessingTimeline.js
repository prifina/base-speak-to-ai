"use client";

import {
  Dialog,
  Portal,
  Timeline,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";
import { LuCheck, LuCircleAlert } from "react-icons/lu";
import { appColors } from "@/lib/appConfig";
import { UI_TEXT } from "@/lib/uiStrings";

export default function ProcessingTimeline({ isOpen, onClose, uploadStatus, timelineEvents = [] }) {
  if (!uploadStatus) return null;

  const hasError = !!uploadStatus.error;
  const existingFilesCount = uploadStatus.existingFilesCount || 0;
  const duplicateFiles = uploadStatus.duplicateFiles || [];

  const chunkingEvent = timelineEvents.find(e => e.event === "CHUNKING");
  const readyEvent = timelineEvents.find(e => e.event === "READY");
  const allFinished = !!readyEvent;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="600px">
            <Dialog.Header>
              <Dialog.Title>
                {hasError ? UI_TEXT.knowledgeBase.processingTimeline.titleFailed : UI_TEXT.knowledgeBase.processingTimeline.titleSuccess}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Timeline.Root>
                <Timeline.Item>
                  <Timeline.Connector>
                    <Timeline.Separator />
                    <Timeline.Indicator bg={hasError ? appColors.errorColor : "green.500"}>
                      {hasError ? <LuCircleAlert /> : <LuCheck />}
                    </Timeline.Indicator>
                  </Timeline.Connector>
                  <Timeline.Content>
                    <Timeline.Title>
                      {hasError ? UI_TEXT.knowledgeBase.processingTimeline.uploadFailed : UI_TEXT.knowledgeBase.processingTimeline.processingStarted}
                    </Timeline.Title>
                    {existingFilesCount > 0 && !hasError && (
                      <Timeline.Description>
                        {UI_TEXT.knowledgeBase.processingTimeline.existingFilesNote(existingFilesCount)}
                      </Timeline.Description>
                    )}
                    {hasError && (
                      <Box mt={2}>
                        <Text color={appColors.errorColor} fontSize="sm">
                          {uploadStatus.error}
                        </Text>
                        {duplicateFiles.length > 0 && (
                          <Box mt={2}>
                            <Text fontSize="sm" fontWeight={600}>{UI_TEXT.knowledgeBase.processingTimeline.duplicateFilesLabel}</Text>
                            {duplicateFiles.map((file, idx) => (
                              <Text key={idx} fontSize="sm" color={appColors.gray}>
                                • {file.name}
                              </Text>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Timeline.Content>
                </Timeline.Item>

                {chunkingEvent && (
                  <Timeline.Item>
                    <Timeline.Connector>
                      <Timeline.Separator />
                      <Timeline.Indicator bg="green.500">
                        <LuCheck />
                      </Timeline.Indicator>
                    </Timeline.Connector>
                    <Timeline.Content>
                      <Timeline.Title>{UI_TEXT.knowledgeBase.processingTimeline.chunkingComplete}</Timeline.Title>
                      <Timeline.Description>{chunkingEvent.status}</Timeline.Description>
                    </Timeline.Content>
                  </Timeline.Item>
                )}

                {readyEvent && (
                  <Timeline.Item>
                    <Timeline.Connector>
                      <Timeline.Separator />
                      <Timeline.Indicator bg="green.500">
                        <LuCheck />
                      </Timeline.Indicator>
                    </Timeline.Connector>
                    <Timeline.Content>
                      <Timeline.Title>{UI_TEXT.knowledgeBase.processingTimeline.knowledgeBaseReady}</Timeline.Title>
                      <Timeline.Description>
                        {UI_TEXT.knowledgeBase.processingTimeline.readyDescription}
                      </Timeline.Description>
                    </Timeline.Content>
                  </Timeline.Item>
                )}
              </Timeline.Root>
            </Dialog.Body>
            {allFinished && (
              <Dialog.Footer>
                <Button onClick={onClose} colorPalette="purple">
                  {UI_TEXT.knowledgeBase.processingTimeline.closeButton}
                </Button>
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
