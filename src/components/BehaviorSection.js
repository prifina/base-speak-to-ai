import { useEffect, useRef, useReducer } from "react";
import {
  Flex,
  Text,
  Box,
  Link,
  HStack,
} from "@chakra-ui/react";
import { UI_TEXT } from "@/lib/uiStrings";
import { EVALS } from "@/lib/appConfig";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { SelectField } from "@/components/SelectField";

const BehaviorSection = ({
  profileTempState,
  updateProfileTempState,
  opts,
  config = {},
}) => {
  const {
    responsePerspective,
    interactionStyle,
    responseLength,
    followUpEncouragement,
  } = profileTempState;

  const authFetch = useAuthFetch();
  // add translation timestamp logic later
  const { language } = opts;

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      responsePerspectiveOptions: config.responsePerspectiveList || [],
      interactionStyleOptions: config.interactionStyleList || [],
      responseLengthOptions: config.responseLengthList || [],
      followUpEncouragementOptions: config.followUpEncouragementList || [],
    }
  );
  const effectCalled = useRef(false);

  const updateState = (attr, value) => {
    updateProfileTempState({ [attr]: value === null ? "" : value.value });
  };
  useEffect(() => {
    if (!effectCalled.current && Object.keys(config).length === 0) {
      effectCalled.current = true;
      (async () => {
        try {
          const res = await authFetch(`/api/get-config?language=${language}`, {
            method: "GET",
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.log("ERROR RES ", errorData);
            throw new Error("Failed to get appsync response");
          }
          const data = await res.json();
          console.log("RES ", data);
          setState({
            responsePerspectiveOptions: data.config.responsePerspectiveList,
            interactionStyleOptions: data.config.interactionStyleList,
            responseLengthOptions: data.config.responseLengthList,
            followUpEncouragementOptions: data.config.followUpEncouragementList,
          });
        } catch (err) {
          console.error("Failed to load config", err);
        }
      })();
    }
  }, [authFetch, language, config]);

  return (
    <Flex flexDirection="column" gap="40px">
      <Box>
        {}
        <HStack>
          <Text textStyle="fieldLabel">
            {UI_TEXT.personalization.behavior.sectionTitle}
          </Text>
          <Link
            href={EVALS.newInteractionStyleRequest}
            target="_blank"
            variant={"underline"}
          >
            <Text textDecoration="underline">
              New Interaction Style Request
            </Text>
          </Link>
        </HStack>
      </Box>
      <Box mr={"20px"} mb={"90px"}>
        <SelectField
          title={UI_TEXT.personalization.behavior.responsePerspective.title}
          description={
            UI_TEXT.personalization.behavior.responsePerspective.description
          }
          options={state.responsePerspectiveOptions}
          value={responsePerspective}
          onChange={(value) => updateState("responsePerspective", value)}
        />
        <SelectField
          isClearable={true}
          title={UI_TEXT.personalization.behavior.interactionStyle.title}
          description={
            UI_TEXT.personalization.behavior.interactionStyle.description
          }
          options={state.interactionStyleOptions}
          value={interactionStyle}
          onChange={(value) => updateState("interactionStyle", value)}
        />
        <SelectField
          isClearable={true}
          title={UI_TEXT.personalization.behavior.defaultResponseLength.title}
          description={
            UI_TEXT.personalization.behavior.defaultResponseLength.description
          }
          options={state.responseLengthOptions}
          value={responseLength}
          onChange={(value) => updateState("responseLength", value)}
        />
        <SelectField
          isClearable={true}
          title={UI_TEXT.personalization.behavior.followUp.title}
          description={UI_TEXT.personalization.behavior.followUp.description}
          options={state.followUpEncouragementOptions}
          value={followUpEncouragement}
          onChange={(value) => updateState("followUpEncouragement", value)}
        />
        {}
      </Box>
    </Flex>
  );
};

export default BehaviorSection;
