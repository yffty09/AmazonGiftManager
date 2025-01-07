class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token, if: :json_request?

  before_action :authenticate_user, unless: :json_request?

  private

  def authenticate_user
    unless current_user
      respond_to do |format|
        format.html { redirect_to '/login' }
        format.json { render json: { error: 'Not authenticated' }, status: :unauthorized }
      end
    end
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def json_request?
    request.format.json? || request.headers['Accept'] =~ /json/
  end
end