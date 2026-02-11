import { LANGUAGE_TAGS } from "./languages.js";

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

export function formatCurrencyFromMinorUnit(
  amountInMinor,
  currency = "USD",
  locale = "en-US",
) {
  // Currencies without minor units
  const noMinorUnit = ["JPY", "KRW", "VND", "IDR"];

  // Decide the divisor
  const divisor = noMinorUnit.includes(currency.toUpperCase()) ? 1 : 100;

  const amountInMajor = amountInMinor / divisor;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInMajor);
}

export const formatSubscriptionPlanTitle = (obj, productName) => {
  //console.log("FORMAT SUBSCRIPTION PLAN TITLE", obj);
  if (!obj) return "";
  //const productName = obj.productName || "";
  const pricing = obj.metadata?.pricing || "";
  return `${productName}${pricing ? " - " + pricing : ""}`;
};

//const options = buildLanguageOptions(LANGUAGE_TAGS, "en");
export function buildLanguageOptions(
  languageTags = LANGUAGE_TAGS,
  uiLocale = "en",
) {
  const dn = new Intl.DisplayNames([uiLocale], { type: "language" });

  // Normalize, de-dupe, and label
  const unique = Array.from(new Set(languageTags));

  return (
    unique
      .map((tag) => {
        const base = tag.split("-")[0]; // "pt-BR" -> "pt"
        const name = dn.of(base) || base; // fallback
        return { tag, name };
      })
      // Sort by display name for dropdown UX
      .sort((a, b) => a.name.localeCompare(b.name, uiLocale))
  );
}

export function getLanguageName(
  languageCode,
  { uiLocale = "en", preferDialect = false } = {},
) {
  // 1) Canonicalize the tag (e.g., 'fi-fi' => 'fi-FI')
  let canonical = languageCode;
  try {
    const arr = Intl.getCanonicalLocales(languageCode);
    if (arr && arr[0]) canonical = arr[0];
  } catch (e) {
    // ignore; keep original
  }

  // 2) Reduce to base language (avoid "(Region)" additions)
  let langForDisplay = canonical;
  try {
    if (typeof Intl.Locale === "function") {
      const loc = new Intl.Locale(canonical);
      if (loc.language === "zh" && loc.script) {
        // Keep script for Chinese so we can differentiate Simplified/Traditional
        langForDisplay = `zh-${loc.script}`; // e.g., zh-Hans, zh-Hant
      } else {
        langForDisplay = loc.language; // e.g., "fi" from "fi-FI"
      }
    } else {
      // Minimal fallback if Intl.Locale isn't available
      langForDisplay = canonical.split("-")[0];
    }
  } catch (e) {
    // ignore
  }

  // 3) Use Intl.DisplayNames if available
  if (typeof Intl.DisplayNames !== "undefined") {
    try {
      const dn = new Intl.DisplayNames([uiLocale], {
        type: "language",
        languageDisplay: preferDialect ? "dialect" : "standard",
        fallback: "code",
        style: "long",
      });
      const out = dn.of(langForDisplay);
      if (out && out !== langForDisplay) return out;
    } catch (e) {
      // ignore
    }
  }

  // 4) Fallback map
  const fallback = {
    en: "English",
    fr: "French",
    es: "Spanish",
    fi: "Finnish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    sv: "Swedish",
    nl: "Dutch",
    zh: "Chinese",
    "zh-Hans": "Chinese (Simplified)",
    "zh-Hant": "Chinese (Traditional)",
    ja: "Japanese",
    ko: "Korean",
    ru: "Russian",
  };

  return fallback[langForDisplay] || languageCode;
}
