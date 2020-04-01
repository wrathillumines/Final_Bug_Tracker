namespace Final_Bug_Tracker.Migrations
{
    using Final_Bug_Tracker.Models;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Final_Bug_Tracker.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(Final_Bug_Tracker.Models.ApplicationDbContext context)
        {
            #region Role Manager

            var roleManager = new RoleManager<IdentityRole>(
                new RoleStore<IdentityRole>(context));

            if (!context.Roles.Any(r => r.Name == "Admin"))
            {
                roleManager.Create(new IdentityRole { Name = "Admin" });
            }
            if (!context.Roles.Any(r => r.Name == "Project Manager"))
            {
                roleManager.Create(new IdentityRole { Name = "Project Manager" });
            }
            if (!context.Roles.Any(r => r.Name == "Developer"))
            {
                roleManager.Create(new IdentityRole { Name = "Developer" });
            }
            if (!context.Roles.Any(r => r.Name == "Submitter"))
            {
                roleManager.Create(new IdentityRole { Name = "Submitter" });
            }

            #endregion

            #region Seed Users

            var userManager = new UserManager<ApplicationUser>(
                new UserStore<ApplicationUser>(context));

            if (!context.Users.Any(u => u.Email == "hwphotog@gmail.com"))
            {
                userManager.Create(new ApplicationUser
                {
                    UserName = "hwphotog@gmail.com",
                    Email = "hwphotog@gmail.com",
                    FirstName = "Hunter",
                    LastName = "Williams",
                    DisplayName = "dhunterw",
                    AvatarUrl = "/Avatars/dhunterw.jpg"
                }, "atomicSkier_92");
            }

            #endregion
        }
    }
}
