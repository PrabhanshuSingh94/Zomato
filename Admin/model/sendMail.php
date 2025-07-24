<?php
// Load PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/../vendor/autoload.php';


// // Include required files (adjust paths if needed)
// require 'PHPMailer/PHPMailer.php';
// require 'PHPMailer/SMTP.php';
// require 'PHPMailer/Exception.php';

$mail = new PHPMailer(true); // Passing 'true' enables exceptions

function sendMail($toEmail, $toName, $subject, $plainMessage) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'psinghnayak94@gmail.com';
        $mail->Password   = 'qoybomfudajcjqnb'; // App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('psinghnayak94@gmail.com', 'Zomato');
        $mail->addAddress($toEmail, $toName);

        // Content
        $mail->isHTML(false); // Set to false for plain text
        $mail->Subject = $subject;
        $mail->Body    = $plainMessage;

        $mail->send();
        return true;
    } catch (Exception $e) {
        return "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>
