import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, copyFileSync, cpSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const themeRoot = path.join(projectRoot, 'wp-theme', 'ikonic-marketing');
const themeAssets = path.join(themeRoot, 'assets');

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function findBuiltAsset(assetsDir, extension) {
  const files = readdirSync(assetsDir);
  const match = files.find((file) => file.startsWith('index-') && file.endsWith(extension));
  if (!match) {
    throw new Error(`Could not find compiled ${extension} file in ${assetsDir}`);
  }
  return match;
}

function buildApp() {
  execSync('npm run build', { stdio: 'inherit' });
}

function prepareThemeFolder() {
  rmSync(themeRoot, { recursive: true, force: true });
  ensureDir(themeAssets);
}

function copyBuildOutput() {
  if (!existsSync(distDir)) {
    throw new Error('dist folder not found. Build may have failed.');
  }

  // Copy all build files (root files from /public and generated assets)
  cpSync(distDir, themeRoot, { recursive: true });
}

function writeThemeFiles(jsFile, cssFile) {
  const styleCss = `/*
Theme Name: Ikonic Marketing Theme
Theme URI: https://example.com
Author: Ikonic Marketing
Author URI: https://example.com
Description: WordPress theme shell for the compiled Ikonic React site.
Version: 1.0.0
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Text Domain: ikonic-marketing
*/
`;

  const functionsPhp = `<?php
if (!defined('ABSPATH')) {
    exit;
}

function ikonic_marketing_enqueue_assets() {
    $theme_uri = get_template_directory_uri();

    wp_enqueue_style(
        'ikonic-marketing-app',
        $theme_uri . '/assets/${cssFile}',
        array(),
        null
    );

    wp_enqueue_script(
        'ikonic-marketing-app',
        $theme_uri . '/assets/${jsFile}',
        array(),
        null,
        true
    );
}
add_action('wp_enqueue_scripts', 'ikonic_marketing_enqueue_assets');

function ikonic_marketing_script_type_module($tag, $handle, $src) {
    if ($handle !== 'ikonic-marketing-app') {
        return $tag;
    }

    return '<script type="module" src="' . esc_url($src) . '"></script>';
}
add_filter('script_loader_tag', 'ikonic_marketing_script_type_module', 10, 3);
`;

  const indexPhp = `<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="root"></div>
<?php wp_footer(); ?>
</body>
</html>
`;

  writeFileSync(path.join(themeRoot, 'style.css'), styleCss, 'utf8');
  writeFileSync(path.join(themeRoot, 'functions.php'), functionsPhp, 'utf8');
  writeFileSync(path.join(themeRoot, 'index.php'), indexPhp, 'utf8');
}

function writeReadme() {
  const readme = `Ikonic Marketing WordPress Theme Export

Build command:
- npm run wp:build

Output folder:
- wp-theme/ikonic-marketing

How to upload:
1. Zip the folder wp-theme/ikonic-marketing.
2. In WordPress admin, go to Appearance > Themes > Add New > Upload Theme.
3. Upload the zip and activate.

Notes:
- This theme serves the compiled React app inside WordPress.
- React routing uses HashRouter, so URLs are in #/ format.
`;

  writeFileSync(path.join(themeRoot, 'README.txt'), readme, 'utf8');
}

function main() {
  buildApp();
  prepareThemeFolder();
  copyBuildOutput();

  const assetsDir = path.join(themeRoot, 'assets');
  const jsFile = findBuiltAsset(assetsDir, '.js');
  const cssFile = findBuiltAsset(assetsDir, '.css');

  writeThemeFiles(jsFile, cssFile);
  writeReadme();

  console.log('WordPress theme generated at:', themeRoot);
}

main();
