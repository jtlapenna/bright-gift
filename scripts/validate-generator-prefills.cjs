const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const scanRoots = ['src/pages', 'src/content', 'src/components'];
const supportedBudgets = new Set(['25', '50', '100', '200']);
const supportedStyles = new Set([
	'eco-friendly',
	'handmade',
	'funny',
	'pride-gifts',
	'quirky',
	'luxury',
	'techy',
	'wellness',
	'athletics',
	'beauty',
	'black-owned',
	'book-lover',
	'practical',
	'thoughtful',
	'cozy',
	'professional'
]);

const styleAliases = {
	appreciative: 'thoughtful',
	books: 'book-lover',
	comfort: 'cozy',
	comforting: 'cozy',
	custom: 'thoughtful',
	elegant: 'luxury',
	eco: 'eco-friendly',
	fun: 'funny',
	'office-safe': 'professional',
	personal: 'thoughtful',
	personalized: 'handmade',
	playful: 'funny',
	polished: 'luxury',
	premium: 'luxury',
	reader: 'book-lover',
	romantic: 'thoughtful',
	safe: 'practical',
	sentimental: 'thoughtful',
	shareable: 'practical',
	sporty: 'athletics',
	sustainable: 'eco-friendly',
	unique: 'quirky',
	useful: 'practical'
};

const requiredParams = [
	'recipient',
	'interests',
	'budget',
	'styles',
	'source_cta',
	'source_variant',
	'source_experiment'
];

const requiredHelperFields = [
	'recipient',
	'interests',
	'budget',
	'styles',
	'sourceCta',
	'sourceVariant',
	'sourceExperiment'
];

function walkFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkFiles(fullPath));
			continue;
		}

		if (/\.(astro|md|mdx|js|ts)$/.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

function normalizeBudget(budget) {
	const rawBudget = String(budget || '').trim();
	const numericBudget = Number(rawBudget.replace(/[^0-9.]/g, ''));

	if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
		return supportedBudgets.has(rawBudget) ? rawBudget : '';
	}

	if (numericBudget <= 25) return '25';
	if (numericBudget <= 50) return '50';
	if (numericBudget <= 100) return '100';
	return '200';
}

function normalizeStyle(style) {
	const normalized = String(style || '').trim().toLowerCase().replace(/_/g, '-');
	return styleAliases[normalized] || normalized;
}

function normalizeStyles(styles) {
	const selectedStyles = [];

	String(styles || '')
		.split(',')
		.map(normalizeStyle)
		.filter(Boolean)
		.forEach(style => {
			if (supportedStyles.has(style) && !selectedStyles.includes(style) && selectedStyles.length < 3) {
				selectedStyles.push(style);
			}
		});

	return selectedStyles;
}

function getLiteralField(body, field) {
	const literalMatch = body.match(new RegExp(`\\b${field}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`));
	if (literalMatch) return literalMatch[2];

	const numberMatch = body.match(new RegExp(`\\b${field}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`));
	if (numberMatch) return numberMatch[1];

	return null;
}

function hasField(body, field) {
	return new RegExp(`\\b${field}\\s*:`).test(body);
}

function validateBudget(value, context, errors) {
	const normalizedBudget = normalizeBudget(value);
	if (!supportedBudgets.has(normalizedBudget)) {
		errors.push(`${context}: budget "${value}" does not normalize to a supported tool option`);
	}
}

function validateStyles(value, context, errors) {
	const normalizedStyles = normalizeStyles(value);
	if (normalizedStyles.length === 0) {
		errors.push(`${context}: styles "${value}" do not normalize to supported tool styles`);
	}
}

function validateHardcodedPrefill(file, content, errors) {
	let count = 0;
	const urlMatches = content.matchAll(/\/\?[^"'<\s)]+#tool/g);

	for (const match of urlMatches) {
		const rawHref = match[0].replaceAll('&amp;', '&');
		if (!rawHref.includes('recipient=')) continue;

		count += 1;
		const context = `${path.relative(rootDir, file)} hardcoded prefill "${rawHref.slice(0, 80)}"`;
		const url = new URL(rawHref, 'https://bright-gift.com');

		for (const param of requiredParams) {
			if (!url.searchParams.get(param)) {
				errors.push(`${context}: missing ${param}`);
			}
		}

		validateBudget(url.searchParams.get('budget'), context, errors);
		validateStyles(url.searchParams.get('styles'), context, errors);
	}

	return count;
}

function validateHelperCalls(file, content, errors) {
	let count = 0;
	const helperMatches = content.matchAll(/buildGeneratorPrefillHref\(\{([\s\S]*?)\}\)/g);

	for (const match of helperMatches) {
		count += 1;
		const body = match[1];
		const context = `${path.relative(rootDir, file)} buildGeneratorPrefillHref call ${count}`;

		for (const field of requiredHelperFields) {
			if (!hasField(body, field)) {
				errors.push(`${context}: missing ${field}`);
			}
		}

		const budget = getLiteralField(body, 'budget');
		if (budget !== null) validateBudget(budget, context, errors);

		const styles = getLiteralField(body, 'styles');
		if (styles !== null) validateStyles(styles, context, errors);
	}

	return count;
}

const errors = [];
let checked = 0;

for (const scanRoot of scanRoots) {
	const absoluteRoot = path.join(rootDir, scanRoot);
	if (!fs.existsSync(absoluteRoot)) continue;

	for (const file of walkFiles(absoluteRoot)) {
		const content = fs.readFileSync(file, 'utf8');
		checked += validateHardcodedPrefill(file, content, errors);
		checked += validateHelperCalls(file, content, errors);
	}
}

if (errors.length > 0) {
	console.error('Generator prefill validation failed:');
	for (const error of errors) {
		console.error(`- ${error}`);
	}
	process.exit(1);
}

console.log(`Validated ${checked} generator prefill links and helper calls.`);
