require 'sinatra'
require 'sinatra/reloader' if development?
require 'json'
require 'dotenv/load'
require 'securerandom'
require 'net/http'
require 'uri'
require 'logger'

# Configure logging
logger = Logger.new(STDOUT)
logger.level = Logger::DEBUG

# Exchange rate API endpoint
EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD"

configure do
  # Session configuration
  secret = ENV['SESSION_SECRET'] || SecureRandom.hex(64)
  use Rack::Session::Cookie, 
    key: 'rack.session',
    path: '/',
    secret: secret,
    expire_after: 2592000 # 30 days in seconds
    
  set :public_folder, 'public'
  set :views, 'views'
end

# Fetch exchange rate
def fetch_exchange_rate
  uri = URI(EXCHANGE_API_URL)
  response = Net::HTTP.get_response(uri)
  
  if response.is_a?(Net::HTTPSuccess)
    data = JSON.parse(response.body)
    rate = data['rates']['CRC']
    return rate if rate
    logger.error("CRC rate not found in API response")
    nil
  else
    logger.error("Failed to fetch exchange rate: #{response.code}")
    nil
  end
rescue => e
  logger.error("Error fetching exchange rate: #{e.message}")
  nil
end

# Routes
get '/' do
  @rate = fetch_exchange_rate
  @error = "Unable to fetch exchange rate" if @rate.nil?
  erb :index
end

# API endpoint
get '/api/rate' do
  content_type :json
  rate = fetch_exchange_rate
  
  if rate
    { rate: rate }.to_json
  else
    status 500
    { error: 'Failed to fetch rate' }.to_json
  end
end

# Error handlers
not_found do
  erb :error_404
end

error do
  logger.error("Unexpected error: #{env['sinatra.error'].message}")
  erb :error_500
end 