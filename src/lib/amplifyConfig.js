export function getAmplifyConfig() {
  const cfg = {
    Auth: {
      Cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
        signUpVerificationMethod: "code",
      },
    },
    API: {
      GraphQL: {
        endpoint: process.env.GRAPHQL_API || process.env.NEXT_PUBLIC_GRAPHQL_API,
        region: process.env.MY_REGION,
        defaultAuthMode: "userPools",
      },
    },
  };

  return cfg;
}
