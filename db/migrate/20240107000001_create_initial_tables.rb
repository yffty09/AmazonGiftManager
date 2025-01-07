class CreateInitialTables < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.string :password_digest, null: false
      t.timestamps
    end

    add_index :users, :username, unique: true

    create_table :gift_cards do |t|
      t.references :user, null: false, foreign_key: true
      t.string :code, null: false
      t.integer :amount, null: false
      t.boolean :is_used, null: false, default: false
      t.string :recipient_name
      t.string :recipient_email
      t.datetime :sent_at
      t.datetime :received_at
      t.timestamps
    end

    add_index :gift_cards, :code
  end
end