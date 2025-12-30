import { create } from "zustand";

import {
  autoSignIn,
  confirmSignIn,
  confirmSignUp,
  confirmUserAttribute,
  fetchAuthSession,
  sendUserAttributeVerificationCode,
  signIn,
  signOut,
  signUp,
  updateUserAttributes,
} from "aws-amplify/auth";

import { configureAmplify } from "./amplify";
import { checkLng } from "@/utils";

// Configure Amplify on store initialization
configureAmplify();

const usePersistentStore = create((set, get) => {
  const initialState = {
    isAuthenticated: false,
    cognitoId: "",
    idToken: {},
    jwtIdToken: "",
    groups: [],
    activeGroup: "",
    isSuper: false,
    isAdmin: [],
    loginName: "",
    knowledgebaseId: "",
    language: checkLng(),
    socketUpdate: {},
    connectionId: "",
    queueStatus: undefined,
    setLoginName: (name) => {
      set({ loginName: name });
    },
    setKnowledgebaseId: (id) => {
      set({ knowledgebaseId: id });
    },
    getJWTIdToken: () => {
      return get().jwtIdToken;
    },
    getActiveGroup: () => {
      if (typeof window !== "undefined") {
        return (
          localStorage.getItem("prifina-base-network") || get().activeGroup
        );
      }
      return get().activeGroup;
    },
    setActiveGroup: (group) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("prifina-base-network", group);
      }
      set({ activeGroup: group });
    },
    signIn: async (username) => {
      console.log("SIGNIN ", username);
      try {
        const { nextStep } = await signIn({
          username,
          options: {
            authFlowType: "CUSTOM_WITHOUT_SRP",
          },
        });

        // handleSignInNextSteps(output);
        console.log("SIGNIN ", nextStep);
        // should be this signInStep ==="CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
        if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE") {
          return Promise.resolve(true);
        }
      } catch (error) {
        console.log(error);
        await signOut();
      }

      return Promise.resolve(false);
    },
    confirmSignIn: async (code) => {
      console.log(code);
      try {
        // to send the answer of the custom challenge
        const { nextStep, ...rest } = await confirmSignIn({
          challengeResponse: code,
          options: {
            clientMetadata: {
              flow: "base-otp",
              loginName: get().loginName,

              // any non-sensitive routing hint
            },
          },
        });
        // console.log(nextStep, rest);
        //{isSignedIn: true,nextStep: {signInStep: "DONE"}}
        if (nextStep.signInStep === "DONE") {
          // set({ isAuthenticated: true });
          await get().isLoggedIn();
          return Promise.resolve(true);
        }
      } catch (err) {
        console.log(err);
      }
      return Promise.resolve(false);
    },
    isLoggedIn: async () => {
      try {
        // const session = await currentSession()
        const { tokens } = await fetchAuthSession({ forceRefresh: true });
        if (!tokens) {
          set({
            isAuthenticated: false,
            idToken: "",
            cognitoId: "",
            knowledgebaseId: "",
            loginName: "",
          });
          // set({ user: initUser });
          return Promise.resolve(false);
        }
        console.log("TOKENS ", tokens);
        // const jwtIdToken = tokens.idToken;
        //const jwtIdToken = tokens.idToken.toString();
        const idToken = tokens.idToken.payload;
        console.log("ID TOKEN ", idToken);
        let activeGroup = get().getActiveGroup();
        //console.log("STORE ACTIVE GROUP START", activeGroup);

        const isSuper = idToken?.["cognito:groups"]?.includes("super") || false;
        const isAdmin =
          idToken?.["cognito:groups"]?.filter((m) => m.startsWith("admin_")) ||
          [];
        if (
          activeGroup !== "" &&
          !(idToken?.["cognito:groups"]?.includes(activeGroup) || false)
        ) {
          activeGroup = isSuper
            ? "super"
            : isAdmin.length > 0
            ? isAdmin[0]
            : "";
        }
        if (activeGroup === "") {
          activeGroup = isSuper
            ? "super"
            : isAdmin.length > 0
            ? isAdmin[0]
            : "";
        }

        console.log("STORE ACTIVE GROUP END ", activeGroup);
        //const authStatus = activeGroup === "" ? false : true;

        set({
          isSuper,
          isAdmin,
          cognitoId: idToken["cognito:username"],
          knowledgebaseId: idToken["custom:knowledgebaseId"] || "",
          //isAuthenticated: authStatus,
          //idToken: idToken,
          //jwtIdToken,
          groups: idToken?.["cognito:groups"] || [],
          activeGroup,
        });
        /*   const currentUser = {
            id: idToken["cognito:username"],
            email: idToken["email"],
            firstName: idToken["given_name"],
            lastName: idToken["family_name"],
            username: idToken["preferred_username"],
            email_verified: idToken["email_verified"],
          };
          const prevUser = get().user;
          set({ user: { ...prevUser, ...currentUser } });
          await get().setCSFRToken(); */
        return Promise.resolve(true);
      } catch (e) {
        if (typeof e === "string" && e === "No current user") {
          console.log("SESSION EXPIRED OR NOT FOUND...");
          return Promise.resolve(false);
        }
        console.log("ERROR ...", e);
        return Promise.resolve(false);
      }
    },
    usernameAvailable: async (username) => {
      /* 
    Uncheck this in cognito app client integration...
    Prevent user existence errors
    Info
    Amazon Cognito authentication APIs return a generic authentication failure response, indicating either the user name or password is incorrect, instead of indicating that the user was not found.
    */
      // adapted from @herri16's solution: https://github.com/aws-amplify/amplify-js/issues/1067#issuecomment-436492775
      /* await confirmSignUp({
          username,
          confirmationCode
        });
       */ /* 
                                                                                                                                                                                  , {
                                                                                                                                                                                    // If set to False, the API will throw an AliasExistsException error if the phone number/email used already exists as an alias with a different user
                                                                                                                                                                                    // forceAliasCreation: false
                                                                                                                                                                                  } */
      try {
        await confirmSignUp({
          username,
          confirmationCode: "000000",
          forceAliasCreation: false,
        });
        // this should always throw an error of some kind, but if for some reason this succeeds then the user probably exists.
        return false;
      } catch (err) {
        /*  console.log(err);
             console.log(err.message);
             console.log(err.code);
             console.log(Object.keys(err));
             console.log(err.name)
      */
        switch (err.name) {
          case "UserNotFoundException":
            return true;
          case "NotAuthorizedException":
            return false;
          case "AliasExistsException":
            // Email alias already exists
            return false;
          case "CodeMismatchException":
            return false;
          case "ExpiredCodeException":
            return false;
          default:
            return false;
        }
      }
    },
    setQueueStatus: (obj) => {
      set(() => ({ queueStatus: obj }));
    },
    setConnectionId: (str) => {
      set(() => ({ connectionId: str }));
    },

    setSocketUpdate: (obj) => {
      set(() => ({ socketUpdate: obj }));
    },
  };

  // Function to save the state to sessionStorage
  const saveState = (state) => {
    if (typeof window !== "undefined") {
      const {
        signIn,
        confirmSignIn,
        isLoggedIn,
        usernameAvailable,
        setLoginName,
        getJWTIdToken,
        getActiveGroup,
        setActiveGroup,
        setKnowledgebaseId,
        setSocketUpdate,
        setConnectionId,
        setQueueStatus,
        ...stateToSave
      } = state;
      sessionStorage.setItem("prifina-base", JSON.stringify(stateToSave));
    }
  };

  // Initialize state with sessionStorage or initialState
  let savedState = initialState;
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("prifina-base");
    if (stored) {
      savedState = { ...initialState, ...JSON.parse(stored) };
    }
  }

  return savedState;
});

// Subscribe to store changes to save to sessionStorage
if (typeof window !== "undefined") {
  usePersistentStore.subscribe((state) => {
    const {
      signIn,
      confirmSignIn,
      isLoggedIn,
      usernameAvailable,
      setLoginName,
      getJWTIdToken,
      getActiveGroup,
      setActiveGroup,
      setKnowledgebaseId,
      ...stateToSave
    } = state;
    sessionStorage.setItem("prifina-base", JSON.stringify(stateToSave));
  });
}

export default usePersistentStore;
