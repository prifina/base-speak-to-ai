import { createCheckLoginHandler } from "@prifina-dev/auth-components";
import { graphqlRequestIAM } from "@/utils/graphqlRequestIAM";

export const GET = createCheckLoginHandler({
  graphqlRequestIAM,
});
