import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {MateriaSelect} from '@/components/form/Selectors';
import {LoadingState,ErrorState,EmptyState} from '@/components/ui/states';
import {request} from '@/lib/api';
import {Activity,activityNames} from '@/lib/study';

interface Review {
 id:string;origem:'AUTOMATICA'|'PROGRAMADA';materia_id:string;materia:string;
 assunto_id:string;assunto:string;atividade:Activity;tarefa:string;motivo:string;
 prevista_em:string;disponivel:boolean;acao_id:string|null;referencia:string|null;
}

export default function ReviewPage(){
 const [materia,setMateria]=useState('');
 const q=useQuery({queryKey:['estudos','revisoes',materia],queryFn:()=>request<Review[]>(`/api/v1/estudos/revisoes${materia?`?materia_id=${materia}`:''}`)});
 const rows=q.data||[];
 const automatic=rows.filter(r=>r.origem==='AUTOMATICA'&&r.disponivel);
 const scheduled=rows.filter(r=>r.origem==='PROGRAMADA'&&r.disponivel);
 const future=rows.filter(r=>!r.disponivel);
 function card(r:Review){
  const params=new URLSearchParams({materia:r.materia_id,assunto:r.assunto_id,atividade:r.atividade,tarefa:r.tarefa});
  if(r.acao_id)params.set('acao',r.acao_id);
  return <article key={r.id} className="tac-card space-y-3">
   <p className="text-xs text-accent uppercase">{r.materia} · {activityNames[r.atividade]}</p>
   <h3 className="text-base font-bold">{r.assunto}</h3>
   <p className="text-sm">{r.tarefa}</p>
   <p className="text-xs text-muted-foreground">{r.motivo}</p>
   {!r.disponivel&&<p className="text-xs text-muted-foreground">Retorno sugerido: {new Date(r.prevista_em).toLocaleDateString('pt-BR')}</p>}
   {r.referencia&&<p className="text-xs text-muted-foreground">Material: {r.referencia}</p>}
   <Link className="btn-tactical inline-flex items-center justify-center gap-2" to={`/estudar?${params}`}>{r.disponivel?'Preparar esta sessão':'Antecipar esta sessão'}</Link>
  </article>;
 }
 return <AppLayout>
  <div className="page-header"><h1 className="page-title">Lista de Revisão</h1><p className="page-subtitle">O histórico indica o retorno. Você não precisa cadastrar revisões para começar.</p></div>
  <div className="tac-card mb-6 space-y-3"><h2 className="font-bold">Não quer escolher?</h2><p className="text-sm text-muted-foreground">Estudar agora combina esta fila com o saldo do seu ciclo e alterna retomada com avanço. Aqui você também pode escolher outra sessão.</p><Link to="/estudar" className="text-accent underline text-sm">Usar a recomendação do ciclo</Link></div>
  <div className="mb-5"><MateriaSelect value={materia} onChange={setMateria}/></div>
  {q.isLoading?<LoadingState/>:q.isError?<ErrorState message={(q.error as Error).message}/>:<>
   <section className="mb-6"><h2 className="text-lg font-bold mb-3">Sugestões automáticas · {automatic.length}</h2>
    {automatic.length?<div className="grid lg:grid-cols-2 gap-4">{automatic.map(card)}</div>:<EmptyState message={rows.length?'Nenhum retorno automático disponível agora. Confira os próximos retornos abaixo ou avance pelo ciclo.':'Ainda não há histórico que justifique revisão. Comece um assunto em Estudar agora; assuntos nunca estudados ficam em Conteúdos.'}/>}</section>
   <section className="mb-6"><h2 className="text-lg font-bold mb-3">Ações programadas por você · {scheduled.length}</h2>
    {scheduled.length?<div className="grid lg:grid-cols-2 gap-4">{scheduled.map(card)}</div>:<p className="text-sm text-muted-foreground">Nenhuma ação manual disponível. Cadastrar ações é opcional.</p>}</section>
   {future.length>0&&<details className="mb-6"><summary className="text-sm text-accent cursor-pointer">Próximos retornos · {future.length}</summary><div className="grid lg:grid-cols-2 gap-4 mt-4">{future.map(card)}</div></details>}
  </>}
  <p className="text-xs text-muted-foreground">Sugestões não são dívidas. A fila é recalculada após novos registros: 1 dia para ampliar prática, 7 dias para verificar retenção e pelo menos 2 dias após revisão. São regras iniciais ajustáveis, não intervalos científicos personalizados. Baixa precisão considera duas tentativas recentes e ao menos 20 questões; contato antigo não prova esquecimento.</p>
 </AppLayout>;
}
