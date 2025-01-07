class Api::SessionsController < ApplicationController
  skip_before_action :authenticate_user, only: [:create, :show]

  def create
    user = User.find_by(username: params[:username])
    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { ok: true, user: user.as_json(except: :password_digest) }
    else
      render json: { ok: false, message: "ユーザー名またはパスワードが正しくありません" }, status: :unauthorized
    end
  end

  def destroy
    session[:user_id] = nil
    render json: { ok: true, message: "ログアウトしました" }
  end

  def show
    if current_user
      render json: { ok: true, user: current_user.as_json(except: :password_digest) }
    else
      render json: { ok: false, message: "認証が必要です" }, status: :unauthorized
    end
  end
end
