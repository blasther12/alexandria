# Fundamentos de Go

Este capítulo ensina a semântica por trás da sintaxe. Use a toolchain oficial, rode `gofmt` e escreva pequenos testes enquanto experimenta.

## Ambiente e primeiro module

```bash
go version
mkdir inventory
cd inventory
go mod init example.com/inventory
go test ./...
```

`go.mod` declara module path, versão mínima da linguagem/toolchain conforme configuração e dependências. `go.sum` registra checksums de módulos baixados; não é um lockfile completo de aplicação. O Minimal Version Selection escolhe versões segundo regras próprias do Go.

Estrutura inicial:

```text
inventory/
├── go.mod
├── cmd/inventory/main.go
├── internal/order/service.go
└── internal/order/service_test.go
```

`internal` impede import por módulos fora da árvore permitida. Não crie `pkg/` automaticamente: package público deve existir porque há consumidor e contrato.

## Paradigmas e composição

Go é multiparadigma, mas privilegia código procedural explícito e composição.
Não há classes nem herança clássica: structs carregam dados, methods associam
comportamento e interfaces são satisfeitas estruturalmente. Embedding promove
campos/métodos, mas não cria uma relação “é um”; prefira delegation quando
ownership ou invariantes precisam ficar visíveis.

Functions são valores e closures permitem estratégias, adapters e pipelines sem
tipo adicional. Um estilo funcional é possível, porém slices, maps e structs são
mutáveis por padrão e a linguagem não oferece collections persistentes ou
imutabilidade profunda nativas. Cópia, ownership e sincronização devem ser
contratos explícitos. APIs declarativas podem ser construídas sobre Go, mas o
core favorece control flow e tratamento de errors visíveis.

## Packages, exports e inicialização

Cada arquivo começa com `package`. Identifiers iniciados por maiúscula são exportados. O nome exportado deve ter comentário útil para lint e documentação:

```go
// Package order contém as regras de pedidos independentes de transporte.
package order

// Status representa o estado persistido de um pedido.
type Status string

const (
	StatusPending Status = "pending"
	StatusPaid    Status = "paid"
)
```

Inicialização de package ocorre segundo dependências, antes de `main`. Evite rede, filesystem e goroutines em `init`; side effects tornam teste, startup e ordem de falha implícitos. Faça wiring explícito em `main`.

## Variáveis, constants e zero value

```go
var retries int            // 0
var enabled bool           // false
var labels map[string]int  // nil
name := "alexandria"       // inferência local
const maxBatch = 100
```

Uma declaração sem initializer recebe zero value. Ler map nil é seguro; escrever causa panic. Slice nil aceita `append`. Escolha se `nil` e vazio têm semânticas distintas em JSON/APIs e teste o contrato.

Constants são valores de precisão arbitrária até receberem tipo/contexto. Conversões são explícitas e podem truncar; valide antes de converter input largo para tipo estreito.

## Strings, bytes e Unicode

String é sequência imutável de bytes, normalmente UTF-8 por convenção. `len` conta bytes; `range` decodifica runes:

```go
s := "ação"
fmt.Println(len(s))                    // bytes
fmt.Println(utf8.RuneCountInString(s)) // code points

for byteOffset, r := range s {
	fmt.Printf("%d %c\n", byteOffset, r)
}
```

Rune não equivale sempre ao caractere percebido pelo usuário; grapheme clusters podem conter múltiplos code points. Normalize apenas quando o domínio exigir, usando biblioteca apropriada.

Strings e slices podem manter backing storage maior vivo em algumas operações. Copie trechos pequenos derivados de buffers gigantes quando profiles mostrarem retenção.

## Arrays, slices e ownership

Array `[N]T` inclui tamanho no tipo e é copiado por valor. Slice `[]T` descreve trecho de um backing array com pointer, length e capacity:

```go
base := []int{10, 20, 30, 40}
view := base[1:3]
view[0] = 99
fmt.Println(base) // [10 99 30 40]
```

`append` pode reutilizar o array ou alocar outro. Uma API que guarda slice recebido precisa documentar/corrigir aliasing:

```go
type Batch struct{ IDs []string }

func NewBatch(ids []string) Batch {
	owned := append([]string(nil), ids...)
	return Batch{IDs: owned}
}
```

