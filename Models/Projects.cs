using System;
using System.Collections.Generic;

namespace Final_Bug_Tracker.Models
{
    public class Projects
    {
        public int Id { get; set; }
        public string CreatorId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTimeOffset Created { get; set; }
        public virtual ApplicationUser Creator { get; set; }
        public virtual ICollection<Tickets> Tickets { get; set; }
        public Projects()
        {
            Tickets = new HashSet<Tickets>();
        }
    }
}