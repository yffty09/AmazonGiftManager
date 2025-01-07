class User < ApplicationRecord
  has_secure_password
  has_many :gift_cards, dependent: :destroy

  validates :username, presence: true, uniqueness: true
  validates :password, presence: true, on: :create
end
