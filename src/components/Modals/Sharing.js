import {
  Box,
  CloseButton,
  Flex,
  Icon,
  Link,
  Text,
  QrCode,
  Button,
} from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { HiDownload, HiDocumentDuplicate } from "react-icons/hi";

import ShareIconList from "@/components/ShareIconList";
import { UI_TEXT } from "@/lib/uiStrings";

const Logo = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle r="35" cx="36" cy="36" fill="white" />
    <circle r="30" cx="36" cy="36" fill="black" />
    <g transform="translate(18 18)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 21.5815V17.357L17.9996 27.9182L25.1998 23.6937V27.9182L17.9996 32.1427L0 21.5815ZM10.7994 15.2448L17.9996 11.0203L36 21.5815V25.806L25.1998 19.4692L17.9996 23.6937L10.7994 19.4692L0 13.1325V8.90802L10.7994 15.2448ZM14.3995 17.357L17.9996 19.4692L21.5997 17.357L17.9996 15.2448L14.3995 17.357ZM36 13.1325V17.357L17.9996 6.79578L10.7994 11.0203V6.79578L17.9996 2.57129L36 13.1325Z"
        fill="white"
      />
    </g>
  </svg>
);

const SharingModal = ({ isOpen, onClose, url }) => {
  console.log("URL ", url);
  const copyURLToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toaster.create({
        title: "URL copied",
        type: "success",
      });
    });
  };

  const handleOpenChange = (details) => {
    if (!details.open) onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange} placement="top">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mt="1.75rem" position="relative">
          <CloseButton
            position="absolute"
            top="4"
            right="4"
            onClick={onClose}
          />
          <Dialog.Header fontSize="lg" fontWeight="bold" px="6" pt="6" pb="4">
            {UI_TEXT.qrCode.title}
          </Dialog.Header>
          <Dialog.Body
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="10px"
            px="6"
            pb="6"
          >
            <Flex direction="column" alignItems="center" gap="2">
              <QrCode.Root value={url} size="xl" encoding={{ ecc: "H" }}>
                <QrCode.Frame style={{ background: "white" }}>
                  <QrCode.Pattern />
                  <foreignObject x="0" y="0" width="100%" height="100%">
                    <QrCode.Overlay
                      style={{
                        width: "33%",
                        height: "33%",
                        padding: "8px",
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Logo />
                    </QrCode.Overlay>
                  </foreignObject>
                </QrCode.Frame>
              </QrCode.Root>
              <QrCode.Root value={url} size="xl" encoding={{ ecc: "H" }}>
                <QrCode.DownloadTrigger
                  asChild
                  fileName="ai-twin-qr.png"
                  mimeType="image/png"
                >
                  <Button variant="ghost" size="sm">
                    <Icon as={HiDownload} boxSize="6" />
                  </Button>
                </QrCode.DownloadTrigger>
              </QrCode.Root>
            </Flex>

            <Flex gap="10px" alignItems="center">
              <Link href={url} target="_blank" rel="noopener noreferrer">
                <Text as="div">{url}</Text>
              </Link>
              <Icon
                as={HiDocumentDuplicate}
                cursor="pointer"
                onClick={copyURLToClipboard}
              />
            </Flex>
            <Text fontWeight="600" color="#35383b" fontSize="18px">
              {UI_TEXT.qrCode.shareMessage}
            </Text>
            <Box
              width="30%"
              height="1px"
              backgroundColor="#cacaca"
              marginBottom="10px"
            />
            <ShareIconList url={url} />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default SharingModal;
