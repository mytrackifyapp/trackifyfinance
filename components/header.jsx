// components/header.jsx
"use client";

import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
// import { ConnectButton } from "thirdweb/react";

// Thirdweb config
import { client } from "@/lib/thirdwebClient";
import { wallets } from "@/lib/thirdwebWallets";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="https://www.mytrackify.com">
          <Image
            src={"/logo.png"}
            alt="Trackify Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Wallet connect */}
        {/* <ConnectButton client={client} wallets={wallets} /> */}

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <a href="https://www.mytrackify.com" className="text-gray-600 hover:text-blue-600">
                 Home
            </a>
            <a
              href="https://www.mytrackify.com/contact"
              className="text-gray-600 hover:text-blue-600"
            >
              Reach US
            </a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <a href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </a>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
