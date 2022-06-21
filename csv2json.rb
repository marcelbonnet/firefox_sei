require 'csv'
require 'json'

arq = ARGV[0]
saida = ARGV[1]
csv = CSV.open(arq, headers: true, header_converters: :symbol, col_sep: ';').map(&:to_h)

f = File.open(saida, 'w')
f.write(csv.to_json)
f.close