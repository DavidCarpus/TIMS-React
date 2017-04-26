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
$token['id'] = $id;

$app->register(new JDesrosiers\Silex\Provider\CorsServiceProvider(), array(
    "cors.allowOrigin" => "*",
));
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
        $group = array_values($filteredArray)[0];
        // $group = array_shift(array_values($filteredArray));
    }
    // echo "<pre>" . print_r($group, TRUE)  .  '</pre>';
    $asides=array_filter(json_decode(file_get_contents('db/OrganizationalAsides.json'), true), function($elem) use($groupName){
        return $elem['link'] == $groupName;
    });
    // echo "<pre>" . print_r($asides, TRUE)  .  '</pre>';
    $asides= is_null($asides) ? []: current($asides);
     $group['asides'] = is_null($asides) ? []:$group['asides'] = $asides;

     $members=array_filter(json_decode(file_get_contents('db/OrganizationalMembers.json'), true), function($elem) use($groupName){
         return $elem['link'] == $groupName;
     });
    $members = current($members);
    $group['members'] = is_null($members['members']) ? []: $group['members'] = $members['members'];

    $pagetext=array_filter(json_decode(file_get_contents('db/OrganizationalPageText.json'), true), function($elem) use($groupName){
        return $elem['link'] == $groupName;
    });
   $pagetext = current($pagetext);
   $group['pagetext'] = is_null($pagetext['pagetext']) ? []: $group['pagetext'] = $pagetext['pagetext'];

   if ($groupName == 'PublicWorks') {
       $group['transferrules'] =  array(
           'wasteTypes' => json_decode(file_get_contents('db/WasteTypes.json'), true),
           'feeSchedule' => json_decode(file_get_contents('db/FeeSchedule.json'), true),
           );
   }

   if ($groupName == 'CodeEnforcement') {
       $group['helpfulInformation'] =  json_decode(file_get_contents('db/HelpfulInformation.json'), true);
   }

    return json_encode($group);
    // if ( array_key_exists('asides', $group)) {
    //     return json_encode($group['asides']);
    // } else {
    //     return '[]';
    // }
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
        if ($item['groupName'] == $groupName ) {
        //     echo "$key";
        //     // $item['id'] = $key;
        //     // array_push($filteredArray, $item);
        unset($item['groupName']);
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
    return json_encode($filteredArray);
});

$app->after(function (Request $request, Response $response) {
    $response->headers->set('Access-Control-Allow-Origin', '*');
});

$app->run();

// http://www.gajotres.net/creating-a-basic-restful-api-with-silex/2/

// http://www.sqlitetutorial.net/sqlite-php/connect/
// http://www.sqlitetutorial.net/sqlite-php/

?>
