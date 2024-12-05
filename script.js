const API_URL = 'http://127.0.0.1:5000'; // Backend API URL

// Fetch and display all time entries
async function fetchEntries() {
    const response = await fetch(`${API_URL}/time-entries`);
    if (!response.ok) {
        alert('Failed to fetch time entries!');
        return;
    }

    const entries = await response.json();
    const tbody = document.querySelector('#entriesTable tbody');
    tbody.innerHTML = ''; // Clear existing entries
   

    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.appendChild(createCell(entry.project_name));
        row.appendChild(createCell(entry.task_description));
        row.appendChild(createCell(entry.start_time));
        row.appendChild(createCell(entry.end_time));

        // Create action buttons
        const actionsCell = document.createElement('td');
        actionsCell.appendChild(createButton('Delete', () => deleteEntry(entry.id)));
        actionsCell.appendChild(createButton('Edit', () => editEntry(entry.id)));
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    // Show table only if there are entries
    document.getElementById('time-entries').style.display = entries.length > 0 ? 'block' : 'none';
}

// Helper to create a table cell
function createCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

// Helper to create a button
function createButton(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
}

// Add a new time entry
document.getElementById('timeEntryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        project_name: document.getElementById('projectName').value,
        task_description: document.getElementById('taskDescription').value,
        start_time: document.getElementById('startTime').value.replace('T', ' '),
        end_time: document.getElementById('endTime').value.replace('T', ' ')
    };

    const response = await fetch(`${API_URL}/time-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Time entry added successfully!');
        fetchEntries();
        document.getElementById('timeEntryForm').reset();
    } else {
        alert('Failed to add entry!');
    }
});

// Delete a time entry
async function deleteEntry(id) {
    const response = await fetch(`${API_URL}/time-entry/${id}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Time entry deleted successfully!');
        fetchEntries();
    } else {
        alert('Failed to delete entry!');
    }
}

// Edit a time entry
async function editEntry(id) {
    const response = await fetch(`${API_URL}/time-entries`);
    if (!response.ok) {
        alert('Failed to fetch time entries!');
        return;
    }

    const entries = await response.json();
    const entry = entries.find(e => e.id === id);

    if (!entry) {
        alert('Entry not found!');
        return;
    }

    document.getElementById('updateProjectName').value = entry.project_name;
    document.getElementById('updateTaskDescription').value = entry.task_description;
    document.getElementById('updateStartTime').value = entry.start_time.replace(' ', 'T');
    document.getElementById('updateEndTime').value = entry.end_time.replace(' ', 'T');
    document.getElementById('updateEntryId').value = id;
    document.getElementById('updateTimeEntryForm').style.display = 'block';
}

// Handle update submission
document.getElementById('updateTimeEntryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateEntryId').value;
    const data = {
        project_name: document.getElementById('updateProjectName').value,
        task_description: document.getElementById('updateTaskDescription').value,
        start_time: document.getElementById('updateStartTime').value.replace('T', ' '),
        end_time: document.getElementById('updateEndTime').value.replace('T', ' ')
    };

    const response = await fetch(`${API_URL}/time-entry/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Time entry updated successfully!');
        fetchEntries();
        document.getElementById('updateTimeEntryForm').reset();
        document.getElementById('updateTimeEntryForm').style.display = 'none';
    } else {
        alert('Failed to update entry!');
    }
});

// Cancel update
function cancelUpdate() {
    document.getElementById('updateTimeEntryForm').reset();
    document.getElementById('updateTimeEntryForm').style.display = 'none';
}

// Fetch and display task report
async function fetchTaskReport() {
    const response = await fetch(`${API_URL}/task-report`);
    if (!response.ok) {
        alert('Failed to fetch task report!');
        return;
    }

    const reportData = await response.json();
    const tbody = document.querySelector('#reportTable tbody');
    tbody.innerHTML = '';

    reportData.forEach(report => {
        const row = document.createElement('tr');
        row.appendChild(createCell(report.project_name));
        row.appendChild(createCell(report.task_description));
        row.appendChild(createCell(report.start_time));
        row.appendChild(createCell(report.end_time));
        row.appendChild(createCell(calculateTimeSpent(report.start_time, report.end_time)));
        tbody.appendChild(row);
    });

    // Show report table only when data is fetched
    document.getElementById('task-report').style.display = reportData.length > 0 ? 'block' : 'none';
}

// Calculate time spent between start and end time
function calculateTimeSpent(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.abs(end - start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Attach report generation function to button
document.getElementById('generateReport').addEventListener('click', function() {
    fetchTaskReport();
});

// Load time entries on page load
document.getElementById('submit').addEventListener('click', function(){
    fetchEntries()
});