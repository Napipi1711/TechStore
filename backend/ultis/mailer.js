import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, link) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #f0f0f0; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; line-height: 1.6; color: #444; }
            .button-wrapper { text-align: center; margin: 30px 0; }
            .button { background-color: #4CAF50; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; letter-spacing: 0.5px; display: inline-block; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            .expiry { color: #e74c3c; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 24px;">Xác nhận đặt lại mật khẩu</h1>
            </div>
            <div class="content">
                <p>Chào bạn,</p>
                <p>Chúng tôi đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản gắn với email này. Để tiếp tục, vui lòng nhấn vào nút bên dưới:</p>
                <div class="button-wrapper">
                    <a href="${link}" class="button">Đặt lại mật khẩu mới</a>
                </div>
                <p>Lưu ý: Liên kết này sẽ <span class="expiry">hết hạn sau 15 phút</span> để đảm bảo an toàn cho tài khoản của bạn.</p>
            </div>
            <div class="footer">
                <p>Nếu bạn không thực hiện yêu cầu này, hãy yên tâm bỏ qua email.<br>Tài khoản của bạn vẫn an toàn.</p>
                <p>&copy; ${new Date().getFullYear()} Hệ thống Support</p>
            </div>
        </div>
    </body>
    </html>
    `;

  try {
    const info = await transporter.sendMail({
      from: `"Hệ thống Support😁 " <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "😚Khôi phục mật khẩu tài khoản của bạn",
      html: htmlTemplate,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("🤪 Lỗi gửi mail:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu.");
  }
};