import { isEmail } from "@/utils";
import { UI_TEXT } from "@/lib/uiStrings";

export const validateUsername = async (username, initialUsername = "", usernameAvailable) => {
  if (!username) return "";
  if (username === initialUsername) return "";
  
  if (username.length < 10 || username.length > 30) {
    return UI_TEXT.account.usernameErrors.length;
  }
  if (/\s/.test(username)) {
    return UI_TEXT.account.usernameErrors.spaces;
  }
  if (/@/.test(username)) {
    return UI_TEXT.account.usernameErrors.email;
  }
  
  const available = await usernameAvailable(username);
  if (!available) {
    return UI_TEXT.account.usernameErrors.exists;
  }
  
  return "";
};

export const validateEmail = async (email, initialEmail = "", authFetch) => {
  if (!email) return "";
  if (email === initialEmail) return "";
  
  if (!isEmail(email)) {
    return UI_TEXT.account.emailErrors.invalid;
  }
  
  const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  
  if (!data.available) {
    return UI_TEXT.account.emailErrors.exists;
  }
  
  return "";
};

export const validateFormData = (formData) => {
  const errors = {};
  
  if (!formData.firstName?.trim()) {
    errors.firstName = "First name is required";
  }
  
  if (!formData.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }
  
  if (!formData.username?.trim()) {
    errors.username = "Username is required";
  }
  
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  }
  
  return errors;
};