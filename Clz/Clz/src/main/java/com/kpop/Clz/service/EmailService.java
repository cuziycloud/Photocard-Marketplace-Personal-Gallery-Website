package com.kpop.Clz.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.name:K-Clz App}")
    private String appName;

    @Async
    public void sendPasswordResetEmail(String recipientEmail, String subject, String username, String resetUrl) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, appName + " Team");
            helper.setTo(recipientEmail);
            helper.setSubject(subject);

            String htmlContent = "<p>Chào " + username + ",</p>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản " + appName + " của mình.</p>"
                    + "<p>Vui lòng nhấp vào đường link bên dưới để thay đổi mật khẩu:</p>"
                    + "<p><a href=\"" + resetUrl + "\">Thay đổi mật khẩu của tôi</a></p>"
                    + "<p>Đường link này sẽ hết hạn sau 1 giờ.</p>"
                    + "<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>"
                    + "<br>"
                    + "<p>Trân trọng,<br>Đội ngũ " + appName + "</p>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Email đặt lại mật khẩu đã được gửi thành công đến {} với chủ đề '{}'", recipientEmail, subject);

        } catch (MessagingException | UnsupportedEncodingException e) {
            logger.error("Lỗi khi gửi email HTML đặt lại mật khẩu đến {}: {}", recipientEmail, e.getMessage(), e);
        }
    }
}