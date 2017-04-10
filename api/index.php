<?php
// require 'vendor/autoload.php';
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();
// production environment - false; test environment - true
$app['debug'] = true;


use App\SQLiteConnection;
use App\JWT;
use App\Config;

$pdo = (new SQLiteConnection())->connect();
// if ($pdo != null)
//     echo 'Connected to the SQLite database successfully!';
// else
//     echo 'Whoops, could not connect to the SQLite database!';

    $token = array();
    $id = 'carpus';
    $token['id'] = $id;

    $app->get('/Records/Documents/{groupName}', function (Silex\Application $app, $groupName)  {
        // echo JWT::encode($token, 'secret_server_key');
        // echo $groupName ;
        // echo '<hr />';
        $string = file_get_contents(Config::PATH_TO_DOCUMENTS_JSON_FILE);
        $jsonArray = json_decode($string);

        $filteredArray = array_filter($jsonArray, function($obj) use($groupName)
        {
            return $obj->groupName == $groupName && $obj->type == 'Document' ;
        });

        // return "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
        return json_encode($filteredArray);
    });
    $app->get('/Records/Meetings/{groupName}', function (Silex\Application $app, $groupName)  {
        // echo JWT::encode($token, 'secret_server_key');
        // echo $groupName ;
        // echo '<hr />';
        $string = file_get_contents(Config::PATH_TO_DOCUMENTS_JSON_FILE);
        $jsonArray = json_decode($string);

        $filteredArray = array_filter($jsonArray, function($obj) use($groupName)
        {
            return $obj->groupName == $groupName && ($obj->type == 'Minutes' || $obj->type == 'Agendas' ||$obj->type == 'Video');
        });

        // return "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
        return json_encode($filteredArray);
    });

$app->run();
// http://www.gajotres.net/creating-a-basic-restful-api-with-silex/2/


// http://www.sqlitetutorial.net/sqlite-php/connect/
// http://www.sqlitetutorial.net/sqlite-php/

?>
