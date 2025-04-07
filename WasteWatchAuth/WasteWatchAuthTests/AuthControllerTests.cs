using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;
using WasteWatchAuth.Models.Auth;
using WasteWatchAuth.Services;
using Xunit;

namespace WasteWatchAuthTests
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<IdentityUser>> _userManagerMock;
        private readonly Mock<SignInManager<IdentityUser>> _signInManagerMock;
        private readonly Mock<IEmailSender> _emailSenderMock;
        private readonly Mock<IAntiforgery> _antiforgeryMock;
        private readonly AuthController _controller;
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;

        public AuthControllerTests()
        {
            _userManagerMock = new Mock<UserManager<IdentityUser>>(
                Mock.Of<IUserStore<IdentityUser>>(), null, null, null, null, null, null, null, null);

            _signInManagerMock = new Mock<SignInManager<IdentityUser>>(
                _userManagerMock.Object,
                new Mock<IHttpContextAccessor>().Object,
                new Mock<IUserClaimsPrincipalFactory<IdentityUser>>().Object,
                null, null, null, null);

            _emailSenderMock = new Mock<IEmailSender>();
            _antiforgeryMock = new Mock<IAntiforgery>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

            var context = new DefaultHttpContext();
            context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id")
            }, "mock"));

            _httpContextAccessorMock.Setup(_ => _.HttpContext).Returns(context);

            _dbContext = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb").Options);

            var activityLogService = new ActivityLogService(_dbContext, _httpContextAccessorMock.Object);

            _controller = new AuthController(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _emailSenderMock.Object,
                activityLogService,
                _antiforgeryMock.Object);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = context
            };
        }



        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            var user = new IdentityUser { Email = "test@example.com" };

            _userManagerMock.Setup(um => um.FindByEmailAsync(user.Email)).ReturnsAsync(user);

            _signInManagerMock.Setup(sm => sm.PasswordSignInAsync(
                It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()
            )).ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Failed);

            var result = await _controller.Login(new LoginModel { Email = user.Email, Password = "wrongpassword" });

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task ForgotPassword_ValidEmail_SendsEmail()
        {
            var user = new IdentityUser { Email = "test@example.com" };
            _userManagerMock.Setup(um => um.FindByEmailAsync(user.Email)).ReturnsAsync(user);
            _userManagerMock.Setup(um => um.GeneratePasswordResetTokenAsync(user)).ReturnsAsync("token");

            var result = await _controller.ForgotPassword(new ForgotPasswordModel { Email = user.Email });

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ForgotPassword_InvalidEmail_ReturnsBadRequest()
        {
            _userManagerMock.Setup(um => um.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((IdentityUser)null);

            var result = await _controller.ForgotPassword(new ForgotPasswordModel { Email = "invalid@example.com" });

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
