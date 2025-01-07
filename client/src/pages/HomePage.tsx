import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useGiftCards } from "../hooks/use-giftcards";
import { useUser } from "../hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { logout } = useUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState({
    isUsed: undefined as boolean | undefined,
    minAmount: "",
    maxAmount: "",
  });

  const { giftCards, isLoading, createGiftCard, updateStatus } = useGiftCards({
    isUsed: filter.isUsed,
    minAmount: filter.minAmount ? parseInt(filter.minAmount) : undefined,
    maxAmount: filter.maxAmount ? parseInt(filter.maxAmount) : undefined,
  });

  const handleCreateGiftCard = async () => {
    try {
      await createGiftCard(parseInt(amount));
      setAmount("");
      toast({
        title: "成功",
        description: "ギフトカードが作成されました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (id: number, isUsed: boolean) => {
    try {
      await updateStatus({ id, isUsed });
      toast({
        title: "成功",
        description: "ステータスが更新されました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Amazonギフトカード管理</h1>
          <Button variant="outline" onClick={() => logout()}>
            ログアウト
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>新規ギフトカード発行</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="金額"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleCreateGiftCard}>発行</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ギフトカード一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="最小金額"
                  value={filter.minAmount}
                  onChange={(e) =>
                    setFilter({ ...filter, minAmount: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="最大金額"
                  value={filter.maxAmount}
                  onChange={(e) =>
                    setFilter({ ...filter, maxAmount: e.target.value })
                  }
                />
                <select
                  className="border rounded px-2"
                  value={filter.isUsed === undefined ? "" : filter.isUsed.toString()}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      isUsed:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    })
                  }
                >
                  <option value="">全て</option>
                  <option value="false">未使用</option>
                  <option value="true">使用済み</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>コード</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>作成日</TableHead>
                      <TableHead>ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftCards?.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>{card.code}</TableCell>
                        <TableCell>¥{card.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(card.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={card.isUsed}
                            onCheckedChange={(checked) =>
                              handleStatusChange(card.id, checked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
