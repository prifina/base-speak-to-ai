// src/app/layout.js
import AppProviders from "./providers/AppProviders";

export const metadata = {
  title: "Next Cognito Nav Example (src/app)",
  description:
    "Example app with Cognito + middleware-based navigation using src/app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
