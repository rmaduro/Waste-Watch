using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;


/// <summary>
/// Service responsible for sending emails using SMTP configuration.
/// Implements the IEmailSender interface from ASP.NET Core Identity.
/// </summary>
public class EmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailSender"/> class.
    /// </summary>
    /// <param name="configuration">Application configuration to access email settings.</param>
	public EmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    /// <summary>
    /// Sends an email asynchronously using SMTP.
    /// </summary>
    /// <param name="email">The recipient's email address.</param>
    /// <param name="subject">The subject of the email.</param>
    /// <param name="htmlMessage">The HTML content of the email.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
	public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var smtpClient = new SmtpClient
        {
            Host = _configuration["EmailSettings:SmtpServer"],
            Port = int.Parse(_configuration["EmailSettings:SmtpPort"]),
            EnableSsl = bool.Parse(_configuration["EmailSettings:EnableSSL"]),
            Credentials = new NetworkCredential(
                _configuration["EmailSettings:SenderEmail"],
                _configuration["EmailSettings:SenderPassword"])
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_configuration["EmailSettings:SenderEmail"]),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        await smtpClient.SendMailAsync(mailMessage);
    }
}