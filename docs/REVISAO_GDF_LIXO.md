# Revisão GDF — Lixo e coleta seletiva

Base: Espia_DF_Cenario_3_Lixo_Coleta_Revisao_Completa_261029_210801.pdf.

- Quatro desafios, 15 casos, nove etapas e seis responsáveis preservados. O responsável do cadastro permanece fixo; a equipe registra o objetivo da investigação.
- Perguntas únicas por registro, opções de início claras, fala do SLU curta e depoimento do morador separado. O cronograma de segunda/quarta/sexta e terça aparece como parte da história, não como horário real do DF.
- Duas fontes pertinentes: orientações/coleta do SLU e Carta de Serviços do SLU. PMDF e fonte de quadra removidas da seleção de resíduos. Expectativa antes da consulta e descoberta depois, com página, data e referência territorial.
- Plano sem entregar a escolha do canal. Na etapa 7, três encaminhamentos possíveis; feedback sobre LAI/ouvidoria aparece depois da escolha. Links SLU e Participa DF. Nenhum envio automático.
- Fechamento com local real, fonte, data, evidência, informação encontrada, limites em relação à história, orientação e síntese coletiva. Não exige seis contribuições repetidas nem uma manifestação pública. Participação externa opcional exige registro verdadeiro, comprovante e revisão prévia do professor.
- Transições contextualizadas; etapa exibida corresponde à atividade em andamento. Status de espera retirado do HUD e do recibo do aluno nesta rota. Avaliações e ajustes continuam disponíveis na área da equipe. Acesso de demonstração continua restrito à demonstração, sem ser incorporado ao percurso do aluno.
- Missões reais desta rota abrem os próprios registros integrados de coleta, sem encaminhar para formulários de parque. Encerramento informa que a investigação foi entregue e o professor pode pedir ajustes.
- Correção geral de marcadores: botões de objetivo, pistas, passagens e legenda de agente desviam dos retângulos dos personagens; coordenadas do chão e percursos permanecem preservados.

## Verificação

Build TypeScript/Vite; suíte de regressão dos 15 casos; teste específico de resíduos; 600 formulários nos quatro tamanhos de tela; 1.200 posições de marcadores em quatro tamanhos, sem interseção com personagens. Testes de navegador usam equipes locais de QA; não equivalem a 150 percursos manuais completos.

## Publicação e limites

O ZIP é uma atualização cumulativa desde as revisões de cenário 1, saúde, território e nova quadra. Extraia e substitua os arquivos correspondentes no repositório, preservando os demais arquivos. Não apague o repositório. A Vercel publicará o commit se a integração automática estiver ativa.

Não executa SQL remoto, não migra avaliações antigas e não conclui a integração das entregas/progresso com o Supabase. Esses registros ainda usam armazenamento local do navegador. O PDF de revisão é preservado; este arquivo documenta a implementação.
