import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

function ensureConfigured() {
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
