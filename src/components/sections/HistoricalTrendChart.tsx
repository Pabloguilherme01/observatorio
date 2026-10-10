import '../../assets/styles/dashboard.css';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { observatorioData as d } from '../../data/observatorioData';
import { formatNumber } from '../../utils/formatters';
const data=[...d.populationSeries].sort((a,b)=>a.year-b.year);

export function HistoricalTrendChart() {
 return <figure className="dashboard-history-card mt-4 rounded-3xl border border-slate-500 p-4 light:bg-slate-50" aria-labelledby="dashboard-history-title">
  <figcaption><h3 id="dashboard-history-title" className="text-lg font-bold text-slate-100 light:text-slate-900">População ao longo do tempo</h3><p className="mt-2 text-sm text-slate-400 light:text-slate-700">Censo é contagem; estimativa é cálculo. Os pontos publicados têm naturezas diferentes e não indicam uma contagem anual.</p></figcaption>
  <div className="dashboard-history-chart mt-4 min-w-0" role="img" aria-label="Histórico de população; consulte os valores e a natureza de cada ponto na tabela abaixo.">
   <LineChart responsive style={{width:'100%',height:300,minWidth:0}} data={data} margin={{left:10,right:20}}>
    <CartesianGrid strokeDasharray="3 5" /><XAxis dataKey="year" type="number" domain={['dataMin','dataMax']} ticks={data.map(p=>p.year)} /><YAxis width={65} tickFormatter={v=>formatNumber(Number(v))} />
    <Tooltip formatter={v=>formatNumber(Number(v))} /><Line name="População" dataKey="value" stroke="#0284c7" strokeWidth={3} connectNulls={false} isAnimationActive={false} />
   </LineChart>
  </div>
  <details className="mt-4 text-slate-300 light:text-slate-800"><summary className="min-h-11 cursor-pointer font-bold">Ver dados em tabela · alternativa acessível ao gráfico</summary><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Dados históricos de população</caption><thead><tr>{['Ano','População','Natureza','Referência'].map(label=><th key={label} scope="col" className="p-2">{label}</th>)}</tr></thead><tbody>{data.map(point=><tr key={point.year}><th scope="row" className="p-2">{point.year}</th><td className="p-2">{formatNumber(point.value)}</td><td className="p-2">{point.kind==='census'?'Censo':'Estimativa'}</td><td className="p-2">{point.referenceDate.split('-').reverse().join('/')}</td></tr>)}</tbody></table></div></details>
 </figure>;
}
