Rails.application.routes.draw do
  root 'home#index'

  namespace :api do
    resources :sessions, only: [:create] do
      collection do
        delete :destroy
        get :show
      end
    end

    resources :users, only: [:create]
    resources :gift_cards do
      collection do
        get :search
      end
    end
  end

  # Vue Router用のキャッチオールルート
  get '*path', to: 'home#index', constraints: ->(request) { !request.xhr? && request.format.html? }
end