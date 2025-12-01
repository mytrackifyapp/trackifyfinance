import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getCryptoWallets } from "@/actions/crypto";
import { WalletList } from "../_components/wallet-list";
import { AddWalletButton } from "../_components/add-wallet-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CryptoWalletsPage() {
  const { userId } = await auth();
  
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  const wallets = await getCryptoWallets();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Crypto Wallets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your crypto wallets to track your portfolio. Connect multiple wallets to see your complete portfolio.
          </p>
        </div>
        <AddWalletButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletList wallets={wallets} />
        </CardContent>
      </Card>
    </div>
  );
}

