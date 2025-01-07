import { log } from "./vite";

interface AmazonAPIError extends Error {
  code?: string;
  response?: any;
}

/**
 * Amazon Gift Card APIを使用してギフトカードを生成する
 * @param amount ギフトカードの金額（日本円）
 * @returns 生成されたギフトカードのコード
 * @throws AmazonAPIError API呼び出し時のエラー
 */
export async function generateGiftCard(amount: number): Promise<string> {
  if (!process.env.AMAZON_API_KEY) {
    throw new Error("Amazon APIキーが設定されていません");
  }

  try {
    // Amazon APIのエンドポイントとパラメータを設定
    const apiEndpoint = "https://api.amazon.co.jp/v1/gift-cards";
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AMAZON_API_KEY}`,
      },
      body: JSON.stringify({
        currency: "JPY",
        amount: amount,
        type: "egift",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error("ギフトカードの生成に失敗しました") as AmazonAPIError;
      error.code = errorData?.error?.code;
      error.response = errorData;
      throw error;
    }

    const data = await response.json();
    log(`ギフトカード生成成功: ${amount}円`);
    return data.claim_code;
  } catch (error: any) {
    log(`ギフトカード生成エラー: ${error.message}`);
    if (error.code) {
      log(`エラーコード: ${error.code}`);
    }
    throw error;
  }
}