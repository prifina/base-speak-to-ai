"use client";

import {
  Dialog,
  VStack,
  Field,
  Input,
  Textarea,
  HStack,
  Button,
} from "@chakra-ui/react";
import { UI_TEXT } from "@/lib/uiStrings";

export default function ProfileCreationModal({
  isOpen,
  profileData,
  onProfileDataChange,
  validatingAiName,
  aiNameValidated,
  onValidateAiName,
  onCreateProfile,
  saving,
  validateAiName,
}) {
  return (
    <Dialog.Root open={isOpen} trapFocus preventScroll>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{UI_TEXT.profile.dialog.title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack spacing={4} align="stretch">
              <Field.Root
                required
                invalid={
                  !validateAiName(profileData.aiName) &&
                  profileData.aiName.length > 0
                }
              >
                <Field.Label>
                  {UI_TEXT.profile.dialog.aiNameLabel}
                  <Field.RequiredIndicator />
                </Field.Label>
                <HStack spacing={2}>
                  <Input
                    value={profileData.aiName}
                    onChange={(e) =>
                      onProfileDataChange({
                        aiName: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder={UI_TEXT.profile.dialog.aiNamePlaceholder}
                    flex={1}
                  />
                  <Button
                    size="sm"
                    onClick={onValidateAiName}
                    loading={validatingAiName}
                    disabled={!validateAiName(profileData.aiName)}
                  >
                    {UI_TEXT.profile.dialog.validateButton}
                  </Button>
                </HStack>
                <Field.HelperText>
                  {!validateAiName(profileData.aiName) &&
                  profileData.aiName.length > 0
                    ? UI_TEXT.profile.dialog.aiNameInvalid
                    : UI_TEXT.profile.dialog.aiNameHelper}
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>{UI_TEXT.profile.nameLabel}</Field.Label>
                <Input
                  value={profileData.title}
                  onChange={(e) =>
                    onProfileDataChange({
                      title: e.target.value,
                    })
                  }
                  placeholder={UI_TEXT.profile.namePlaceholder}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{UI_TEXT.profile.visibleDescription}</Field.Label>
                <Textarea
                  value={profileData.caption}
                  onChange={(e) =>
                    onProfileDataChange({
                      caption: e.target.value,
                    })
                  }
                  placeholder={UI_TEXT.profile.descriptionPlaceholder}
                  rows={3}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{UI_TEXT.profile.dialog.useCaseLabel}</Field.Label>
                <Textarea
                  value={profileData.useCase}
                  onChange={(e) =>
                    onProfileDataChange({
                      useCase: e.target.value,
                    })
                  }
                  placeholder={UI_TEXT.profile.dialog.useCasePlaceholder}
                  rows={3}
                />
              </Field.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              onClick={onCreateProfile}
              loading={saving}
              disabled={
                !validateAiName(profileData.aiName) || !aiNameValidated
              }
            >
              {UI_TEXT.profile.dialog.createButton}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}