---
inclusion: always
---

<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.

   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
------------------------------------------------------------------------------------->

# Diretrizes de UX e Design — Paleta de Cores AWS

## Paleta de Cores (Baseada na Marca AWS)

- **Primária (Ações & Destaques):** #0972D3 (AWS Cloudscape Blue) — botões, links, estados ativos
- **Secundária (Acentos & Hover):** #FF9900 (AWS Orange) — efeitos de hover, elementos de destaque, call-to-action
- **Escura (Cabeçalhos & Navegação):** #252F3E (AWS Squid Ink) — navbar, sidebar, footer backgrounds
- **Prioridade Alta / Urgente:** #D91515 (AWS Red) — tarefas atrasadas, estados de erro, indicadores de alta prioridade
- **Prioridade Média / Atenção:** #FF9900 (AWS Orange) — prazos se aproximando, prioridade média
- **Prioridade Baixa / Sucesso:** #037F0C (AWS Green) — tarefas concluídas, estados de sucesso, prioridade baixa
- **Fundo:** #FAFAFA (Cinza Claro) — fundo da página para contraste limpo
- **Cards & Superfícies:** #FFFFFF (Branco) — fundo dos cards com sombra sutil

## Design Visual

- Usar interface limpa e minimalista com bastante espaço em branco
- Usar cantos arredondados (border-radius: 8px) em cards e botões
- Fonte: System font stack para performance (system-ui, -apple-system, sans-serif)
- Sombra dos cards: 0 1px 4px rgba(0, 0, 0, 0.1) para profundidade sutil

## Cards de Tarefas

- Mostrar prioridade como borda colorida à esquerda de cada card (4px solid, usando cores de prioridade acima)
- Exibir tags como pequenos badges coloridos com cantos arredondados
- Mostrar data de vencimento com urgência visual (vermelho se atrasada, laranja se vence hoje, cinza se futura)
- Manter ações (editar, excluir, concluir) como botões de ícone visíveis no hover
- Badges de status: "A Fazer" em Squid Ink, "Em Progresso" em AWS Blue, "Concluída" em AWS Green

## Acessibilidade

- Todos os elementos interativos devem ser navegáveis por teclado
- Usar HTML semântico (main, nav, section, article)
- Manter contraste mínimo de 4.5:1 para texto
- Incluir aria-labels em botões com apenas ícone
- Indicadores de foco devem ser visíveis (usar contorno AWS Blue)
