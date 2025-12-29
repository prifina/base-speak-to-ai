"use client";

import {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useReducer,
} from "react";

import {
  Box,
  HStack,
  Text,
  Flex,
  useDisclosure,
  Button,
  FileUpload,
  useFileUploadContext,
  useFileUpload as useChakraFileUpload,
} from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";

import { UI_TEXT } from "@/lib/uiStrings";
import { AuthContext } from "@/app/providers/AuthProvider";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { toaster } from "@/components/ui/toaster";
import { Loading } from "@/components/Loading";
import { useMediaQuery } from "@/lib/useMediaQuery";
import BasicQuickAdd from "@/components/Modals/BasicQuickAdd";
import ProcessingTimeline from "@/components/Modals/ProcessingTimeline";
import FilesTable from "@/components/FilesTable";
import { fileSupport, appColors } from "@/lib/appConfig";
import { generateUniqueId } from "@/utils";
import { useWebSocket } from "@/hooks/useWebSocket";

const QuotaIndicator = ({ maxQuota }) => {
  const fileUpload = useFileUploadContext();
  const totalSize = fileUpload.acceptedFiles.reduce(
    (sum, file) => sum + file.size,
    0
  );
  const usedPercentage = (totalSize / maxQuota) * 100;
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Box mb={3}>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="sm" fontWeight={500}>
          {UI_TEXT.knowledgeBase.quota.label}
        </Text>
        <Text fontSize="sm" color={appColors.gray}>
          {formatSize(totalSize)} / {formatSize(maxQuota)}
        </Text>
      </HStack>
      <Box h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
        <Box
          h="full"
          bg={usedPercentage > 100 ? appColors.errorColor : appColors.purple}
          w={`${Math.min(usedPercentage, 100)}%`}
          transition="width 0.3s"
        />
      </Box>
    </Box>
  );
};

