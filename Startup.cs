using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Final_Bug_Tracker.Startup))]
namespace Final_Bug_Tracker
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
