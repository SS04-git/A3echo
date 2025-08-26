import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata = {
  title: "Echo: A Chat Application",
  description: "A simple responsive chat app built with React, Next.js, and React-Bootstrap",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
        <main>{children}</main>
      </body>
    </html>
  );
}