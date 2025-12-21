// src/lib/graphqlRequestUserPool.js
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { cookies } from "next/headers";
import { getAmplifyConfig } from "@/lib/amplifyConfig"; // the JS config object you created
import { verifyJwtFromCognito } from "@/lib/auth-helpers";

const client = generateServerClientUsingCookies({
  config: getAmplifyConfig(),
  cookies,
});
export function extractGraphQLErrorsFromAny(errOrResult) {
  const errs =
    (errOrResult && Array.isArray(errOrResult.errors) && errOrResult.errors) ||
    (errOrResult?.data &&
      Array.isArray(errOrResult.data.errors) &&
      errOrResult.data.errors) ||
    [];

  return errs.map((e) => ({
    message: e.message || String(e),
    errorType:
      e.errorType || e.validationErrorType || e.extensions?.code || null,
    path: e.path || null,
  }));
}
export function getHttpStatus(err) {
  // Axios-style (some Amplify internals use axios-like error shapes)
  if (err?.response?.status) return err.response.status;
  if (err?.response?.statusCode) return err.response.statusCode;

  // AmplifyError sometimes nests the real error
  if (err?.underlyingError?.response?.status)
    return err.underlyingError.response.status;
  if (err?.underlyingError?.status) return err.underlyingError.status;
  if (err?.underlyingError?.statusCode) return err.underlyingError.statusCode;

  // AWS SDK-style metadata (less common here, but worth checking)
  if (err?.$metadata?.httpStatusCode) return err.$metadata.httpStatusCode;

  return undefined; // likely a GraphQL 200-with-errors case, or status not exposed
}

export async function graphqlRequestUserPool({ query, variables = {}, token }) {
  // Prefer an explicit token, otherwise read your custom cookie
  //const jwt = token || cookies().get("cognitoIdToken")?.value;
  const lastAuthUser = cookies().get(
    `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.LastAuthUser`
  )?.value;
  console.log("LAST AUTH USER ", lastAuthUser);
  const jwt = cookies().get(
    `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.${lastAuthUser}.idToken`
  )?.value;
  //const token = cookies["cognitoIdToken"];
  console.log("JWT ", jwt);

  if (!jwt) {
    // throw new Error("graphqlRequestUserPool: missing JWT (idToken)");
    const error = new Error("Missing JWT (idToken)");
    error.code = "JWT_MISSING";
    throw error;
  }

  /* 
  if (!jwt) {
    // throw new Error("graphqlRequestUserPool: missing JWT (idToken)");
    const error = new Error("Missing JWT (idToken)");
    error.code = "JWT_MISSING";
    throw error;
  }

  const payload = await verifyJwtFromCognito(jwt);

  if (!payload) {
    //throw new Error("Invalid JWT (idToken)");
    const error = new Error("Invalid JWT (idToken)");
    error.code = "JWT_INVALID";
    throw error;
  }
  //console.log("PAYLOAD ", payload);
  //console.log("PAYLOAD EXP ", payload.exp);
  //console.log("NOW ", new Date().getTime());
  if (payload.exp * 1000 != new Date().getTime()) {
    const error = new Error("Expired JWT (idToken)");
    error.code = "JWT_EXPIRED";
    throw error;
  }
 */

  // Try the runtime working value first; fallback to singular if your version expects it
  const modes = ["userPools", "userPool"];

  let lastErr;
  for (const authMode of modes) {
    try {
      const { data, errors } = await client.graphql({
        query,
        variables,
        authMode,
        authToken: jwt, // ✅ forces the exact token AppSync should validate
      });
      //console.log("ERROR ", errors);
      if (errors?.length) console.error("GraphQL errors:", errors);
      return data;
    } catch (err) {
      lastErr = err;
      const code = getHttpStatus(err);
      console.log("CODE ", code);
      if (code !== undefined) {
        switch (code) {
          case 401:
            const error = new Error("Unauthorized");
            error.code = "UNAUTHORIZED";
            lastErr = error;
          case 403:
            const error2 = new Error(
              "AccessDeniedException / ExpiredTokenException"
            );
            error2.code = "FORBIDDEN";
            lastErr = error2;
          case 400:
            const error3 = new Error("Bad Request");
            error3.code = "BAD_REQUEST";
            lastErr = error3;
          case 500:
            const error4 = new Error("Internal Server Error");
            error4.code = "INTERNAL_SERVER_ERROR";
            lastErr = error4;
          case 503:
            const error5 = new Error("Service Unavailable");
            error5.code = "SERVICE_UNAVAILABLE";
            lastErr = error5;
          default:
            const error6 = new Error("Unknown Error");
            error6.code = "UNKNOWN_ERROR";
            lastErr = error6;
        }
      }
      const extracted = extractGraphQLErrorsFromAny(err);
      console.error("GraphQL errors (thrown):", extracted);
      if (extracted.length) {
        const error = new Error(extracted[0].message);
        error.code = extracted[0].errorType;
        lastErr = error;
        const validationErrors = extracted.filter((m) =>
          m.message.includes("Validation error")
        );
        if (validationErrors.length) {
          const error = new Error(validationErrors[0].message);
          error.code = "VALIDATION_ERROR";
          lastErr = error;
        }
        if (extracted[0].message === "Unauthorized") {
          const error = new Error(extracted[0].message);
          error.code = "UNAUTHORIZED";
          lastErr = error;
        }
      }
    }
  }

  throw lastErr;
}
