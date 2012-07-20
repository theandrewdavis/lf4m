use Rack::Static, :urls => ['/js', '/css']

map '/' do
  run Rack::File.new('index.html')
end
