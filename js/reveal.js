// Renders the Ocean Deep answer reveal inside a card. Router calls this.
SHARK.renderReveal = function (card, shark, points, correct) {
  const c = shark.credit || {};
  const attr = c.creator
    ? `Photo: ${c.creator} · ${c.source || 'iNaturalist'} · ${c.license || ''} · ${c.url || ''}`
    : '';
  card.classList.add('reveal');
  card.innerHTML = `
    <div class="reveal-body">
      <div class="reveal-emoji">${shark.emoji || '🦈'}</div>
      <div class="reveal-name">${shark.name || 'Shark'}</div>
      <div class="reveal-latin">${shark.latin || ''}</div>
      <div class="reveal-fact">${shark.fact || ''}</div>
      <div class="reveal-points ${points > 0 ? '' : 'zero'}">${points > 0 ? '+' + points.toLocaleString() + ' pts' : 'No points'}</div>
      ${attr ? `<div class="reveal-attr">${attr}</div>` : ''}
    </div>
  `;
};