A cópia custa O(n), mas estabelece ownership. Alternativas são consumir o input ou torná-lo imutável por contrato; escolha deliberadamente.

Pré-alocar ajuda quando o tamanho é conhecido:

```go
out := make([]string, 0, len(users))
for _, user := range users {
	out = append(out, user.ID)
}
```

Não pré-aloque por reflexo com estimativas enormes: aumenta memória viva.

## Maps

```go
counts := make(map[string]int)
counts["ok"]++

value, exists := counts["missing"]
fmt.Println(value, exists) // 0 false
```

A ordem de iteração não é especificada. Se output precisa ser determinístico, ordene keys. Maps não suportam escrita concorrente segura sem sincronização. Um map também retém keys/values até removê-los; cache precisa de capacidade e expiração.

Structs comparáveis podem ser keys; slices, maps e functions não. `NaN` tem semântica de igualdade problemática e raramente deve ser key de domínio.

## Controle de fluxo

Go tem `if`, `switch`, `for` e `select`; não há `while` separado.

```go
for scanner.Scan() {
	line := scanner.Text()
	if strings.TrimSpace(line) == "" {
		continue
	}
	if err := process(line); err != nil {
		return fmt.Errorf("process line %d: %w", lineNo, err)
	}
}
if err := scanner.Err(); err != nil {
	return fmt.Errorf("scan input: %w", err)
}
```

Sempre verifique o error terminal de iteradores como `bufio.Scanner` e `rows.Err()`. Scanner tem limite de token configurável; input não confiável exige limite intencional.

## Functions, closures e `defer`

Functions podem retornar múltiplos valores. Named returns são úteis em funções pequenas, mas podem esconder estado em rotinas longas.

`defer` agenda chamada para o retorno da função, em ordem LIFO:

```go
func read(path string) (_ []byte, err error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open %q: %w", path, err)
	}
	defer func() {
		if closeErr := f.Close(); err == nil && closeErr != nil {
			err = fmt.Errorf("close %q: %w", path, closeErr)
		}
	}()
	return io.ReadAll(io.LimitReader(f, 1<<20))
}
```

Para leitura, close error muitas vezes é irrelevante; para flush/escrita, pode representar perda. Delimite uma iteração em helper se precisar de `defer` dentro de loop grande.

## Structs, methods e composition

```go
type Money struct {
	Cents    int64
	Currency string
}

func NewMoney(cents int64, currency string) (Money, error) {
	if cents < 0 || currency == "" {
		return Money{}, errors.New("invalid money")
	}
	return Money{Cents: cents, Currency: currency}, nil
}

func (m Money) Add(other Money) (Money, error) {
	if m.Currency != other.Currency {
		return Money{}, errors.New("currency mismatch")
	}
	return Money{Cents: m.Cents + other.Cents, Currency: m.Currency}, nil
}
```

Value receiver recebe cópia superficial e compõe o method set do valor e pointer. Pointer receiver pode mutar e evita cópia de struct grande. Seja consistente para um tipo; não use pointer apenas para “performance” sem medir escape/cópia.

Embedding promove methods, mas não é inheritance. Pode vazar API acidentalmente; prefira named fields quando a relação precisa ficar explícita.

## Interfaces e typed nil

Interfaces são satisfeitas implicitamente. Defina-as perto do consumidor:

```go
type Clock interface {
	Now() time.Time
}

type Service struct{ clock Clock }

func NewService(clock Clock) *Service {
	return &Service{clock: clock}
}
```

Uma interface guarda dynamic type e dynamic value. Se contém pointer nil com tipo, ela não é igual a nil:

```go
var p *os.PathError
var err error = p
fmt.Println(err == nil) // false
```

Evite retornar pointer typed nil como interface. Interfaces pequenas favorecem teste e composition; interfaces grandes criadas pelo produtor acoplam consumidores ao conjunto inteiro.

## Errors

Errors são valores. Adicione contexto, preserve causa e classifique apenas quando o chamador precisa decidir:

