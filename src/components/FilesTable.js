"use client";

import { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  IconButton,
  VStack,
  Button,
  Table,
  Popover,
  Pagination,
  ButtonGroup,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSolidDownload, BiTrash } from "react-icons/bi";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { UI_TEXT } from "@/lib/uiStrings";
import { appColors } from "@/lib/appConfig";
import { toaster } from "@/components/ui/toaster";
import DeleteConfirmDialog from "@/components/Modals/DeleteConfirmDialog";

export default function FilesTable({ docs, knowledgebaseId, authFetch, onDelete }) {
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fileToDelete, setFileToDelete] = useState(null);
  const { open: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const itemsPerPage = 15;

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString();
  };

  const isTextOrMarkdown = (mimeType) => {
    return mimeType?.startsWith("text/") || mimeType === "application/markdown";
  };

  const downloadFile = async (payload, fileName) => {
    try {
      const response = await authFetch("/api/get-presigned-url", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to get download URL");

      const { url } = await response.json();
      const fileResponse = await fetch(url);
      const blob = await fileResponse.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      toaster.create({
        title: "Download failed",
        type: "error",
      });
    }
  };

  const handleDownload = async (doc) => {
    const payload = doc.meta?.s3Key
      ? {
          s3Key: doc.meta.s3Key,
          fileName: doc.id,
          fileType: doc.meta.type,
          uploadFolder: "uploads-v2",
          commandType: "GET",
          bucket: "prifina-upload-conversions",
        }
      : {
          fileName: `${doc.id}.txt`,
          fileType: doc.meta?.type,
          uploadFolder: `knowledgebase/${knowledgebaseId}/uploaded`,
          commandType: "GET",
          bucket: "prifina-ai-source-docs",
        };
    await downloadFile(payload, doc.meta?.name || doc.meta?.fname);
  };

  const handleDownloadConversion = async (doc) => {
    const payload = {
      s3Key: `knowledgebase/${knowledgebaseId}/${doc.created_at.split("T")[0]}/${doc.id}/file.md`,
      fileName: doc.id,
      fileType: doc.meta?.type,
      uploadFolder: "uploads-v2",
      commandType: "GET",
      bucket: "prifina-upload-conversions",
    };
    const fileName = doc.meta?.name || doc.meta?.fname;
    const baseName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
    await downloadFile(payload, `${baseName}.md`);
  };

  const handleDelete = (doc) => {
    setFileToDelete(doc);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    const doc = fileToDelete;
    onDeleteClose();

    try {
      const response = await authFetch("/api/delete-doc-item", {
        method: "POST",
        body: JSON.stringify({
          knowledgebaseId,
          itemId: doc.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      onDelete(doc.id);
      setFileToDelete(null);

      toaster.create({
        title: "File deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toaster.create({
        title: "Failed to delete file",
        type: "error",
      });
      setFileToDelete(null);
    }
  };

  const filteredDocs = docs.filter((doc) => {
    const fileName = doc.meta?.name || doc.meta?.fname || "";
    return fileName.toLowerCase().includes((filterText || "").toLowerCase());
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocs = filteredDocs.slice(startIndex, endIndex);

  return (
    <Box>
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          onDeleteClose();
          setFileToDelete(null);
        }}
        fileName={fileToDelete?.meta?.name || fileToDelete?.meta?.fname}
        onConfirm={confirmDelete}
      />
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight={600}>{UI_TEXT.knowledgeBase.fileTable.title}</Text>
        {docs.length > 0 && (
          <Input
            placeholder="Filter files..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
            maxW="300px"
            size="sm"
          />
        )}
      </Flex>
      {docs.length === 0 ? (
        <Text color={appColors.gray}>{UI_TEXT.knowledgeBase.fileTable.noFiles}</Text>
      ) : (
        <Box minH="600px">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{UI_TEXT.knowledgeBase.fileTable.fileName}</Table.ColumnHeader>
                <Table.ColumnHeader>{UI_TEXT.knowledgeBase.fileTable.fileSize}</Table.ColumnHeader>
                <Table.ColumnHeader>{UI_TEXT.knowledgeBase.fileTable.uploadDate}</Table.ColumnHeader>
                <Table.ColumnHeader w="50px"></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {currentDocs.map((doc) => (
                <Table.Row key={doc.id}>
                  <Table.Cell>{doc.meta?.name || doc.meta?.fname}</Table.Cell>
                  <Table.Cell>{formatSize(doc.meta?.size)}</Table.Cell>
                  <Table.Cell>{formatDate(doc.created_at)}</Table.Cell>
                  <Table.Cell>
                    <Popover.Root positioning={{ placement: "bottom-end" }}>
                      <Popover.Trigger asChild>
                        <IconButton variant="ghost" size="sm">
                          <BsThreeDotsVertical />
                        </IconButton>
                      </Popover.Trigger>
                      <Popover.Positioner>
                        <Popover.Content width="auto" p={1}>
                          <Popover.Body p={0}>
                            <VStack gap={0} align="stretch">
                              <Button
                                variant="ghost"
                                size="sm"
                                justifyContent="flex-start"
                                onClick={() => handleDownload(doc)}
                              >
                                <BiSolidDownload />
                                {UI_TEXT.knowledgeBase.fileTable.download}
                              </Button>
                              {!isTextOrMarkdown(doc.meta?.type) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  justifyContent="flex-start"
                                  onClick={() => handleDownloadConversion(doc)}
                                >
                                  <BiSolidDownload />
                                  Download Conversion
                                </Button>
                              )}
                              <Popover.CloseTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  justifyContent="flex-start"
                                  onClick={() => handleDelete(doc)}
                                  color="red.500"
                                >
                                  <BiTrash />
                                  {UI_TEXT.knowledgeBase.fileTable.delete}
                                </Button>
                              </Popover.CloseTrigger>
                            </VStack>
                          </Popover.Body>
                        </Popover.Content>
                      </Popover.Positioner>
                    </Popover.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          {filteredDocs.length > itemsPerPage && (
            <Flex justify="center" mt={4}>
              <Pagination.Root
                count={filteredDocs.length}
                pageSize={itemsPerPage}
                page={currentPage}
                onPageChange={(e) => setCurrentPage(e.page)}
              >
                <ButtonGroup variant="ghost" size="sm">
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>
                  <Pagination.Items
                    render={(page) => (
                      <IconButton variant={{ base: "ghost", _selected: "outline" }}>
                        {page.value}
                      </IconButton>
                    )}
                  />
                  <Pagination.NextTrigger asChild>
                    <IconButton>
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}
