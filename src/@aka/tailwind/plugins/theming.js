// eslint-disable-next-line @typescript-eslint/no-var-requires
const chroma = require('chroma-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generateContrasts = require(path.resolve(__dirname, '../utils/generate-contrasts'));
// -----------------------------------------------------------------------------------------------------
// @ Utilities
// -----------------------------------------------------------------------------------------------------

/**
 * Normalize the provided theme
 *
 * @param theme
 */
const normalizeTheme = (theme) => {
  return _.fromPairs(
    _.map(
      _.omitBy(theme, (palette, paletteName) => paletteName.startsWith('on') || _.isEmpty(palette)),
      (palette, paletteName) => [
        paletteName,
        {
          ...palette,
          DEFAULT: palette['DEFAULT'] || palette[500],
        },
      ]
    )
  );
};

/**
 * Generates variable colors for the 'colors'
 * configuration from the provided theme
 *
 * @param theme
 */
const generateVariableColors = (theme) => {
  // https://github.com/adamwathan/tailwind-css-variable-text-opacity-demo
  const customPropertiesWithOpacity =
    (name) =>
    ({ opacityVariable, opacityValue }) => {
      if (opacityValue) {
        return `rgba(var(--aka-${name}-rgb), ${opacityValue})`;
      }
      if (opacityVariable) {
        return `rgba(var(--aka-${name}-rgb), var(${opacityVariable}, 1))`;
      }
      return `rgb(var(--aka-${name}-rgb))`;
    };

  return _.fromPairs(
    _.flatten(
      _.map(_.keys(flattenColorPalette(normalizeTheme(theme))), (name) => [
        [name, customPropertiesWithOpacity(name)],
        [`on-${name}`, customPropertiesWithOpacity(`on-${name}`)],
      ])
    )
  );
};

// -----------------------------------------------------------------------------------------------------
// @ AKA TailwindCSS Main Plugin
// -----------------------------------------------------------------------------------------------------
const theming = plugin.withOptions(
  (options) =>
    ({ addComponents, e, theme }) => {
      // -----------------------------------------------------------------------------------------------------
      // @ Map variable colors
      // -----------------------------------------------------------------------------------------------------
      const mapVariableColors = _.fromPairs(
        _.map(options.themes, (theme, themeName) => [
          themeName === 'default' ? 'body' : `body.theme-${e(themeName)}`,
          _.fromPairs(
            _.flatten(
              _.map(
                flattenColorPalette(
                  _.fromPairs(
                    _.flatten(
                      _.map(normalizeTheme(theme), (palette, paletteName) => [
                        [e(paletteName), palette],
                        [
                          `on-${e(paletteName)}`,
                          _.fromPairs(
                            _.map(generateContrasts(palette), (color, hue) => [
                              hue,
                              _.get(theme, [`on-${paletteName}`, hue]) || color,
                            ])
                          ),
                        ],
                      ])
                    )
                  )
                ),
                (value, key) => [
                  [`--aka-${e(key)}`, value],
                  [`--aka-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                ]
              )
            )
          ),
        ])
      );

      addComponents(mapVariableColors);

      // -----------------------------------------------------------------------------------------------------
      // @ Generate scheme based css custom properties and utility classes
      // -----------------------------------------------------------------------------------------------------
      const schemeCustomProps = _.map(['light', 'dark'], (colorScheme) => {
        const isDark = colorScheme === 'dark';
        const background = theme(`aka.customProps.background.${colorScheme}`);
        const foreground = theme(`aka.customProps.foreground.${colorScheme}`);
        const lightSchemeSelectors = 'body.light, .light, .dark .light';
        const darkSchemeSelectors = 'body.dark, .dark, .light .dark';

        return {
          [isDark ? darkSchemeSelectors : lightSchemeSelectors]: {
            /**
             * If a custom property is not available, browsers will use
             * the fallback value. In this case, we want to use '--is-dark'
             * as the indicator of a dark theme so we can use it like this:
             * background-color: var(--is-dark, red);
             *
             * If we set '--is-dark' as "true" on dark themes, the above rule
             * won't work because of the said "fallback value" logic. Therefore,
             * we set the '--is-dark' to "false" on light themes and not set it
             * all on dark themes so that the fallback value can be used on
             * dark themes.
             *
             * On light themes, since '--is-dark' exists, the above rule will be
             * interpolated as:
             * "background-color: false"
             *
             * On dark themes, since '--is-dark' doesn't exist, the fallback value
             * will be used ('red' in this case) and the rule will be interpolated as:
             * "background-color: red"
             *
             * It's easier to understand and remember like this.
             */
            ...(!isDark ? { '--is-dark': 'false' } : {}),

            // Generate custom properties from customProps
            ..._.fromPairs(
              _.flatten(
                _.map(background, (value, key) => [
                  [`--aka-${e(key)}`, value],
                  [`--aka-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                ])
              )
            ),
            ..._.fromPairs(
              _.flatten(
                _.map(foreground, (value, key) => [
                  [`--aka-${e(key)}`, value],
                  [`--aka-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                ])
              )
            ),
          },
        };
      });

      const schemeUtilities = (() => {
        // Generate general styles & utilities
        return {};
      })();

      addComponents(schemeCustomProps);
      addComponents(schemeUtilities);
    },
  (options) => {
    return {
      theme: {
        extend: {
          colors: generateVariableColors(options.themes.default),
        },
        aka: {
          customProps: {
            background: {
              light: {
                'bg-app-bar': '#ffffff',
                'bg-card': '#ffffff',
                'bg-default': colors.blueGray[100],
                'bg-dialog': '#ffffff',
                'bg-hover': chroma(colors.blueGray[400]).alpha(0.12).css(),
                'bg-status-bar': colors.blueGray[300],
              },
              dark: {
                'bg-app-bar': colors.blueGray[900],
                'bg-card': colors.blueGray[800],
                'bg-default': colors.blueGray[900],
                'bg-dialog': colors.blueGray[800],
                'bg-hover': 'rgba(255, 255, 255, 0.05)',
                'bg-status-bar': colors.blueGray[900],
              },
            },
            foreground: {
              light: {
                'text-default': colors.blueGray[800],
                'text-secondary': colors.blueGray[500],
                'text-hint': colors.blueGray[400],
                'text-disabled': colors.blueGray[400],
                border: colors.blueGray[200],
                divider: colors.blueGray[200],
                icon: colors.blueGray[500],
                'mat-icon': colors.blueGray[500],
              },
              dark: {
                'text-default': '#ffffff',
                'text-secondary': colors.blueGray[400],
                'text-hint': colors.blueGray[500],
                'text-disabled': colors.blueGray[600],
                border: chroma(colors.blueGray[100]).alpha(0.12).css(),
                divider: chroma(colors.blueGray[100]).alpha(0.12).css(),
                icon: colors.blueGray[400],
                'mat-icon': colors.blueGray[400],
              },
            },
          },
          themes: Object.keys(options.themes),
        },
      },
      variants: {},
    };
  }
);

module.exports = theming;
