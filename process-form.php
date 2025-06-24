<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitizar e validar os dados
    $name = filter_var(trim($_POST["name"]), FILTER_SANITIZE_STRING);
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone = filter_var(trim($_POST["phone"]), FILTER_SANITIZE_STRING);
    $subject = filter_var(trim($_POST["subject"]), FILTER_SANITIZE_STRING);
    $message = filter_var(trim($_POST["message"]), FILTER_SANITIZE_STRING);

    // Verificar se o e-mail é válido
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Email inválido.");
    }

    // Configurar os parâmetros do e-mail
    $to = "services@henriquelondon.com";
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Criar o corpo do e-mail
    $email_body = "Nome: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Telefone: $phone\n";
    $email_body .= "Assunto: $subject\n";
    $email_body .= "Mensagem:\n$message\n";

    // Enviar o e-mail
    if (mail($to, $subject, $email_body, $headers)) {
        header("Location: thanks.html"); // Redirecionar após o envio
        exit();
    } else {
        echo "Ocorreu um erro ao enviar o e-mail.";
    }
} else {
    echo "Método de solicitação inválido.";
}
?>