export default function KnowledgePage() {
  const authFetch = useAuthFetch();
  const [isMobile] = useMediaQuery("(max-width: 992px)");
  // console.log("IS MOBILE ", isMobile);
  const { user, loaded: authLoaded } = useContext(AuthContext);

  const { cognitoId, knowledgebaseId, language } = useStore(
    useShallow((state) => ({
      cognitoId: state.cognitoId,
      knowledgebaseId: state.knowledgebaseId,
      language: state.language,
    }))
  );
  const acceptedFileTypes = Object.keys(fileSupport).join(",");
  const maxFileSize = 500 * 1024 * 1024;
  const maxQuota = 500 * 1024 * 1024;

  const fileUploadApi = useChakraFileUpload({
    maxFiles: 5,
    maxFileSize: maxFileSize,
    accept: acceptedFileTypes,
    onFileReject: (details) => {
      details.files.forEach((file) => {
        if (file.errors.includes("TOO_MANY_FILES")) {
          toaster.create({
            title: UI_TEXT.knowledgeBase.uploadErrors.tooManyFiles.title,
            description:
              UI_TEXT.knowledgeBase.uploadErrors.tooManyFiles.description,
            type: "warning",
          });
        }
      });
    },
    validate: (file) => {
      const existingFiles = document.querySelectorAll(
        '[data-scope="file-upload"][data-part="item"]'
      );
      const existingNames = Array.from(existingFiles).map(
        (el) => el.querySelector('[data-part="item-name"]')?.textContent
      );
      if (existingNames.includes(file.name)) {
        toaster.create({
          title: UI_TEXT.knowledgeBase.uploadErrors.duplicateFile.title,
          description:
            UI_TEXT.knowledgeBase.uploadErrors.duplicateFile.description,
          type: "warning",
        });
        return ["DUPLICATE_FILE"];
      }
      const currentTotal = Array.from(existingFiles).reduce((sum, el) => {
        const sizeText = el.querySelector(
          '[data-part="item-size-text"]'
        )?.textContent;
        return sum + (parseInt(sizeText) || 0);
      }, 0);
      if (currentTotal + file.size > maxQuota) {
        toaster.create({
          title: UI_TEXT.knowledgeBase.uploadErrors.quotaExceeded.title,
          description:
            UI_TEXT.knowledgeBase.uploadErrors.quotaExceeded.description,
          type: "warning",
        });
        return ["QUOTA_EXCEEDED"];
      }
      return null;
    },
  });

  const [state, setState] = useReducer(
    (state, action) => {
      if (typeof action === 'function') {
        return { ...state, ...action(state) };
      }
      return { ...state, ...action };
    },
    {
      loading: true,
      saving: false,
      knowledgeBaseDocs: [],
      filesToUpload: [],
      s3Options: {},
      uploadProgress: { current: 0, total: 0, currentFile: "", percentage: 0 },
      uploadStatus: null,
      connectionId: null,
      timelineEvents: [],
    }
  );

  const handleSocketUpdate = useCallback(
    (msg) => {
      console.log("[WEBSOCKET] Message received:", msg);
      console.log("[WEBSOCKET] Current knowledgebaseId:", knowledgebaseId);

      if (msg.event === "CHUNKING") {
        console.log("[WEBSOCKET] CHUNKING event detected, updating timeline");
        setState((prevState) => {
          const newEvents = [
            ...prevState.timelineEvents,
            { event: "CHUNKING", status: msg.status, timestamp: Date.now() },
            {
              event: "READY",
              status: "Knowledge base ready",
              timestamp: Date.now(),
            },
          ];
          console.log("[WEBSOCKET] Previous events:", prevState.timelineEvents);
          console.log("[WEBSOCKET] New timeline events:", newEvents);
          return { timelineEvents: newEvents };
        });
      }
    },
    [knowledgebaseId]
  );

  useWebSocket({
    site: knowledgebaseId,
    enabled: !!knowledgebaseId,
    setConnectionId: (id) => setState({ connectionId: id }),
    onSocketUpdate: handleSocketUpdate,
  });

  useEffect(() => {
    console.log("[SOCKET] Subscribing to socket updates...");
    const unsub = useStore.subscribe(
      (state) => state.socketUpdate,
      (socketUpdate) => {
        console.log("[SOCKET] Store update:", socketUpdate);
        handleSocketUpdate(socketUpdate);
      }
    );
    return unsub;
  }, [handleSocketUpdate]);

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const {
    open: isTimelineOpen,
    onOpen: onTimelineOpen,
    onClose: onTimelineClose,
  } = useDisclosure();
  const effectCalled = useRef(false);
  const loading = !authLoaded || state.loading;

  const handleFileDelete = (fileId) => {
    setState((prevState) => ({
      knowledgeBaseDocs: prevState.knowledgeBaseDocs.filter(
        (file) => file.id !== fileId
      ),
    }));
  };

  const saveQuickAdd = useCallback(
    (file) => {
      const blob = new Blob([file.description], { type: "text/plain" });
      const newFile = new File([blob], `${file.title}.txt`, {
        type: "text/plain",
      });

      const currentFiles = fileUploadApi.acceptedFiles || [];
      fileUploadApi.setFiles([...currentFiles, newFile]);
      onClose();
    },
    [onClose, fileUploadApi]
  );

  const handleUpload = useCallback(async () => {
    console.log("[UPLOAD] Starting upload process");
    console.log(
      "[UPLOAD] Files to upload:",
      fileUploadApi.acceptedFiles.length
    );
    console.log("[UPLOAD] S3 Options:", state.s3Options);

    const totalFiles = fileUploadApi.acceptedFiles.length;
    const filesToUpload = [];
    setState({
      saving: true,
      uploadProgress: {
        current: 0,
        total: totalFiles,
        currentFile: "",
        percentage: 0,
      },
    });

    try {
      for (let i = 0; i < fileUploadApi.acceptedFiles.length; i++) {
        const file = fileUploadApi.acceptedFiles[i];
        const uuid = generateUniqueId();
        const ext = file.name.split(".").pop() || "txt";
        const newFileName = `${uuid}.${ext}`;

        console.log(
          `[UPLOAD] Processing file ${i + 1}/${totalFiles}: ${file.name}`
        );

        setState({
          uploadProgress: {
            current: i + 1,
            total: totalFiles,
            currentFile: file.name,
            percentage: 0,
          },
        });

        const response = await authFetch("/api/get-presigned-url", {
          method: "POST",
          body: JSON.stringify({
            fileName: newFileName,
            fileType: file.type,
            uploadFolder: state.s3Options.folder,
            bucket: state.s3Options.bucket,
            commandType: "PUT",
          }),
        });

        if (!response.ok) {
          const errMsg = await response.json();
          console.error(
            `[UPLOAD] Presigned URL error for ${file.name}:`,
            errMsg
          );
          throw new Error(errMsg.error || "Failed to get presigned URL");
        }

        const { url: presignedUrl } = await response.json();
        console.log(`[UPLOAD] Presigned URL obtained for ${file.name}`);

        console.log(
          `[UPLOAD] Uploading ${file.name} to S3, size: ${file.size}`
        );

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          let lastUpdate = 0;

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              const now = Date.now();
              if (now - lastUpdate > 500 || percentComplete === 100) {
                console.log(
                  `[UPLOAD] Progress for ${
                    file.name
                  }: ${percentComplete.toFixed(1)}%`
                );
                setState({
                  uploadProgress: {
                    current: i + 1,
                    total: totalFiles,
                    currentFile: file.name,
                    percentage: percentComplete,
                  },
                });
                lastUpdate = now;
              }
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log(
                `[UPLOAD] S3 upload response status for ${file.name}:`,
                xhr.status
              );
              resolve();
            } else {
              console.error(
                `[UPLOAD] S3 upload error for ${file.name}:`,
                xhr.responseText
              );
              reject(new Error(`Failed to upload ${file.name} to S3`));
            }
          });

          xhr.addEventListener("error", () => {
            console.error(`[UPLOAD] Network error uploading ${file.name}`);
            reject(new Error(`Network error uploading ${file.name}`));
          });

          xhr.open("PUT", presignedUrl);
          xhr.send(file);
        });

        console.log(`[UPLOAD] Successfully uploaded ${file.name}`);

        filesToUpload.push({
          name: file.name,
          uuid,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      }

      console.log("[UPLOAD] All files uploaded successfully");
      console.log("[UPLOAD] Files to upload state:", filesToUpload);

      console.log("[PROCESS] Calling process-upload API");
      const processResponse = await authFetch("/api/process-upload", {
        method: "POST",
        body: JSON.stringify({
          appId: process.env.NEXT_PUBLIC_APP_ID || "base-app",
          knowledgebaseId,
          files: filesToUpload,
        }),
      });

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        console.error("[PROCESS] Process upload error:", processError);
        throw new Error(processError.error || "Failed to process uploads");
      }

      const processData = await processResponse.json();
      console.log("[PROCESS] Process upload response:", processData);

      setState({ uploadStatus: processData.uploadStatus });
      onTimelineOpen();

      toaster.create({
        title: UI_TEXT.knowledgeBase.uploadSuccess.title,
        description:
          UI_TEXT.knowledgeBase.uploadSuccess.description(totalFiles),
        type: "success",
      });

      fileUploadApi.clearFiles();
      setState({
        saving: false,
        uploadProgress: {
          current: 0,
          total: 0,
          currentFile: "",
          percentage: 0,
        },
        filesToUpload,
      });
    } catch (error) {
      console.error("[UPLOAD] Upload failed:", error);
      toaster.create({
        title: UI_TEXT.knowledgeBase.uploadFailed.title,
        description: error.message,
        type: "error",
      });
      setState({
        saving: false,
        uploadProgress: {
          current: 0,
          total: 0,
          currentFile: "",
          percentage: 0,
        },
      });
    }
  }, [
    authFetch,
    fileUploadApi,
    state.s3Options,
    knowledgebaseId,
    onTimelineOpen,
  ]);

  useEffect(() => {
    async function fetchData() {
      const res = await authFetch(
        `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}&opt=DOCS`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.log("ERROR RES ", errorData);
        throw new Error("Failed to get appsync response");
      }
      const data = await res.json();
      console.log("RES ", data);
      const sortedDocs = (data.knowledgeBaseDocs || []).sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return b.created_at.localeCompare(a.created_at);
      });
      setState({
        loading: false,
        knowledgeBaseDocs: sortedDocs,
        s3Options: {
          folder: `incoming/${knowledgebaseId}`,
          bucket: process.env.UPLOAD_BUCKET || "prifina-upload-conversions",
        },
      });
    }
    if (!effectCalled.current) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authFetch, knowledgebaseId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <BasicQuickAdd onClose={onClose} save={saveQuickAdd} isOpen={isOpen} />
      <ProcessingTimeline
        isOpen={isTimelineOpen}
        onClose={onTimelineClose}
        uploadStatus={state.uploadStatus}
        timelineEvents={state.timelineEvents}
      />
      <Flex flexDir={"column"} gap={"40px"} p="28px">
        <Box pl={{ base: "42px", md: "0" }}>
          <Text textStyle="pageTitle">
            {UI_TEXT.knowledgeBase.sectionTitle}
          </Text>
        </Box>
        <Box>
          <Text fontWeight={600} mb={3}>
            {UI_TEXT.knowledgeBase.quickAdd.prompt}
          </Text>
          <Button
            colorPalette="purple"
            variant="subtle"
            width="fit-content"
            onClick={onOpen}
            paddingX="4"
          >
            {UI_TEXT.knowledgeBase.quickAdd.button}
          </Button>
        </Box>
        <Box>
          <FileUpload.RootProvider value={fileUploadApi}>
            <FileUpload.HiddenInput />
            <FileUpload.Dropzone w="full">
              <LuUpload size="24" color="gray" />
              <FileUpload.DropzoneContent>
                <Text color={appColors.black}>
                  {UI_TEXT.knowledgeBase.fileDrag.instructions}
                </Text>
                <Text color={appColors.gray}>
                  {UI_TEXT.knowledgeBase.fileDrag.supportedFormats}
                </Text>
              </FileUpload.DropzoneContent>
            </FileUpload.Dropzone>
            {fileUploadApi.acceptedFiles.length > 0 && (
              <QuotaIndicator maxQuota={maxQuota} />
            )}
            {state.saving && (
              <Box mb={3}>
                <Text fontSize="sm" color={appColors.gray} mb={1}>
                  Uploading {state.uploadProgress.current} of{" "}
                  {state.uploadProgress.total}:{" "}
                  {state.uploadProgress.currentFile} (
                  {state.uploadProgress.percentage.toFixed(0)}%)
                </Text>
                <Box
                  h="4px"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    bg={appColors.purple}
                    w={`${state.uploadProgress.percentage}%`}
                    transition="width 0.3s"
                  />
                </Box>
              </Box>
            )}
            <Flex justify="space-between" align="center" mb={3} w="full">
              <Text fontWeight={600}>
                {UI_TEXT.knowledgeBase.attachments.files}
              </Text>
              <Button
                colorPalette="purple"
                size="sm"
                disabled={fileUploadApi.acceptedFiles.length === 0}
                loading={state.saving}
                onClick={handleUpload}
              >
                {UI_TEXT.knowledgeBase.attachments.uploadPrompt}
              </Button>
            </Flex>
            {fileUploadApi.acceptedFiles.length === 0 ? (
              <Text color={appColors.gray}>
                {UI_TEXT.knowledgeBase.attachments.noFiles}
              </Text>
            ) : (
              <FileUpload.List showSize clearable />
            )}
          </FileUpload.RootProvider>
        </Box>
        <FilesTable
          docs={state.knowledgeBaseDocs}
          knowledgebaseId={knowledgebaseId}
          authFetch={authFetch}
          onDelete={handleFileDelete}
        />
      </Flex>
    </Box>
  );
}
