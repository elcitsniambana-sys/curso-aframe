/* =====================================================================
   CURSO A-FRAME · Utilitários para trabalhar com modelos 3D baixados da Web
   ---------------------------------------------------------------------
   Inclua DEPOIS do A-Frame:
     <script src="../../js/curso-utilitarios.js"></script>

   1) medir-modelo   → mostra o tamanho do modelo (caixa envolvente) em metros.
   2) ajustar-tamanho → escala automaticamente o modelo para a altura (ou largura)
                        desejada, centraliza e "apoia" no chão (y = 0).
   Ideal para modelos de origem desconhecida (cm? mm? polegadas?).
   ===================================================================== */

// Calcula a caixa envolvente do modelo no referencial LOCAL da entidade.
function cursoCaixaLocal(entidadeEl, objeto) {
  var inversa = new THREE.Matrix4().copy(entidadeEl.object3D.matrixWorld).invert();
  var caixa = new THREE.Box3();
  var temp = new THREE.Box3();
  objeto.updateMatrixWorld(true);
  objeto.traverse(function (no) {
    if (no.isMesh && no.geometry) {
      if (!no.geometry.boundingBox) no.geometry.computeBoundingBox();
      temp.copy(no.geometry.boundingBox).applyMatrix4(no.matrixWorld).applyMatrix4(inversa);
      caixa.union(temp);
    }
  });
  return caixa;
}

/* ---------------------------------------------------------------------
   medir-modelo
   Uso: <a-entity gltf-model="#x" medir-modelo="saida: #placa"></a-entity>
   (saida é opcional: uma entidade com componente text que receberá o resultado)
   --------------------------------------------------------------------- */
AFRAME.registerComponent('medir-modelo', {
  schema: { saida: { type: 'selector' } },
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      var malha = this.el.getObject3D('mesh');
      if (!malha) return;
      this.el.object3D.updateMatrixWorld(true);
      var t = cursoCaixaLocal(this.el, malha).getSize(new THREE.Vector3());
      var s = this.el.object3D.scale;
      var real = { x: t.x * s.x, y: t.y * s.y, z: t.z * s.z };
      var msg = 'Original: ' + t.x.toFixed(2) + ' × ' + t.y.toFixed(2) + ' × ' + t.z.toFixed(2) + ' (unid.)\n' +
                'Na cena: ' + real.x.toFixed(2) + ' × ' + real.y.toFixed(2) + ' × ' + real.z.toFixed(2) + ' m (L × A × P)';
      console.log('[medir-modelo]', this.el.getAttribute('gltf-model'), '\n' + msg);
      if (this.data.saida) this.data.saida.setAttribute('text', 'value', msg);
      this.el.emit('modelo-medido', { original: t, cena: real });
    });
  }
});

/* ---------------------------------------------------------------------
   ajustar-tamanho
   Uso: <a-entity gltf-model="#x" ajustar-tamanho="altura: 1.5"></a-entity>
        <a-entity gltf-model="#x" ajustar-tamanho="largura: 0.4; apoiarNoChao: false"></a-entity>
   Se altura e largura forem 0, apenas centraliza/apoia sem escalar.
   --------------------------------------------------------------------- */
AFRAME.registerComponent('ajustar-tamanho', {
  schema: {
    altura:       { type: 'number', default: 0 },   // metros (eixo Y)
    largura:      { type: 'number', default: 0 },   // metros (maior dimensão horizontal)
    apoiarNoChao: { type: 'boolean', default: true },
    centralizar:  { type: 'boolean', default: true }
  },
  init: function () {
    this.ajustar = this.ajustar.bind(this);
    this.el.addEventListener('model-loaded', this.ajustar);
  },
  update: function (antigo) {
    if (Object.keys(antigo).length) this.ajustar();   // reajusta se as propriedades mudarem
  },
  ajustar: function () {
    var malha = this.el.getObject3D('mesh');
    if (!malha) return;
    malha.position.set(0, 0, 0);
    malha.scale.set(1, 1, 1);
    this.el.object3D.updateMatrixWorld(true);
    var caixa = cursoCaixaLocal(this.el, malha);
    var tam = caixa.getSize(new THREE.Vector3());
    var centro = caixa.getCenter(new THREE.Vector3());
    var fator = 1;
    if (this.data.altura > 0 && tam.y > 0) fator = this.data.altura / tam.y;
    else if (this.data.largura > 0) fator = this.data.largura / Math.max(tam.x, tam.z);
    malha.scale.setScalar(fator);
    malha.position.set(
      this.data.centralizar ? -centro.x * fator : 0,
      this.data.apoiarNoChao ? -caixa.min.y * fator : (this.data.centralizar ? -centro.y * fator : 0),
      this.data.centralizar ? -centro.z * fator : 0
    );
    this.el.emit('modelo-ajustado', { tamanhoOriginal: tam, fator: fator });
  },
  remove: function () {
    this.el.removeEventListener('model-loaded', this.ajustar);
  }
});
