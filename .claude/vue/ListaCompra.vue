<template>
  <div class="stage">
    <div class="phone">
      <div class="screen">
        <!-- Barra de estado -->
        <div class="statusbar">
          <span>9:41</span>
          <div class="camera"></div>
          <div class="d-flex align-center" style="gap:5px">
            <span style="font-size:10px;letter-spacing:.04em">NFC</span>
            <div class="battery"><div></div></div>
          </div>
        </div>

        <!-- 01 Escaneo NFC -->
        <div v-if="screen === 'nfc'" class="nfc">
          <div class="nfc-ring">
            <div v-for="d in [0, 0.7, 1.4]" :key="d" class="pulse" :style="{ animationDelay: d + 's' }"></div>
            <div class="nfc-core">NFC</div>
          </div>
          <div class="d-flex flex-column" style="gap:10px">
            <div class="h-nfc">Acerca el móvil al tag de la nevera</div>
            <div class="body muted">La lista de casa se abrirá sola, con lo que haya añadido cualquiera de la familia.</div>
          </div>
          <v-btn class="btn btn-ink" rounded="pill" height="54" :ripple="false" flat @click="scan">Simular lectura del tag</v-btn>
        </div>

        <!-- 01b Nuevo usuario -->
        <div v-else-if="screen === 'join'" class="join">
          <div class="d-flex flex-column" style="gap:12px">
            <div class="eyebrow">Ana te ha invitado</div>
            <div class="h-join">¿Cómo te llamas?</div>
            <div class="body muted">Así Ana sabrá quién ha añadido cada cosa a «Lista de casa».</div>
          </div>
          <div class="d-flex flex-column" style="gap:12px">
            <v-text-field v-model="nameDraft" class="name-field" placeholder="Tu nombre" variant="outlined"
              hide-details autofocus @keydown.enter="joinList" />
            <div class="d-flex align-center" style="gap:12px;padding:4px 2px">
              <v-avatar size="40" color="#AFFC41" class="ava" style="font-size:17px">{{ nameInitial }}</v-avatar>
              <div class="muted" style="font-size:14px">Este será tu color en la lista</div>
            </div>
          </div>
          <div style="flex:1"></div>
          <v-btn class="btn btn-teal" rounded="lg" height="56" block flat :ripple="false"
            :style="{ opacity: nameDraft.trim() ? 1 : 0.4 }" @click="joinList">Entrar a la lista</v-btn>
        </div>

        <!-- 02 Lista compartida -->
        <div v-else-if="screen === 'list'" class="page">
          <div class="head" style="gap:16px">
            <div class="d-flex justify-space-between align-start" style="gap:12px">
              <div class="d-flex flex-column" style="flex:1 1 0;min-width:0;gap:4px">
                <div class="h-page" style="white-space:nowrap">Lista de casa</div>
                <div class="muted" style="font-size:14px">{{ pendingLabel }}</div>
              </div>
              <div class="d-flex" style="flex-shrink:0;padding-left:8px">
                <v-avatar v-for="m in members" :key="m.name" size="32" :color="m.color" :title="m.name"
                  class="ava stack" style="font-size:13px">{{ m.name[0] }}</v-avatar>
              </div>
            </div>
            <v-btn class="btn btn-teal" rounded="lg" height="51" block flat :ripple="false" @click="screen = 'shop'">Empezar a comprar</v-btn>
          </div>
          <div class="scroll">
            <v-card v-for="it in items" :key="it.id" class="row" flat>
              <div class="d-flex flex-column" style="flex:1 1 0;min-width:0;gap:5px">
                <div style="font-size:17px;font-weight:500">{{ it.name }}</div>
                <div v-if="showWhoAdded" class="d-flex align-center meta" style="gap:6px;min-width:0">
                  <v-avatar size="16" :color="colorOf(it.by)" class="ava" style="font-size:9px">{{ it.by[0] }}</v-avatar>
                  <span class="ellipsis">{{ it.by }} · {{ it.when }}</span>
                </div>
              </div>
              <div class="stepper">
                <v-btn icon flat size="36" class="step" :ripple="false" @click="setQty(it.id, -1)">−</v-btn>
                <span class="qty">{{ it.qty }}</span>
                <v-btn icon flat size="36" class="step step-on" :ripple="false" @click="setQty(it.id, 1)">+</v-btn>
              </div>
            </v-card>
            <div v-if="!items.length" class="empty">No falta nada. Añade lo primero abajo.</div>
          </div>
          <div class="adder">
            <v-text-field v-model="draft" class="add-field" placeholder="Añadir producto…" variant="solo" flat
              hide-details @keydown.enter="add" />
            <v-btn class="btn-ink add-btn" flat :ripple="false" @click="add">+</v-btn>
          </div>
        </div>

        <!-- 03 Modo tienda -->
        <div v-else-if="screen === 'shop'" class="page shop">
          <div class="shop-head">
            <div class="d-flex justify-space-between align-center">
              <div class="shop-eyebrow">Modo tienda</div>
              <v-btn class="exit" rounded="pill" flat size="small" :ripple="false" @click="screen = 'list'">Salir</v-btn>
            </div>
            <div style="font-size:34px;font-weight:600">{{ checkedCount }} de {{ items.length }} en el carro</div>
            <v-progress-linear :model-value="progress" height="6" rounded color="#AFFC41" bg-color="#ffffff" bg-opacity="0.2" />
          </div>
          <div class="shop-sheet">
            <v-card v-for="it in shopItems" :key="it.id" class="row shop-row" flat @click="it.checked = !it.checked" :ripple="false">
              <template v-if="it.checked">
                <div class="check on">✓</div>
                <div class="shop-name done">{{ it.name }}</div>
                <div class="done" style="font-size:15px">×{{ it.qty }}</div>
              </template>
              <template v-else>
                <div class="check"></div>
                <div class="shop-name" style="font-weight:500">{{ it.name }}</div>
                <div class="muted" style="font-size:15px;font-weight:600">×{{ it.qty }}</div>
              </template>
            </v-card>
          </div>
          <div class="shop-foot">
            <v-btn class="btn btn-ink" rounded="lg" height="53" block flat :ripple="false"
              :style="{ opacity: checkedCount ? 1 : 0.4 }" @click="finish">
              {{ checkedCount ? `Terminar compra (${checkedCount})` : 'Marca lo que ya tienes' }}
            </v-btn>
          </div>
        </div>

        <!-- 04 Historial -->
        <div v-else-if="screen === 'history'" class="page">
          <div class="head" style="gap:4px">
            <div class="h-page">Historial</div>
            <div class="muted" style="font-size:14px">Compras terminadas por la familia</div>
          </div>
          <div class="scroll">
            <v-card v-for="h in history" :key="h.id" class="hist" flat>
              <button class="hist-head" @click="openHist = openHist === h.id ? null : h.id">
                <v-avatar size="38" :color="colorOf(h.by)" class="ava" style="font-size:15px">{{ h.by[0] }}</v-avatar>
                <div class="d-flex flex-column" style="flex:1 1 0;min-width:0;gap:3px">
                  <div style="font-size:16px;font-weight:500">{{ h.date }}</div>
                  <div class="meta">{{ h.by }} · {{ h.items.length }} producto{{ h.items.length === 1 ? '' : 's' }}</div>
                </div>
                <div class="meta" style="font-size:18px">{{ openHist === h.id ? '−' : '+' }}</div>
              </button>
              <v-expand-transition>
                <div v-if="openHist === h.id" class="hist-body">
                  <div v-for="x in h.items" :key="x.name" class="hist-line">
                    <span>{{ x.name }}</span><span class="meta" style="font-size:15px">×{{ x.qty }}</span>
                  </div>
                  <v-btn class="btn btn-teal" rounded="lg" height="47" block flat :ripple="false"
                    style="margin-top:8px;font-size:15px" @click="repeat(h)">Repetir esta compra</v-btn>
                </div>
              </v-expand-transition>
            </v-card>
          </div>
        </div>

        <!-- Navegación inferior -->
        <div v-if="screen === 'list' || screen === 'history'" class="nav">
          <button v-for="t in tabs" :key="t.key" class="tab" @click="screen = t.key">
            <div class="tab-pill" :style="{ background: screen === t.key ? '#B2FF9E' : 'transparent' }">{{ t.glyph }}</div>
            <span :style="{ fontWeight: screen === t.key ? 600 : 400 }">{{ t.label }}</span>
          </button>
        </div>

        <div class="homebar" :style="{ background: screen === 'list' || screen === 'history' ? '#f0f0f0' : '#fafafa' }"><div></div></div>

        <!-- Hoja "Tag detectado" -->
        <div v-if="scanning" class="scrim">
          <div class="sheet">
            <div class="eyebrow">Tag detectado</div>
            <div style="font-size:22px;font-weight:600">Abriendo «Lista de casa»…</div>
            <div class="muted" style="font-size:14px">Lista compartida por Ana</div>
          </div>
        </div>

        <div v-if="toast" class="toast">{{ toast }}</div>
      </div>
    </div>
  </div>
