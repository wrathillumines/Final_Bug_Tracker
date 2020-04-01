﻿using System;

namespace Final_Bug_Tracker.Models
{
    public class TicketComments
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string UserId { get; set; }
        public string Comment { get; set; }
        public DateTimeOffset Created { get; set; }
        public virtual Tickets Ticket { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}