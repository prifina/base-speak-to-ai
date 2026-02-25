"use client";

import { useMemo, useEffect, useReducer, useCallback, useRef } from "react";
import { Box, Flex, Text, VStack, Button, Select, Portal, createListCollection } from "@chakra-ui/react";
import { buildLanguageOptions } from "@/utils";
import { LANGUAGE_TAGS } from "@/utils/languages";
import { toaster } from "@/components/ui/toaster";
import useStore from "@/lib/sessionStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthFetch } from "@/lib/useAuthFetch";

export default function LanguagesPage() {
  const authFetch = useAuthFetch();
  const { knowledgebaseId } = useStore(
    useShallow((state) => ({
      knowledgebaseId: state.knowledgebaseId,
    }))
  );
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      primaryLanguage: "",
      secondaryLanguages: [],
      browserLanguage: "",
      loading: false,
      originalPrimaryLanguage: "",
      originalSecondaryLanguages: [],
    }
  );

  const languageOptions = useMemo(() => buildLanguageOptions(LANGUAGE_TAGS, "en"), []);
  
  const languageCollection = useMemo(
    () =>
      createListCollection({
        items: languageOptions.map((lang) => ({
          label: lang.name,
          value: lang.tag,
        })),
      }),
    [languageOptions]
  );

  const fetchLanguagePreferences = useCallback(async () => {
    if (!knowledgebaseId) return;
    
    try {
      const res = await authFetch("/api/get-account-localize", {
        method: "POST",
        body: JSON.stringify({ knowledgebaseId }),
      });
      
      const data = await res.json();
      
      if (data?.localize) {
        setState({
          primaryLanguage: data.localize.primaryLanguage || "",
          secondaryLanguages: data.localize.secondaryLanguages || [],
          originalPrimaryLanguage: data.localize.primaryLanguage || "",
          originalSecondaryLanguages: data.localize.secondaryLanguages || [],
        });
      }
    } catch (error) {
      console.error("Error fetching language preferences:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgebaseId]);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !state.browserLanguage) {
      const browserInfo = {
        language: navigator.language || navigator.userLanguage,
        languages: navigator.languages || [],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
      };
      setState({ browserLanguage: browserInfo.language });
    }
  }, [state.browserLanguage]);

  useEffect(() => {
    if (knowledgebaseId && !hasFetched.current) {
      hasFetched.current = true;
      fetchLanguagePreferences();
    }
  }, [knowledgebaseId, fetchLanguagePreferences]);

  const handleSave = async () => {
    if (!knowledgebaseId) {
      toaster.create({
        title: "No knowledgebase ID found",
        type: "error",
      });
      return;
    }

    setState({ loading: true });
    try {
      const browserInfo = typeof window !== "undefined" ? {
        language: navigator.language || navigator.userLanguage,
        languages: navigator.languages || [],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      } : {};

      const localize = {
        primaryLanguage: state.primaryLanguage,
        secondaryLanguages: state.secondaryLanguages,
        browserInfo,
      };

      const res = await authFetch("/api/update-account-localize", {
        method: "POST",
        body: JSON.stringify({ knowledgebaseId, localize }),
      });

      const data = await res.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      toaster.create({
        title: "Language preferences saved",
        type: "success",
      });

      setState({
        originalPrimaryLanguage: state.primaryLanguage,
        originalSecondaryLanguages: state.secondaryLanguages,
      });
    } catch (error) {
      console.error("Error saving language preferences:", error);
      toaster.create({
        title: "Failed to save language preferences",
        type: "error",
      });
    } finally {
      setState({ loading: false });
    }
  };

  return (
    <Flex direction="column" p="28px" maxW="800px">
      <Text fontSize="32px" fontWeight={600} mb="40px">
        Languages
      </Text>

      <VStack align="stretch" gap="40px">
        <Box>
          <Text fontSize="18px" fontWeight={600} color="teal.500" mb="8px">
            Primary Language
          </Text>
          <Text fontSize="14px" color="gray.600" mb="16px">
            Messages from others interacting with your AI Twin in foreign languages will be translated to your primary language.
          </Text>
          <Select.Root
            collection={languageCollection}
            value={state.primaryLanguage ? [state.primaryLanguage] : []}
            onValueChange={(e) => setState({ primaryLanguage: e.value[0] || "" })}
            positioning={{ sameWidth: true }}
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select language" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.ClearTrigger />
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content maxH="300px">
                  {languageCollection.items.map((lang) => (
                    <Select.Item item={lang} key={lang.value}>
                      {lang.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        <Box>
          <Text fontSize="18px" fontWeight={600} color="teal.500" mb="8px">
            Secondary Languages
          </Text>
          <Text fontSize="14px" color="gray.600" mb="16px">
            Languages you understand and don&apos;t want to be translated.
          </Text>
          <Select.Root
            collection={languageCollection}
            value={state.secondaryLanguages}
            onValueChange={(e) => setState({ secondaryLanguages: e.value })}
            positioning={{ sameWidth: true }}
            multiple
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select a language" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.ClearTrigger />
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content maxH="300px">
                  {languageCollection.items.map((lang) => (
                    <Select.Item item={lang} key={lang.value}>
                      {lang.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        <Button
          bg="teal.500"
          color="white"
          onClick={handleSave}
          loading={state.loading}
          width="fit-content"
          _hover={{ bg: "teal.600" }}
          disabled={
            state.primaryLanguage === state.originalPrimaryLanguage &&
            JSON.stringify(state.secondaryLanguages) === JSON.stringify(state.originalSecondaryLanguages)
          }
        >
          Save Changes
        </Button>

        <Box bg="blue.50" p="20px" borderRadius="md">
          <Text fontSize="14px" color="gray.700">
            ℹ️ When people interact with your AI Twin in different languages, their messages are
            automatically translated to your primary language for easy reading in the Insights
            section and in your email reports. Messages in your secondary languages are not
            translated, as there is no need for those. Original language messages are always
            saved alongside any translations.
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
}
