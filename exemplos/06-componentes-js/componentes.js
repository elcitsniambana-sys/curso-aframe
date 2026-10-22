/* =====================================================================
   CURSO A-FRAME · Exemplo 06 — Componentes personalizados
   ---------------------------------------------------------------------
   Arquitetura Entidade-Componente-Sistema (ECS):
     • Entidade  = um <a-entity> (um "contêiner" vazio, um nó do grafo de cena)
     • Componente = um pedaço reutilizável de dados + comportamento (este arquivo!)
     • Sistema   = gerencia globalmente todos os componentes de um tipo (opcional)

   Ciclo de vida de um componente (os métodos mais usados):
     schema  → declara as propriedades (com tipo e valor padrão)
     init()  → chamado UMA vez, quando o componente é anexado
     update(oldData) → chamado após init e sempre que uma propriedade muda
     tick(time, timeDelta) → chamado a CADA quadro (≈ 60–90 vezes por segundo)
     remove() → limpeza ao remover o componente (listeners, objetos criados…)

   IMPORTANTE: componentes devem ser registrados ANTES do <a-scene> no HTML.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) girar — gira a entidade continuamente usando tick().
   Uso: <a-box girar="velocidade: 90; eixo: y"></a-box>
   --------------------------------------------------------------------- */
AFRAME.registerComponent('girar', {
  schema: {
    velocidade: { type: 'number', default: 45 },               // graus por segundo
    eixo: { type: 'string', default: 'y', oneOf: ['x', 'y', 'z'] }
  },

  tick: function (time, timeDelta) {
    // timeDelta está em milissegundos. Multiplicar pelo delta torna o movimento
    // independente da taxa de quadros (60 Hz no PC, 72/90/120 Hz nos óculos).
    var radianos = THREE.MathUtils.degToRad(this.data.velocidade) * (timeDelta / 1000);
    this.el.object3D.rotation[this.data.eixo] += radianos;   // acesso direto ao three.js (rápido)
  }
});

/* ---------------------------------------------------------------------
   2) trocar-cor — a cada clique, avança para a próxima cor da lista.
   Uso: <a-sphere trocar-cor="cores: #e11d48, #2563eb, #16a34a"></a-sphere>
   --------------------------------------------------------------------- */
AFRAME.registerComponent('trocar-cor', {
  schema: {
    cores: { type: 'array', default: ['#E11D48', '#2563EB', '#16A34A', '#F59E0B'] }
  },

  init: function () {
    this.indice = 0;
    // Guardamos a função "amarrada" (bind) para poder removê-la depois em remove().
    this.aoClicar = this.aoClicar.bind(this);
    this.el.addEventListener('click', this.aoClicar);
  },

  aoClicar: function () {
    this.indice = (this.indice + 1) % this.data.cores.length;
    this.el.setAttribute('material', 'color', this.data.cores[this.indice]);
    // Componentes também podem EMITIR eventos para outros componentes ouvirem.
    this.el.emit('cor-trocada', { cor: this.data.cores[this.indice] });
  },

  remove: function () {
    this.el.removeEventListener('click', this.aoClicar);
  }
});

/* ---------------------------------------------------------------------
   3) gerador — clique numa superfície e crie objetos no ponto atingido.
   Mostra: criar entidades por JavaScript, usar o ponto de interseção do
   raycaster e limitar a quantidade (boa prática de desempenho).
   Uso: <a-plane class="clicavel" gerador="max: 30"></a-plane>
   --------------------------------------------------------------------- */
AFRAME.registerComponent('gerador', {
  schema: {
    max: { type: 'int', default: 25 },
    forma: { type: 'string', default: 'sphere', oneOf: ['sphere', 'box', 'cone', 'torus'] }
  },

  init: function () {
    this.criados = [];
    this.el.addEventListener('click', (evt) => {
      // evt.detail.intersection.point é um THREE.Vector3 em coordenadas do MUNDO.
      var p = evt.detail.intersection && evt.detail.intersection.point;
      if (!p) return;

      var novo = document.createElement('a-entity');
      var cor = new THREE.Color().setHSL(Math.random(), 0.7, 0.55).getStyle();
      // Cada primitiva tem suas próprias propriedades de geometria:
      var GEOMETRIAS = {
        sphere: { primitive: 'sphere', radius: 0.12 },
        box:    { primitive: 'box', width: 0.22, height: 0.22, depth: 0.22 },
        cone:   { primitive: 'cone', radiusBottom: 0.12, radiusTop: 0, height: 0.25 },
        torus:  { primitive: 'torus', radius: 0.1, radiusTubular: 0.03 }
      };
      novo.setAttribute('geometry', GEOMETRIAS[this.data.forma]);
      novo.setAttribute('material', { color: cor, roughness: 0.4 });
      novo.setAttribute('position', { x: p.x, y: p.y + 0.12, z: p.z });
      // "Cai" do alto: animação de entrada
      novo.setAttribute('animation', { property: 'position', from: p.x + ' ' + (p.y + 1.5) + ' ' + p.z,
                                       to: p.x + ' ' + (p.y + 0.12) + ' ' + p.z, dur: 600, easing: 'easeOutBounce' });
      this.el.sceneEl.appendChild(novo);
      this.criados.push(novo);

      // Mantém no máximo "max" objetos: remove o mais antigo.
      if (this.criados.length > this.data.max) {
        var velho = this.criados.shift();
        velho.parentNode.removeChild(velho);
      }
      this.el.emit('objeto-criado', { total: this.criados.length });
    });
  }
});

/* ---------------------------------------------------------------------
   4) encarar-camera — "billboard": a entidade sempre vira para a câmera.
   Mostra: acessar a câmera ativa e usar object3D.lookAt (three.js).
   Uso: <a-entity encarar-camera text="value: Olá"></a-entity>
   --------------------------------------------------------------------- */
AFRAME.registerComponent('encarar-camera', {
  init: function () {
    this.alvo = new THREE.Vector3();
  },
  tick: function () {
    var camera = this.el.sceneEl.camera;               // THREE.Camera ativa
    if (!camera) return;
    camera.getWorldPosition(this.alvo);
    this.alvo.y = this.el.object3D.getWorldPosition(new THREE.Vector3()).y; // só gira em Y
    this.el.object3D.lookAt(this.alvo);
  }
});

/* ---------------------------------------------------------------------
   5) mostrar-evento — escuta um evento e escreve algo num texto.
   Mostra: comunicação entre componentes por eventos (baixo acoplamento).
   Uso: <a-entity mostrar-evento="evento: cor-trocada; origem: #esfera"></a-entity>
   --------------------------------------------------------------------- */
AFRAME.registerComponent('mostrar-evento', {
  schema: {
    evento: { type: 'string' },
    origem: { type: 'selector' },        // tipo selector: recebe "#id" e devolve o elemento
    prefixo: { type: 'string', default: '' }
  },
  init: function () {
    var el = this.el, data = this.data;
    data.origem.addEventListener(data.evento, function (evt) {
      el.setAttribute('text', 'value', data.prefixo + ' ' + JSON.stringify(evt.detail));
    });
  }
});
