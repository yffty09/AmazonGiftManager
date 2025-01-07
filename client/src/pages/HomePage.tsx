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
  const [giftCardData, setGiftCardData] = useState({
    amount: "",
    recipientName: "",
    recipientEmail: "",
  });
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
      await createGiftCard({
        amount: parseInt(giftCardData.amount),
        recipientName: giftCardData.recipientName,
        recipientEmail: giftCardData.recipientEmail,
      });
      setGiftCardData({
        amount: "",
        recipientName: "",
        recipientEmail: "",
      });
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

  const formatDate = (date: string | null) => {
    if (!date) return "未設定";
    return new Date(date).toLocaleDateString();
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  placeholder="金額"
                  value={giftCardData.amount}
                  onChange={(e) =>
                    setGiftCardData({ ...giftCardData, amount: e.target.value })
                  }
                />
                <Input
                  type="text"
                  placeholder="受取人名"
                  value={giftCardData.recipientName}
                  onChange={(e) =>
                    setGiftCardData({ ...giftCardData, recipientName: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder="受取人メールアドレス"
                  value={giftCardData.recipientEmail}
                  onChange={(e) =>
                    setGiftCardData({ ...giftCardData, recipientEmail: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleCreateGiftCard} className="w-full">発行</Button>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>コード</TableHead>
                        <TableHead>金額</TableHead>
                        <TableHead>受取人</TableHead>
                        <TableHead>メールアドレス</TableHead>
                        <TableHead>作成日</TableHead>
                        <TableHead>送信日</TableHead>
                        <TableHead>受取日</TableHead>
                        <TableHead>ステータス</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {giftCards?.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>{card.code}</TableCell>
                          <TableCell>¥{card.amount.toLocaleString()}</TableCell>
                          <TableCell>{card.recipientName || "未設定"}</TableCell>
                          <TableCell>{card.recipientEmail || "未設定"}</TableCell>
                          <TableCell>{formatDate(card.createdAt)}</TableCell>
                          <TableCell>{formatDate(card.sentAt)}</TableCell>
                          <TableCell>{formatDate(card.receivedAt)}</TableCell>
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}