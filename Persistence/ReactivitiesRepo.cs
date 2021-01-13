using System;
using System.Threading.Tasks;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class ReactivitiesRepo : IReactivitiesRepo
    {
        private readonly DataContext _context;

        public ReactivitiesRepo(DataContext context)
        {
            _context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<bool> SaveAll() => await _context.SaveChangesAsync() > 0;

        public async Task<Activity> GetActivity(Guid id) => await _context.Activities.FindAsync(id);
        
        public async Task<AppUser> GetUser(string username) => await _context.Users.SingleOrDefaultAsync(x => x.UserName == username);
    }
}