class Api::GiftCardsController < ApplicationController
  def index
    gift_cards = current_user.gift_cards
      .then { |cards| filter_by_code(cards) }
      .then { |cards| filter_by_amount(cards) }
      .then { |cards| filter_by_recipient(cards) }
      .then { |cards| filter_by_used_status(cards) }
      .order(created_at: :desc)

    render json: { ok: true, cards: gift_cards }
  end

  def create
    gift_card = current_user.gift_cards.build(gift_card_params)
    
    if gift_card.save
      render json: { ok: true, gift_card: gift_card }
    else
      render json: { ok: false, message: gift_card.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    gift_card = current_user.gift_cards.find(params[:id])
    
    if gift_card.update(gift_card_params)
      render json: { ok: true, gift_card: gift_card }
    else
      render json: { ok: false, message: gift_card.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { ok: false, message: "ギフトカードが見つかりません" }, status: :not_found
  end

  private

  def gift_card_params
    params.require(:gift_card).permit(:code, :amount, :is_used, :recipient_name, :recipient_email, :sent_at, :received_at)
  end

  def filter_by_code(cards)
    return cards unless params[:code].present?
    cards.where("code ILIKE ?", "%#{params[:code]}%")
  end

  def filter_by_amount(cards)
    cards = cards.where("amount >= ?", params[:min_amount]) if params[:min_amount].present?
    cards = cards.where("amount <= ?", params[:max_amount]) if params[:max_amount].present?
    cards
  end

  def filter_by_recipient(cards)
    cards = cards.where("recipient_name ILIKE ?", "%#{params[:recipient_name]}%") if params[:recipient_name].present?
    cards = cards.where("recipient_email ILIKE ?", "%#{params[:recipient_email]}%") if params[:recipient_email].present?
    cards
  end

  def filter_by_used_status(cards)
    return cards unless params[:is_used].present?
    cards.where(is_used: params[:is_used])
  end
end
