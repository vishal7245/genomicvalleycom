import { SiteHeader } from "@/components/site-header";
import { FloatingSocialButtons } from "@/components/floatingbutton";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <div className="relative flex min-h-screen flex-col font-serif">
          <SiteHeader />
            <main className="flex-1">
              <FloatingSocialButtons />
                <div className="container mx-auto">
              {children}
            </div>
            </main>
      </div>
      </>
  );
}

