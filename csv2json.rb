require 'csv'
require 'json'

arq = "/tmp/meu_pgd.csv"
csv = CSV.open(arq, headers: true, header_converters: :symbol, col_sep: ';').map(&:to_h)

f = File.open("/tmp/pgd.json", 'w')
f.write(csv.to_json)
f.close