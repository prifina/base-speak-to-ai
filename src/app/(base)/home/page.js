"use client";

import {
  useEffect,
  useState,
  useContext,
  useRef,
  useReducer,
  use,
} from "react";
import {
  Box,
  HStack,
  Text,
  Link,
  IconButton,
  VStack,
  Flex,
  Input,
  Field,
} from "@chakra-ui/react";
import { MdOutlineQrCode2 } from "react-icons/md";
import { UI_TEXT } from "@/lib/uiStrings";
import { AuthContext } from "@/app/providers/AuthProvider";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";

import { toaster } from "@/components/ui/toaster";
import { Loading } from "@/components/Loading";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AvatarComponent } from "@/components/AvatarComponent";
import { LabelInput } from "@/components/LabelInput";
import CustomTextArea from "@/components/CustomTextArea";
import BehaviorSection from "@/components/BehaviorSection";

const visibleDescriptionMaxLength = 100;

export default function HomePage() {
  const authFetch = useAuthFetch();
  const [isMobile] = useMediaQuery("(max-width: 992px)");
  console.log("IS MOBILE ", isMobile);
  const { user, loaded: authLoaded } = useContext(AuthContext);

  const { cognitoId, knowledgebaseId, language } = useStore(
    useShallow((state) => ({
      cognitoId: state.cognitoId,
      knowledgebaseId: state.knowledgebaseId,
      language: state.language,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      user: {},
      editedUser: {},
    }
  );

  const effectCalled = useRef(false);

  useEffect(() => {
    async function fetchData() {
      const res = await authFetch(
        `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}`,
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
      setState({ loading: false, user: data.user, editedUser: data.user });
    }
    if (!effectCalled.current) {
      fetchData();
      effectCalled.current = true;
    }
  }, [cognitoId, authFetch, knowledgebaseId]);

  const loading = !authLoaded || state.loading;

  if (loading) {
    return <Loading />;
  }

  const changeProfileAvatar = () => {
    /*  setAvatarFiles(
      {
        multiple: false,
        accept: "image/png,image/jpeg,image/jpg",
        s3Options: { folder: "avatars", bucket: process.env.SPEAK_TO_CDN },
      },
      (avatars) => {
        // setImageButtonLoading(true);
        console.log("AVATAR ", avatars);
        checkAvatar(avatars[0]).then((avatarStatus) => {
          console.log("AVATAR STATUS ", avatarStatus);
          if (!avatarStatus.check) {
            toast({
              title: "Invalid avatar size",
              status: "error",
              description: avatarStatus.message,
            });
          } else {
            console.log("AVATAR UPLOAD OK");
            avatars.map(async ({ source, name, size, file }) => {
              console.log({ source, name, size, file });
              changeAvatar({ source, name, size, file, toast });
            });
          }
        });
      }
    ); */
  };

  const inputOnChange = (e) => {
    setState({
      editedUser: {
        ...state.editedUser,
        [e.target.name]: e.target.value,
      },
    });
  };
  return (
    <Flex direction="column" h="100%" p="28px">
      {state.user?.userId && (
        <HStack justify="space-between" mb="20px">
          <Box>
            <Box fontSize="24px" fontWeight={600}>
              <Link
                href={`${process.env.NEXT_PUBLIC_SPEAK_TO_USER}/${state.user.userId}`}
                target="_blank"
              >
                <Text>{UI_TEXT.profile.aiTwin}</Text>
                <Text
                  textDecoration="underline"
                  fontSize="initial"
                  fontWeight="normal"
                >{`${process.env.NEXT_PUBLIC_SPEAK_TO_USER}/${state.user.userId}`}</Text>
              </Link>
            </Box>
          </Box>
          <Box mr={cognitoId && cognitoId !== "" ? "80px" : "65px"}>
            {!isMobile && (
              <Box cursor="pointer">
                <MdOutlineQrCode2 size="40px" />
              </Box>
            )}
          </Box>
        </HStack>
      )}

      <Box mt="20px">
        <AvatarComponent
          avatar={state.user.avatar}
          changeImage={changeProfileAvatar}
          aiIcon={state.user.addBadge || true}
        />
      </Box>

      <Box mt="20px">
        <LabelInput
          label={UI_TEXT.profile.nameLabel}
          value={state.editedUser.title}
          name="title"
          onChange={inputOnChange}
          placeholder={UI_TEXT.profile.namePlaceholder}
        />
      </Box>
      <CustomTextArea
        label={UI_TEXT.profile.visibleDescription}
        maxLength={visibleDescriptionMaxLength}
        resize={"none"}
        name="caption"
        value={state.editedUser.caption || ""}
        onChange={inputOnChange}
        onDefault={() => {
          setState({
            editedUser: {
              ...state.editedUser,
              caption: "Amplifying expertise in digital marketing & strategy",
            },
          });
        }}
        placeholder={UI_TEXT.profile.descriptionPlaceholder}
      />

      <BehaviorSection
        profileTempState={state.editedUser}
        updateProfileTempState={(obj) => {
          // console.log("UPDATE PROFILE TEMP STATE", obj);
          setState({
            editedUser: {
              ...state.editedUser,
              ...obj,
            },
          });
        }}
        opts={{ language }}
      />
      <Box>
        <VStack align="flex-start" spacing={3}>
          {user && (
            <Box mt={4}>
              <Text fontWeight="bold">Client-side AuthContext:</Text>
              <Text fontSize="sm" color="gray.600">
                AuthContext username: {user.username}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}
