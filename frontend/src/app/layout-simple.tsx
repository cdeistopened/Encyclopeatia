import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ray Peat Radio",
  description: "A searchable database of Ray Peat podcast transcripts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: 20 }}>
          <h1>Ray Peat Radio</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
