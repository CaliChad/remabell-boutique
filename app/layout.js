import "./globals.css";

export const metadata = {
  title: "Remabell Exquisite | 100% Original Skincare Lagos",
  description: "Top skincare vendor in Lagos, Nigeria. Worldwide shipping on original products.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
