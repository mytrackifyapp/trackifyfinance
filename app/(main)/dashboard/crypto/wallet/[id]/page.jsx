import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getCryptoWallets, getCryptoTransactions, syncCryptoWallet } from "@/actions/crypto";
import { WalletDetailHeader } from "../../_components/wallet-detail-header";
import { WalletAssets } from "../../_components/wallet-assets";
import { WalletTransactions } from "../../_components/wallet-transactions";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function WalletDetailPage({ params }) {
  const { userId } = await auth();
  
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  const walletId = params.id;
  const [wallets, transactions] = await Promise.all([
    getCryptoWallets(),
    getCryptoTransactions({ walletId }),
  ]);

  const wallet = wallets.find((w) => w.id === walletId);

  if (!wallet) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/crypto/wallets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallets
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Wallet not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/crypto/wallets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wallets
        </Button>
      </Link>

      <WalletDetailHeader wallet={wallet} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <WalletAssets wallet={wallet} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <WalletTransactions transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

