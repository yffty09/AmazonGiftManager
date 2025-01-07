namespace :db do
  desc "サンプルデータを生成"
  task generate_sample_data: :environment do
    puts "サンプルデータの生成を開始..."
    
    # admin123ユーザーを作成または取得
    user = User.find_by(username: 'admin123')
    unless user
      user = User.create!(
        username: 'admin123',
        password: 'password123'
      )
      puts "admin123ユーザーを作成しました"
    end

    # ギフトカードのサンプルデータを生成
    1000.times do |i|
      amount = [1000, 3000, 5000, 10000, 30000, 50000].sample
      is_used = [true, false].sample
      recipient_name = is_used ? ["田中太郎", "山田花子", "佐藤次郎", "鈴木美咲"].sample : nil
      recipient_email = recipient_name ? "#{recipient_name.gsub(/[^\p{Alnum}]/, '')}@example.com" : nil
      sent_at = is_used ? rand(1.year.ago..Time.current) : nil
      received_at = sent_at ? sent_at + rand(1..24).hours : nil

      gift_card = user.gift_cards.create!(
        code: "GC#{format('%08d', i + 1)}",
        amount: amount,
        is_used: is_used,
        recipient_name: recipient_name,
        recipient_email: recipient_email,
        sent_at: sent_at,
        received_at: received_at,
        created_at: rand(1.year.ago..Time.current)
      )

      if (i + 1) % 100 == 0
        puts "#{i + 1}件のギフトカードを生成しました"
      end
    end

    puts "サンプルデータの生成が完了しました"
  end
end
