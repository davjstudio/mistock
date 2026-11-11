const initialStock = 20;
const countForm = document.querySelector('#demo-count');
const quantityInput = countForm.elements.quantity;
const reasonInput = countForm.elements.reason;
const formatDate = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima',
});
const get = id => document.getElementById(id);

let stock = initialStock;
let role = 'encargado';
let pending = null;

function formatDifference(amount) {
  if (amount === 0) return 'Sin diferencia';
  const units = Math.abs(amount);
  return `${units} ${units === 1 ? 'unidad' : 'unidades'} ${amount < 0 ? 'menos' : 'más'}`;
}

function showDifference() {
  const quantity = quantityInput.valueAsNumber;
  const valid = quantityInput.validity.valid && Number.isSafeInteger(quantity);
  const difference = quantity - stock;
  get('demo-difference').textContent = valid
    ? difference === 0 ? 'El conteo coincide con el stock.' : `Diferencia de ${formatDifference(difference)}.`
    : 'Ingresa una cantidad entera entre 0 y 999 999.';
  get('send-count').disabled = !valid || difference === 0;
}

function render() {
  get('demo-stock').textContent = stock;
  get('encargado-panel').hidden = role !== 'encargado';
  get('dueno-panel').hidden = role !== 'dueno';
  countForm.hidden = pending !== null;
  get('count-locked').hidden = pending === null;
  get('review-details').hidden = pending === null;
  get('review-empty').hidden = pending !== null;
  if (pending) {
    get('review-stock').textContent = pending.before;
    get('review-count').textContent = pending.quantity;
    get('review-difference').textContent = formatDifference(pending.quantity - pending.before);
    get('review-reason').textContent = pending.reason;
  }
  showDifference();
}

document.querySelector('.role-picker').addEventListener('change', event => {
  role = event.target.value;
  get('demo-status').textContent = '';
  render();
});

quantityInput.addEventListener('input', showDifference);
reasonInput.addEventListener('input', () => reasonInput.setCustomValidity(''));

countForm.addEventListener('submit', event => {
  event.preventDefault();
  if (role !== 'encargado' || pending || !countForm.reportValidity()) return;
  const quantity = quantityInput.valueAsNumber;
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 999999 || quantity === stock) return;
  const reason = reasonInput.value.trim();
  if (!reason) {
    reasonInput.setCustomValidity('Escribe el motivo del conteo.');
    reasonInput.reportValidity();
    return;
  }
  pending = { before: stock, quantity, reason, countedAt: new Date() };
  render();
  get('demo-status').textContent = `Conteo enviado. El stock sigue en ${stock} unidades.`;
  document.querySelector('input[value="dueno"]').focus();
});

get('approve-count').addEventListener('click', () => {
  if (role !== 'dueno' || !pending) return;
  const { before, quantity, reason, countedAt } = pending;
  stock = quantity;
  pending = null;
  const entry = document.createElement('li');
  const balance = document.createElement('strong');
  balance.textContent = `Arroz de 1 kg · ${before} → ${stock} unidades`;
  const detail = document.createElement('p');
  detail.textContent = `${reason}. Registró Encargado de ejemplo (${formatDate.format(countedAt)}). Aprobó Dueño de ejemplo (${formatDate.format(new Date())}). Hora de Perú.`;
  entry.append(balance, detail);
  get('history-list').prepend(entry);
  get('history-empty').hidden = true;
  get('demo-status').textContent = `Ajuste aprobado. Nuevo stock: ${stock} unidades.`;
  render();
  get('reset-demo').focus();
});

get('reset-demo').addEventListener('click', () => {
  stock = initialStock;
  role = 'encargado';
  pending = null;
  countForm.reset();
  reasonInput.setCustomValidity('');
  document.querySelector('input[value="encargado"]').checked = true;
  get('history-list').replaceChildren();
  get('history-empty').hidden = false;
  get('demo-status').textContent = 'Ejemplo reiniciado con 20 unidades.';
  render();
  quantityInput.focus();
});

render();
