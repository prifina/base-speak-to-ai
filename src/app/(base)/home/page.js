"use client";

import {
  useEffect,
  useState,
  useContext,
  useRef,
  useReducer,
  Suspense,
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
  Accordion,
  useDisclosure,
  Dialog,
  Button,
  Textarea,
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
import ExampleSection from "@/components/ExampleSection";
import PersonalizationAccordionItem from "@/components/PersonalizationAccordionItem";
import FooterSection from "@/components/FooterSection";
import SaveButton from "@/components/SaveButton";
import SharingModal from "@/components/Modals/Sharing";
import ProfileCreationModal from "@/components/Modals/ProfileCreation";

import { updateKnowledgebaseId } from "@/lib/userAttributes";
import { useAvatarUpload } from "@/lib/useFileUpload";

const visibleDescriptionMaxLength = 100;

// Profile creation dialog component

export default function HomePage() {
  const authFetch = useAuthFetch();
  const [isMobile] = useMediaQuery("(max-width: 992px)");
  // console.log("IS MOBILE ", isMobile);
  const { user, loaded: authLoaded } = useContext(AuthContext);

  const { cognitoId, knowledgebaseId, language, setUserStatus, activeGroup, setKnowledgebaseId } = useStore(
    useShallow((state) => ({
      cognitoId: state.cognitoId,
      knowledgebaseId: state.knowledgebaseId,
      language: state.language,
      setUserStatus: state.setUserStatus,
      activeGroup: state.getActiveGroup(),
      setKnowledgebaseId: state.setKnowledgebaseId,
    }))
  );

  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const uploadAvatar = useAvatarUpload(authFetch);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      saving: false,
      user: {},
      editedUser: {},
      profileData: {
        title: "",
        caption: "",
        useCase: "",
        aiName: "",
      },
      validatingAiName: false,
      aiNameValidated: false,
    }
  );

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const effectCalled = useRef(false);

  useEffect(() => {
    async function fetchData() {
      console.log(
        "[HOME] Fetching data with knowledgebaseId:",
        knowledgebaseId
      );
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
      // Update userStatus in sessionStore
      console.log("[HOME] Setting userStatus to:", data.user?.status);
      setUserStatus(data.user?.status);
      setState({ loading: false, user: data.user, editedUser: data.user });
    }
    console.log(
      "[HOME] Effect check - authLoaded:",
      authLoaded,
      "knowledgebaseId:",
      knowledgebaseId,
      "effectCalled:",
      effectCalled.current
    );
    if (!effectCalled.current && authLoaded) {
      if (!knowledgebaseId) {
        // Show profile creation dialog
        setShowProfileDialog(true);
        setState({ loading: false });
      } else {
        fetchData();
      }
      effectCalled.current = true;
    }
  }, [cognitoId, authFetch, knowledgebaseId, authLoaded, setUserStatus]);

  const loading = !authLoaded || state.loading;

  if (loading) {
    return <Loading />;
  }

  const changeProfileAvatar = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/jpg,image/webp";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await uploadAvatar(file, {
        bucket: process.env.SPEAK_TO_CDN,
        folder: "avatars",
        userId: state.user.userId,
      });

      if (!result.success) {
        toaster.create({
          title: "Invalid avatar",
          type: "error",
          description: result.error,
        });
      } else {
        console.log("AVATAR UPLOADED", result.url);
        const fileExtension = result.fileName.split(".").pop();
        setState({
          editedUser: {
            ...state.editedUser,
            avatar: result.url,
            avatarKey: `avatars/${result.fileName}`,
            mimeType: `image/${fileExtension}`,
          },
        });
        toaster.create({
          title: "Avatar uploaded",
          type: "success",
          description: "Your avatar has been updated successfully",
        });
      }
    };

    input.click();
  };

  const inputOnChange = (e) => {
    setState({
      editedUser: {
        ...state.editedUser,
        [e.target.name]: e.target.value,
      },
    });
  };

  const hasChanges =
    JSON.stringify(state.user) !== JSON.stringify(state.editedUser);

  const handleSave = async () => {
    setState({ saving: true });
    try {
      const res = await authFetch("/api/update-user", {
        method: "POST",
        body: JSON.stringify(state.editedUser),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      setState({ user: state.editedUser, saving: false });
      toaster.create({
        title: "Changes saved",
        type: "success",
      });
    } catch (error) {
      console.error("Save error:", error);
      setState({ saving: false });
      toaster.create({
        title: "Failed to save changes",
        type: "error",
      });
    }
  };

  const validateAiName = (aiName) => {
    const regex = /^[a-z0-9\-\_\.~]+$/;
    const hyphenIndex = aiName.indexOf("-");
    return (
      aiName.length >= 4 &&
      regex.test(aiName) &&
      aiName.includes("-") &&
      hyphenIndex > 0 &&
      hyphenIndex < aiName.length - 1
    );
  };

  const handleValidateAiName = async () => {
    setState({ validatingAiName: true });
    try {
      const res = await authFetch(
        `/api/validate-ai-name?aiName=${state.profileData.aiName}`,
        {
          method: "GET",
        }
      );

      if (res.status === 404) {
        // AI name is available (not found)
        setState({ validatingAiName: false, aiNameValidated: true });
        toaster.create({
          title: "AI name is available",
          type: "success",
        });
      } else {
        // AI name already exists
        setState({ validatingAiName: false, aiNameValidated: false });
        toaster.create({
          title: "AI name is not available",
          type: "error",
        });
      }
    } catch (error) {
      console.error("AI name validation error:", error);
      setState({ validatingAiName: false, aiNameValidated: false });
      toaster.create({
        title: "Error checking AI name availability",
        type: "error",
      });
    }
  };

  const handleCreateProfile = async () => {
    setState({ saving: true });
    try {
      const { v4: uuidv4 } = await import('uuid');
      const knowledgebaseId = uuidv4();
      const networkId = activeGroup || "x_prifina";
      
      const profilePayload = {
        userId: state.profileData.aiName,
        ownerId: cognitoId,
        knowledgebaseId,
        networkId,
        title: state.profileData.title || "",
        caption: state.profileData.caption || "",
        useCase: state.profileData.useCase || "",
        verifiedEmail: user?.email || "",
      };

      const res = await authFetch("/api/add-new-twin", {
        method: "POST",
        body: JSON.stringify(profilePayload),
      });

      if (!res.ok) {
        throw new Error("Failed to create profile");
      }

      // Update Cognito user attribute
      await updateKnowledgebaseId(knowledgebaseId);
      
      // Update sessionStore knowledgebaseId
      setKnowledgebaseId(knowledgebaseId);

      setShowProfileDialog(false);
      setState({ saving: false });
      
      // Refresh the page to load the new profile
      window.location.reload();

      toaster.create({
        title: "Profile created",
        type: "success",
      });
    } catch (error) {
      console.error("Profile creation error:", error);
      setState({ saving: false });
      toaster.create({
        title: "Failed to create profile",
        type: "error",
      });
    }
  };
  return (
    <Flex direction="column" p="28px">
      <ProfileCreationModal
        isOpen={showProfileDialog}
        profileData={state.profileData}
        onProfileDataChange={(updates) =>
          setState({
            profileData: {
              ...state.profileData,
              ...updates,
            },
            aiNameValidated: updates.aiName ? false : state.aiNameValidated,
          })
        }
        validatingAiName={state.validatingAiName}
        aiNameValidated={state.aiNameValidated}
        onValidateAiName={handleValidateAiName}
        onCreateProfile={handleCreateProfile}
        saving={state.saving}
        validateAiName={validateAiName}
      />

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
              <Box cursor="pointer" onClick={onOpen}>
                <MdOutlineQrCode2 size="40px" />
              </Box>
            )}
          </Box>
        </HStack>
      )}

      {isOpen && (
        <Suspense>
          <SharingModal
            isOpen={isOpen}
            onClose={onClose}
            url={`${process.env.NEXT_PUBLIC_SPEAK_TO_USER}/${state.user.userId}`}
          />
        </Suspense>
      )}

      <Box mt="40px">
        <AvatarComponent
          avatar={state.editedUser.avatar}
          changeImage={changeProfileAvatar}
          aiIcon={state.user.addBadge || true}
        />
      </Box>

      <Box mt="40px">
        <LabelInput
          label={UI_TEXT.profile.nameLabel}
          value={state.editedUser.title}
          name="title"
          onChange={inputOnChange}
          placeholder={UI_TEXT.profile.namePlaceholder}
        />
      </Box>
      <Box mt="20px">
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
      </Box>
      <Box mt="20px">
        <Text fontWeight={600} fontSize={"20px"}>
          {UI_TEXT.personalization.sectionTitle}
        </Text>
        <Box
          width={"100%"}
          height={"1px"}
          mb={"30px"}
          backgroundColor={"#CBCBCB"}
        />
      </Box>
      <Box>
        <Accordion.Root multiple>
          <PersonalizationAccordionItem
            title={UI_TEXT.personalization.disclaimerAndExamples.title}
          >
            <ExampleSection
              profileTempState={state.editedUser}
              updateProfileTempState={(obj) => {
                console.log("UPDATE PROFILE TEMP STATE", obj);
                setState({
                  editedUser: {
                    ...state.editedUser,
                    ...obj,
                  },
                });
              }}
              opts={{ language }}
            />
          </PersonalizationAccordionItem>
          <PersonalizationAccordionItem
            title={UI_TEXT.personalization.behavior.title}
          >
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
          </PersonalizationAccordionItem>
          <PersonalizationAccordionItem
            title={UI_TEXT.personalization.footer.title}
          >
            <FooterSection
              profileTempState={state.editedUser}
              updateProfileTempState={(obj) => {
                console.log("UPDATE PROFILE TEMP STATE", obj);
                setState({
                  editedUser: {
                    ...state.editedUser,
                    ...obj,
                  },
                });
              }}
            />
          </PersonalizationAccordionItem>
        </Accordion.Root>
      </Box>
      <Box mt="40px">
        <SaveButton
          onClick={handleSave}
          loading={state.saving}
          disabled={state.saving || !hasChanges}
        />
      </Box>
    </Flex>
  );
}
