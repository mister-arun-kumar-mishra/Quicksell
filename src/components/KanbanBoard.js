import React, { useState, useEffect } from 'react';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState({});
  const [isDisplayed, setIsDisplayed] = useState(false);

  useEffect(() => {
    // Fetch data from the API
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then((response) => response.json())
      .then((data) => {
        // Store the retrieved ticket and user data in the state
        if (Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
        if (data.users) {
          const userMap = {};
          data.users.forEach((user) => {
            userMap[user.id] = user;
          });
          setUsers(userMap);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const toggleDisplay = () => {
    setIsDisplayed(!isDisplayed);
  };

  const getUserAvatar = (userId) => {
    const user = users[userId];
    if (user) {
      return (
        <div className={`user-avatar small ${user.available ? 'green' : 'blue'}`}>
          {user.name[0].toUpperCase()}
        </div>
      );
    }
    return null;
  };

  const getUserDisplayName = (userId) => {
    const user = users[userId];
    return user ? user.name : `User-${userId.slice(4)}`;
  };

  const groupAndSortTickets = () => {
    const groupedTickets = {};

    const statusCounts = {
      Todo: 0,
      'In progress': 0,
      Backlog: 0,
      Cancelled: 0,
    };

    const userCounts = {};

    if (grouping === 'status') {
      tickets.forEach((ticket) => {
        if (!groupedTickets[ticket.status]) {
          groupedTickets[ticket.status] = [];
        }
        groupedTickets[ticket.status].push(ticket);

        statusCounts[ticket.status]++;
        const userId = ticket.userId;
        if (!userCounts[userId]) {
          userCounts[userId] = 0;
        }
        userCounts[userId]++;
      });
    } else if (grouping === 'userId') {
      tickets.forEach((ticket) => {
        if (!groupedTickets[ticket.userId]) {
          groupedTickets[ticket.userId] = [];
        }
        groupedTickets[ticket.userId].push(ticket);

        const userId = ticket.userId;
        if (!userCounts[userId]) {
          userCounts[userId] = 0;
        }
        userCounts[userId]++;
      });
    } else if (grouping === 'priority') {
      tickets.forEach((ticket) => {
        if (!groupedTickets[ticket.priority]) {
          groupedTickets[ticket.priority] = [];
        }
        groupedTickets[ticket.priority].push(ticket);
      });
    }

    // Include the count for "Cancelled" status
    groupedTickets['Cancelled'] = [];
    statusCounts['Cancelled'] = 0;

    // Sort the groupTickets based on the selected sorting criteria
    Object.values(groupedTickets).forEach((groupTickets) => {
      groupTickets.sort((a, b) => {
        if (sorting === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sorting === 'priority') {
          return a.priority - b.priority;
        }
        return 0; // Default sorting
      });
    });

    return { groupedTickets, statusCounts, userCounts };
  };

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <button className="display-button" onClick={toggleDisplay}>
          {isDisplayed ? 'Display' : 'Display'}
        </button>
      </div>
      {isDisplayed && (
        <div className="display-options">
          <div className="card">
            <div className="card-content-main">
              <label htmlFor="grouping">Grouping:</label>
              <select
                id="grouping"
                onChange={(event) => setGrouping(event.target.value)}
                value={grouping}
              >
                <option value="status">Status</option>
                <option value="userId">User</option>
                <option value="priority">Priority</option>
              </select>
              </div>
              <div className="card-content-main">
              <label htmlFor="sorting">Ordering:</label>
              <select
                id="sorting"
                onChange={(event) => setSorting(event.target.value)}
                value={sorting}
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="columns">
        {Object.entries(groupAndSortTickets().groupedTickets).map(([group, groupTickets]) => {
          if (grouping !== 'userId' && group === 'Cancelled') {
            return null;
          } else {
            return (
              <div className="column" key={group}>
                <div className="column-header">
                  {group}{' '}
                  {grouping === 'status'
                    ? `(${groupAndSortTickets().statusCounts[group] || 0})`
                    : grouping === 'userId'
                    ? `(${groupAndSortTickets().userCounts[group] || 0})`
                    : ''}
                </div>
                {groupTickets.map((ticket) => (
                  <div className="card" key={ticket.id}>
                    <div className="card-content">
                      <div className="card-header">
                        <p className="ticket-id">{ticket.id}</p>
                        {getUserAvatar(ticket.userId)}
                      </div>
                      <p>
                        <strong>{ticket.title}</strong>
                      </p>
                      <p>{ticket.tag.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
