interface GeneratorPrefillOptions {
	recipient: string;
	interests: string;
	budget: number | string;
	styles: string;
	sourceCta: string;
	sourceVariant: string;
	sourceExperiment: string;
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
		budget: String(budget),
		styles,
		source_cta: sourceCta,
		source_variant: sourceVariant,
		source_experiment: sourceExperiment
	});

	return `/?${params.toString()}#tool`;
}
