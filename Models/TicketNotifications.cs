using System;

namespace Final_Bug_Tracker.Models
{
    public class TicketNotifications
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string RecipientId { get; set; }
        public string SenderId { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public bool HasBeenRead { get; set; }
        public DateTimeOffset Created { get; set; }
        public virtual Tickets Ticket { get; set; }
        public virtual ApplicationUser Recipient { get; set; }
        public virtual ApplicationUser Sender { get; set; }
    }
}