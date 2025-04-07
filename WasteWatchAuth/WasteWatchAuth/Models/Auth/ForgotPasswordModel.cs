using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models.Auth
{
    public class ForgotPasswordModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }
    }

}
