"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function WalletAssets({ wallet }) {
  const assets = wallet.assets || [];

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No assets in this wallet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Assets</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Average Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{asset.tokenSymbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.tokenName}</div>
                  </div>
                </TableCell>
                <TableCell>{asset.amount.toFixed(6)}</TableCell>
                <TableCell>
                  ${asset.averageCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

