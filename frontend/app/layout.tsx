import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import QueryProvider from "@/components/providers/QueryProvider";
import SocketProvider from "@/components/SocketProvider";
import NotificationPortal from "@/components/notifications/NotificationPortal";

import { DashboardProvider } from "@/context/DashboardContext";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: "FreeCone | Elite Global Talent Marketplace",
  description: "Elite Global Talent Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f6f7f8] font-display text-slate-900" suppressHydrationWarning>
        <NotificationPortal />
        <QueryProvider>
          <SocketProvider>
            <DashboardProvider>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </DashboardProvider>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}