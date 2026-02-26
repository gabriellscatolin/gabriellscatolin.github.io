<<<<<<< HEAD:documents/gdd.md
<img src="../assets/logointeli.png">


# GDD - Game Design Document - Módulo 1 - Inteli

**_Os trechos em itálico servem apenas como guia para o preenchimento da seção. Por esse motivo, não devem fazer parte da documentação final_**

## Nome do Grupo:
Cielitos
#### Nomes dos integrantes do grupo
- Ana Alícia Medina Santos da Rocha Nunes
- Eduardo Melquiades Amaral 
- Gabriel Thomas Correia Scatolin 
- Lucas Komatsu Borten 
- Matheus Correia
- Nicolas Dely 
- Rachel Silvestre
- Sofia Brandão

## Sumário

[1. Introdução](#c1)

[2. Visão Geral do Jogo](#c2)

[3. Game Design](#c3)

[4. Desenvolvimento do jogo](#c4)

[5. Casos de Teste](#c5)

[6. Conclusões e trabalhos futuros](#c6)

[7. Referências](#c7)

[Anexos](#c8)

<br>

## Lista de figuras

Figura 1 - Sprite sheet personagens jogáveis

Figura 2 - Personagens jogáveis

Figura 3 - Personagens secundários

Figura 4 - Foto perfil personagens secundários

Figura 5 - Cenários dos estabelecimentos internamente

# <a name="c1"></a>1. Introdução (sprints 1 a 4)

## 1.1. Plano Estratégico do Projeto

### 1.1.1. Contexto da indústria (sprint 2)

&emsp; A Cielo S.A. posiciona-se como a líder nacional no setor de adquirência e serviços financeiros, desempenhando um papel sistêmico na economia brasileira. Fundada em 1995 (originalmente como VisaNet), a companhia evoluiu de uma processadora de transações para uma plataforma de tecnologia de ponta voltada ao varejo. Com presença capilarizada em 99% do território nacional, a Cielo detém uma abrangência sem paralelos, atendendo desde microempreendedores até gigantes do varejo corporativo.     [1](#ref1)
<br>&emsp;O impacto da organização é mensurável: em 2022, a empresa processou aproximadamente 9 bilhões de transações, movimentando o equivalente a 7% do Produto Interno Bruto (PIB) brasileiro. [2](#ref2) Esse volume financeiro é sustentado por um ecossistema que ultrapassa a "maquininha", incluindo soluções de e-commerce, logística de pagamentos, antecipação de recebíveis e análise de dados (Big Data).
<br>&emsp;Atualmente, a indústria de meios de pagamento no Brasil atravessa um cenário de hipercompetitividade e disrupção tecnológica. A Cielo enfrenta concorrentes de peso como Rede, Stone, Getnet e PagSeguro, além da ascensão das fintechs e do sistema PIX, que alteraram o comportamento de consumo. [3](#ref3) Nesse contexto, o diferencial competitivo da Cielo não reside apenas na tecnologia, mas na capacidade consultiva de sua força de vendas.
<br>&emsp;A estratégia atual da companhia foca na transformação digital e na excelência do atendimento. Para manter a liderança, é imperativo que o time de vendas possua um conhecimento homogêneo e profundo sobre o portfólio. O uso de ferramentas de gamificação surge, portanto, como uma resposta estratégica para garantir a equidade no aprendizado e a atualização constante dos vendedores em um mercado que se redefine a cada ciclo tecnológico. [4](#ref4)



#### 1.1.1.1. Modelo de 5 Forças de Porter (sprint 2)

&emsp; A Análise de 5 Forças de Porter é um framework utilizado para entender a competitividade que uma marca tem no mercado frente a agentes externos: a ameaça de novos entrantes no mercado, o poder de barganha dos seus fornecedores, o poder de barganha dos seus clientes, a ameaça de produtos substitutos e a rivalidade com seus concorrentes. [5](#ref5)

&emsp; Sob essa perspectiva, observa-se na figura 1 a análise feita pelo grupo de forma personalizada buscando entender as possíveis adversidades no mercado, mostrando preparo e cuidado ao entender as necessidades do parceiro.

<div align="center">
<sub>Figura 1 - Análise de 5 Forças de Porter - Cielo</sub>
<img src="../gdd_images/forças_porter.jpeg">
<sup>Fonte: Equipe cielitos, Faculdade Inteli 2026</sup>
</div>

**Ameaça de Novos Entrantes**

A ameaça de novos entrantes no setor de pagamentos e adquirência em que a Cielo atua é considerada moderada a baixa, devido à presença de barreiras estruturais, regulatórias e competitivas. As principais barreiras incluem:

Regulação e compliance:
 A entrada no mercado exige autorização do Banco Central do Brasil, além do cumprimento de normas rigorosas de segurança, governança e compliance, tornando o processo complexo, custoso e demorado.
Requisitos de capital e tecnologia:
 São necessários investimentos elevados em infraestrutura tecnológica, segurança da informação, sistemas de processamento de pagamentos e mão de obra altamente especializada.
Escala operacional:
 Operar de forma competitiva requer grande volume de transações para diluição de custos, o que dificulta a entrada de novos players sem escala consolidada.

Impacto Potencial:
 Apesar das barreiras, fintechs e soluções digitais inovadoras exercem pressão competitiva ao oferecer serviços mais flexíveis, integrados e de menor custo.

**Ameaça de Produtos ou Serviços Substitutos**

A ameaça de produtos ou serviços substitutos para a Cielo é considerada alta, devido à existência de alternativas que podem reduzir a dependência dos comerciantes das maquininhas tradicionais. Os principais substitutos incluem:

Substitutos diretos:
 Empresas consolidadas do setor de adquirência, como Stone, PagSeguro, Rede e Getnet, oferecem soluções similares de processamento de pagamentos, competindo diretamente com os serviços da Cielo.

Alternativas às maquininhas tradicionais:
 O Pix permite pagamentos instantâneos sem a necessidade de maquininhas, reduzindo custos para os comerciantes e aumentando sua adoção.
 Além disso, transações via criptomoedas surgem como uma alternativa emergente, eliminando intermediários e, em alguns casos, dispensando o uso de adquirentes.

Impacto do Nível de Ameaça:
    A crescente adoção de meios de pagamento digitais e instantâneos pressiona o modelo tradicional de adquirência, podendo reduzir volumes de transações e margens.


**Análise do Poder de Barganha dos Clientes**

A base de clientes da Cielo é composta por pequenos e médios comerciantes, grandes redes varejistas e negócios digitais.

Pequenos e Médios Comerciantes:
  Possuem alto poder de barganha devido à baixa barreira de saída e à alta sensibilidade a preços, o que pressiona a redução de taxas.

Grandes Varejistas:
  Exercem forte pressão por meio do alto volume transacionado, exigindo condições personalizadas que impactam as margens da empresa.

Negócios Digitais:
 Demandam integração tecnológica e segurança, exigindo investimentos contínuos em inovação.
Impacto na Indústria: O elevado poder de barganha dos clientes gera uma compressão das margens de lucro. A Cielo mitiga esse cenário utilizando sua infraestrutura robusta e portfólio de serviços integrados para elevar o custo de troca e reter os clientes.


**Análise do Poder de Barganha dos Fornecedores**

Os principais fornecedores da Cielo são as bandeiras de cartão (Visa, Mastercard, Elo), fabricantes de terminais POS (maquininhas), provedores de infraestrutura de nuvem e desenvolvedores de software de segurança.

Bandeiras e Tecnologia Crítica:
 Possuem alto poder de barganha por definirem padrões mundiais e oferecerem tecnologias de difícil substituição, o que torna a Cielo dependente de suas regras e sistemas.

Fornecedores de Insumos Padronizados: 
 Apresentam baixo poder de barganha, pois a Cielo utiliza plataformas de gestão e compras em escala para forçar a competitividade entre diferentes empresas de serviços

Gestão de Fornecedores:
 A Cielo aplica códigos de conduta e auditorias de conformidade para reduzir riscos e evitar a dependência excessiva de parceiros específicos.

Impacto na Indústria: O poder de barganha é moderado a relevante. Enquanto as bandeiras limitam a flexibilidade de custos, a Cielo mitiga esse impacto através de processos estratégicos de sourcing e automação, garantindo que fornecedores de menor complexidade não comprometam sua margem operacional.

**Rivalidade entre Concorrentes Existentes**

A rivalidade no setor de meios de pagamento eletrônicos no Brasil é considerada alta, com grandes competidores como PagSeguro, Stone, Mercado Pago, Rede, SafraPay, InfinitePay, SumUp, C6 Pay e SuperGet. Os principais fatores que intensificam essa rivalidade enfrentada pela Cielo incluem:

Baixa diferenciação dos produtos:
 As empresas oferecem soluções funcionalmente semelhantes, como maquininhas de cartão, pagamentos digitais e integrações para e-commerce, reduzindo a diferenciação percebida pelos clientes.

Competição por preço e condições comerciais:
 A disputa ocorre principalmente em torno de taxas cobradas, prazos de recebimento e custos de equipamentos, pressionando margens e tornando a concorrência mais agressiva.

Baixo custo de troca e baixa fidelização:
 A ausência de contratos de exclusividade permite que comerciantes utilizem múltiplas maquininhas simultaneamente, aumentando o poder de escolha dos clientes e dificultando a retenção.

Impacto da Rivalidade : A elevada rivalidade limita a rentabilidade média do setor e exige investimentos contínuos em inovação, tecnologia e diferenciação. Como resposta, as empresas buscam ampliar seus portfólios com serviços financeiros integrados, como antecipação de recebíveis, crédito e soluções de gestão, com o objetivo de aumentar o valor percebido e fortalecer a fidelização dos clientes.


### 1.1.2. Análise SWOT (sprint 2)

&emsp; A Matriz SWOT (Strengths, Weaknesses, Opportunities e Threats) é um framework que busca trazer uma análise abrangente das diferentes características de uma empresa, projeto ou processo, visando avaliar a posição competitiva deste elemento no mercado com base em dados. [6](#ref6) Por meio da Matriz SWOT, é possível visualizar fatores internos (Forças e Fraquezas) e fatores externos (Oportunidades e Ameaças) que afetam o desempenho do objeto em questão. [2](#ref2)

&emsp; A Figura 2 apresenta uma Matriz SWOT elaborada para a empresa Cielo, com base nos princípios descritos no parágrafo anterior. Essa matriz destaca como a organização se posiciona frente aos principais fatores internos (forças e fraquezas) e externos (oportunidades e ameaças) identificados na análise.

<div align="center">
  <sub>Figura 2 - Análise SWOT - Cielo</sub>
  <img src="../gdd_images/matriz_swot.png">
  <sup>Fonte: Equipe cielitos, Faculdade Inteli 2026</sup>
</div>

#### Forças (Strengths) 
1. **Liderança e Capilaridade de Mercado:** Presente em 99% do território brasileiro, a Cielo possui a maior rede de aceitação do país, o que garante uma vantagem competitiva em volume de transações.

2. **Ecossistema Tecnológico Adaptativo:** A implementação de tecnologias como o Cielo Tap (NFC) transforma smartphones em maquininhas, reduzindo a barreira de entrada para microempreendedores

3. **Multibandeira e Homologação:** A companhia é homologada com as principais bandeiras globais e locais, oferecendo segurança e estabilidade operacional superior aos novos entrantes.

4. **Portfólio Customizado:** Capacidade de oferecer produtos distintos (Cielo Lio, Cielo Zip, e-commerce) que atendem desde o pequeno varejo até grandes corporações.

### Fraquezas (Weaknesses)

1. **Dependência do Varejo Físico:** Embora esteja em transição digital, a maior parte da receita ainda provém de transações físicas, tornando-a vulnerável a crises de mobilidade ou fechamento de comércio

2. **Custos Operacionais Elevados:** A logística de manutenção e substituição de hardware (maquininhas) gera um custo fixo significativamente maior que o de competidores puramente digitais.

3. **Desafios de Fidelização (Churn):** Devido à "guerra das maquininhas", a fidelidade do cliente é baixa, com alta sensibilidade a taxas e custos de aluguel. [7](#ref7)

### Oportunidades (Opportunities)

1. **Expansão dos Meios Digitais:** O crescimento exponencial do Pix e do e-commerce permite à Cielo atuar como gateway de pagamento, indo além do hardware físico. 

2. **Novos Modelos de Negócio (Logística):** O aumento do serviço de entregas (delivery) gera demanda por soluções de pagamento móveis e integradas a aplicativos. 

3. **Data Intelligence:** Utilizar o volume massivo de dados transacionados (7% do PIB) para oferecer serviços de consultoria e análise de crédito para lojistas. 

### Ameaças (Threats)
1. **Hipercompetitividade (Guerra de Taxas):** A entrada agressiva de players como Stone, PagSeguro e fintechs força a compressão das margens de lucro. 

2. **Insegurança e Fraudes:** Ataques cibernéticos e fraudes em cartões trazem riscos financeiros e de reputação para a marca. [14]

3. **Desintermediação (Blockchain/DeFi):** O surgimento de tecnologias que eliminam intermediários financeiros pode ameaçar o modelo de negócio de adquirência a longo prazo.

 &emsp;Com base nesta análise SWOT, destacamos que a Cielo S.A. pode utilizar sua liderança absoluta e capilaridade de mercado para aproveitar as oportunidades de expansão nos meios de pagamento digitais e serviços baseados em dados, como o Pix e o e-commerce. [1](#ref1)Isso mitigaria os riscos de dependência do varejo físico, aplicando uma estratégia de diversificação de receita que vai além do hardware tradicional.
 &emsp; Além disso, a Cielo fortaleceria sua posição contra a concorrência acirrada e a ameaça de novos entrantes ao investir na capacitação de sua força de vendas, garantindo que inovações como o Cielo Tap sejam disseminadas com eficiência e segurança. [5](#ref5) Ademais, a hipercompetitividade do setor e a volatilidade econômica são dificultadores diretos, já que a compressão de margens exige uma operação extremamente enxuta e consultiva. Este cenário em que a Cielo está inserida é altamente desafiador e compartilhado por concorrentes como Rede, Stone e PagSeguro. [6](#ref6) Entretanto, seu foco em tecnologia de ponta e a busca por equidade no aprendizado de seus colaboradores são fatores essenciais que lhe permitem manter a soberania e a competitividade no mercado nacional.


### 1.1.3. Missão / Visão / Valores (sprint 2)

Missão, Visão e Valores são os três pilares fundamentais que definem a identidade e o propósito de uma empresa ou projeto.[10](#ref10) Definir esses conceitos é essencial para ter uma concepção clara de si mesma, de sua filosofia e até mesmo da maneira como deve ser estruturada e gerida.

**Missão:** Desenvolver um jogo educacional capaz de capacitar gerentes de negócios que vivem em regiões mais afastadas, promovendo equidade no acesso à formação em vendas e reduzindo a diferença de aprendizado em relação aos profissionais localizados nos grandes centros urbanos. [9](#ref9)

**Visão:** Ser referência em jogos educacionais para capacitação em vendas, destacando-se pela acessibilidade, jogabilidade e impacto social

**Valores:** Os valores do projeto refletem os princípios éticos e operacionais que guiam o desenvolvimento do jogo, assegurando o alinhamento com a cultura de inovação e responsabilidade da Cielo S.A. [12](#ref12)

Equidade e Acessibilidade: Garantir a democratização do conhecimento, assegurando que o aprendizado esteja disponível para todos os profissionais, independentemente de sua localização geográfica ou condição socioeconômica.

Inovação e Gamificação: Utilizar tecnologias disruptivas para transformar processos de treinamento tradicionais em experiências de aprendizado dinâmicas e eficazes.

Aprendizagem Contínua (Lifelong Learning): Fomentar uma cultura de autodesenvolvimento, incentivando a atualização constante das competências necessárias para o mercado de adquirência. [2](#ref2)

Foco na Experiência (UX/Gamer): Priorizar a usabilidade e a jogabilidade, garantindo uma interface simples, intuitiva e envolvente para maximizar a retenção do conhecimento.

Impacto Social e Produtivo: Contribuir diretamente para a formação profissional de qualidade, gerando oportunidades reais de crescimento e performance na rede de vendas. [8](#ref8)


### 1.1.4. Proposta de Valor (sprint 4)

*Posicione aqui o canvas de proposta de valor. Descreva os aspectos essenciais para a criação de valor da ideia do produto com o objetivo de ajudar a entender melhor a realidade do cliente e entregar uma solução que está alinhado com o que ele espera.*

### 1.1.5. Descrição da Solução Desenvolvida (sprint 4)

*Descreva brevemente a solução desenvolvida para o parceiro de negócios. Descreva os aspectos essenciais para a criação de valor da ideia do produto com o objetivo de ajudar a entender melhor a realidade do cliente e entregar uma solução que está alinhado com o que ele espera. Observe a seção 2 e verifique que ali é possível trazer mais detalhes, portanto seja objetivo aqui. Atualize esta descrição até a entrega final, conforme desenvolvimento.*

### 1.1.6. Matriz de Riscos (sprint 4)

*Registre na matriz os riscos identificados no projeto, visando avaliar situações que possam representar ameaças e oportunidades, bem como os impactos relevantes sobre o projeto. Apresente os riscos, ressaltando, para cada um, impactos e probabilidades com plano de ação e respostas.*

### 1.1.7. Objetivos, Metas e Indicadores (sprint 4)

*Definição de metas SMART (específicas, mensuráveis, alcançáveis, relevantes e temporais) para seu projeto, com indicadores claros para mensuração*

## 1.2. Requisitos do Projeto (sprints 1 e 2)

Os requisitos do projeto descrevem as funcionalidades e características necessárias para o desenvolvimento do jogo, considerando as demandas do parceiro e as decisões do grupo. Eles orientam a implementação técnica e a experiência do usuário, devendo ser atualizados sempre que houver mudanças no projeto.

<div align="center">

<sub>Tabela 1 - Requisitos do Projeto</sub>

\# | Requisito  
--- | ---
1| O jogo deverá apresentar uma tela inicial contendo as opções “Jogar”, “Créditos” e “Configurações”.
2| O controle do personagem deverá ser realizado por meio das teclas WASD para movimentação no ambiente do jogo.
3| O jogo deverá ser desenvolvido para a plataforma web, permitindo acesso via navegador sem necessidade de instalação.
4| O jogo deverá apresentar um mapa interativo que represente estabelecimentos do cotidiano dos usuários, possibilitando o acompanhamento do deslocamento e progresso do personagem.
5| O jogador deverá interagir com NPCs que simulam situações de atendimento e venda, baseadas em contextos reais do parceiro.
6| As mecânicas do jogo deverão possibilitar o aprendizado de conceitos de serviço e técnicas de venda utilizadas pelo parceiro, integradas à narrativa e às missões.
7| O jogo deverá conter missões vinculadas ao ganho de moedas, utilizadas como sistema de progressão e recompensa.
8| O jogo deverá utilizar referências visuais, cores e logotipos da Cielo, respeitando a identidade visual do parceiro.
9| O jogo deverá incluir quizzes e puzzles ao longo da experiência para reforçar o aprendizado, permitindo o registro de métricas de acertos e falhas dos jogadores.
10| O jogo deverá apresentar instruções claras e progressivas, possibilitando que o jogador compreenda as mecânicas e avance de forma intuitiva.
11| As missões do jogo deverão ser inspiradas em missões reais já utilizadas pelo parceiro, e o trajeto do personagem deverá ser baseado nas rotas reais utilizadas pelos vendedores da Cielo.
12| O jogo deverá contar com uma câmera de acompanhamento no formato side-scroller/top-down.
13| As etapas de venda do parceiro deverão seguir o mesmo passo a passo ao longo do jogo durante as interações.

<sub>Fonte: Autoria Própria (2026) </sub>
</div>

## 1.3. Público-alvo do Projeto (sprint 2)

O público-alvo é definido como o extrato demográfico e profissional para o qual o produto é direcionado, permitindo a personalização da linguagem e das mecânicas de engajamento para maximizar a conversão educacional. [11] No contexto do Mini Mundo Cielo, o foco reside na padronização da excelência comercial em escala nacional.

### Perfil Demográfico e Profissional
**Segmento:** Novos Gerentes de Negócios (GN) da área comercial da Cielo S.A.

**Escolaridade:** Ensino Médio completo (mínimo exigido para a função).

**Faixa Etária Média:** 44 anos (Perfil de adultos com experiência prévia em vendas ou transição de carreira).

**Necessidade Operacional:** Profissionais em fase de onboarding que necessitam de domínio rápido do portfólio (Cielo Tap, Lio, e-commerce) e da cultura organizacional. [1]

**Distribuição Geográfica e Escala**
  O projeto visa atender uma demanda anual de aproximadamente 3.000 novos profissionais, caracterizando-se por uma alta dispersão geográfica que justifica a digitalização do treinamento.

**Justificativa de Gamificação Digital**
A transição dos jogos físicos presenciais para o Mini Mundo Cielo representa a evolução da estratégia de learning & development da companhia. Ao digitalizar dinâmicas que já possuem eficácia comprovada, a Cielo elimina barreiras geográficas e garante que um Gerente de Negócios no Norte tenha a mesma equidade de aprendizado e acesso às ferramentas que um profissional no Sudeste. [14] 



# <a name="c2"></a>2. Visão Geral do Jogo (sprint 2)

## 2.1. Objetivos do Jogo (sprint 2)

O objetivo do jogo é capacitar o jogador em técnicas de atendimento e vendas por meio de missões interativas que simulam situações reais do cotidiano comercial. Para avançar, o jogador deve interagir com NPCs, resolver desafios, responder quizzes e concluir tarefas relacionadas ao processo de venda. A progressão ocorre por fases e recompensas, permitindo acompanhar a evolução das habilidades desenvolvidas ao longo da experiência.

Fonte: Elaboração própria com base em conceitos de serious games (Michael & Chen, 2006; Deterding et al., 2011).

## 2.2. Características do Jogo (sprint 2)
O jogo possui foco educacional com elementos de gamificação, priorizando acessibilidade, narrativa guiada e aprendizado progressivo por meio de simulação de contextos comerciais.

### 2.2.1. Gênero do Jogo (sprint 2)
O jogo é classificado como serious game educacional, combinando elementos de simulação, RPG leve e aventura narrativa. A experiência enfatiza tomada de decisão, interação com personagens e resolução de situações de venda baseadas em cenários reais.

### 2.2.2. Plataforma do Jogo (sprint 2)

O jogo será desenvolvido para desktop, com acesso via navegador, dispensando instalação.

Dispositivo: Computadores desktop e notebooks.
Sistema: Navegadores modernos compatíveis (Google Chrome, Microsoft Edge e Firefox).

### 2.2.3. Número de jogadores (sprint 2)

O jogo é projetado para um jogador (single player), permitindo experiência individual focada no aprendizado e na progressão personalizada das habilidades de vendas.

### 2.2.4. Títulos semelhantes e inspirações (sprint 2)

O projeto se inspira em jogos que utilizam progressão por tarefas, interação com personagens e evolução gradual do jogador. Um dos principais referenciais é Stardew Valley, que apresenta mecânicas de rotina, missões e interação com NPCs, influenciando a estrutura de progressão do jogo.

Outra inspiração é Pokémon FireRed, que contribui com a lógica de progressão por objetivos, desbloqueio de novas áreas e evolução contínua das habilidades do jogador. Esses elementos orientam a organização das fases e o sistema de recompensas do projeto.

O jogo também se baseia em princípios de gamificação e serious games aplicados à aprendizagem profissional.

### 2.2.5. Tempo estimado de jogo (sprint 5)

*Ex. O jogo pode ser concluído em 3 horas passando por todas as fases.*

*Ex. cada partida dura até 15 minutos*

# <a name="c3"></a>3. Game Design (sprints 2 e 3)

## 3.1. Enredo do Jogo (sprints 2 e 3)

*Descreva o enredo/história do jogo, criando contexto para os personagens (seção 3.2) e o mundo do jogo (seção 3.3). Uma boa história costuma ter um arco narrativo de contexto, conflito e resolução. Utilize etapas sequenciais para descrever esta história.* 

*Caso seu jogo não possua enredo/história (ex. jogo Tetris), mencione os motivos de não existir e como o jogador pode se contextualizar com o ambiente do jogo.*

## 3.2. Personagens (sprints 2 e 3)

### 3.2.1. Controláveis

*Descreva os personagens controláveis pelo jogador. Mencione nome, objetivos, características, habilidades, diferenciais etc. Utilize figuras (character art, sprite sheets etc.) para ilustrá-los. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes.* 

*Caso não existam personagens (ex. jogo Tetris), mencione os motivos de não existirem e como o jogador pode interpretar tal fato.*

### 3.2.2. Non-Playable Characters (NPC)

*\<opcional\> Se existirem coadjuvantes ou vilões, aqui é o local para descrevê-los e ilustrá-los. Utilize listas ou tabelas para organizar esta seção. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes. Caso não existam NPCs, remova esta seção.*

### 3.2.3. Diversidade e Representatividade dos Personagens

 A concepção do elenco fundamenta-se na senioridade e capilaridade nacional dos gerentes de vendas da Cielo (Seção 1.3), espelhando a pluralidade demográfica reportada pelo IBGE (Censo 2022). O grupo, com idade média de 44 anos, reflete a maturidade exigida pelo cargo de gestão. A escolha de nomes e sobrenomes frequentes no registro civil brasileiro (Santos, Oliveira, Souza) âncora os avatares na realidade cotidiana, evitando o distanciamento causado por nomes estrangeiros ou genéricos.

**Adequação ao Público-Alvo:** O jogo apresenta estrita consonância com o perfil dos colaboradores. Ao utilizar avatares que ocupam a mesma faixa geracional e profissional dos jogadores, estabelece-se o pertencimento. Dandara, Gabriel, João Vitor e Maya não são apenas figuras estéticas; eles representam a diversidade regional (SP, PE, RS, BA) em que a Cielo atua. Isso garante que o treinamento corporativo seja percebido como uma extensão do ambiente de trabalho real, aumentando o engajamento através da identificação.

**Justificativa e Equidade:** As escolhas de design promovem a equidade ao descentralizar a liderança de um único perfil fenotípico. A inclusão de Dandara Santos (mulher negra, 44 anos) e João Vitor (homem negro, 45 anos) em cargos de gerência valida a presença de grupos historicamente sub-representados em postos de decisão. O projeto assegura que a autoridade no jogo seja distribuída de forma equânime entre gêneros e raças, reforçando o compromisso da marca com uma cultura corporativa inclusiva.

**Inovação na Representatividade:** A inovação deste projeto reside na desconstrução de estereótipos regionais e étnicos. Ao posicionar João Vitor, um homem negro, como representante de Pelotas (RS), e Maya Souza, uma mulher branca, representando Salvador (BA), o jogo desafia o viés inconsciente que tende a homogeneizar a população de certas regiões. Essa escolha demonstra criatividade ao celebrar a miscigenação real e a mobilidade profissional dentro do território brasileiro, oferecendo uma representação mais sofisticada e menos caricata do que a mídia tradicional costuma apresentar.

## 3.3. Mundo do jogo (sprints 2 e 3)

### 3.3.1. Locações Principais e/ou Mapas (sprints 2 e 3)

*Descreva o ambiente do jogo, em que locais ele ocorre. Ilustre com imagens. Se houverem mapas, posicione-os aqui, descrevendo as áreas em acordo com o enredo. Se houverem fases, descreva-as também em acordo com o enredo (pode ser um jogo de uma fase só). Utilize listas ou tabelas para organizar esta seção. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes.*

### 3.3.2. Navegação pelo mundo (sprints 2 e 3)

*Descreva como os personagens se movem no mundo criado e as relações entre as locações – como as áreas/fases são acessadas ou desbloqueadas, o que é necessário para serem acessadas etc. Utilize listas ou tabelas para organizar esta seção.*

### 3.3.3. Condições climáticas e temporais (sprints 2 e 3)

*\<opcional\> Descreva diferentes condições de clima que podem afetar o mundo e as fases, se aplicável*

*Caso seja relevante, descreva como o tempo passa, se ele é um fator limitante ao jogo (ex. contagem de tempo para terminar uma fase)*

### 3.3.4. Concept Art (sprint 2)

*Inclua imagens de Concept Art do jogo que ainda não foram demonstradas em outras seções deste documento. Para cada imagem, coloque legendas, como no exemplo abaixo.*

<img src="../assets/concept1.jpg">

Figura 1: detalhe da cena da partida do herói para a missão, usando sua nave

### 3.3.5. Trilha sonora (sprint 4)

*Descreva a trilha sonora do jogo, indicando quais músicas serão utilizadas no mundo e nas fases. Utilize listas ou tabelas para organizar esta seção. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes.*

*Exemplo de tabela*
\# | titulo | ocorrência | autoria
--- | --- | --- | ---
1 | tema de abertura | tela de início | própria
2 | tema de combate | cena de combate com inimigos comuns | Hans Zimmer
3 | ... 

## 3.4. Inventário e Bestiário (sprint 3)

### 3.4.1. Inventário

*\<opcional\> Caso seu jogo utilize itens ou poderes para os personagens obterem, descreva-os aqui, indicando títulos, imagens, meios de obtenção e funções no jogo. Utilize listas ou tabelas para organizar esta seção. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes.* 

*Exemplo de tabela*
\# | item |  | como obter | função | efeito sonoro
--- | --- | --- | --- | --- | ---
1 | moeda | <img src="../assets/coin.png"> | há muitas espalhadas em todas as fases | acumula dinheiro para comprar outros itens | som de moeda
2 | madeira | <img src="../assets/wood.png"> | há muitas espalhadas em todas as fases | acumula madeira para construir casas | som de madeiras
3 | ... 

### 3.4.2. Bestiário

*\<opcional\> Caso seu jogo tenha inimigos, descreva-os aqui, indicando nomes, imagens, momentos de aparição, funções e impactos no jogo. Utilize listas ou tabelas para organizar esta seção. Caso utilize material de terceiros em licença Creative Commons, não deixe de citar os autores/fontes.* 

*Exemplo de tabela*
\# | inimigo |  | ocorrências | função | impacto | efeito sonoro
--- | --- | --- | --- | --- | --- | ---
1 | robô terrestre | <img src="../assets/inimigo2.PNG"> |  a partir da fase 1 | ataca o personagem vindo pelo chão em sua direção, com velocidade constante, atirando parafusos | se encostar no inimigo ou no parafuso arremessado, o personagem perde 1 ponto de vida | sons de tiros e engrenagens girando
2 | robô voador | <img src="../assets/inimigo1.PNG"> | a partir da fase 2 | ataca o personagem vindo pelo ar, fazendo movimento em 'V' quando se aproxima | se encostar, o personagem perde 3 pontos de vida | som de hélice
3 | ... 

## 3.5. Gameflow (Diagrama de cenas) (sprint 2)

*Posicione aqui seu "storyboard de programação" - o diagrama de cenas do jogo. Indique, por exemplo, como o jogo começa, quais opções o jogador tem, como ele avança nas fases, quais as condições de 'game over', como o jogo reinicia. Seu diagrama deve representar as classes, atributos e métodos usados no jogo.*

## 3.6. Regras do jogo (sprint 3)

*Descreva aqui as regras do seu jogo: objetivos/desafios, meios para se conseguir alcançar*

*Ex. O jogador deve pilotar o carro e conseguir terminar a corrida dentro de um minuto sem bater em nenhum obstáculo.*

*Ex. O jogador deve concluir a fase dentro do tempo, para obter uma estrela. Se além disso ele coletar todas as moedas, ganha mais uma estrela. E se além disso ele coletar os três medalhões espalhados, ganha mais uma estrela, totalizando três. Ao final do jogo, obtendo três estrelas em todas as fases, desbloqueia o mundo secreto.*  

## 3.7. Mecânicas do jogo (sprint 3)

*Descreva aqui as formas de controle e interação que o jogador tem sobre o jogo: quais os comandos disponíveis, quais combinações de comandos, e quais as ações consequentes desses comandos. Utilize listas ou tabelas para organizar esta seção.*

*Ex. Em um jogo de plataforma 2D para desktop, o jogador pode usar as teclas WASD para mecânicas de andar, mirar para cima, agachar, e as teclas JKL para atacar, correr, arremesar etc.*

*Ex. Em um jogo de puzzle para celular, o jogador pode tocar e arrastar sobre uma peça para movê-la sobre o tabuleiro, ou fazer um toque simples para rotacioná-la*

## 3.8. Implementação Matemática de Animação/Movimento (sprint 4)

*Descreva aqui a função que implementa a movimentação/animação de personagens ou elementos gráficos no seu jogo. Sua função deve se basear em alguma formulação matemática (e.g. fórmula de aceleração). A explicação do funcionamento desta função deve conter notação matemática formal de fórmulas/equações. Se necessário, crie subseções para sua descrição.*

# <a name="c4"></a>4. Desenvolvimento do Jogo

## 4.1. Desenvolvimento preliminar do jogo (sprint 1)

## 1. Estrutura do projeto: 
O projeto foi estruturado de forma modular, separando os diferentes eixos do sistema em arquivos distintos, como cenas, assets e códigos principais, incluindo a separação do arquivo main.js. 
Essa organização facilita a manutenção, a leitura do código e o trabalho em equipe.
Os principais arquivos são:
Main.js: arquivo responsável por inicializar o jogo e gerenciar as cenas.
index.html: arquivo responsável pelas configurações da página web e pela integração com o main.js.

## 2. Estrutura dos Personagens:
A primeira versão do jogo teve como foco principal o desenvolvimento visual e conceitual, priorizando a criação dos personagens e dos cenários iniciais que compõem o universo do jogo.

2.1. Desenvolvimento de personagens jogáveis:

Nesta etapa, foram desenvolvidos alguns personagens jogáveis em pixel art 2D utilizando o site piskelapp.com.
Os personagens foram pensados para permitir futuras animações.
Sprites dos personagens jogáveis:

<div align="center">
	
<sub>Figura 1 - Sprite sheet personagens jogáveis</sub>

<img src="../src/assets/imagens/imagensGdd/sprite_sheet_protagonistas_gdd.png">

<sub>Figura 2 - Personagens jogáveis</sub>

<img src="../src/assets/imagens/imagensGdd/personagens_protagonistas_gdd.png">

<sub>Fonte: Autoria Própria usando o Piskel (2026)Descrição: imagem do sprite sheet dos personagens jogáveis</sub>
</div>
	
Os sprites foram criados seguindo um padrão de tamanho e proporção, facilitando sua utilização posterior no código do jogo e garantindo consistência visual entre os personagens.

2.2. Desenvolvimento de personagens secundários:

Além dos personagens jogáveis, foram desenvolvidos personagens secundários (NPCs), que representam diferentes profissões e ambientes do jogo. Esses NPCs contribuem para a ambientação e a narrativa, sendo que cada um representa um integrante do grupo.
Sprites dos personagens secundários:

<div align="center">
	
<sub>Figura 3 - Personagens secundários </sub>

<img src="../src/assets/imagens?imagensGdd/personagens_secundarios_gdd.png">
</div>

<div align="center">
<sub>Fonte: Autoria Própria usando o Piskel (2026) Descrição: imagem dos personagens secundários que trabalham no comércios do jogo</sub>
</div>
	
<sub>Figura 4 - Foto perfil personagens secundários </sub>

<img src="../src/assets/imagens?imagensGdd/fotos_personagens_secundarios_gdd.png">

<div align="center">
<sub>Fonte: Autoria Própria usando o Piskel e Inteligência Artifcial (2026) Descrição: imagens detalhada dos personagens secundários que trabalham no comércios do jogo</sub>
</div>

## 3. Estrutura dos cenários iniciais:
Foram desenvolvidos cenários iniciais em pixel art utilizando ferramentas de inteligência artificial. Esses cenários representam os primeiros ambientes que o jogador irá explorar.

<sub>Figura 5 - Cenários dos estabelecimentos internamente</sub>

<img src="../src/assets/imagens/imagensGdd/foto_cenarios_gdd.png">

<sub>Fonte: Autoria Própria usando Inteligência Artifcial (2026) Descrição: imagens dos cenários internos do jogo</sub>
</div>

## 4.2. Desenvolvimento básico do jogo (sprint 2)

*Descreva e ilustre aqui o desenvolvimento da versão básica do jogo, explicando brevemente o que foi entregue em termos de código e jogo. Utilize prints de tela para ilustrar. Indique as eventuais dificuldades e próximos passos.*

## 4.3. Desenvolvimento intermediário do jogo (sprint 3)

*Descreva e ilustre aqui o desenvolvimento da versão intermediária do jogo, explicando brevemente o que foi entregue em termos de código e jogo. Utilize prints de tela para ilustrar. Indique as eventuais dificuldades e próximos passos.*

## 4.4. Desenvolvimento final do MVP (sprint 4)

*Descreva e ilustre aqui o desenvolvimento da versão final do jogo, explicando brevemente o que foi entregue em termos de MVP. Utilize prints de tela para ilustrar. Indique as eventuais dificuldades e planos futuros.*

## 4.5. Revisão do MVP (sprint 5)

*Descreva e ilustre aqui o desenvolvimento dos refinamentos e revisões da versão final do jogo, explicando brevemente o que foi entregue em termos de MVP. Utilize prints de tela para ilustrar.*

# <a name="c5"></a>5. Testes

## 5.1. Casos de Teste (sprints 2 a 4)

*Os casos de teste são conjuntos de condições, ações, dados de entrada e resultados esperados, projetados para verificar se uma funcionalidade específica de um software funciona corretamente.*  

| #  | Pré-condição                                             | Descrição do teste                                                                 | Pós-condição                                                                 |
|----|----------------------------------------------------------|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| 1  | Carregamento da tela inicial.                            | Iniciar SceneInicial.js                                                             | Cena carregada corretamente.                                                 |
| 2  | Exibição do fundo.                                       | Verificar se o fundo carrega corretamente.                                          | Fundo visível e na posição correta.                                          |
| 3  | Botões da tela inicial.                                  | Verificar se os botões da tela inicial estão funcionando.                           | Os botões da tela inicial estão funcionando corretamente.                    |
| 4  | Animação dos botões da tela inicial.                     | Checar o funcionamento das animações dos botões da tela inicial.                   | As animações estão funcionando.                                              |
| 5  | Transição da tela inicial para seleção de personagens.   | Transição da SceneInicial para ScenePersonagem.                                     | A transição está em funcionamento.                                           |
| 6  | Seleção de personagens.                                  | Ver se os personagens carregam corretamente e passar o mouse sobre eles.           | Personagens carregam como esperado e a interação ao passar o mouse funciona.|
| 7  | Carregar o mundo com o personagem escolhido.             | Clicar no ícone do personagem e verificar se o mundo carrega corretamente.         | Mundo carregado com o spritesheet do personagem escolhido.                  |
| 8  | Movimentação do jogador.                                 | Usar teclas direcionais para mover o jogador.                                       | Personagem se move como esperado.                                            |
| 9  | Colisão com obstáculos.                                  | Tentar atravessar as barreiras.                                                      | Personagem não atravessa os obstáculos.                                      |
| 10 | Tutorial.                                                | Observar o tutorial após iniciar o jogo.                                            | O tutorial aparece corretamente.                                             |

<sub>Fonte: Autoria Própria (2026) </sub>
</div>

## 5.2. Testes de jogabilidade (playtests) (sprint 5)

### 5.2.1 Registros de testes

*Descreva nesta seção as sessões de teste/entrevista com diferentes jogadores. Registre cada teste conforme o template a seguir.*

Nome | João Jonas (use nomes fictícios)
--- | ---
Já possuía experiência prévia com games? | sim, é um jogador casual
Conseguiu iniciar o jogo? | sim
Entendeu as regras e mecânicas do jogo? | entendeu as regras, mas sobre as mecânicas, apenas as essenciais, não explorou os comandos complexos
Conseguiu progredir no jogo? | sim, sem dificuldades  
Apresentou dificuldades? | Não, conseguiu jogar com facilidade e afirmou ser fácil
Que nota deu ao jogo? | 9.0
O que gostou no jogo? | Gostou  de como o jogo vai ficando mais difícil ao longo do tempo sem deixar de ser divertido
O que poderia melhorar no jogo? | A responsividade do personagem aos controles, disse que havia um pouco de atraso desde o momento do comando até a resposta do personagem

### 5.2.2 Melhorias

*Descreva nesta seção um plano de melhorias sobre o jogo, com base nos resultados dos testes de jogabilidade*

# <a name="c6"></a>6. Conclusões e trabalhos futuros (sprint 5)

*Escreva de que formas a solução do jogo atingiu os objetivos descritos na seção 1 deste documento. Indique pontos fortes e pontos a melhorar de maneira geral.*

*Relacione os pontos de melhorias evidenciados nos testes com plano de ações para serem implementadas no jogo. O grupo não precisa implementá-las, pode deixar registrado aqui o plano para futuros desenvolvimentos.*

*Relacione também quaisquer ideias que o grupo tenha para melhorias futuras*

# <a name="c7"></a>7. Referências (sprint 5)

&emsp; Optou-se pela utilização das normas da APA (American Psychological Association) em vez das normas da ABNT (Associação Brasileira de Normas Técnicas), com o intuito de alinhar o projeto a padrões internacionais de formatação e citação, favorecendo sua aplicação e reconhecimento em contextos acadêmicos e profissionais fora do Brasil.

## 7. Referências

<br><a name="ref1">[1]:</a>
CIELO S.A. **Quem somos**. Disponível em: https://www.cielo.com.br/institucional/. Acesso em: 26 fev. 2026.
<br><a name="ref2">[2]:</a> 
Cielo. (2022). Relatório anual integrado 2022. Recuperado em 26 fev. 2026, de
https://www.cielo.com.br/docs/sustentabilidade/2022/pt-br/Relatorio-Anual-Integrado-2022.pdf
<br><a name="ref3">[3]:</a>
VALOR ECONÔMICO. **Guerra das maquininhas: Cielo reage e disputa se acirra**. Disponível em: https://valor.globo.com/. Acesso em: 26 fev. 2026.
<br><a name="ref4">[4]:</a>
 HARVARD BUSINESS REVIEW. **How Gamification Can Help Your Employees Learn**. Disponível em: https://hbr.org/. Acesso em: 26 fev. 2026.
<br><a name="ref5">[5]:</a> 
Júnior, H. (2015). As cinco forças de porter e os fatores críticos de sucesso: Uma análise da tomada de decisões estratégicas na empresa Total Eletro em Pau dos Ferros-RN. Universidade do Estado do Rio Grande do Norte. Disponível em: https://www.uern.br/controledepaginas/2015-/arquivos/5018helder_viana_marinho_de_oliveira_janior.pdf. Acesso em: 26 fev. 2026.
<br><a name="ref6">[6]:</a> Cielo. (s.d.). Como fazer análise SWOT. Blog Cielo. 
https://blog.cielo.com.br/vender/como-fazer-analise-swot/ acesso em 26 fev. 2026
<br><a name="ref7">[7]:</a> Exame. (2020, janeiro 27). O pior da guerra das maquininhas de fato passou para a Cielo? Exame. https://exame.<br><a name="ref8">[8]:</a>com/negocios/o-pior-da-guerra-das-maquininhas-de-fato-passou-para-a-cielo/ Acesso em: 26 fevereiro 2026.
Exame. (2016, maio 3). Cielo vê concorrência mais agressiva e retração de clientes. Exame. https://exame.com/negocios/cielo-ve-concorrencia-mais-agressiva-e-retracao-de-clientes/ Acesso em: 26 fevereiro 2026.
<br><a name="ref9">[9]:</a>Kotler, P.; Keller, K. Administração de Marketing.
Sebrae (2022). Planejamento estratégico empresarial. acessado em: 18 fevereiro 2026
<br><a name="ref10">[10]:</a> Corrales, J. A. (2019, maio 8). Entenda o que é a missão e a visão de uma empresa com o exemplo de 3 marcas de sucesso. Rock Content - BR; Rock Content. https://rockcontent.com/br/blog/missao-e-visao
<br><a name="ref11">[11]:</a>Desidério, M. (2017, agosto 14). 5 dicas essenciais para definir o público-alvo do seu negócio. Exame. https://exame.com/pme/5-dicas-essenciais-para-definir-o-publico-alvo-do-seu-negocio/ Acesso em: 26 fevereiro 2026.
<br><a name="ref12">[12]:</a>Serviço Brasileiro de Apoio às Micro e Pequenas Empresas (Sebrae). (s.d.). ESG: o que é e qual é a importância? Saiba aqui! https://sebrae.com.br/sites/PortalSebrae/ufs/pe/artigos/esg-o-que-e-e-qual-e-a-importancia-saiba-aqui,4ef39fd767ede710VgnVCM100000d701210aRCRD Acesso em: 26 fevereiro 2026.







LUCK, Heloisa. Liderança em gestão escolar. 4. ed. Petrópolis: Vozes, 2010. <br>
SOBRENOME, Nome. Título do livro: subtítulo do livro. Edição. Cidade de publicação: Nome da editora, Ano de publicação. <br>

INTELI. Adalove. Disponível em: https://adalove.inteli.edu.br/feed. Acesso em: 1 out. 2023 <br>
SOBRENOME, Nome. Título do site. Disponível em: link do site. Acesso em: Dia Mês Ano

# <a name="c8"></a>Anexos

*Inclua aqui quaisquer complementos para seu projeto, como diagramas, imagens, tabelas etc. Organize em sub-tópicos utilizando headings menores (use ## ou ### para isso)*
=======;
