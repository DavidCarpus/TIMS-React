<?php
require 'vendor/autoload.php';

use App\SQLiteConnection;
use App\JWT;

$pdo = (new SQLiteConnection())->connect();
if ($pdo != null)
    echo 'Connected to the SQLite database successfully!';
else
    echo 'Whoops, could not connect to the SQLite database!';

    $token = array();
    $id = 'carpus';
    $token['id'] = $id;
    echo JWT::encode($token, 'secret_server_key');

// http://www.sqlitetutorial.net/sqlite-php/connect/
// http://www.sqlitetutorial.net/sqlite-php/
