// src/app/layout.js
import "./globals.css";
import AppProviders from "./providers/AppProviders";

export const metadata = {
  title: "Prifina Base App",
  description: "",
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
