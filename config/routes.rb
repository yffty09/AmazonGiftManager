Rails.application.routes.draw do
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
end
