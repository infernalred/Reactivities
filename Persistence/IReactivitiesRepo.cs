using System;
using System.Threading.Tasks;
using Domain;

namespace Persistence
{
    public interface IReactivitiesRepo
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T : class;
        Task<bool> SaveAll();
        Task<Activity> GetActivity(Guid id);
        Task<AppUser> GetUser(string username);
    }
}