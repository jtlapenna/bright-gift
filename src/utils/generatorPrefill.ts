interface GeneratorPrefillOptions {
	recipient: string;
	interests: string;
	budget: number | string;
	styles: string;
	sourceCta: string;
	sourceVariant: string;
	sourceExperiment: string;
}

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

const styleAliases: Record<string, string> = {
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

function normalizeBudget(budget: number | string): string {
	const rawBudget = String(budget || '').trim();
	const numericBudget = Number(rawBudget.replace(/[^0-9.]/g, ''));

	if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
		return rawBudget;
	}

	if (numericBudget <= 25) return '25';
	if (numericBudget <= 50) return '50';
	if (numericBudget <= 100) return '100';
	return '200';
}

function normalizeStyle(style: string): string {
	const normalized = style.trim().toLowerCase().replace(/_/g, '-');
	return styleAliases[normalized] || normalized;
}

function normalizeStyles(styles: string): string {
	const selectedStyles: string[] = [];

	String(styles || '')
		.split(',')
		.map(normalizeStyle)
		.filter(Boolean)
		.forEach(style => {
			if (supportedStyles.has(style) && !selectedStyles.includes(style) && selectedStyles.length < 3) {
				selectedStyles.push(style);
			}
		});

	return selectedStyles.join(',');
}

export function buildGeneratorPrefillHref({
	recipient,
	interests,
	budget,
	styles,
	sourceCta,
	sourceVariant,
	sourceExperiment
}: GeneratorPrefillOptions): string {
	const params = new URLSearchParams({
		recipient,
		interests,
		budget: normalizeBudget(budget),
		styles: normalizeStyles(styles),
		source_cta: sourceCta,
		source_variant: sourceVariant,
		source_experiment: sourceExperiment
	});

	return `/?${params.toString()}#tool`;
}
