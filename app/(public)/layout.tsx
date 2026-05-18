import { CorporateFooter } from "@/components/marketing/corporate-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CorporateFooter />
    </>
  );
}
