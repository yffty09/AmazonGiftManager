require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module AmazonGiftManager
  class Application < Rails::Application
    config.load_defaults 7.0

    # APIモードを有効化しつつ、セッション管理も可能にする
    config.api_only = true

    # セッション管理のための設定
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.middleware.use ActionDispatch::Flash

    config.session_store :cookie_store, key: '_amazon_gift_manager_session'

    # CORS設定
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost:5000'  # 開発環境のオリジン
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true,
          expose: ['access-token', 'expiry', 'token-type', 'uid', 'client']
      end
    end
  end
end