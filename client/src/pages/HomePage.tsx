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
import { Loader2, Search } from "lucide-react";

export default function HomePage() {
  const { logout } = useUser();
  const { toast } = useToast();
  const [giftCardData, setGiftCardData] = useState({
    amount: "",
    recipientName: "",
    recipientEmail: "",
  });
  const [searchFilters, setSearchFilters] = useState({
    code: "",
    minAmount: "",
    maxAmount: "",
    recipientName: "",
    recipientEmail: "",
    isUsed: undefined as boolean | undefined,
  });

  const { giftCards, isLoading, error, createGiftCard, updateStatus } = useGiftCards({
    ...searchFilters,
    minAmount: searchFilters.minAmount ? parseInt(searchFilters.minAmount) : undefined,
    maxAmount: searchFilters.maxAmount ? parseInt(searchFilters.maxAmount) : undefined,
  });

  const handleCreateGiftCard = async () => {
    if (!giftCardData.amount || parseInt(giftCardData.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "有効な金額を入力してください",
      });
      return;
    }

    try {
      await createGiftCard({
        amount: parseInt(giftCardData.amount),
        recipientName: giftCardData.recipientName || undefined,
        recipientEmail: giftCardData.recipientEmail || undefined,
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "未設定";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      return "無効な日付";
    }
  };

  const handleSearch = () => {
    toast({
      title: "検索完了",
      description: "検索結果が更新されました",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <p className="text-red-500">データの取得に失敗しました: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex justify-between items-center">
              <CardTitle>ギフトカード一覧</CardTitle>
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                検索
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="space-y-2">
                            <div>コード</div>
                            <Input
                              placeholder="コードで検索"
                              value={searchFilters.code}
                              onChange={(e) =>
                                setSearchFilters({ ...searchFilters, code: e.target.value })
                              }
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div>金額</div>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="最小"
                                value={searchFilters.minAmount}
                                onChange={(e) =>
                                  setSearchFilters({ ...searchFilters, minAmount: e.target.value })
                                }
                              />
                              <Input
                                type="number"
                                placeholder="最大"
                                value={searchFilters.maxAmount}
                                onChange={(e) =>
                                  setSearchFilters({ ...searchFilters, maxAmount: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div>受取人</div>
                            <Input
                              placeholder="受取人名で検索"
                              value={searchFilters.recipientName}
                              onChange={(e) =>
                                setSearchFilters({ ...searchFilters, recipientName: e.target.value })
                              }
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div>メールアドレス</div>
                            <Input
                              placeholder="メールアドレスで検索"
                              value={searchFilters.recipientEmail}
                              onChange={(e) =>
                                setSearchFilters({ ...searchFilters, recipientEmail: e.target.value })
                              }
                            />
                          </div>
                        </TableHead>
                        <TableHead>作成日</TableHead>
                        <TableHead>送信日</TableHead>
                        <TableHead>受取日</TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div>ステータス</div>
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={searchFilters.isUsed === undefined ? "" : searchFilters.isUsed.toString()}
                              onChange={(e) =>
                                setSearchFilters({
                                  ...searchFilters,
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
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {giftCards && giftCards.length > 0 ? (
                        giftCards.map((card) => (
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            データがありません
                          </TableCell>
                        </TableRow>
                      )}
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