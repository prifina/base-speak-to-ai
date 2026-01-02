import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

function ensureConfigured() {
  // Guard against build-time execution
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
  
  if (isBuildTime) {
    console.warn("Amplify configuration skipped during build time");
    return;
  }

  const endpoint = process.env.GRAPHQL_API || process.env.NEXT_PUBLIC_GRAPHQL_API;
  const region = process.env.MY_REGION;
  const accessKey = process.env.MY_ACCESS_KEY;
  const secretKey = process.env.MY_SECRET_KEY;

  console.log("[Amplify-Config] Configuring with:", {
    endpoint: endpoint ? endpoint.substring(0, 50) + '...' : 'missing',
    region,
    hasAccessKey: !!accessKey,
    hasSecretKey: !!secretKey
  });

  Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint,
          region,
          defaultAuthMode: "iam",
        },
      },
    },
    {
      Auth: {
        credentialsProvider: {
          getCredentialsAndIdentityId: async () => ({
            credentials: {
              accessKeyId: accessKey,
              secretAccessKey: secretKey,
            },
          }),
          clearCredentialsAndIdentityId: () => {},
        },
      },
    }
  );
}

export const graphqlRequestIAM = async ({ query, variables = {} }) => {
  // Debug environment variables
  console.log("[GraphQL-IAM] Environment check:", {
    GRAPHQL_API: !!process.env.GRAPHQL_API,
    NEXT_PUBLIC_GRAPHQL_API: !!process.env.NEXT_PUBLIC_GRAPHQL_API,
    MY_REGION: !!process.env.MY_REGION,
    MY_ACCESS_KEY: !!process.env.MY_ACCESS_KEY,
    MY_SECRET_KEY: !!process.env.MY_SECRET_KEY
  });

  // Guard against build-time execution
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
  
  if (isBuildTime) {
    console.warn("GraphQL IAM request skipped during build time");
    return null;
  }

  // Check if required env vars are available
  const endpoint = process.env.GRAPHQL_API || process.env.NEXT_PUBLIC_GRAPHQL_API;
  const region = process.env.MY_REGION;
  const accessKey = process.env.MY_ACCESS_KEY;
  const secretKey = process.env.MY_SECRET_KEY;

  if (!endpoint || !region || !accessKey || !secretKey) {
    console.error("[GraphQL-IAM] Missing required environment variables:", {
      endpoint: !!endpoint,
      region: !!region,
      accessKey: !!accessKey,
      secretKey: !!secretKey
    });
    throw new Error("Missing required environment variables for GraphQL IAM");
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
