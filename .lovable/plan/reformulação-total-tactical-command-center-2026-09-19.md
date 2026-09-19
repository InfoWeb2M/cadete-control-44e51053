# Reformulação total — Tactical Command Center

## Objetivo
Transformar o sistema em um centro de comando acadêmico moderno, organizado e marcante, preservando a identidade EsPCEx, os dados reais, as funcionalidades e a paleta tática.

## Direção visual aprovada
- Paleta oliva operacional: `#10130F`, `#23291C`, `#849052`, `#D6B95C`, `#E7E9DE`.
- Tipografia: Space Grotesk nos títulos e DM Sans no conteúdo; números técnicos continuam monoespaçados.
- Composição: grade bento assimétrica, com módulos priorizados por importância.
- Cantos discretos, linhas técnicas, texturas de grade e ruído muito sutis.
- Referência estrutural: “Tactical command center”.

## O que será alterado
1. **Base visual global**
   - Refazer tokens, superfícies, sombras, tipografia, campos, seletores, botões, estados e barras de rolagem.
   - Criar um padrão único para títulos, módulos, indicadores e mensagens de carregamento/erro.
   - Remover estilos antigos conflitantes e a importação remota de fontes no CSS.

2. **Navegação e estrutura**
   - Refinar a sidebar desktop, mantendo logo, nome e abas.
   - Separar as abas em grupos claros: Comando, Registro e Análise.
   - Criar navegação mobile em formato de painel operacional, com abertura fluida, atalhos prioritários e indicação forte da tela atual.
   - Remover completamente Cronograma da navegação e das rotas.
   - Atualizar a área de conteúdo para funcionar melhor entre celular e telas de até 1600px.

3. **Painel principal**
   - Reorganizar próxima sessão, indicadores, metas, recomendação, missão, gráficos e redações em uma grade bento assimétrica.
   - Melhorar hierarquia e reduzir repetição visual.
   - Corrigir a falha quando a API retorna o painel vazio ou incompleto.

4. **Cards, gráficos e dados**
   - Uniformizar todos os cards e painéis, mantendo estados semânticos de sucesso, atenção e crítico.
   - Melhorar contraste, legendas, dicas, eixos e estados vazios dos gráficos.
   - Garantir que os gráficos de setor acomodem oito matérias sem colisões.
   - Preservar integralmente o consumo da API e os cálculos fornecidos pelo backend.

5. **Formulários e telas novas/existentes**
   - Aplicar o novo padrão a estudo, metas, conteúdos, sessão, bloco, simulado, redações, revisão, timer, histórico, relatório mensal e contagem regressiva.
   - Organizar campos por blocos lógicos, melhorar foco, validação, ações e leitura em telas pequenas.
   - Harmonizar Lista de Revisão e Relatório Mensal com o restante do sistema.

6. **Movimento e acabamento**
   - Entradas escalonadas, revelação progressiva de gráficos e números, pulso operacional discreto, transições de navegação e respostas táteis.
   - Manter animações suaves e úteis, com versão reduzida para quem desativa movimento.

7. **Validação**
   - Verificar painel e principais fluxos em desktop e mobile.
   - Conferir ausência de sobreposição, cortes de texto e erros no navegador.
   - Executar testes relevantes e validar navegação após a remoção do Cronograma.
