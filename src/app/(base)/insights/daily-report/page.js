"use client";

import { useEffect, useContext, useRef, useReducer, useMemo } from "react";
import { Box, Input, Field, Checkbox, VStack, Select, Portal, createListCollection } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { Loading } from "@/components/Loading";
import { UI_TEXT } from "@/lib/uiStrings";
import { isEmail } from "@/utils";
import SaveButton from "@/components/SaveButton";
import { toaster } from "@/components/ui/toaster";

export default function DailyReportPage() {
  const authFetch = useAuthFetch();
  const { loaded: authLoaded } = useContext(AuthContext);
  const { knowledgebaseId } = useStore(
    useShallow((state) => ({
      knowledgebaseId: state.knowledgebaseId,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      saving: false,
      user: {},
      email: "",
      isEmailValid: true,
      dailyReport: false,
      hour30: "00:00",
      initialData: {},
    }
  );

  const timeCollection = useMemo(
    () =>
      createListCollection({
        items: Array.from({ length: 48 }, (_, i) => {
          const hours = Math.floor(i / 2).toString().padStart(2, "0");
          const minutes = i % 2 === 0 ? "00" : "30";
          const time = `${hours}:${minutes}`;
          return { label: time, value: time };
        }),
      }),
    []
  );

  const effectCalled = useRef(false);

  useEffect(() => {
    async function fetchData() {
      const res = await authFetch(
        `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}&opt=EMAIL`,
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
      const initialData = {
        email: data.user.email || "",
        dailyReport: data.user.dailyReport || false,
        hour30: data.user.hour30 || "00:00",
      };
      setState({ 
        loading: false, 
        user: data.user,
        ...initialData,
        initialData,
      });
    }
    if (!effectCalled.current) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authFetch, knowledgebaseId]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setState({
      email: value,
      isEmailValid: value === "" || isEmail(value),
    });
  };

  const hasChanges =
    state.email !== state.initialData.email ||
    state.dailyReport !== state.initialData.dailyReport ||
    state.hour30 !== state.initialData.hour30;

  const handleSave = async () => {
    if (!state.isEmailValid) return;

    setState({ saving: true });
    try {
      const res = await authFetch("/api/update-user", {
        method: "POST",
        body: JSON.stringify({
          ...state.user,
          email: state.email,
          dailyReport: state.dailyReport,
          hour30: state.hour30,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      const newData = {
        email: state.email,
        dailyReport: state.dailyReport,
        hour30: state.hour30,
      };
      setState({ saving: false, initialData: newData });
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

  const loading = !authLoaded || state.loading;

  if (loading) {
    return <Loading />;
  }

  return (
    <VStack align="stretch" gap="6">
      <Field.Root invalid={!state.isEmailValid}>
        <Field.Label>{UI_TEXT.insights.reports.emailPrompt}</Field.Label>
        <Input
          value={state.email}
          onChange={handleEmailChange}
          placeholder="email@example.com"
          variant="flushed"
        />
        {!state.isEmailValid && (
          <Field.ErrorText>{UI_TEXT.insights.reports.invalidEmail}</Field.ErrorText>
        )}
      </Field.Root>

      <Checkbox.Root
        checked={state.dailyReport}
        onCheckedChange={(e) => setState({ dailyReport: !!e.checked })}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>{UI_TEXT.insights.reports.active}</Checkbox.Label>
      </Checkbox.Root>

      <Select.Root
        collection={timeCollection}
        value={[state.hour30]}
        onValueChange={(e) => setState({ hour30: e.value[0] })}
        disabled={!state.dailyReport}
        maxW="200px"
        size="sm"
      >
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content maxH="300px">
              {timeCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Box mt="20px">
        <SaveButton
          onClick={handleSave}
          loading={state.saving}
          disabled={state.saving || !hasChanges || !state.isEmailValid}
        />
      </Box>
    </VStack>
  );
}
