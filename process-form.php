<?php
/**
 * Process Contact Form - Secure Version
 * Requires PHPMailer: composer require phpmailer/phpmailer
 */

// ===== CONFIGURAÇÃO =====
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// ===== CONSTANTES =====
define('MAX_NAME_LENGTH', 100);
define('MAX_EMAIL_LENGTH', 255);
define('MAX_SUBJECT_LENGTH', 200);
define('MAX_MESSAGE_LENGTH', 2000);
define('MAX_PHONE_LENGTH', 20);

// ===== FUNÇÕES DE SEGURANÇA =====
function validate_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function sanitize_input($data, $type = 'string') {
    $data = trim($data);
    $data = stripslashes($data);
    
    switch ($type) {
        case 'email':
            $data = filter_var($data, FILTER_SANITIZE_EMAIL);
            break;
        case 'phone':
            $data = preg_replace('/[^0-9+\-\s\(\)]/', '', $data);
            break;
        case 'int':
            $data = filter_var($data, FILTER_SANITIZE_NUMBER_INT);
            break;
        case 'url':
            $data = filter_var($data, FILTER_SANITIZE_URL);
            break;
        default:
            $data = filter_var($data, FILTER_SANITIZE_SPECIAL_CHARS, FILTER_FLAG_STRIP_LOW);
    }
    
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           strlen($email) <= MAX_EMAIL_LENGTH;
}

function validate_phone($phone) {
    if (empty($phone)) return true;
    
    // Valida formato internacional (+351 967 341 341)
    $pattern = '/^\+?[0-9\s\-\(\)]{10,20}$/';
    return preg_match($pattern, $phone) && 
           strlen($phone) <= MAX_PHONE_LENGTH;
}

function validate_name($name) {
    return !empty($name) && 
           strlen($name) >= 2 && 
           strlen($name) <= MAX_NAME_LENGTH &&
           preg_match('/^[a-zA-ZÀ-ÿ\s\-\.]+$/', $name);
}

function validate_subject($subject) {
    return !empty($subject) && 
           strlen($subject) >= 3 && 
           strlen($subject) <= MAX_SUBJECT_LENGTH;
}

function validate_message($message) {
    return !empty($message) && 
           strlen($message) >= 10 && 
           strlen($message) <= MAX_MESSAGE_LENGTH;
}

function rate_limit_check($ip) {
    $key = 'rate_limit_' . $ip;
    $limit = 5; // 5 requests
    $window = 3600; // 1 hour
    
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = [
            'count' => 1,
            'time' => time()
        ];
        return true;
    }
    
    $data = $_SESSION[$key];
    
    if (time() - $data['time'] > $window) {
        // Reset window
        $_SESSION[$key] = [
            'count' => 1,
            'time' => time()
        ];
        return true;
    }
    
    if ($data['count'] >= $limit) {
        return false;
    }
    
    $data['count']++;
    $_SESSION[$key] = $data;
    return true;
}

// ===== PROCESSAMENTO DO FORMULÁRIO =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Verificar rate limiting
$ip = $_SERVER['REMOTE_ADDR'];
if (!rate_limit_check($ip)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// Verificar CSRF token
if (!isset($_POST['csrf_token']) || !validate_csrf_token($_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Security token invalid.']);
    exit;
}

// Coletar e sanitizar dados
$name = sanitize_input($_POST['name'] ?? '');
$email = sanitize_input($_POST['email'] ?? '', 'email');
$phone = sanitize_input($_POST['phone'] ?? '', 'phone');
$subject = sanitize_input($_POST['subject'] ?? '');
$message = sanitize_input($_POST['message'] ?? '');

// Validação
$errors = [];

if (!validate_name($name)) {
    $errors['name'] = 'Please enter a valid name (2-100 characters)';
}

if (!validate_email($email)) {
    $errors['email'] = 'Please enter a valid email address';
}

if (!validate_phone($phone)) {
    $errors['phone'] = 'Please enter a valid phone number';
}

if (!validate_subject($subject)) {
    $errors['subject'] = 'Subject must be 3-200 characters';
}

if (!validate_message($message)) {
    $errors['message'] = 'Message must be 10-2000 characters';
}

// Se houver erros, retornar
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

// ===== ENVIO DE EMAIL COM PHPMailer =====
try {
    // Incluir PHPMailer (instalar via composer)
    require 'vendor/autoload.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    // Configuração do servidor
    $mail->isSMTP();
    $mail->Host = 'smtp.your-email-provider.com'; // Configurar conforme seu provedor
    $mail->SMTPAuth = true;
    $mail->Username = 'your-email@example.com'; // Seu email
    $mail->Password = 'your-email-password'; // Sua senha ou app password
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Remetente e destinatário
    $mail->setFrom('noreply@henriquelondon.com', 'Portfolio Contact Form');
    $mail->addAddress('services@henriquelondon.com', 'Henrique London');
    $mail->addReplyTo($email, $name);
    
    // Conteúdo
    $mail->isHTML(true);
    $mail->Subject = "Portfolio Contact: " . $subject;
    
    $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ffb500; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>New Contact Form Submission</h1>
                </div>
                <div class='content'>
                    <div class='field'>
                        <div class='label'>Name:</div>
                        <div>$name</div>
                    </div>
                    <div class='field'>
                        <div class='label'>Email:</div>
                        <div>$email</div>
                    </div>
                    <div class='field'>
                        <div class='label'>Phone:</div>
                        <div>" . ($phone ?: 'Not provided') . "</div>
                    </div>
                    <div class='field'>
                        <div class='label'>Subject:</div>
                        <div>$subject</div>
                    </div>
                    <div class='field'>
                        <div class='label'>Message:</div>
                        <div>" . nl2br($message) . "</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    ";
    
    $mail->AltBody = "
        New Contact Form Submission\n
        Name: $name\n
        Email: $email\n
        Phone: " . ($phone ?: 'Not provided') . "\n
        Subject: $subject\n
        Message:\n$message
    ";
    
    // Enviar email
    $mail->send();
    
    // Log do envio (opcional)
    $log_entry = date('Y-m-d H:i:s') . " - $name ($email) - $subject\n";
    file_put_contents('contact_log.txt', $log_entry, FILE_APPEND);
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully!'
    ]);
    
} catch (Exception $e) {
    // Log do erro
    error_log("Email sending failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error sending message. Please try again later.'
    ]);
}

// Gerar novo token CSRF para próximo uso
generate_csrf_token();
?>