</template>

<script>
let uid = 100;

export default {
  name: 'ListaCompra',
  props: {
    startScreen: { type: String, default: 'nfc' },   // nfc | list | shop | history
    currentUser: { type: String, default: 'Ana' },
    newUser: { type: Boolean, default: true },
    showWhoAdded: { type: Boolean, default: true }
  },
  data() {
    return {
      screen: this.startScreen,
      scanning: false, draft: '', toast: '', openHist: 1, nameDraft: '',
      me: this.newUser ? null : this.currentUser,
      members: [
        { name: 'Ana', color: '#1DD3B0' },
        { name: 'Luis', color: '#AFFC41' }
      ],
      items: [
        { id: 1, name: 'Leche semidesnatada', qty: 2, by: 'Luis', when: 'hace 10 min', checked: false },
        { id: 2, name: 'Plátanos', qty: 6, by: 'Ana', when: 'hace 1 h', checked: false },
        { id: 3, name: 'Pan de molde', qty: 1, by: 'Ana', when: 'ayer', checked: false },
        { id: 4, name: 'Huevos', qty: 12, by: 'Luis', when: 'ayer', checked: false },
        { id: 5, name: 'Tomates', qty: 4, by: 'Ana', when: 'ayer', checked: false },
        { id: 6, name: 'Detergente', qty: 1, by: 'Luis', when: 'lun', checked: false },
        { id: 7, name: 'Yogures naturales', qty: 8, by: 'Ana', when: 'lun', checked: false }
      ],
      history: [
        { id: 1, date: 'Sábado, 1 nov', by: 'Luis', items: [{ name: 'Arroz', qty: 2 }, { name: 'Pollo', qty: 1 }, { name: 'Café', qty: 1 }, { name: 'Manzanas', qty: 6 }] },
        { id: 2, date: 'Miércoles, 29 oct', by: 'Ana', items: [{ name: 'Leche', qty: 4 }, { name: 'Pasta', qty: 3 }, { name: 'Aceite de oliva', qty: 1 }] },
        { id: 3, date: 'Domingo, 26 oct', by: 'Ana', items: [{ name: 'Pescado', qty: 1 }, { name: 'Lechugas', qty: 2 }] }
      ],
      tabs: [
        { key: 'list', label: 'Lista', glyph: '≡' },
        { key: 'history', label: 'Historial', glyph: '↺' },
        { key: 'nfc', label: 'Tag NFC', glyph: 'NFC' }
      ]
    };
  },
  computed: {
    user() { return this.me || 'Ana'; },
    nameInitial() { return (this.nameDraft.trim()[0] || '?').toUpperCase(); },
    pending() { return this.items.filter(i => !i.checked).length; },
    checkedCount() { return this.items.length - this.pending; },
    pendingLabel() { return this.pending === 1 ? 'Falta 1 producto' : `Faltan ${this.pending} productos`; },
    progress() { return this.items.length ? (this.checkedCount / this.items.length) * 100 : 0; },
    shopItems() { return [...this.items.filter(i => !i.checked), ...this.items.filter(i => i.checked)]; }
  },
  beforeUnmount() { clearTimeout(this.t1); clearTimeout(this.t2); },
  methods: {
    colorOf(n) { return (this.members.find(m => m.name === n) || this.members[0]).color; },
    flash(msg) { clearTimeout(this.t2); this.toast = msg; this.t2 = setTimeout(() => (this.toast = ''), 2200); },
    scan() {
      if (this.scanning) return;
      this.scanning = true;
      this.t1 = setTimeout(() => { this.scanning = false; this.screen = this.me ? 'list' : 'join'; }, 1400);
    },
    joinList() {
      const name = this.nameDraft.trim(); if (!name) return;
      const old = this.members[1].name;
      const rn = x => { if (x.by === old) x.by = name; };
      this.members[1].name = name;
      this.items.forEach(rn); this.history.forEach(rn);
      this.me = name; this.screen = 'list';
      this.flash('Hola, ' + name + '. Ya estás en la lista');
    },
    setQty(id, d) {
      const it = this.items.find(i => i.id === id); if (!it) return;
      it.qty += d;
      if (it.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    },
    add() {
      const name = this.draft.trim(); if (!name) return;
      this.items.unshift({ id: ++uid, name, qty: 1, by: this.user, when: 'ahora', checked: false });
      this.draft = '';
    },
    finish() {
      const done = this.items.filter(i => i.checked); if (!done.length) return;
      const d = new Date(); const time = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
      const id = ++uid;
      this.history.unshift({ id, date: 'Hoy, ' + time, by: this.user, items: done.map(i => ({ name: i.name, qty: i.qty })) });
      this.items = this.items.filter(i => !i.checked);
      this.openHist = id; this.screen = 'list';
      this.flash(done.length === 1 ? '1 producto guardado en el historial' : done.length + ' productos guardados en el historial');
    },
    repeat(h) {
      let added = 0, merged = 0;
      h.items.forEach(x => {
        const ex = this.items.find(i => i.name.toLowerCase() === x.name.toLowerCase());
        if (ex) { merged++; if (ex.qty < x.qty) ex.qty = x.qty; }
        else { added++; this.items.unshift({ id: ++uid, name: x.name, qty: x.qty, by: this.user, when: 'ahora', checked: false }); }
      });
      this.screen = 'list';
      this.flash(added + ' añadidos' + (merged ? ', ' + merged + ' ya estaban' : ''));
    }
  }
};
</script>

<style scoped>
.stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 16px; box-sizing: border-box; background: #e4e4e4; font-family: 'Outfit', sans-serif; color: #3C1642; }
.phone { width: 384px; height: 812px; border-radius: 46px; background: #1d1a16; padding: 10px; box-sizing: border-box; box-shadow: 0 30px 60px -20px rgba(60,40,20,.35); }
.screen { position: relative; width: 100%; height: 100%; border-radius: 36px; overflow: hidden; background: #fafafa; display: flex; flex-direction: column; }
.statusbar { height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; font-size: 13px; font-weight: 500; position: relative; }
.camera { position: absolute; left: 50%; top: 10px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: #1d1a16; }
.battery { width: 18px; height: 9px; border: 1.5px solid #3C1642; border-radius: 3px; padding: 1px; box-sizing: border-box; }
.battery > div { width: 70%; height: 100%; background: #3C1642; border-radius: 1px; }

.muted { color: #6a5a72; }
.meta { color: #867790; font-size: 13px; }
.body { font-size: 16px; line-height: 1.45; text-wrap: pretty; }
.eyebrow { font-size: 13px; font-weight: 600; color: #086375; letter-spacing: .08em; text-transform: uppercase; }
.h-page { font-size: 30px; font-weight: 600; letter-spacing: -.01em; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn { font-family: inherit !important; font-size: 16px; font-weight: 500; letter-spacing: 0 !important; text-transform: none !important; }
.btn-ink { background: #3C1642 !important; color: #fafafa !important; }
.btn-teal { background: #086375 !important; color: #fff !important; }
.nfc .btn { padding: 0 28px !important; }

.nfc { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; gap: 40px; text-align: center; }
.nfc-ring { position: relative; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; }
.pulse { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #086375; opacity: 0; animation: pulse 2.1s ease-out infinite; }
.nfc-core { width: 120px; height: 120px; border-radius: 50%; background: #086375; color: #fafafa; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 26px; letter-spacing: .06em; position: relative; }
.h-nfc { font-size: 28px; font-weight: 600; line-height: 1.15; text-wrap: pretty; }
@keyframes pulse { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(1.6); opacity: 0; } }

.join { flex: 1; display: flex; flex-direction: column; padding: 40px 28px 24px; gap: 32px; }
.h-join { font-size: 32px; font-weight: 600; line-height: 1.1; letter-spacing: -.01em; }
.name-field :deep(.v-field) { border-radius: 16px; background: #fff; height: 58px; font-family: inherit; font-size: 20px; color: #3C1642; }
.name-field :deep(.v-field__outline) { --v-field-border-width: 2px; --v-field-border-opacity: 1; color: #e8e8e8; }
.name-field :deep(.v-field--focused .v-field__outline) { color: #086375; }
.name-field :deep(input) { font-size: 20px; padding: 0 18px; min-height: 54px; }

.ava { color: #3C1642 !important; font-weight: 600; }
.stack { border: 2px solid #fafafa; margin-left: -8px; }

.page { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.head { padding: 16px 24px 20px; display: flex; flex-direction: column; }
.scroll { flex: 1; overflow-y: auto; padding: 0 16px 12px; display: flex; flex-direction: column; gap: 8px; }
.row { background: #fff !important; border-radius: 18px !important; padding: 14px 14px 14px 18px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 0 #e8e8e8 !important; color: #3C1642 !important; flex-shrink: 0; }
.stepper { flex-shrink: 0; display: flex; align-items: center; gap: 2px; background: #f0f0f0; border-radius: 999px; padding: 3px; }
.step { background: transparent !important; color: #3C1642 !important; font-size: 20px; font-family: inherit; }
.step-on { background: #fff !important; }
.qty { min-width: 22px; text-align: center; font-size: 16px; font-weight: 600; }
.empty { padding: 48px 16px; text-align: center; color: #867790; font-size: 16px; }
.adder { padding: 10px 16px; display: flex; gap: 8px; border-top: 1px solid #e8e8e8; }
.add-field :deep(.v-field) { border-radius: 14px; background: #fff; box-shadow: none; min-height: 48px; font-family: inherit; color: #3C1642; }
.add-field :deep(input) { font-size: 16px; min-height: 48px; padding: 0 16px; }
.add-field :deep(input::placeholder), .name-field :deep(input::placeholder) { color: #9a8f7f; opacity: 1; }
.add-btn { min-width: 48px !important; width: 48px; height: 48px !important; border-radius: 14px !important; font-size: 24px; padding: 0 !important; }

.shop { background: #086375; color: #fff; }
.shop-head { padding: 12px 24px 22px; display: flex; flex-direction: column; gap: 14px; }
.shop-eyebrow { font-size: 14px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; opacity: .85; white-space: nowrap; }
.exit { background: rgba(255,255,255,.16) !important; color: #fff !important; font-family: inherit; font-size: 14px; text-transform: none; letter-spacing: 0; padding: 0 14px !important; height: 34px !important; }
.shop-sheet { flex: 1; overflow-y: auto; background: #fafafa; color: #3C1642; border-radius: 28px 28px 0 0; padding: 16px 16px 12px; display: flex; flex-direction: column; gap: 8px; }
.shop-row { padding: 16px 18px; gap: 16px; cursor: pointer; }
.check { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #c7c3cc; box-sizing: border-box; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.check.on { background: #086375; border: none; color: #fff; }
.shop-name { flex: 1; font-size: 18px; }
.done { color: #9e95a3; }
.shop-name.done { text-decoration: line-through; }
.shop-foot { background: #fafafa; padding: 10px 16px 14px; }

.hist { background: #fff !important; border-radius: 18px !important; box-shadow: 0 1px 0 #e8e8e8 !important; overflow: hidden; color: #3C1642 !important; flex-shrink: 0; }
.hist-head { width: 100%; border: none; background: transparent; font-family: inherit; color: inherit; text-align: left; padding: 16px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; }
.hist-body { padding: 0 18px 16px 70px; display: flex; flex-direction: column; gap: 8px; }
.hist-line { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; color: #4e3557; }

.nav { display: flex; justify-content: space-around; padding: 8px 12px 10px; background: #f0f0f0; flex-shrink: 0; }
.tab { border: none; background: transparent; font-family: inherit; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px 10px; color: #3C1642; font-size: 12px; }
.tab-pill { width: 56px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

.homebar { height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.homebar > div { width: 110px; height: 4px; border-radius: 2px; background: #3C1642; opacity: .5; }

.scrim { position: absolute; inset: 0; background: rgba(29,26,22,.35); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 28px 28px 0 0; padding: 28px 24px 40px; display: flex; flex-direction: column; gap: 6px; animation: up .3s ease-out; }
@keyframes up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.toast { position: absolute; left: 16px; right: 16px; bottom: 110px; background: #3C1642; color: #fafafa; border-radius: 14px; padding: 14px 18px; font-size: 15px; }
</style>
