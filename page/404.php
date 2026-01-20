<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found | Modern 404</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
            color: #fff;
            font-family: 'Poppins', sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 10;
        }
        
        .error-code {
            font-size: 220px;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 20px;
            text-shadow: 8px 8px 0 rgba(0, 0, 0, 0.1);
            background: linear-gradient(45deg, #fff 30%, #f3f3f3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: fadeInScale 1.2s ease-out;
        }
        
        @keyframes fadeInScale {
            0% {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .error-title {
            font-size: 42px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 15px;
            animation: slideIn 1s ease-out 0.3s both;
        }
        
        .error-message {
            font-size: 20px;
            font-weight: 300;
            max-width: 600px;
            margin: 0 auto 40px;
            line-height: 1.6;
            opacity: 0.9;
            animation: slideIn 1s ease-out 0.5s both;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            animation: slideIn 1s ease-out 0.7s both;
        }
        
        .btn-modern {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            color: white;
            padding: 15px 35px;
            font-size: 18px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .btn-modern:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-5px);
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
            color: white;
            text-decoration: none;
        }
        
        .btn-modern i {
            margin-right: 10px;
        }
        
        .divider {
            height: 4px;
            width: 80px;
            background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
            margin: 30px auto;
            animation: expand 1.2s ease-out 0.9s both;
        }
        
        @keyframes expand {
            from {
                width: 0;
            }
            to {
                width: 80px;
            }
        }
        
        /* Cloud animation (kept from original) */
        .cloud {
            width: 350px; 
            height: 120px;
            background: #FFF;
            background: linear-gradient(top, #FFF 100%);
            border-radius: 100px;
            position: absolute;
            margin: 120px auto 20px;
            z-index: 1;
            transition: ease 1s;
            opacity: 0.7;
        }

        .cloud:after, .cloud:before {
            content: '';
            position: absolute;
            background: #FFF;
            z-index: -1
        }

        .cloud:after {
            width: 100px; 
            height: 100px;
            top: -50px; 
            left: 50px;
            border-radius: 100px;
        }

        .cloud:before {
            width: 180px; 
            height: 180px;
            top: -90px; 
            right: 50px;
            border-radius: 200px;
        }
        
        .x1 {
            top: -50px;
            left: 100px;
            transform: scale(0.3);
            opacity: 0.9;
            animation: moveclouds 15s linear infinite;
        }
        
        .x1_5 {
            top: -80px;
            left: 250px;
            transform: scale(0.3);
            animation: moveclouds 17s linear infinite;
        }

        .x2 {
            left: 250px;
            top: 30px;
            transform: scale(0.6);
            opacity: 0.6; 
            animation: moveclouds 25s linear infinite;
        }

        .x3 {
            left: 250px; 
            bottom: -70px;
            transform: scale(0.6);
            opacity: 0.8; 
            animation: moveclouds 25s linear infinite;
        }

        .x4 {
            left: 470px; 
            bottom: 20px;
            transform: scale(0.75);
            opacity: 0.75;
            animation: moveclouds 18s linear infinite;
        }

        .x5 {
            left: 200px; 
            top: 300px;
            transform: scale(0.5);
            opacity: 0.8; 
            animation: moveclouds 20s linear infinite;
        }

        @keyframes moveclouds {
            0% { margin-left: 1000px; }
            100% { margin-left: -1000px; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .error-code {
                font-size: 140px;
            }
            
            .error-title {
                font-size: 32px;
            }
            
            .error-message {
                font-size: 18px;
                padding: 0 20px;
            }
            
            .btn-modern {
                padding: 12px 25px;
                font-size: 16px;
            }
        }
        
        @media (max-width: 480px) {
            .error-code {
                font-size: 100px;
            }
            
            .error-title {
                font-size: 26px;
            }
            
            .action-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .btn-modern {
                width: 100%;
                max-width: 280px;
            }
        }
    </style>
</head>
<body>
    <div id="clouds">
        <div class="cloud x1"></div>
        <div class="cloud x1_5"></div>
        <div class="cloud x2"></div>
        <div class="cloud x3"></div>
        <div class="cloud x4"></div>
        <div class="cloud x5"></div>
    </div>
    
    <div class="container">
        <div class="error-code">404</div>
        
        <div class="divider"></div>
        
        <h1 class="error-title">page Not Found</h1>
        
        <p class="error-message">The page you're looking for doesn't exist or may have been moved. Please check the URL or navigate back to the home page.</p>
        
        <div class="action-buttons">
            <a href="neils/" class="btn-modern">
                <i class="fas fa-arrow-left"></i> Back to Homepage
            </a>
            <!-- <a href="/" class="btn-modern">
                <i class="fas fa-home"></i> Go to Homepage
            </a>
            <a href="#" class="btn-modern">
                <i class="fas fa-envelope"></i> Contact Support
            </a> -->
        </div>
    </div>
    
    <!-- Font Awesome for icons -->
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</body>
</html>