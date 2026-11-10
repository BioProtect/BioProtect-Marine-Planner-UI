import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  antislop: true,
  // ponytail: no html/css formatter wired up; add `formatters: true` + eslint-plugin-format if wanted
  ignores: [
    'build',
    'sessions',
    '**/*.html',
    '**/*.css',
  ],
}, {
  rules: {
    // ponytail: crashes on ESLint 10 ("AST is missing the tokens array"); re-enable once sonarjs supports it
    'sonarjs/no-commented-code': 'off',
    // closures referencing later consts are fine; same-scope (TDZ) uses are still reported
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: false },
    ],
    // ponytail: warn until the 3 offenders (CumulativeImpactDialog, FeatureListItem, generatePdfReport) are split up
    'sonarjs/cognitive-complexity': 'warn',
  },
})
