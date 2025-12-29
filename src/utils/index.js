export function checkLng() {
  let userlang = "en";
  if (typeof window !== "undefined") {
    userlang = navigator.language || navigator.userLanguage;

    if (userlang.startsWith("en-")) {
      userlang.toLowerCase().substring(0, 2);
    }
  }
  return userlang;
}

export function isValidUrl(urlString) {
  try {
    if (urlString.includes(" ")) return false;
    new URL(urlString);
    return true; // URL is valid
  } catch (e) {
    return false; // URL is invalid
  }
}

export const isEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16).substring(2);

  return `id-${timestamp}-${hexadecimalString}`;
}

export async function isUrlOnline(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
    });

    // If the request was successful, or even if it wasn't but the server responded,
    // the URL is considered 'online'.
    return response.ok || response.type === "opaque";
  } catch (error) {
    // If there's an error (like a network issue), the URL is 'offline'.
    return false;
  }
}
