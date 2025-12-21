export function getAmplifyConfig() {
  const cfg = {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID, // optional
        signUpVerificationMethod: "code",
      },
    },
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_API,
        region: process.env.MY_REGION,
        // IMPORTANT: use 'userPools' (plural) in v6 Next.js server flows
        defaultAuthMode: "userPools",
      },
    },
  };

  // basic sanity checks
  if (!cfg.Auth.Cognito.userPoolId || !cfg.Auth.Cognito.userPoolClientId) {
    throw new Error("Missing Cognito env vars");
  }
  if (!cfg.API.GraphQL.endpoint || !cfg.API.GraphQL.region) {
    throw new Error("Missing GraphQL env vars");
  }

  return cfg;
}
