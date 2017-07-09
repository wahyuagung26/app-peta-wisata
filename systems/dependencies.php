<?php
$container = $app->getContainer();

/** Database dependencies */
$container['db'] = function ($container) {
    $database = new Cahkampung\Landadb(Db());
    return $database;
};

$container['view'] = function ($c) {
    $view = new \Slim\Views\Twig('public', [
        'cache' => false,
    ]);

    // Instantiate and add Slim specific extension
    $basePath = rtrim(str_ireplace('index.php', '', $c['request']->getUri()->getBasePath()), '/');
    $view->addExtension(new Slim\Views\TwigExtension($c['router'], $basePath));
    $view['baseUrl'] = $c['request']->getUri()->getBaseUrl();

    return $view;
};
