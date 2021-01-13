using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Activities;
using Application.Errors;
using Application.Interfaces;
using AutoFixture;
using Domain;
using MediatR;
using Moq;
using Persistence;
using Xunit;

namespace Application.Tests
{
    public class ActivitiesTests
    {
        private Mock<IMediator> _mediator;
        private Fixture _fixture;
        private Mock<IReactivitiesRepo> _repo;
        private Mock<IUserAccessor> _userAccessor;
        
        public ActivitiesTests()
        {
            _mediator = new Mock<IMediator>();
            _fixture = new Fixture();
            _repo = new Mock<IReactivitiesRepo>();
            _userAccessor = new Mock<IUserAccessor>();
        }

        [Fact]
        public async Task ActivitiesCreate_Success()
        {
            var command =_fixture.Create<Create.Command>();
            var user = _fixture.Build<AppUser>().Without(x => x.UserActivities).Without(x => x.Followers)
                .Without(x => x.Followings).Create();
            
            _repo.Setup(u => u.GetUser(user.UserName)).ReturnsAsync(user);
            _repo.Setup(x => x.SaveAll()).ReturnsAsync(true);
            _userAccessor.Setup(x => x.GetCurrentUserName()).Returns(user.UserName);

            var query = new Create.Handler(_repo.Object, _userAccessor.Object);
            await query.Handle(command, new CancellationToken());
            
            _repo.Verify(x => x.Add(It.IsAny<Activity>()));
            _repo.Verify(x => x.Add(It.IsAny<UserActivity>()));
            _repo.Verify(x => x.GetUser(user.UserName));
            _repo.Verify(x => x.SaveAll());
            _repo.VerifyNoOtherCalls();
            _mediator.VerifyNoOtherCalls();
        }
        
        [Fact]
        public async Task ActivitiesEdit_Success()
        {
            var command =_fixture.Create<Edit.Command>();
            var activity = _fixture.Build<Activity>().Without(x => x.UserActivities).Without(x => x.Comments).Create();
            command.Id = activity.Id;

            _repo.Setup(x => x.GetActivity(activity.Id)).ReturnsAsync(activity);
            _repo.Setup(x => x.SaveAll()).ReturnsAsync(true);

            var query = new Edit.Handler(_repo.Object);
            await query.Handle(command, new CancellationToken());
            
            _repo.Verify(x => x.GetActivity(It.IsAny<Guid>()));
            _repo.Verify(x => x.SaveAll());
            _repo.VerifyNoOtherCalls();
            _mediator.VerifyNoOtherCalls();
        }
        
        [Fact]
        public async Task ActivitiesEdit_Exception()
        {
            var command =_fixture.Create<Edit.Command>();

            var query = new Edit.Handler(_repo.Object);
            
            await Assert.ThrowsAsync<RestException>(async () => await query.Handle(command, new CancellationToken()));
            _repo.Verify(x => x.GetActivity(It.IsAny<Guid>()));
            _repo.VerifyNoOtherCalls();
            _mediator.VerifyNoOtherCalls();
        }
    }
}