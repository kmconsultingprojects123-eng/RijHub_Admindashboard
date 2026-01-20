<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Auth Debug Test</title>
</head>
<body>
    <h1>Authentication Debug</h1>
    
    <h2>PHP $_COOKIE:</h2>
    <pre><?php print_r($_COOKIE); ?></pre>
    
    <h2>Token from Cookie:</h2>
    <pre><?php 
    $token = $_COOKIE['token'] ?? 'NOT FOUND';
    echo $token;
    ?></pre>
    
    <h2>JWT Decode Test:</h2>
    <pre><?php
    require_once('./bootstrap.php');
    use _Helpers\JWT;
    
    if (isset($_COOKIE['token'])) {
        $jwt = new JWT();
        $payload = $jwt->decodeJWT($_COOKIE['token']);
        echo "Payload:\n";
        print_r($payload);
        
        if ($payload) {
            echo "\n\nRole: " . ($payload['role'] ?? 'NOT SET');
            echo "\nIs Admin: " . (($payload['role'] ?? '') === 'admin' ? 'YES' : 'NO');
        } else {
            echo "\n\nFailed to decode JWT!";
        }
    } else {
        echo "No token cookie found!";
    }
    ?></pre>
    
    <h2>JavaScript Cookie:</h2>
    <pre id="js-cookie"></pre>
    
    <script>
        document.getElementById('js-cookie').textContent = document.cookie;
    </script>
</body>
</html>
