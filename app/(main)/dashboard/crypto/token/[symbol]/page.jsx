import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getCryptoPortfolio, getCryptoTransactions } from "@/actions/crypto";
import { getTokenMetadata, getTokenPriceHistory } from "@/lib/crypto/price-api";
import { TokenDetailHeader } from "../../_components/token-detail-header";
import { TokenPriceChart } from "../../_components/token-price-chart";
import { TokenHoldings } from "../../_components/token-holdings";
import { TokenTransactions } from "../../_components/token-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TokenDetailPage({ params }) {
  const { userId } = await auth();
  
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  const symbol = params.symbol?.toUpperCase();
  const [portfolio, transactions, metadata, priceHistory] = await Promise.all([
    getCryptoPortfolio(),
    getCryptoTransactions({ tokenSymbol: symbol }),
    getTokenMetadata(symbol),
    getTokenPriceHistory(symbol, 30),
  ]);

  const token = portfolio.tokens?.find((t) => t.symbol === symbol);

  if (!token) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{symbol}</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Token not found in your portfolio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TokenDetailHeader token={token} metadata={metadata} />
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price History (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenPriceChart data={priceHistory || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Holdings by Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenHoldings token={token} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenTransactions transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

