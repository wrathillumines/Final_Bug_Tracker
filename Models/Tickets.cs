using System;
using System.Collections.Generic;

namespace Final_Bug_Tracker.Models
{
    public class Tickets
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string CreatorId { get; set; }
        public string AssignedToUserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTimeOffset Created { get; set; }
        public DateTimeOffset? Updated { get; set; }
        public virtual Projects Project { get; set; }
        public virtual ApplicationUser Creator { get; set; }
        public virtual ApplicationUser AssignedToUser { get; set; }
        public virtual ICollection<TicketComments> TicketComments { get; set; }
        public virtual ICollection<TicketAttachments> TicketAttachments { get; set; }
        public virtual ICollection<TicketHistories> TicketHistories { get; set; }
        public virtual ICollection<TicketNotifications> TicketNotifications { get; set; }
        public virtual ICollection<TicketStatuses> TicketStatuses { get; set; }
        public virtual ICollection<TicketTypes> TicketTypes { get; set; }
        public virtual ICollection<TicketPriorities> TicketPriorities { get; set; }
        public Tickets()
        {
            TicketComments = new HashSet<TicketComments>();
            TicketAttachments = new HashSet<TicketAttachments>();
            TicketHistories = new HashSet<TicketHistories>();
            TicketNotifications = new HashSet<TicketNotifications>();
            TicketStatuses = new HashSet<TicketStatuses>();
            TicketTypes = new HashSet<TicketTypes>();
            TicketPriorities = new HashSet<TicketPriorities>();
        }
    }
}