```go
var ErrNotFound = errors.New("not found")

func Load(ctx context.Context, id string) (Order, error) {
	order, err := repositoryLoad(ctx, id)
	if err != nil {
		return Order{}, fmt.Errorf("load order %q: %w", id, err)
	}
	return order, nil
}

func HTTPStatus(err error) int {
	if errors.Is(err, ErrNotFound) {
		return http.StatusNotFound
	}
	return http.StatusInternalServerError
}
```

Não compare mensagens. Custom error types são úteis para dados estruturados; sentinel errors para identidade estável. Expor detalhes internos pela API pode acoplar consumidores e vazar informação.

`panic` sinaliza invariant quebrada ou condição irrecuperável na inicialização, não input inválido comum. `recover` pertence a boundaries controladas, como servidor, e deve preservar diagnóstico.

## Generics

Generics são adequados quando algoritmo é realmente o mesmo para uma família de tipos:

```go
func Map[T, U any](in []T, fn func(T) U) []U {
	out := make([]U, len(in))
	for i, value := range in {
		out[i] = fn(value)
	}
	return out
}
```

Não converta domínio em framework de containers genéricos. Interfaces modelam behavior em runtime; type parameters expressam relações entre tipos em compile time. Escolha pela semântica.

## I/O e composição

`io.Reader` e `io.Writer` têm contratos pequenos que conectam arquivos, rede, compressão, hashing e testes:

```go
func copyHash(dst io.Writer, src io.Reader) (string, error) {
	h := sha256.New()
	if _, err := io.Copy(io.MultiWriter(dst, h), src); err != nil {
		return "", fmt.Errorf("copy: %w", err)
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
```

I/O permite partial read/write. Use helpers que respeitem o contrato; limite input antes de materializar. `io.ReadAll` em body externo sem limite é um risco de memória.

## Concorrência e cancellation

Goroutine precisa de owner e saída. `context` carrega deadline/cancellation request-scoped:

```go
func run(ctx context.Context, jobs <-chan Job) error {
	for {
		select {
		case <-ctx.Done():
			return context.Cause(ctx)
		case job, ok := <-jobs:
			if !ok {
				return nil
			}
			if err := handle(ctx, job); err != nil {
				return err
			}
		}
	}
}
```

O sender normalmente fecha channel; receiver não fecha para “pedir parada”. Closing faz receives restantes drenarem e depois retornarem zero value com `ok=false`. Enviar em channel fechado causa panic; fechar duas vezes também.

Buffered channel desacopla temporariamente velocidades e pode impor limite, mas não conserta ausência de capacity model. Mutex é mais simples para proteger um map; atomics cabem em estado mínimo com invariantes muito claras.

## HTTP seguro por padrão

`net/http` já cria uma goroutine por conexão/request conforme implementação, mas handlers continuam responsáveis por limites:

```go
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return fmt.Errorf("decode JSON: %w", err)
	}
	if dec.Decode(&struct{}{}) != io.EOF {
		return errors.New("body must contain one JSON value")
	}
	return nil
}
```

Configure server timeouts e `http.Client`. Reutilize clients/transports para pooling. Sempre feche response body e decida se precisa drená-lo para reutilizar conexão.

## Testes essenciais

```go
func TestMoneyAddRejectsDifferentCurrency(t *testing.T) {
	a, _ := NewMoney(100, "BRL")
	b, _ := NewMoney(100, "USD")
	if _, err := a.Add(b); err == nil {
		t.Fatal("expected currency mismatch")
	}
}
```

Use `t.Helper()` em assertion helpers, `t.Cleanup()` para recursos e `t.TempDir()` para filesystem. Paralelize testes somente quando estado global, env, clock e ports não os tornam racy.

## Checklist

- [ ] `gofmt`, `go vet` e testes passam;
- [ ] cada goroutine tem owner e término;
- [ ] I/O tem deadline/timeout e input limitado;
- [ ] errors preservam causa sem vazar secrets;
- [ ] slices/maps têm ownership e concorrência definidos;
- [ ] recursos fecham em todos os caminhos;
- [ ] API pública é pequena e documentada;
- [ ] comportamento sob overload é limitado;
- [ ] telemetry cobre boundary e SLO.

---

[← Visão geral](README.md) · [↑ Trilha Go](README.md) · [Internals →](internals.md)
