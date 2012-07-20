require 'sinatra'
set :protection, except: :ip_spoofing

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end
