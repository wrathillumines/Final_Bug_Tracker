namespace Final_Bug_Tracker.Models
{
    public class TicketStatuses
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual Tickets Ticket { get; set; }
    }
}