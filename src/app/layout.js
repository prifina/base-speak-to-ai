// src/app/layout.js
import "./globals.css";
import AppProviders from "./providers/AppProviders";

export const metadata = {
  title: "Next Cognito Nav Example (src/app)",
  description:
    "Example app with Cognito + middleware-based navigation using src/app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
