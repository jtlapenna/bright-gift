const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const home = fs.readFileSync(path.join(rootDir, 'src/pages/index.astro'), 'utf8');
const layout = fs.readFileSync(path.join(rootDir, 'src/layouts/Layout.astro'), 'utf8');
const errors = [];

function requireText(source, value, context) {
	if (!source.includes(value)) errors.push(`${context}: missing ${value}`);
}

const clickStart = home.indexOf("resultsContainer.addEventListener('click'");
const clickEnd = home.indexOf('// Share functionality', clickStart);

if (clickStart === -1 || clickEnd === -1) {
	errors.push('Could not isolate the generator result click handler.');
} else {
	const clickHandler = home.slice(clickStart, clickEnd);
	requireText(clickHandler, "trackBrightGiftEvent('gift_generator_result_click'", 'Generator result click handler');

	for (const eventName of ['affiliate_click', 'amazon_click']) {
		if (clickHandler.includes(`trackBrightGiftEvent('${eventName}'`)) {
			errors.push(`Generator result click handler must not emit ${eventName}; Layout.astro owns standard affiliate events.`);
		}
	}
}

requireText(layout, "sendEvent('affiliate_click'", 'Global affiliate tracking');
requireText(layout, "sendEvent('amazon_click'", 'Global affiliate tracking');
requireText(home, 'result_card_count: 0', 'Generator result summary');
requireText(home, 'summary.result_card_count = new Set(', 'Generator result summary');

const renderStart = home.indexOf('function renderIdeaCards(ideas)');
const renderEnd = home.indexOf("return [...hybridCards, ...regularCards].join('');", renderStart);

if (renderStart === -1 || renderEnd === -1) {
	errors.push('Could not isolate renderIdeaCards.');
} else {
	const renderSource = home.slice(renderStart, renderEnd);
	const resultCards = [...renderSource.matchAll(/<div[^>]+role="listitem"[^>]*>/g)].map(match => match[0]);
	const resultLinks = [...renderSource.matchAll(/<a href="\$\{[^}]+\}"[\s\S]*?>/g)].map(match => match[0]);

	if (resultCards.length < 2) {
		errors.push(`Expected hybrid and regular result card templates; found ${resultCards.length}.`);
	}

	for (const [index, card] of resultCards.entries()) {
		for (const attribute of ['data-result-position', 'data-result-partner', 'data-result-hybrid', 'data-product-name']) {
			if (!card.includes(attribute)) errors.push(`Result card template ${index + 1}: missing ${attribute}.`);
		}
	}

	if (resultLinks.length < 4) {
		errors.push(`Expected four generator result link templates; found ${resultLinks.length}.`);
	}

	for (const [index, link] of resultLinks.entries()) {
		for (const attribute of ['data-cta-position', 'data-cta-variant', 'data-product-name', 'data-retailer']) {
			if (!link.includes(attribute)) errors.push(`Result link template ${index + 1}: missing ${attribute}.`);
		}
	}
}

if (errors.length > 0) {
	console.error('Generator attribution validation failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log('Generator result attribution ownership and metadata validated.');
