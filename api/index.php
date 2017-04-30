<?php
// require 'vendor/autoload.php';
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();
// production environment - false; test environment - true
$app['debug'] = true;


use App\SQLiteConnection;
use App\JWT;
use App\Config;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$pdo = (new SQLiteConnection())->connect();
// if ($pdo != null)
//     echo 'Connected to the SQLite database successfully!';
// else
//     echo 'Whoops, could not connect to the SQLite database!';


$token = array();
$id = 'carpus';
// $userkey='change';
$token['id'] = $id;
$app['userkey'] = 'change';
//
// $app->register(new JDesrosiers\Silex\Provider\CorsServiceProvider(), array(
//     "cors.allowOrigin" => "*",
// ));
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());
//https://silex.sensiolabs.org/doc/2.0/middlewares.html
$addAuthToken = function (Request $request, Response $response, Silex\Application $app) {
    $response->headers->set('authorization', $app['userkey']);
};

$app->after(function (Request $request, Response $response) {
    $response->headers->set('Access-Control-Allow-Origin', '*');
});
// ==========================================================
// ==========================================================
$app->get('/Menus/', function (Silex\Application $app)  {
    $string = file_get_contents(Config::PATH_TO_MENUS_JSON_FILE);
    $jsonArray = json_decode($string, true);
    // echo "<pre>" . print_r($jsonArray, TRUE)  .  '</pre>';
    return json_encode($jsonArray);
});
// ==========================================================
$app->get('/Asides/{groupName}', function (Silex\Application $app, $groupName)  {
    $string = file_get_contents('db/OrganizationalAsides.json');
    $jsonArray = json_decode($string, true);
    $filteredArray=array_filter($jsonArray, function($elem) use($groupName){
        return $elem['link'] == $groupName;
    });
    $group=[];
    if (count($filteredArray)  > 0) {
        $group = array_values($filteredArray)[0];
    }
    // echo "<pre>" . print_r($jsonArray, TRUE)  .  '</pre>';
    if ( array_key_exists('asides', $group)) {
        return json_encode($group['asides']);
    } else {
        return '[]';
    }
    // return json_encode($jsonArray);
});
// ==========================================================
$app->get('/EB2Services/{groupName}', function (Silex\Application $app, $groupName)  {
    $string = file_get_contents('db/EB2Services.json');
    $jsonArray = json_decode($string, true);
    $filteredArray=$jsonArray;
    if (! ($groupName == 'Home' || $groupName == 'TownClerk')) {
        // echo "<pre>" . print_r($jsonArray, TRUE)  .  '</pre>';
        $filteredArray=array_filter($jsonArray, function($elem) use($groupName){
            return $elem['link'] == $groupName;
        });
    };
    $services=[];
    if (count($filteredArray)  > 0) {
        $services = array_values($filteredArray);
    }
    // echo "<pre>" . print_r($services, TRUE)  .  '</pre>';
    // if ( array_key_exists('asides', $group)) {
    //     return json_encode($group['asides']);
    // } else {
    //     return '[]';
    // }
    return json_encode($services);
});
// ==========================================================
$app->get('/LoginRequest/{encodedemailAddress}', function (Silex\Application $app, $encodedemailAddress)  {
    global $userkey;
    $emailAddress = base64_decode ( $encodedemailAddress);
    $token = array(
        "name" => "David Carpus",
        "emailAddress" => $emailAddress,
        "iss" => "townURL",
        "aud" => "townURL",
        "iat" => time(),
    );
// echo '<hr />';
// echo $emailAddress;
// echo '<hr />';
    $key =  base64_encode( JWT::encode($token, Config::JWT_KEY) );
    if ($_SERVER["SERVER_NAME"] != 'localhost') {
        $url = 'http://' . $_SERVER["SERVER_NAME"] . '/' . $key;
        mail ( $emailAddress , 'JWT Link' , $url  );
        return 'email sent.';
    } else {
        $url = 'http://' . $_SERVER["SERVER_NAME"] . '/path/' . $key;
        $app['userkey'] = $key;
        return '<a href="'.$app['url_generator']->generate('Login', [ "jwt64" => $key, "email" => $encodedemailAddress ]).'">Login</a>';
    }
    // return json_encode($key);
})->after($addAuthToken);
// ==========================================================
$app->get('/Login/{jwt64}', function (Silex\Application $app, $jwt64)  {
    $jwt = base64_decode ( $jwt64);
    $decoded = JWT::decode($jwt, Config::JWT_KEY, array('HS256'));
    // $params = $request->query->all();
    echo '<hr />';
    echo "<pre>" . print_r($decoded, TRUE)  .  '</pre>';
    echo '<hr />';
    // mail ( $emailAddress , 'JWT Link' , $key  );
return $_SERVER["SERVER_NAME"];
    // return json_encode($key);
})->bind('Login');;
// ==========================================================
$app->get('/GroupData/{groupName}', function (Silex\Application $app, $groupName)  {
    // echo JWT::encode($token, 'secret_server_key');
    // echo $groupName ;
    // echo '<hr />';
    $string = file_get_contents('db/OrganizationalUnits.json');
    $jsonArray = json_decode($string, true);

    $filteredArray=array_filter($jsonArray, function($elem) use($groupName){
        return $elem['link'] == $groupName;
    });
    $group=[];
    if (count($filteredArray)  > 0) {
        $group = current($filteredArray);
    }

    // foreach (["Members", "Asides", "PageText"] as  $value) {
    foreach (["Members",  "PageText"] as  $value) {
        $tableData=array_filter(json_decode(file_get_contents('db/Organizational' . $value . '.json'), true), function($elem) use($groupName){
            return $elem['link'] == $groupName;
        });
        $tableData= is_null($tableData) ? []: current($tableData);
        $tableData = ($value == 'Members' || $value == 'PageText' ) ?  $tableData[strtolower($value)] : $tableData;
        // echo "<pre>" . print_r($tableData, TRUE)  .  '</pre>';
        $group[strtolower($value)] = $tableData;
    }

    if ( array_key_exists('customData', $group)) {
        foreach ($group['customData'] as  $value) {
            $tableData=json_decode(file_get_contents('db/' . $value . '.json'), true);
            $group[strtolower($value)] = $tableData;
        }
        unset($group['customData']);
    }

    return json_encode($group);
    // echo "<pre>" . print_r($group, TRUE)  .  '</pre>';
});
// ==========================================================
$app->get('/Records/Documents/{groupName}', function (Silex\Application $app, $groupName)  {
    // echo JWT::encode($token, 'secret_server_key');
    // echo $groupName ;
    // echo '<hr />';
    $string = file_get_contents(Config::PATH_TO_DOCUMENTS_JSON_FILE);
    $jsonArray = json_decode($string, true);

    $filteredArray=array();
    // print_r("<pre>" );
    foreach ($jsonArray as $key => $item) {
        // echo "<pre>" . print_r($item, TRUE)  .  '</pre>';
        if ($item['groupName'] == $groupName  && $item['type'] == 'Document') {
        //     echo "$key";
        //     // $item['id'] = $key;
        unset($item['date']);
        unset($item['type']);
        unset($item['groupName']);
        //     // array_push($filteredArray, $item);
            $filteredArray[]= $item;
        }
    }
    // echo "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
    return json_encode($filteredArray);
});
// ==========================================================
$app->get('/FAQ/{groupName}', function (Silex\Application $app, $groupName)  {
    // echo JWT::encode($token, 'secret_server_key');
    // echo $groupName ;
    // echo '<hr />';
    $string = file_get_contents(Config::PATH_TO_FAQ_JSON_FILE);
    $jsonArray = json_decode($string, true);

    $filteredArray=array();
    // print_r("<pre>" );
    foreach ($jsonArray as $key => $item) {
        // echo "<pre>" . print_r($item, TRUE)  .  '</pre>';
        if ($item['link'] == $groupName ) {
        //     echo "$key";
        //     // $item['id'] = $key;
        //     // array_push($filteredArray, $item);
        unset($item['link']);
            $filteredArray[]= $item;
        }
    }
    // echo "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
    return json_encode($filteredArray);
});
// ==========================================================
$app->get('/Records/Notices/{groupName}', function (Silex\Application $app, $groupName)  {
    // echo JWT::encode($token, 'secret_server_key');
    // echo $groupName ;
    // echo '<hr />';
    $string = file_get_contents(Config::PATH_TO_DOCUMENTS_JSON_FILE);
    $jsonArray = json_decode($string, true);

    $filteredArray=array();
    foreach ($jsonArray as $key => $item) {
        if ($item['type'] == 'Notice') {
            if ($item['groupName'] == $groupName || ($groupName == 'Home' && $item['mainpage'])) {
            unset($item['date']);
            unset($item['type']);
            unset($item['groupName']);
                $filteredArray[]= $item;
            }
        }
    }
    // echo "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
    return json_encode($filteredArray);
});
// ==========================================================
$app->get('/Records/Meetings/{groupName}', function (Silex\Application $app, $groupName)  {
    // echo JWT::encode($token, 'secret_server_key');
    // echo $groupName ;
    // echo '<hr />';
    $string = file_get_contents(Config::PATH_TO_DOCUMENTS_JSON_FILE);
    $jsonArray = json_decode($string, true);

    $filteredArray=array();
    // print_r("<pre>" );
    foreach ($jsonArray as $key => $item) {
        // print_r( $item);

        if ($item['groupName'] == $groupName  && ($item['type'] == 'Minutes' || $item['type'] == 'Agendas' ||$item['type'] == 'Video')) {
            $item['id'] = $key;
            $keyDate= $item['date'];
            unset($item['date']);
            $filteredArray[$keyDate] []= $item;
        }
    }
    // echo "<pre>" . print_r($filteredArray, TRUE)  .  '</pre>';
    return json_encode($filteredArray);
});
// ==========================================================
// ==========================================================
// ==========================================================
$app->after(function (Request $request, Response $response) {
    $response->headers->set('Access-Control-Allow-Origin', '*');
});

$app->run();

// http://www.gajotres.net/creating-a-basic-restful-api-with-silex/2/

// http://www.sqlitetutorial.net/sqlite-php/connect/
// http://www.sqlitetutorial.net/sqlite-php/

?>
