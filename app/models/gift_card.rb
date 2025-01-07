class GiftCard < ApplicationRecord
  belongs_to :user

  validates :code, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
end
