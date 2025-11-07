import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import LayoutContent from "@/components/LayoutContent";
import { I18nProvider } from "@/lib/i18n/context";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";

export const metadata: Metadata = {
  title: "News SEO Assistant",
  description: "Aggregate local news and generate SEO keywords automatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <I18nProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
              {/* Background decoration with animations */}
              <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-float" 
                     style={{ animationDelay: '0s', animationDuration: '10s' }} />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float" 
                     style={{ animationDelay: '2s', animationDuration: '12s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-float" 
                     style={{ animationDelay: '4s', animationDuration: '14s' }} />
              </div>

              {/* Sidebar Navigation */}
              <Navigation />

              {/* Main Content - with dynamic sidebar offset */}
              <LayoutContent>
                {children}
              </LayoutContent>
            </div>
          </SidebarProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
