import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GiftCard } from "@db/schema";

type GiftCardFilter = {
  code?: string;
  isUsed?: boolean;
  minAmount?: number;
  maxAmount?: number;
  recipientName?: string;
  recipientEmail?: string;
};

type GiftCardInput = {
  amount: number;
  recipientName?: string;
  recipientEmail?: string;
};

type GiftCardResponse = {
  ok: boolean;
  cards: GiftCard[];
  message?: string;
};

export function useGiftCards(filter?: GiftCardFilter) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<GiftCardResponse>({
    queryKey: ['/api/giftcards', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.code) params.append('code', filter.code);
      if (filter?.isUsed !== undefined) params.append('isUsed', filter.isUsed.toString());
      if (filter?.minAmount) params.append('minAmount', filter.minAmount.toString());
      if (filter?.maxAmount) params.append('maxAmount', filter.maxAmount.toString());
      if (filter?.recipientName) params.append('recipientName', filter.recipientName);
      if (filter?.recipientEmail) params.append('recipientEmail', filter.recipientEmail);

      const response = await fetch(`/api/giftcards?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('ギフトカードの取得に失敗しました');
      }

      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: GiftCardInput) => {
      const response = await fetch('/api/giftcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('ギフトカードの作成に失敗しました');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/giftcards'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isUsed }: { id: number; isUsed: boolean }) => {
      const response = await fetch(`/api/giftcards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUsed }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/giftcards'] });
    },
  });

  return {
    giftCards: data?.cards || [],
    isLoading,
    error,
    createGiftCard: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}