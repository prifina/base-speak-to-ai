// import { ProfileInstructionsText } from "@/components/ProfileInstructionsText";
import { Flex } from "@chakra-ui/react";
import Image from "next/image";

import FacebookIcon from "@/assets/app_icons/facebook.svg";
import GMailIcon from "@/assets/app_icons/gmail.svg";
import InstagramIcon from "@/assets/app_icons/instagram.svg";
import LinkedInIcon from "@/assets/app_icons/linkedin.svg";
import WhatsAppIcon from "@/assets/app_icons/whatsapp.svg";
import XIcon from "@/assets/app_icons/x.svg";
import { UI_TEXT } from "@/lib/uiStrings";

const ShareIconList = ({ url }) => {
  const defaultMessage = UI_TEXT.qrCode.defaultShareMessage;
  return (
    <Flex flexDirection={"row"} gap={"20px"} mb={"20px"}>
      <Image
        src={GMailIcon}
        alt={"Gmail Icon"}
        onClick={() => {
          window.open(
            `https://mail.google.com/mail/u/0/?fs=1&su=SUBJECT&body=${encodeURIComponent(
              defaultMessage
            )}${url}&tf=cm`,
            "_blank"
          );
        }}
        style={{
          cursor: "pointer",
        }}
      />

      <Image
        src={InstagramIcon}
        alt={"Instagram Icon"}
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(`https://www.instagram.com/`, "_blank");
        }}
      />

      <Image
        src={XIcon}
        alt={"X (Twitter) Icon"}
        onClick={() => {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              defaultMessage
            )}&url=${url}`,
            "_blank"
          );
        }}
        style={{
          cursor: "pointer",
        }}
      />

      <Image
        src={WhatsAppIcon}
        alt={"Whatsapp Icon"}
        onClick={() => {
          window.open(
            `https://wa.me/?text=${encodeURIComponent(defaultMessage)}${url}`,
            "_blank"
          );
        }}
        style={{
          cursor: "pointer",
        }}
      />

      <Image
        src={FacebookIcon}
        alt={"Facebook Icon"}
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          window.open(
            `https://www.facebook.com/share.php?u=${url}&t=${encodeURIComponent(
              defaultMessage
            )}`,
            "_blank"
          );
        }}
      />
      <Image
        src={LinkedInIcon}
        alt={"LinkedIn Icon"}
        onClick={() => {
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${encodeURIComponent(
              defaultMessage
            )}`,
            "_blank"
          );
        }}
        style={{
          cursor: "pointer",
        }}
      />
    </Flex>
  );
};

export default ShareIconList;
