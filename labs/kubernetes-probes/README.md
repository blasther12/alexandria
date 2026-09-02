# Lab · Kubernetes probes e rollout

## Objetivo

Entender a diferença operacional entre `startupProbe`, `readinessProbe` e `livenessProbe` e observar como uma configuração ruim transforma lentidão em restart storm.

## Pré-requisitos

- `kubectl`;
- cluster local como kind, minikube ou Docker Desktop Kubernetes.

## Experimento

Suba uma aplicação simples com três endpoints:

```text
/live   -> 200 enquanto o processo está saudável
/ready  -> 200 apenas quando pode receber tráfego
/slow   -> demora propositalmente para iniciar
```

Configure inicialmente:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 3

livenessProbe:
  httpGet:
    path: /live
    port: 8080
  periodSeconds: 3
```

Observe:

```bash
kubectl get pods -w
kubectl describe pod <pod>
kubectl get events --sort-by=.lastTimestamp
```

## Quebrar de propósito

Faça `/live` depender de um banco indisponível ou introduza atraso superior ao timeout da liveness.

Observe se o Pod entra em reinicialização repetitiva.

## Recuperar

- mova dependências remotas para readiness;
- use startup probe se a inicialização for lenta;
- ajuste `failureThreshold`, intervalos e timeout com base em comportamento real.

## Evidência esperada

Registre:

- `restartCount`;
- eventos de probe failure;
- diferença entre estar vivo e estar pronto;
- comportamento durante rollout.

## Perguntas

1. Quando liveness piora um incidente?
2. O que readiness deveria testar e o que deveria evitar?
3. Como graceful shutdown conversa com rollout e readiness?
