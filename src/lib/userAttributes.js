import { fetchUserAttributes, updateUserAttributes } from "aws-amplify/auth";

import { confirmUserAttribute, sendUserAttributeVerificationCode } from "aws-amplify/auth";

export async function getUserAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    return {
      givenName: attributes.given_name || "",
      familyName: attributes.family_name || "",
      email: attributes.email || "",
      preferredUsername: attributes.preferred_username || "",
      name: attributes.name || "",
      authenticatorStatus: attributes["custom:authenticator_status"] || "",
      emailVerified: attributes.email_verified === "true",
    };
  } catch (error) {
    console.error("Error fetching user attributes:", error);
    throw error;
  }
}

export async function updateUserProfile(updates) {
  try {
    const attributesToUpdate = {};
    
    if (updates.givenName !== undefined) {
      attributesToUpdate.given_name = updates.givenName;
    }
    if (updates.familyName !== undefined) {
      attributesToUpdate.family_name = updates.familyName;
    }
    if (updates.email !== undefined) {
      attributesToUpdate.email = updates.email;
    }
    if (updates.preferredUsername !== undefined) {
      attributesToUpdate.preferred_username = updates.preferredUsername;
    }
    if (updates["custom:authenticator_status"] !== undefined) {
      attributesToUpdate["custom:authenticator_status"] = updates["custom:authenticator_status"];
    }
    if (updates["custom:authenticator_secret"] !== undefined) {
      attributesToUpdate["custom:authenticator_secret"] = updates["custom:authenticator_secret"];
    }
    if (updates["custom:knowledgebaseId"] !== undefined) {
      attributesToUpdate["custom:knowledgebaseId"] = updates["custom:knowledgebaseId"];
    }

    await updateUserAttributes({ userAttributes: attributesToUpdate });
    return { success: true };
  } catch (error) {
    console.error("Error updating user attributes:", error);
    throw error;
  }
}

export async function verifyEmailAttribute(code) {
  try {
    await confirmUserAttribute({ userAttributeKey: "email", confirmationCode: code });
    return { success: true };
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
}

export async function requestEmailVerificationCode() {
  try {
    await sendUserAttributeVerificationCode({ userAttributeKey: "email" });
    return { success: true };
  } catch (error) {
    console.error("Error requesting verification code:", error);
    throw error;
  }
}
