using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models.Auth
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A password é obrigatória")]
        [MinLength(6, ErrorMessage = "A password deve ter pelo menos 6 caracteres")]
        public string Password { get; set; }

        public string Role { get; set; }
    }
}
