class Api::UsersController < ApplicationController
  skip_before_action :authenticate_user, only: [:create]

  def create
    user = User.new(user_params)
    if user.save
      session[:user_id] = user.id
      render json: { ok: true, user: user.as_json(except: :password_digest) }
    else
      render json: { ok: false, message: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end
end
