require 'rake'

namespace :db do
  desc "サンプルデータを生成"
  task generate_sample_data: :environment do
    puts "サンプルデータの生成を開始..."

    ActiveRecord::Base.transaction do
      # admin123ユーザーを作成または取得
      user = User.find_by(username: 'admin123')
      unless user
        user = User.create!(
          username: 'admin123',
          password: 'password123'
        )
        puts "admin123ユーザーを作成しました"
      end

      # バッチサイズを設定
      batch_size = 50
      total_records = 1000

      (0...total_records).each_slice(batch_size) do |batch|
        gift_cards = batch.map do |i|
          amount = [1000, 3000, 5000, 10000, 30000, 50000].sample
          is_used = [true, false].sample
          recipient_name = is_used ? ["田中太郎", "山田花子", "佐藤次郎", "鈴木美咲"].sample : nil
          recipient_email = recipient_name ? "#{recipient_name.gsub(/[^\p{Alnum}]/, '')}@example.com" : nil
          sent_at = is_used ? rand(1.year.ago..Time.current) : nil
          received_at = sent_at ? sent_at + rand(1..24).hours : nil

          {
            user_id: user.id,
            code: "GC#{format('%08d', i + 1)}",
            amount: amount,
            is_used: is_used,
            recipient_name: recipient_name,
            recipient_email: recipient_email,
            sent_at: sent_at,
            received_at: received_at,
            created_at: rand(1.year.ago..Time.current)
          }
        end

        # バルクインサート
        GiftCard.insert_all!(gift_cards)
        puts "#{batch.first + batch_size}件のギフトカードを生成しました"
      end

      total_count = GiftCard.count
      puts "サンプルデータの生成が完了しました（合計: #{total_count}件）"
    end
  end
end