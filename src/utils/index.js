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
