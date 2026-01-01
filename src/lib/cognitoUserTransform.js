/**
 * Transform Cognito user object to standardized format
 * @param {Object} cognitoUser - Raw Cognito user object
 * @returns {Object} Transformed user object
 */
export function transformCognitoUser(cognitoUser) {
  if (!cognitoUser) return null;

  // Parse attributes into a more usable format
  const attributes = {};
  cognitoUser.Attributes?.forEach(attr => {
    attributes[attr.Name] = attr.Value;
  });

  return {
    username: cognitoUser.Username,
    enabled: cognitoUser.Enabled,
    userStatus: cognitoUser.UserStatus,
    userCreateDate: cognitoUser.UserCreateDate,
    userLastModifiedDate: cognitoUser.UserLastModifiedDate,
    attributes: {
      email: attributes.email,
      emailVerified: attributes.email_verified === 'true',
      givenName: attributes.given_name,
      familyName: attributes.family_name,
      name: attributes.name,
      preferredUsername: attributes.preferred_username,
      authenticatorStatus: attributes['custom:authenticator_status'],
      knowledgebaseId: attributes['custom:knowledgebaseId'],
    }
  };
}