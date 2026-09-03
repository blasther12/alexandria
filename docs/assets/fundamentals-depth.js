(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const TARGET = 'chapter/fundamentos/3';

  const isTarget = () => location.hash.replace(/^#\/?/, '') === TARGET;

  const content = `
<section class="chapter-section deep-dive-intro" data-fundamentals-depth>
  <div class="eyebrow">Aprofundamento</div>
  <h2>O problema real: a CPU não executa no vazio</h2>
  <div class="deep-prose">
    <p>Quando um programa parece “CPU-bound”, é tentador imaginar que o processador está simplesmente ocupado fazendo contas. Na prática, boa parte do desempenho depende de outra pergunta: <strong>a CPU consegue receber instruções e dados rápido o bastante para manter suas unidades de execução trabalhando?</strong></p>
    <p>Processadores modernos tentam executar várias instruções ao mesmo tempo, antecipam o caminho provável de um <em>if</em>, reorganizam operações internamente e escondem latências de memória. Tudo isso funciona muito bem enquanto o código é previsível e os dados estão próximos. Quando há muitos <em>cache misses</em>, dependências entre instruções ou desvios imprevisíveis, a máquina perde paralelismo e passa a esperar.</p>
    <p>Por isso, entender performance de CPU exige conectar quatro ideias: <strong>registradores, pipeline, hierarquia de memória e predição de desvios</strong>. Elas não são detalhes isolados. Formam um único mecanismo de alimentação da CPU.</p>
  </div>
  <aside class="deep-callout"><strong>Modelo mental</strong><span>Seu código vira instruções. Instruções precisam de operandos. Operandos precisam chegar até as unidades de execução. A CPU tenta prever o futuro para não ficar parada.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">1 · Execução</div>
  <h2>A jornada de uma instrução</h2>
  <p>Uma visão simplificada de um processador moderno ajuda a entender de onde aparecem bolhas no pipeline.</p>
  <div class="deep-flow" aria-label="Fluxo simplificado de execução de uma instrução">
    <div class="deep-step"><strong>Fetch</strong><span>Busca instruções, normalmente a partir do cache L1 de instruções.</span></div>
    <div class="deep-arrow">→</div>
    <div class="deep-step"><strong>Decode</strong><span>Converte instruções da ISA em operações internas que o núcleo consegue agendar.</span></div>
    <div class="deep-arrow">→</div>
    <div class="deep-step"><strong>Rename / Dispatch</strong><span>Mapeia registradores arquiteturais para registradores físicos e distribui trabalho.</span></div>
    <div class="deep-arrow">→</div>
    <div class="deep-step"><strong>Execute</strong><span>ALUs, unidades vetoriais e load/store executam quando operandos estão disponíveis.</span></div>
    <div class="deep-arrow">→</div>
    <div class="deep-step"><strong>Retire</strong><span>Resultados tornam-se visíveis na ordem correta, preservando a semântica do programa.</span></div>
  </div>
  <div class="deep-prose">
    <p>O código parece executar linha por linha, mas internamente o processador pode ter dezenas ou centenas de operações em voo. Isso é <strong>execução fora de ordem</strong>: se uma instrução está esperando um dado da memória, outras independentes podem avançar.</p>
    <p>O limite aparece quando o processador não encontra trabalho independente. Uma cadeia como <code>a = f(a); a = g(a); a = h(a)</code> possui dependência verdadeira entre as operações. A segunda precisa do resultado da primeira. Já operações sobre dados independentes podem ser sobrepostas.</p>
  </div>
  <aside class="deep-callout"><strong>Importante</strong><span>“Fora de ordem” não significa resultado fora de ordem. A CPU pode executar antecipadamente, mas precisa preservar o comportamento observável definido pela arquitetura.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">2 · Registradores</div>
  <h2>O lugar mais barato para um valor existir</h2>
  <div class="deep-prose">
    <p>Registradores ficam dentro do núcleo e alimentam diretamente as unidades de execução. Eles guardam operandos temporários, endereços, contadores, resultados e estado de controle. A ISA expõe registradores “arquiteturais”, como registradores de propósito geral, <em>stack pointer</em>, <em>program counter</em> e registradores vetoriais.</p>
    <p>Internamente, CPUs modernas costumam ter mais registradores físicos do que aqueles visíveis na ISA. O mecanismo de <strong>register renaming</strong> permite eliminar dependências falsas. Se duas instruções escrevem no mesmo nome arquitetural, a CPU pode mapear cada escrita para um registrador físico diferente e aumentar o paralelismo.</p>
  </div>
  <div class="deep-grid deep-grid--2">
    <article class="deep-card"><h3>Dependência verdadeira</h3><p><strong>RAW, Read After Write.</strong> Uma instrução realmente precisa do resultado produzido por outra. Não existe renomeação que remova essa dependência.</p></article>
    <article class="deep-card"><h3>Dependências falsas</h3><p><strong>WAR/WAW.</strong> Duas operações usam o mesmo nome de registrador, mas não necessariamente o mesmo valor lógico. Renomeação pode separar os destinos físicos.</p></article>
  </div>
  <pre class="chapter-diagram">r1 = load A
r2 = load B
r3 = r1 + 1    ─┐
r4 = r2 + 1     ├─ podem avançar em paralelo
r5 = r3 * 2    ─┘  depende de r3</pre>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">3 · Memória</div>
  <h2>A hierarquia existe para esconder uma diferença brutal de velocidade</h2>
  <p>O processador não trata toda memória como se tivesse o mesmo custo. Ele trabalha com uma hierarquia em que capacidade aumenta enquanto proximidade e velocidade diminuem.</p>
  <div class="deep-table-wrap">
    <table class="deep-table">
      <thead><tr><th>Camada</th><th>Papel</th><th>Característica</th><th>O que isso significa para o código</th></tr></thead>
      <tbody>
        <tr><td>Registradores</td><td>Operandos imediatos</td><td>Dentro do núcleo</td><td>Ideal para valores quentes e intermediários.</td></tr>
        <tr><td>L1</td><td>Dados e instruções muito quentes</td><td>Pequeno e muito próximo</td><td>Loops sobre working sets pequenos podem ser extremamente rápidos.</td></tr>
        <tr><td>L2</td><td>Segundo nível de cache</td><td>Maior, porém mais distante</td><td>Um miss em L1 não significa ir imediatamente à RAM.</td></tr>
        <tr><td>LLC / L3</td><td>Cache de último nível</td><td>Grande e frequentemente compartilhado</td><td>Ajuda a evitar acessos à memória principal, mas sofre contenção entre núcleos.</td></tr>
        <tr><td>RAM</td><td>Working set amplo</td><td>Muito maior e muito mais distante</td><td>Acesso irregular pode deixar unidades de execução esperando dados.</td></tr>
      </tbody>
    </table>
  </div>
  <div class="deep-prose">
    <p>Quando a CPU busca um endereço, ela normalmente não traz apenas aquele valor. Ela traz um <strong>bloco de cache</strong>, também chamado de <em>cache line</em>. Em várias arquiteturas atuais é comum encontrar linhas de 64 bytes, embora isso seja uma propriedade da microarquitetura e não uma regra universal.</p>
    <p>Se uma linha tiver 64 bytes e o programa percorrer um vetor de inteiros de 4 bytes, um único carregamento pode trazer 16 inteiros vizinhos. Essa é a base da <strong>localidade espacial</strong>. Se os mesmos dados forem reutilizados pouco depois, temos <strong>localidade temporal</strong>.</p>
  </div>
  <div class="deep-grid deep-grid--3">
    <article class="deep-card"><h3>Localidade espacial</h3><p>Acessar endereços próximos aumenta a chance de aproveitar bytes já trazidos pela mesma cache line.</p></article>
    <article class="deep-card"><h3>Localidade temporal</h3><p>Reutilizar rapidamente um dado aumenta a chance de ele continuar em algum nível de cache.</p></article>
    <article class="deep-card"><h3>Working set</h3><p>É o conjunto de dados ativo em uma janela de execução. Quando ele cresce além dos caches, misses se tornam mais frequentes.</p></article>
  </div>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">Exemplo guiado</div>
  <h2>Por que a ordem de um loop pode mudar tanto a performance?</h2>
  <p>Em C, uma matriz declarada como <code>int matrix[N][N]</code> usa normalmente organização <em>row-major</em>: os elementos de uma mesma linha ficam contíguos em memória.</p>
  <div class="deep-code-pair">
    <article>
      <h3>Percurso amigável ao cache</h3>
      <pre class="chapter-code"><code>for (int row = 0; row &lt; N; row++) {
  for (int col = 0; col &lt; N; col++) {
    sum += matrix[row][col];
  }
}</code></pre>
      <p>Os endereços avançam de forma contígua. A cache line traz dados que serão usados logo depois, e o prefetcher de hardware consegue reconhecer o padrão.</p>
    </article>
    <article>
      <h3>Percurso hostil ao cache</h3>
      <pre class="chapter-code"><code>for (int col = 0; col &lt; N; col++) {
  for (int row = 0; row &lt; N; row++) {
    sum += matrix[row][col];
  }
}</code></pre>
      <p>Cada acesso salta por uma linha inteira. Quando N é grande, a CPU pode carregar uma cache line, usar poucos bytes e descartá-la antes de reutilizá-la.</p>
    </article>
  </div>
  <aside class="deep-callout"><strong>A lição não é “sempre percorra linhas”.</strong><span>A lição é entender o layout físico dos dados e alinhar o padrão de acesso a esse layout.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">Além do básico</div>
  <h2>Cache não é apenas “L1, L2 e L3”</h2>
  <div class="deep-prose">
    <p>Dois mecanismos adicionais aparecem rapidamente quando você investiga aplicações reais: <strong>TLB</strong> e <strong>prefetching</strong>.</p>
    <p>A CPU trabalha com endereços virtuais. A tradução para endereços físicos passa por tabelas de páginas, e a <strong>TLB</strong> funciona como um cache dessas traduções. Um working set espalhado por muitas páginas pode provocar TLB misses mesmo quando o padrão parece razoável do ponto de vista de cache de dados.</p>
    <p>Já o <strong>prefetcher</strong> tenta detectar padrões, como acessos sequenciais, e trazer linhas antes de elas serem requisitadas. Acessos com stride regular costumam ser mais fáceis de antecipar do que perseguição de ponteiros em estruturas dispersas.</p>
  </div>
  <div class="deep-grid deep-grid--2">
    <article class="deep-card"><h3>Array contíguo</h3><p>Endereços previsíveis, boa densidade de dados por cache line e excelente oportunidade para prefetch.</p></article>
    <article class="deep-card"><h3>Estrutura ligada por ponteiros</h3><p>Cada nó pode estar em uma região distante. O próximo endereço só fica conhecido depois que o nó atual chega.</p></article>
  </div>
  <p class="deep-note">É por isso que um algoritmo teoricamente “melhor” em Big O pode perder em dados pequenos ou médios para outro que usa memória de maneira muito mais amigável.</p>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">4 · Branch prediction</div>
  <h2>A CPU aposta no caminho antes de saber a resposta</h2>
  <div class="deep-prose">
    <p>Um pipeline profundo não pode simplesmente esperar toda condição de um <code>if</code> ser resolvida antes de buscar as próximas instruções. Por isso, o processador usa <strong>predição de desvios</strong>: ele tenta adivinhar se o branch será tomado e qual será o próximo endereço de execução.</p>
    <p>Quando acerta, o trabalho especulativo continua e a latência do branch fica quase escondida. Quando erra, instruções executadas pelo caminho incorreto precisam ser descartadas. A CPU então busca o caminho correto, criando uma penalidade que depende da microarquitetura e da profundidade do pipeline.</p>
  </div>
  <div class="deep-grid deep-grid--2">
    <article class="deep-card"><h3>Branch previsível</h3><pre class="mini-code">if (i &lt; limit) { ... }</pre><p>Padrões repetitivos ou altamente enviesados são relativamente fáceis de aprender.</p></article>
    <article class="deep-card"><h3>Branch imprevisível</h3><pre class="mini-code">if (random_bit()) { ... }</pre><p>Resultados próximos de aleatórios retiram do predictor a regularidade necessária para acertar consistentemente.</p></article>
  </div>
  <aside class="deep-callout"><strong>Branchless não é sinônimo de mais rápido.</strong><span>Trocar um branch previsível por mais instruções pode piorar o programa. O objetivo é medir o caminho crítico, não colecionar truques de micro-otimização.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">5 · Paralelismo interno</div>
  <h2>IPC, latência e throughput contam histórias diferentes</h2>
  <div class="deep-prose">
    <p><strong>IPC</strong>, instruções por ciclo, é uma forma útil de pensar quanto trabalho a CPU consegue completar a cada ciclo. Um IPC baixo não significa automaticamente “CPU fraca”. Pode indicar dependências, frontend sem instruções, cache misses, branch misses ou gargalos em uma unidade específica.</p>
    <p><strong>Latência</strong> é quanto uma operação individual demora. <strong>Throughput</strong> é quantas operações podem ser iniciadas ou concluídas em uma janela. Uma CPU pode esconder uma operação de alta latência mantendo várias independentes em voo.</p>
    <p>Esse é o motivo pelo qual código com mais independência entre operações pode usar melhor uma CPU superscalar do que código formado por uma longa cadeia de dependências.</p>
  </div>
  <pre class="chapter-diagram">ciclo 1   load A ────────────────┐
          load B ────────────┐    │
ciclo 2   trabalho independente   │  latências se sobrepõem
ciclo 3              B chega ─────┘
ciclo 4                   A chega

versus

load A → espera → usa A → gera B → espera → usa B
          cadeia de dependência reduz paralelismo</pre>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">6 · Engenharia prática</div>
  <h2>Onde isso aparece num backend comum?</h2>
  <div class="deep-grid deep-grid--2">
    <article class="deep-card"><h3>Serialização e parsing</h3><p>Percorrer buffers de forma linear tende a aproveitar melhor caches do que estruturas com muitas indireções e objetos espalhados.</p></article>
    <article class="deep-card"><h3>Hash maps</h3><p>São O(1) em média, mas hashing, buckets, colisões e acessos dispersos podem gerar mais tráfego de memória do que uma estrutura compacta.</p></article>
    <article class="deep-card"><h3>Object graphs</h3><p>Muitos objetos pequenos significam mais ponteiros, mais metadados e menor densidade útil por cache line.</p></article>
    <article class="deep-card"><h3>Batching</h3><p>Processar vários itens por vez pode aumentar reutilização de dados, reduzir overhead por item e favorecer vetorização.</p></article>
    <article class="deep-card"><h3>Concorrência</h3><p>Threads trabalhando em dados próximos podem invalidar cache lines umas das outras. O caso clássico é <strong>false sharing</strong>.</p></article>
    <article class="deep-card"><h3>GC e runtimes</h3><p>Layout de objetos, alocação e movimentação de memória influenciam caches mesmo quando a linguagem esconde ponteiros.</p></article>
  </div>
  <aside class="deep-callout"><strong>False sharing</strong><span>Duas threads podem alterar variáveis logicamente independentes que residem na mesma cache line. A coerência passa a invalidar a linha entre núcleos, criando tráfego sem existir compartilhamento lógico do dado.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">7 · Medição</div>
  <h2>Como provar que o gargalo é microarquitetural</h2>
  <p>Antes de mudar o código, tente transformar a hipótese em contadores observáveis. Em Linux, <code>perf</code> é uma das ferramentas mais úteis. Os eventos disponíveis variam conforme CPU, kernel e permissões.</p>
  <pre class="chapter-code"><code>perf stat \
  -e cycles,instructions,branches,branch-misses,cache-references,cache-misses \
  ./seu-programa

perf record -g ./seu-programa
perf report</code></pre>
  <div class="deep-table-wrap">
    <table class="deep-table">
      <thead><tr><th>Sinal</th><th>Pergunta útil</th><th>Hipótese possível</th></tr></thead>
      <tbody>
        <tr><td>instructions / cycles</td><td>Quanto trabalho termina por ciclo?</td><td>IPC baixo pode apontar stalls ou dependências.</td></tr>
        <tr><td>branch-misses</td><td>Os desvios estão sendo previstos?</td><td>Controle imprevisível pode esvaziar o pipeline.</td></tr>
        <tr><td>cache-misses</td><td>Os dados quentes estão próximos?</td><td>Working set grande ou acesso irregular.</td></tr>
        <tr><td>perfil de CPU</td><td>Onde os ciclos estão concentrados?</td><td>Hotspot real pode estar longe da função suspeita.</td></tr>
      </tbody>
    </table>
  </div>
  <p class="deep-note">Contadores agregados precisam de contexto. Um cache-miss rate maior não é necessariamente ruim se o programa executa muito menos instruções ou reduz o tempo total.</p>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">Experimento</div>
  <h2>Um laboratório simples que vale mais que decorar a hierarquia</h2>
  <ol class="chapter-list deep-lab-list">
    <li>Crie um vetor pequeno o bastante para caber confortavelmente em cache e outro muito maior.</li>
    <li>Percorra os vetores sequencialmente e registre tempo e contadores.</li>
    <li>Repita acessando posições em ordem pseudoaleatória.</li>
    <li>Compare cache misses, IPC e tempo total.</li>
    <li>Depois teste uma matriz em ordem de linha e em ordem de coluna.</li>
    <li>Por fim, adicione um branch altamente previsível e outro alimentado por dados aleatórios.</li>
  </ol>
  <aside class="deep-callout"><strong>O objetivo do laboratório</strong><span>Não é produzir um benchmark “científico” perfeito. É tornar visível a relação entre layout de dados, previsibilidade, cache e utilização da CPU.</span></aside>
</section>

<section class="chapter-section deep-section">
  <div class="eyebrow">Conexões</div>
  <h2>O que você deve levar para os próximos temas</h2>
  <div class="deep-prose">
    <p>Esses mecanismos reaparecem em praticamente todo o restante da Alexandria. Estruturas de dados alteram localidade. Garbage collectors mudam padrões de memória. Bancos dependem de pages e buffers. Sistemas distribuídos adicionam uma escala de latência ainda maior. Observabilidade precisa distinguir tempo consumido executando de tempo consumido esperando.</p>
    <p>O ponto central é abandonar a ideia de que “complexidade computacional” e “performance real” são a mesma coisa. Big O continua essencial, mas uma máquina real executa instruções sobre uma hierarquia real de memória, com pipelines, caches, predictors e limites físicos.</p>
  </div>
</section>

<section class="chapter-section deep-section deep-checkpoint">
  <div class="eyebrow">Checkpoint</div>
  <h2>Você entendeu o mecanismo?</h2>
  <details><summary>Por que um array pode superar uma estrutura com menos operações teóricas?</summary><p>Porque custo real inclui movimento de memória. Dados contíguos aproveitam cache lines, prefetching e menor quantidade de indireções. Dependendo do tamanho do problema, isso pode superar a vantagem algorítmica teórica de outra estrutura.</p></details>
  <details><summary>Por que uma cache miss reduz paralelismo?</summary><p>Ela pode atrasar o operando de que uma instrução depende. A CPU tenta executar trabalho independente enquanto espera, mas quando a janela de instruções não contém trabalho suficiente, unidades de execução ficam ociosas.</p></details>
  <details><summary>Por que uma predição errada custa mais do que apenas avaliar a condição?</summary><p>Porque o processador já pode ter buscado, decodificado e executado especulativamente várias instruções do caminho errado. Esse trabalho precisa ser descartado antes de o caminho correto avançar.</p></details>
  <details><summary>Por que “branchless” não é uma regra universal?</summary><p>Um branch previsível pode ser barato. Removê-lo pode adicionar instruções, leituras ou dependências. A versão melhor depende dos dados, do compilador e da microarquitetura, portanto precisa ser medida.</p></details>
</section>`;

  function inject() {
    if (!isTarget()) return;
    const hero = app.querySelector('.chapter-hero');
    const main = app.querySelector('.chapter-layout > main');
    if (!hero || !main || app.querySelector('[data-fundamentals-depth]')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'fundamentals-depth-stack';
    wrapper.innerHTML = content;

    const firstGenericSection = main.querySelector('.chapter-section');
    if (firstGenericSection) main.insertBefore(wrapper, firstGenericSection);
    else main.prepend(wrapper);

    const lead = hero.querySelector('.lead');
    if (lead) lead.textContent = 'Entenda como registradores, pipeline, caches, localidade e branch prediction determinam quanto trabalho uma CPU moderna realmente consegue sustentar.';
  }

  const observer = new MutationObserver(() => queueMicrotask(inject));
  observer.observe(app, { childList: true, subtree: true });
  addEventListener('hashchange', () => setTimeout(inject, 0));
  addEventListener('DOMContentLoaded', inject);
  setTimeout(inject, 0);
})();
