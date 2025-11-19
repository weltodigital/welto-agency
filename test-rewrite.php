<?php
// Simple test to check if mod_rewrite is working
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    echo mod_rewrite_enabled() ? "mod_rewrite is ENABLED" : "mod_rewrite is DISABLED";
} else {
    echo "Cannot determine mod_rewrite status";
}

function mod_rewrite_enabled() {
    return in_array('mod_rewrite', apache_get_modules());
}
?>