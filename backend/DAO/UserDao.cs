
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DAO
{
    public interface IUserDao
    {
        Task<User> GetUserByFirebaseUidAsync(string firebaseUid);
        Task<User> GetUserByUsernameAsync(string username);
        Task AddUserAsync(User user);
        Task UpdateUserAsync(User user);
    }

    public class UserDao : IUserDao
    {
        private readonly ApplicationDbContext _context;

        public UserDao(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByFirebaseUidAsync(string firebaseUid)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}