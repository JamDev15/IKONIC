<?php
if (!defined('ABSPATH')) {
    exit;
}

function ikonic_marketing_enqueue_assets() {
    $theme_uri = get_template_directory_uri();

    wp_enqueue_style(
        'ikonic-marketing-app',
        $theme_uri . '/assets/index-IAFChdgI.css',
        array(),
        null
    );

    wp_enqueue_script(
        'ikonic-marketing-app',
        $theme_uri . '/assets/index-Bhm-KdCp.js',
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
