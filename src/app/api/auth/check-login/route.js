import { createCheckLoginHandler } from "@prifina-dev/auth-components";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export const GET = createCheckLoginHandler({
  graphqlRequestIAM,
});
