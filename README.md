# Curso A-Frame: Prototipagem rápida de Realidade Virtual e Aumentada com A-Frame

Material prático de um curso de **3 horas** sobre [A-Frame](https://aframe.io) 1.8 para criar ambientes de
**Realidade Virtual (RV)** e **Realidade Aumentada (RA)** que rodam no navegador — no PC, no celular e em óculos
como o Meta Quest — publicados de graça no **GitHub Pages** de cada participante.

> Abra o site publicado (`https://SEU-USUARIO.github.io/curso-aframe/`) para ver o índice com todos os exemplos,
> exercícios e QR codes para abrir no celular.

---

## 1. Faça a sua cópia e publique (5 minutos, só pelo navegador)

1. Entre (ou crie a conta gratuita) em <https://github.com>.
2. Nesta página do repositório, clique em **Use this template → Create a new repository**.
   - *Repository name*: `curso-aframe`
   - Visibilidade: **Public** (o GitHub Pages gratuito exige repositório público)
   - Clique em **Create repository**.
3. No **seu** repositório: **Settings → Pages**.
   - *Build and deployment → Source*: **Deploy from a branch**
   - *Branch*: **main** e pasta **/ (root)** → **Save**.
4. Aguarde 1–2 minutos e recarregue a página de *Settings → Pages*: aparecerá
   **“Your site is live at https://SEU-USUARIO.github.io/curso-aframe/”**.
5. Abra o link. Pronto: o índice do curso é o seu site, com HTTPS — requisito para RV/RA.

> Sem botão “Use this template”? Use **Fork**, ou baixe o ZIP e envie os arquivos com
> **Add file → Upload files** num repositório novo e público.

## 2. Como editar

| Jeito | Quando usar | Como |
|---|---|---|
| **github.dev** (recomendado na aula) | Qualquer computador, nada para instalar | No repositório, aperte a tecla **`.`** (ponto). Abre um VS Code no navegador. Edite, vá em *Source Control*, escreva a mensagem e **Commit & Push**. |
| Editor do GitHub | Mudança rápida num arquivo | Abra o arquivo → ícone de lápis → **Commit changes**. |
| VS Code + Live Server | Trabalho contínuo, testar sem publicar | Clone o repositório, instale a extensão *Live Server*, clique em **Go Live**. |
| Servidor Python | Sem VS Code | Na pasta do projeto: `python -m http.server 8000` → <http://localhost:8000> |

Depois de cada *commit*, o GitHub Pages republica em ~1 minuto (veja a aba **Actions**). Recarregue com
**Ctrl+Shift+R** para evitar o cache. **Não abra os arquivos com duplo clique** (`file://`): modelos e texturas
não carregam; use sempre um servidor (Pages, Live Server ou Python).

## 3. Estrutura

```
index.html                 ← índice (portal) com roteiro, links e QR codes
marcadores.html            ← marcadores/alvos de RA para imprimir
exemplos/01 … 10           ← exemplos comentados linha a linha
exercicios/ex1 … ex4       ← exercícios com TODOs  ·  exercicios/solucoes/
projeto-final/             ← Mostruário 3D (RV + RA) gerado a partir de uma lista
js/curso-utilitarios.js    ← componentes medir-modelo e ajustar-tamanho
assets/
  modelos/                 ← GLB (NASA, Khronos) + peça CAD (STEP e GLB)
  meus-modelos/            ← coloque aqui os SEUS arquivos
  texturas/ ceu/ sons/     ← imagens, céu 360°, som
  fontes/                  ← fonte SDF com acentos para <a-text>
  marcadores/              ← Hiro, marcador do curso (.patt) e alvo MindAR (.mind)
```

## 4. Versões usadas (não misture!)

| Página | Biblioteca | A-Frame |
|---|---|---|
| Exemplos 01–08, exercícios 1–3, projeto final | A-Frame 1.8.0 (+ aframe-extras 7.7.0, environment 1.5.0) | **1.8.0** |
| Exemplo 09, exercício 4B | AR.js 3.4.8 | **1.6.0** |
| Exemplo 10, exercício 4C | MindAR 1.2.5 | **1.5.0** |

## 5. Onde cada coisa funciona

- **RV**: PC (mouse/teclado), celular (giroscópio), óculos com navegador WebXR (Meta Quest, Pico, Apple Vision Pro).
- **RA WebXR (exemplo 08)**: Chrome no Android com *Google Play Services for AR*, e Meta Quest. **Não** funciona no iPhone.
- **RA por marcador/imagem (09 e 10)**: qualquer celular com câmera, inclusive iPhone (Safari).

## 6. Problemas comuns

- **Tela branca/preta** → abra o Console (F12) e leia o primeiro erro em vermelho.
- **Modelo não aparece** → caminho errado (maiúsculas/minúsculas!), escala gigante/minúscula, ou modelo atrás de você.
- **Botão VR/AR não aparece** → página sem HTTPS, navegador sem WebXR, ou (AR) faltou `xr-mode-ui="XRMode: ar"`.
- **Câmera não abre (09/10)** → permita o acesso à câmera; feche outros apps que a usam.
- **Mudança não aparece** → aguarde o deploy (aba *Actions*) e use Ctrl+Shift+R.

Créditos dos modelos e imagens: [CREDITOS.md](CREDITOS.md). Código sob licença [MIT](LICENSE).
