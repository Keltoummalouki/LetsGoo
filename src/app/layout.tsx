import type { Metadata } from "next";
import { CatalogProvider } from "@/components/catalog-provider";
import { Header, Footer } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "LetsGoo — Your next Casablanca outing",
  description:
    "Discover places, compare budgets, find experiences, and plan your next outing in Casablanca.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CatalogProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </CatalogProvider>
      </body>
    </html>
  );
}
