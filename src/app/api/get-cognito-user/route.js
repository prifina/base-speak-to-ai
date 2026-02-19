import { createGetCognitoUserHandler } from "@prifina-dev/auth-components";
import { graphqlRequestIAM } from "@/utils/graphqlRequestIAM";

export const GET = createGetCognitoUserHandler({
  graphqlRequestIAM,
});
