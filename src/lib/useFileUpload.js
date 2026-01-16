import React, { useState, useRef } from "react";

import { generateUniqueId } from "@/utils";
import { fileToSquareCompressedBlob } from "@/lib/avatarCompress";

import { UI_TEXT } from "@/lib/uiStrings";
import { fileSupport, imageFileSupport } from "@/lib/appConfig";
// import styles from './styles.module.css'

export const checkAvatar = async (avatar) => {
  console.log("FILE is", avatar.file);

  if (!avatar)
    return {
      check: false,
      message: UI_TEXT.profile.avatar.notAnImage,
    };

  if (!avatar.type.startsWith("image/")) {
    return {
      check: false,
      message: UI_TEXT.profile.avatar.notAnImage,
    };
  }

  if (avatar.size / 1024 > 5120) {
    return {
      check: false,
      message: `Max file size is 5MB. Selected image: ${(
        avatar.size / 1024
      ).toFixed(2)}KB`,
    };
  }

  try {
    const blob = await fileToSquareCompressedBlob(avatar.file, {
      maxBytes: 512 * 1024,
      startSize: 512,
      minSize: 256,
    });

    return {
      check: true,
      message: "Image is valid and square.",
      processedFile: blob,
    };
  } catch (error) {
    return {
      check: false,
      message: UI_TEXT.profile.avatar.imageFailed,
    };
  }
};

function createInputComponent({ multiple, accept }) {
  const el = document.createElement("input");
  // set input config
  el.type = "file";
  el.accept = accept;
  el.multiple = multiple;
  // return file input element
  return el;
}

export const useAvatarUpload = (authFetch) => {
  const uploadAvatar = async (file, { bucket, folder = "avatars", userId } = {}) => {
    try {
      const avatarStatus = await checkAvatar({ file, type: file.type, size: file.size });
      
      if (!avatarStatus.check) {
        return { success: false, error: avatarStatus.message };
      }

      const processedFile = avatarStatus.processedFile;
      const fileType = processedFile.type || "image/webp";
      const ext = fileType.split("/")[1] || "webp";
      const fileName = userId ? `${userId}.${ext}` : `${generateUniqueId()}.${ext}`;

      const response = await authFetch("/api/get-presigned-url", {
        method: "POST",
        body: JSON.stringify({
          fileName,
          fileType,
          uploadFolder: folder,
          bucket,
          commandType: "PUT",
        }),
      });

      if (!response.ok) {
        const errMsg = await response.json();
        console.error("Presigned URL error:", errMsg);
        throw new Error(errMsg.error || "Failed to get presigned URL");
      }

      const { url: presignedUrl } = await response.json();
      console.log("Presigned URL obtained:", presignedUrl);

      console.log("Uploading to S3, file size:", processedFile.size, "type:", fileType);
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: processedFile,
      });

      console.log("S3 upload response status:", uploadResponse.status);
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload error:", errorText);
        throw new Error("Failed to upload to S3");
      }

      return {
        success: true,
        url: presignedUrl.split("?")[0],
        fileName,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return uploadAvatar;
};

export const useFileUpload = (authFetch) => {
  const config = {
    folder: "uploads-v2",
    bucket: process.env.AI_BUCKET,
  };
  //const mimeTypes = Object.keys(fileSupport);
  //console.log("CONFIG ", config);
  const [files, setFiles] = useState(null);
  const allowedMimeTypes = useRef(Object.keys(fileSupport));
  const s3Config = useRef(config);

  //console.log("S3 OPTION CONFIG ", s3Config);
  let userCallback = () => {};

  let allowUpload = true;

  // Handle onChange event
  const onChange = async (e) => {
    const parsedFiles = await processFiles(e.target.files);
    const target = e.target;

    // remove event listener after operation
    target.removeEventListener("change", onChange);

    // remove input element after operation
    target.remove();

    console.log("PARSED FILES ", parsedFiles);
    // update files state hook
    setFiles(parsedFiles);
    return userCallback(parsedFiles);

    // user specified callback
  };

  const processFiles = async (fileList) => {
    const parsedFiles = [];

    for (const fileIndex in fileList) {
      if (isNaN(fileIndex)) continue;
      const file = fileList[fileIndex];
      const uuid = generateUniqueId();
      const ext = file.name.split(".").pop() || "txt";
      let url = "";
      console.log("S3 CONFIG WHEN GETTING PRESIGNED URL ", s3Config.current);
      if (s3Config.current?.folder !== "avatars" && allowUpload) {
        // console.log("S3 BUCKET ", s3Config.current.bucket);
        // console.log("S3 FOLDER ", s3Config.current.folder);
        // console.log("S3 FILE NAME ", file.name);
        // console.log("S3 FILE TYPE ", file.type);
        // console.log("S3 FILE EXT ", ext);
        // console.log("S3 FILE UUID ", uuid);
        const response = await authFetch("/api/get-presigned-url", {
          method: "POST",
          body: JSON.stringify({
            fileName: `${uuid}.${ext}`,
            fileType: file.type,
            uploadFolder: s3Config.current.folder,
            bucket: s3Config.current.bucket,
          }),
        });

        if (!response.ok) {
          const errMsg = await response.json();
          throw new Error(errMsg);
        }

        const { url: presignedUrl } = await response.json();
        url = presignedUrl;
      }
      // console.log("MIME TYPE ", allowedMimeTypes.current);
      if (allowedMimeTypes.current.indexOf(file.type) > -1) {
        const parsedFile = {
          source: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file,
          uuid,
          url,
        };
        parsedFiles.push(parsedFile);
      }
    }

    return parsedFiles;
  };

  // Handle upload
  const uploadFile = (
    { accept, multiple, purge, mime, s3Options, files: fileArray, test } = {
      mime: [],
      accept: "",
      multiple: false,
      purge: false,
      s3Options: {},
      files: null,
      test: false,
    },
    cb
  ) => {
    if (typeof cb === "function") {
      userCallback = cb;
    }
    if (test) {
      allowUpload = false;
    }
    if (purge) {
      setFiles(null);
    } else {
      console.log("S3 OPT ", s3Options);
      s3Config.current = s3Options;
      if (s3Options?.folder === "avatars") {
        allowedMimeTypes.current = Object.keys(imageFileSupport);
      }
      if (fileArray) {
        processFiles(fileArray).then((parsedFiles) => {
          setFiles(parsedFiles);
          userCallback(parsedFiles);
        });
      } else {
        // create virtual input element
        console.log("ACCEPT ", accept);
        const inputEL = createInputComponent({ multiple, accept });
        // add event listener
        inputEL.addEventListener("change", onChange);
        inputEL.click();
      }
    }
  };

  // return React.useMemo(() => [files, uploadFile], [files]);
  // should work without useMemo... as it creates other changes..
  return [files, uploadFile];
};
