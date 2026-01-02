import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

function ensureConfigured() {
  // Guard against build-time execution
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
  
  if (isBuildTime) {
    console.warn("Amplify configuration skipped during build time");
    return;
  }

  Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint: process.env.NEXT_PUBLIC_GRAPHQL_API,
          region: process.env.MY_REGION,
          defaultAuthMode: "iam",
        },
      },
    },
    {
      Auth: {
        credentialsProvider: {
          getCredentialsAndIdentityId: async () => ({
            credentials: {
              accessKeyId: process.env.MY_ACCESS_KEY,
              secretAccessKey: process.env.MY_SECRET_KEY,
            },
          }),
          clearCredentialsAndIdentityId: () => {},
        },
      },
    }
  );
}

export const graphqlRequestIAM = async ({ query, variables = {} }) => {
  // Guard against build-time execution
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
  
  if (isBuildTime) {
    console.warn("GraphQL IAM request skipped during build time");
    return null;
  }

  ensureConfigured();
  const client = generateClient({ authMode: "iam" });

  const { data, errors } = await client.graphql({
    query,
    variables,
  });

  if (errors && errors.length) {
    console.error("GraphQL errors:", errors);
  }

  return data;
};
